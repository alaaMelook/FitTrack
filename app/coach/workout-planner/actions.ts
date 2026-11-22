'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { logActivity } from '@/lib/activity-logger'

function parseWorkoutPayload(raw: FormDataEntryValue | null) {
  if (typeof raw !== 'string') throw new Error('Add plan details before saving.')
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Plan details must be valid JSON.')
  }
  if (!Array.isArray(parsed)) throw new Error('Plan details must be a JSON array.')
  if (parsed.length > 100) throw new Error('A plan can contain no more than 100 entries.')
  if (parsed.some((item) => !item || typeof item !== 'object' || typeof item.day !== 'string')) {
    throw new Error('Each workout day needs a day name.')
  }
  return parsed
}

async function verifyAssignedClient(clientId: string, userId: string) {
  const db: any = createAdminClient()
  const { data: coach } = await db.from('coaches').select('id').eq('user_id', userId).maybeSingle()
  if (!coach) throw new Error('Coach profile not found.')

  const { data: client } = await db.from('clients').select('id').eq('id', clientId).maybeSingle()
  if (!client) throw new Error('Client not found.')

  const { data: assignment } = await db
    .from('coach_assignments')
    .select('id')
    .eq('client_id', clientId)
    .eq('coach_id', coach.id)
    .is('ended_at', null)
    .maybeSingle()

  // If client is not yet assigned to this coach, assign them automatically
  if (!assignment) {
    await db.from('coach_assignments').insert({
      client_id: clientId,
      coach_id: coach.id,
      assigned_by_user_id: userId,
      started_at: new Date().toISOString(),
    })
  }
}

export async function saveWorkoutPlanAction(formData: FormData) {
  const session = await requireCoach()
  const rawClientIds = formData.getAll('clientIds').map(String).filter(Boolean)
  const singleClientId = String(formData.get('clientId') ?? '').trim()
  const clientIds = rawClientIds.length > 0 ? Array.from(new Set(rawClientIds)) : (singleClientId ? [singleClientId] : [])

  const title = String(formData.get('title') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()
  const id = String(formData.get('id') ?? '').trim()
  const duration = String(formData.get('duration') ?? '1_month').trim()

  if (clientIds.length === 0 || !title || title.length > 120) {
    redirect('/coach/workout-planner?error=missing-fields')
  }

  let errorMsg: string | null = null

  try {
    const rawDays = parseWorkoutPayload(formData.get('items'))

    const scheduleWithDuration = (rawDays as any[]).map((d) => ({
      ...d,
      planDuration: duration,
    }))

    const db: any = createAdminClient()

    for (const cId of clientIds) {
      await verifyAssignedClient(cId, session.id)
      const values = {
        client_id: cId,
        coach_user_id: session.id,
        title,
        notes: notes || null,
        schedule: scheduleWithDuration,
        updated_at: new Date().toISOString(),
      }

      if (id && cId === singleClientId) {
        const result = await db.from('workout_plans').update(values).eq('id', id).eq('client_id', cId)
        if (result.error) throw result.error
      } else {
        const result = await db.from('workout_plans').insert(values)
        if (result.error) throw result.error
      }

      await logActivity({
        actorUserId: session.id,
        action: id && cId === singleClientId ? `Updated workout plan "${title}"` : `Assigned workout plan "${title}"`,
        entityType: 'workout_plan',
        entityId: id || undefined,
        metadata: { title, clientId: cId },
      })
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    const message = error instanceof Error ? error.message : 'Unable to save this plan.'
    errorMsg = message
  }

  if (errorMsg) {
    redirect(`/coach/workout-planner?error=${encodeURIComponent(errorMsg)}`)
  }

  revalidatePath('/coach/workout-planner')
  revalidatePath('/coach/programs')
  revalidatePath('/client/workouts')
  revalidatePath('/admin/programs')
  redirect('/coach/workout-planner?saved=1')
}

export async function deleteWorkoutPlanAction(formData: FormData) {
  const session = await requireCoach()
  const id = String(formData.get('id') ?? '')
  const clientId = String(formData.get('clientId') ?? '')

  if (!id || !clientId) redirect('/coach/workout-planner?error=missing-fields')

  let errorMsg: string | null = null

  try {
    await verifyAssignedClient(clientId, session.id)
    const db: any = createAdminClient()
    const { error } = await db
      .from('workout_plans')
      .delete()
      .eq('id', id)
      .eq('client_id', clientId)
      .eq('coach_user_id', session.id)

    if (error) throw error

    await logActivity({
      actorUserId: session.id,
      action: 'Deleted workout plan',
      entityType: 'workout_plan',
      entityId: id,
      metadata: { clientId },
    })
  } catch (error) {
    if (isRedirectError(error)) throw error
    const message = error instanceof Error ? error.message : 'Unable to delete this plan.'
    errorMsg = message
  }

  if (errorMsg) {
    redirect(`/coach/workout-planner?error=${encodeURIComponent(errorMsg)}`)
  }

  revalidatePath('/coach/workout-planner')
  revalidatePath('/coach/programs')
  revalidatePath('/client/workouts')
  revalidatePath('/admin/programs')
  redirect('/coach/workout-planner?deleted=1')
}
