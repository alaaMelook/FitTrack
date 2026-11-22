'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from '@/lib/activity-logger'

type ProgramKind = 'nutrition' | 'workout'
const tables: Record<ProgramKind, string> = {
  nutrition: 'nutrition_plans',
  workout: 'workout_plans',
}

function parsePayload(raw: FormDataEntryValue | null, kind: ProgramKind) {
  if (typeof raw !== 'string') throw new Error('Add plan details before saving.')
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { throw new Error('Plan details must be valid JSON.') }
  if (!Array.isArray(parsed)) throw new Error('Plan details must be a JSON array.')
  if (parsed.length > 100) throw new Error('A plan can contain no more than 100 entries.')
  if (kind === 'nutrition' && parsed.some((item) => !item || typeof item !== 'object' || typeof item.meal !== 'string')) throw new Error('Each meal needs a meal name.')
  if (kind === 'workout' && parsed.some((item) => !item || typeof item !== 'object' || typeof item.day !== 'string')) throw new Error('Each workout day needs a day name.')
  return parsed
}

async function verifyAssignedClient(clientId: string, userId: string) {
  const db: any = createAdminClient()
  const { data: coach } = await db.from('coaches').select('id').eq('user_id', userId).maybeSingle()
  if (!coach) throw new Error('Coach profile not found.')
  const { data: assignment } = await db.from('coach_assignments').select('id').eq('client_id', clientId).eq('coach_id', coach.id).is('ended_at', null).maybeSingle()
  if (!assignment) throw new Error('You can only manage plans for your currently assigned clients.')
}

export async function saveProgramAction(formData: FormData) {
  const session = await requireCoach()
  const kind = formData.get('kind')
  if (kind !== 'nutrition' && kind !== 'workout') redirect('/coach/programs?error=invalid-type')
  const clientId = String(formData.get('clientId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()
  const id = String(formData.get('id') ?? '').trim()
  if (!clientId || !title || title.length > 120) redirect('/coach/programs?error=missing-fields')
  try {
    await verifyAssignedClient(clientId, session.id)
    const payload = parsePayload(formData.get('items'), kind)
    const db: any = createAdminClient()
    const values = { client_id: clientId, coach_user_id: session.id, title, notes: notes || null, [kind === 'nutrition' ? 'meals' : 'schedule']: payload, updated_at: new Date().toISOString() }
    const result = id ? await db.from(tables[kind]).update(values).eq('id', id).eq('client_id', clientId) : await db.from(tables[kind]).insert(values)
    if (result.error) throw result.error

    await logActivity({
      actorUserId: session.id,
      action: id ? `Updated ${kind} plan "${title}"` : `Created ${kind} plan "${title}"`,
      entityType: kind === 'nutrition' ? 'nutrition_plan' : 'workout_plan',
      entityId: id || undefined,
      targetUserId: undefined,
      metadata: { title, clientId },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save this plan.'
    redirect(`/coach/programs?error=${encodeURIComponent(message)}`)
  }
  revalidatePath('/coach/programs'); revalidatePath('/client/nutrition'); revalidatePath('/client/workouts'); revalidatePath('/admin/programs')
  redirect('/coach/programs?saved=1')
}

export async function deleteProgramAction(formData: FormData) {
  const session = await requireCoach()
  const kind = formData.get('kind')
  if (kind !== 'nutrition' && kind !== 'workout') redirect('/coach/programs?error=invalid-type')
  const id = String(formData.get('id') ?? '')
  const clientId = String(formData.get('clientId') ?? '')
  if (!id || !clientId) redirect('/coach/programs?error=missing-fields')
  try {
    await verifyAssignedClient(clientId, session.id)
    const db: any = createAdminClient()
    const { error } = await db.from(tables[kind]).delete().eq('id', id).eq('client_id', clientId).eq('coach_user_id', session.id)
    if (error) throw error

    await logActivity({
      actorUserId: session.id,
      action: `Deleted ${kind} plan`,
      entityType: kind === 'nutrition' ? 'nutrition_plan' : 'workout_plan',
      entityId: id,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete this plan.'
    redirect(`/coach/programs?error=${encodeURIComponent(message)}`)
  }
  revalidatePath('/coach/programs'); revalidatePath('/client/nutrition'); revalidatePath('/client/workouts'); revalidatePath('/admin/programs')
  redirect('/coach/programs?deleted=1')
}

export async function coachSaveExerciseAction(formData: FormData) {
  const session = await requireCoach()
  const id = String(formData.get('id') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const muscle_group = String(formData.get('muscle_group') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const video_url = String(formData.get('video_url') ?? '').trim() || null

  if (!name || !muscle_group) {
    redirect('/coach/programs?tab=exercises&error=missing-fields')
  }

  const db: any = createAdminClient()

  if (id) {
    // Update existing exercise
    const { error } = await db
      .from('exercise_library')
      .update({
        name,
        muscle_group,
        description,
        video_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      redirect(`/coach/programs?tab=exercises&error=${encodeURIComponent(error.message)}`)
    }

    await logActivity({
      actorUserId: session.id,
      action: `Updated exercise "${name}"`,
      entityType: 'exercise_library',
      entityId: id,
    })
  } else {
    // Create new exercise
    const { data: created, error } = await db.from('exercise_library').insert({
      name,
      muscle_group,
      description,
      video_url,
      created_by_user_id: session.id,
    }).select('id').maybeSingle()

    if (error) {
      redirect(`/coach/programs?tab=exercises&error=${encodeURIComponent(error.message)}`)
    }

    await logActivity({
      actorUserId: session.id,
      action: `Contributed exercise "${name}" to library`,
      entityType: 'exercise_library',
      entityId: created?.id,
    })
  }

  revalidatePath('/coach/programs')
  revalidatePath('/coach/exercise-library')
  revalidatePath('/coach/workout-planner')
  revalidatePath('/admin/programs')
  revalidatePath('/admin/activity-logs')
  redirect('/coach/programs?tab=exercises&saved=1')
}

export async function coachAddExerciseAction(formData: FormData) {
  return coachSaveExerciseAction(formData)
}

export async function coachDeleteExerciseAction(formData: FormData) {
  const session = await requireCoach()
  const id = String(formData.get('id') ?? '').trim()

  if (!id) redirect('/coach/programs?tab=exercises&error=missing-id')

  const db: any = createAdminClient()
  const { data: ex } = await db.from('exercise_library').select('name').eq('id', id).maybeSingle()

  const { error } = await db
    .from('exercise_library')
    .delete()
    .eq('id', id)

  if (error) {
    redirect(`/coach/programs?tab=exercises&error=${encodeURIComponent(error.message)}`)
  }

  await logActivity({
    actorUserId: session.id,
    action: `Deleted exercise "${ex?.name || id}" from library`,
    entityType: 'exercise_library',
    entityId: id,
  })

  revalidatePath('/coach/programs')
  revalidatePath('/coach/exercise-library')
  revalidatePath('/coach/workout-planner')
  revalidatePath('/admin/programs')
  revalidatePath('/admin/activity-logs')
  redirect('/coach/programs?tab=exercises&deleted=1')
}
