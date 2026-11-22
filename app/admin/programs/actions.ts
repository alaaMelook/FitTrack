'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

/** Delete a nutrition plan by id */
export async function adminDeleteNutritionPlan(id: string) {
  await requireAdmin()
  const db: any = createAdminClient()

  const { error } = await db.from('nutrition_plans').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/programs')
  redirect('/admin/programs?tab=nutrition&deleted=1')
}

/** Edit/update a nutrition plan */
export async function adminUpdateNutritionPlan(formData: FormData) {
  await requireAdmin()
  const db: any = createAdminClient()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const notes = formData.get('notes') as string
  const mealsRaw = formData.get('meals') as string
  const coachUserId = (formData.get('coach_user_id') as string)?.trim() || null
  const sharedCoachIds = formData.getAll('shared_coach_ids').map((v) => String(v).trim()).filter(Boolean)

  let meals: any
  try {
    meals = JSON.parse(mealsRaw)
  } catch {
    redirect(`/admin/programs?tab=nutrition&error=invalid_json`)
  }

  // Tag sharedCoachIds in meals JSONB for guaranteed availability
  if (Array.isArray(meals) && meals.length > 0) {
    meals[0] = {
      ...meals[0],
      sharedCoachIds,
    }
  }

  const updatePayload: Record<string, any> = {
    title,
    notes,
    meals,
    updated_at: new Date().toISOString(),
  }

  if (coachUserId) {
    updatePayload.coach_user_id = coachUserId
  }

  // Try updating with shared_coach_ids column, fallback gracefully if column is not yet migrated
  try {
    const { error } = await db
      .from('nutrition_plans')
      .update({ ...updatePayload, shared_coach_ids: sharedCoachIds })
      .eq('id', id)

    if (error && (error.code === '42703' || error.message?.includes('shared_coach_ids'))) {
      const { error: fallbackError } = await db.from('nutrition_plans').update(updatePayload).eq('id', id)
      if (fallbackError) throw new Error(fallbackError.message)
    } else if (error) {
      throw new Error(error.message)
    }
  } catch (err: any) {
    if (err?.digest?.includes('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') throw err
    const { error: fallbackError } = await db.from('nutrition_plans').update(updatePayload).eq('id', id)
    if (fallbackError) throw new Error(fallbackError.message)
  }

  revalidatePath('/admin/programs')
  revalidatePath('/coach/programs')
  revalidatePath('/coach/workout-planner')
  redirect('/admin/programs?tab=nutrition&saved=1')
}

/** Delete a workout plan by id */
export async function adminDeleteWorkoutPlan(id: string) {
  await requireAdmin()
  const db: any = createAdminClient()

  const { error } = await db.from('workout_plans').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/programs')
  redirect('/admin/programs?tab=workout&deleted=1')
}

/** Edit/update a workout plan */
export async function adminUpdateWorkoutPlan(formData: FormData) {
  await requireAdmin()
  const db: any = createAdminClient()

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const notes = formData.get('notes') as string
  const scheduleRaw = formData.get('schedule') as string
  const coachUserId = (formData.get('coach_user_id') as string)?.trim() || null
  const sharedCoachIds = formData.getAll('shared_coach_ids').map((v) => String(v).trim()).filter(Boolean)

  let schedule: any
  try {
    schedule = JSON.parse(scheduleRaw)
  } catch {
    redirect(`/admin/programs?tab=workout&error=invalid_json`)
  }

  // Tag sharedCoachIds in schedule JSONB for guaranteed availability
  if (Array.isArray(schedule) && schedule.length > 0) {
    schedule[0] = {
      ...schedule[0],
      sharedCoachIds,
    }
  }

  const updatePayload: Record<string, any> = {
    title,
    notes,
    schedule,
    updated_at: new Date().toISOString(),
  }

  if (coachUserId) {
    updatePayload.coach_user_id = coachUserId
  }

  // Try updating with shared_coach_ids column, fallback gracefully if column is not yet migrated
  try {
    const { error } = await db
      .from('workout_plans')
      .update({ ...updatePayload, shared_coach_ids: sharedCoachIds })
      .eq('id', id)

    if (error && (error.code === '42703' || error.message?.includes('shared_coach_ids'))) {
      const { error: fallbackError } = await db.from('workout_plans').update(updatePayload).eq('id', id)
      if (fallbackError) throw new Error(fallbackError.message)
    } else if (error) {
      throw new Error(error.message)
    }
  } catch (err: any) {
    if (err?.digest?.includes('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') throw err
    const { error: fallbackError } = await db.from('workout_plans').update(updatePayload).eq('id', id)
    if (fallbackError) throw new Error(fallbackError.message)
  }

  revalidatePath('/admin/programs')
  revalidatePath('/coach/programs')
  revalidatePath('/coach/workout-planner')
  redirect('/admin/programs?tab=workout&saved=1')
}

/** Insert or upsert an exercise in the library */
export async function adminSaveExercise(formData: FormData) {
  await requireAdmin()
  const db: any = createAdminClient()

  const id = (formData.get('id') as string) || null
  const name = (formData.get('name') as string)?.trim()
  const muscle_group = (formData.get('muscle_group') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const video_url = (formData.get('video_url') as string)?.trim() || null

  if (!name || !muscle_group) {
    redirect('/admin/programs?tab=exercises&error=missing_fields')
  }

  if (id) {
    const { error } = await db
      .from('exercise_library')
      .update({ name, muscle_group, description, video_url, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await db
      .from('exercise_library')
      .insert({ name, muscle_group, description, video_url })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/programs')
  redirect('/admin/programs?tab=exercises&saved=1')
}

/** Delete an exercise from the library */
export async function adminDeleteExercise(id: string) {
  await requireAdmin()
  const db: any = createAdminClient()

  const { error } = await db.from('exercise_library').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/programs')
  redirect('/admin/programs?tab=exercises&deleted=1')
}
