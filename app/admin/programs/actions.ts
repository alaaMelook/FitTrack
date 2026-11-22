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

  let meals: unknown
  try {
    meals = JSON.parse(mealsRaw)
  } catch {
    redirect(`/admin/programs?tab=nutrition&error=invalid_json`)
  }

  const { error } = await db
    .from('nutrition_plans')
    .update({ title, notes, meals, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/programs')
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

  let schedule: unknown
  try {
    schedule = JSON.parse(scheduleRaw)
  } catch {
    redirect(`/admin/programs?tab=workout&error=invalid_json`)
  }

  const { error } = await db
    .from('workout_plans')
    .update({ title, notes, schedule, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/programs')
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
