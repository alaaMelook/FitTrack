'use server'

import { revalidatePath } from 'next/cache'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

function parseMeasurementFields(formData: FormData) {
  const measuredAtStr = formData.get('measuredAt') as string
  return {
    measuredAt: measuredAtStr
      ? new Date(measuredAtStr).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    chestCm: formData.get('chestCm') ? parseFloat(formData.get('chestCm') as string) : null,
    armCm: formData.get('armCm') ? parseFloat(formData.get('armCm') as string) : null,
    glutesCm: formData.get('glutesCm') ? parseFloat(formData.get('glutesCm') as string) : null,
    absCm: formData.get('absCm') ? parseFloat(formData.get('absCm') as string) : null,
    legCm: formData.get('legCm') ? parseFloat(formData.get('legCm') as string) : null,
    calfCm: formData.get('calfCm') ? parseFloat(formData.get('calfCm') as string) : null,
    backCm: formData.get('backCm') ? parseFloat(formData.get('backCm') as string) : null,
    weightKg: formData.get('weightKg') ? parseFloat(formData.get('weightKg') as string) : null,
    bodyFatPct: formData.get('bodyFatPct') ? parseFloat(formData.get('bodyFatPct') as string) : null,
    muscleMassKg: formData.get('muscleMassKg') ? parseFloat(formData.get('muscleMassKg') as string) : null,
    coachNotes: (formData.get('notes') as string) || '',
  }
}

export async function addMeasurementAction(prevState: any, formData: FormData) {
  try {
    const session = await requireCoach()
    const adminSupabase = createAdminClient()

    const clientId = formData.get('clientId') as string
    if (!clientId) return { success: false, error: 'Client ID is required.' }

    const f = parseMeasurementFields(formData)

    const hasAnyField = [f.chestCm, f.armCm, f.glutesCm, f.absCm, f.legCm, f.calfCm, f.backCm, f.weightKg, f.bodyFatPct, f.muscleMassKg, f.coachNotes]
      .some(val => val !== null && val !== '')
    if (!hasAnyField) return { success: false, error: 'Please enter at least one measurement.' }

    const extraDetails: string[] = []
    if (f.calfCm) extraDetails.push(`Calf: ${f.calfCm}cm`)
    if (f.backCm) extraDetails.push(`Back: ${f.backCm}cm`)
    if (f.coachNotes) extraDetails.push(f.coachNotes)

    const { error: insertError } = await adminSupabase.from('measurements').insert({
      client_id: clientId,
      recorded_by_user_id: session.id,
      measured_at: f.measuredAt,
      chest_cm: f.chestCm,
      arm_cm: f.armCm,
      hips_cm: f.glutesCm,
      waist_cm: f.absCm,
      thigh_cm: f.legCm,
      weight_kg: f.weightKg,
      body_fat_pct: f.bodyFatPct,
      muscle_mass_kg: f.muscleMassKg,
      notes: extraDetails.length > 0 ? extraDetails.join(' | ') : null,
    })

    if (insertError) return { success: false, error: insertError.message }

    revalidatePath(`/coach/my-clients/${clientId}`)
    revalidatePath('/coach/dashboard')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

/** Coach can edit an existing measurement belonging to their client */
export async function editMeasurementAction(prevState: any, formData: FormData) {
  try {
    await requireCoach()
    const adminSupabase = createAdminClient()

    const measurementId = formData.get('measurementId') as string
    const clientId = formData.get('clientId') as string
    if (!measurementId || !clientId) return { success: false, error: 'Measurement ID and Client ID required.' }

    const f = parseMeasurementFields(formData)

    const extraDetails: string[] = []
    if (f.calfCm) extraDetails.push(`Calf: ${f.calfCm}cm`)
    if (f.backCm) extraDetails.push(`Back: ${f.backCm}cm`)
    if (f.coachNotes) extraDetails.push(f.coachNotes)

    const { error: updateError } = await adminSupabase
      .from('measurements')
      .update({
        measured_at: f.measuredAt,
        chest_cm: f.chestCm,
        arm_cm: f.armCm,
        hips_cm: f.glutesCm,
        waist_cm: f.absCm,
        thigh_cm: f.legCm,
        weight_kg: f.weightKg,
        body_fat_pct: f.bodyFatPct,
        muscle_mass_kg: f.muscleMassKg,
        notes: extraDetails.length > 0 ? extraDetails.join(' | ') : null,
      } as any)
      .eq('id', measurementId)

    if (updateError) return { success: false, error: updateError.message }

    revalidatePath(`/coach/my-clients/${clientId}`)
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}

/** Coach can delete a measurement belonging to their client */
export async function deleteMeasurementAction(measurementId: string, clientId: string) {
  try {
    await requireCoach()
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
      .from('measurements')
      .delete()
      .eq('id', measurementId)

    if (error) return { success: false, error: error.message }

    revalidatePath(`/coach/my-clients/${clientId}`)
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

