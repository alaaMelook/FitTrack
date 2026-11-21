'use server'

import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function parseNum(val: FormDataEntryValue | null): number | null {
  if (!val || val === '') return null
  const n = parseFloat(val as string)
  return isNaN(n) ? null : n
}

export async function adminAddMeasurement(formData: FormData) {
  const session = await requireAdmin()
  const db: any = createAdminClient()

  const clientId = formData.get('clientId') as string
  const measuredAt = formData.get('measuredAt') as string

  await db.from('measurements').insert({
    client_id: clientId,
    recorded_by_user_id: session.id,
    measured_at: measuredAt,
    weight_kg: parseNum(formData.get('weight_kg')),
    body_fat_pct: parseNum(formData.get('body_fat_pct')),
    muscle_mass_kg: parseNum(formData.get('muscle_mass_kg')),
    chest_cm: parseNum(formData.get('chest_cm')),
    arm_cm: parseNum(formData.get('arm_cm')),
    waist_cm: parseNum(formData.get('waist_cm')),
    hips_cm: parseNum(formData.get('hips_cm')),
    thigh_cm: parseNum(formData.get('thigh_cm')),
    upper_body_cm: parseNum(formData.get('upper_body_cm')),
    lower_body_cm: parseNum(formData.get('lower_body_cm')),
    notes: (formData.get('notes') as string) || null,
  })

  revalidatePath('/admin/measurements')
  redirect('/admin/measurements?saved=1')
}

export async function adminDeleteMeasurement(formData: FormData) {
  await requireAdmin()
  const db: any = createAdminClient()

  const id = formData.get('id') as string
  await db.from('measurements').delete().eq('id', id)

  revalidatePath('/admin/measurements')
  redirect('/admin/measurements?deleted=1')
}
