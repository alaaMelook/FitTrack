'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function coachSaveExerciseAction(formData: FormData) {
  const session = await requireCoach()
  const id = String(formData.get('id') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const muscle_group = String(formData.get('muscle_group') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const video_url = String(formData.get('video_url') ?? '').trim() || null

  if (!name || !muscle_group) {
    redirect('/coach/exercise-library?error=missing-fields')
  }

  const db: any = createAdminClient()

  if (id) {
    // Update — only if this coach created it
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
      .eq('created_by_user_id', session.id)

    if (error) {
      redirect(`/coach/exercise-library?error=${encodeURIComponent(error.message)}`)
    }
  } else {
    // Insert new exercise
    const { error } = await db.from('exercise_library').insert({
      name,
      muscle_group,
      description,
      video_url,
      created_by_user_id: session.id,
    })

    if (error) {
      redirect(`/coach/exercise-library?error=${encodeURIComponent(error.message)}`)
    }
  }

  revalidatePath('/coach/exercise-library')
  revalidatePath('/coach/workout-planner')
  revalidatePath('/coach/programs')
  revalidatePath('/admin/programs')
  redirect('/coach/exercise-library?saved=1')
}

export async function coachDeleteExerciseAction(formData: FormData) {
  const session = await requireCoach()
  const id = String(formData.get('id') ?? '').trim()

  if (!id) redirect('/coach/exercise-library?error=missing-id')

  const db: any = createAdminClient()
  const { error } = await db
    .from('exercise_library')
    .delete()
    .eq('id', id)
    .eq('created_by_user_id', session.id)

  if (error) {
    redirect(`/coach/exercise-library?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/coach/exercise-library')
  revalidatePath('/coach/workout-planner')
  revalidatePath('/coach/programs')
  revalidatePath('/admin/programs')
  redirect('/coach/exercise-library?deleted=1')
}
