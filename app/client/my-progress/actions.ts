'use server'

import { revalidatePath } from 'next/cache'
import { requireClient } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export async function addClientSelfMeasurementAction(prevState: any, formData: FormData) {
  try {
    const session = await requireClient()
    const adminSupabase = createAdminClient()

    const measuredAtStr = formData.get('measuredAt') as string
    const chestCm = formData.get('chestCm') ? parseFloat(formData.get('chestCm') as string) : null
    const armCm = formData.get('armCm') ? parseFloat(formData.get('armCm') as string) : null
    const glutesCm = formData.get('glutesCm') ? parseFloat(formData.get('glutesCm') as string) : null
    const absCm = formData.get('absCm') ? parseFloat(formData.get('absCm') as string) : null
    const legCm = formData.get('legCm') ? parseFloat(formData.get('legCm') as string) : null
    const calfCm = formData.get('calfCm') ? parseFloat(formData.get('calfCm') as string) : null
    const backCm = formData.get('backCm') ? parseFloat(formData.get('backCm') as string) : null
    const weightKg = formData.get('weightKg') ? parseFloat(formData.get('weightKg') as string) : null
    const bodyFatPct = formData.get('bodyFatPct') ? parseFloat(formData.get('bodyFatPct') as string) : null
    const muscleMassKg = formData.get('muscleMassKg') ? parseFloat(formData.get('muscleMassKg') as string) : null
    const userNotes = (formData.get('notes') as string) || ''

    // Check if at least one field is provided
    const hasAnyField = [chestCm, armCm, glutesCm, absCm, legCm, calfCm, backCm, weightKg, bodyFatPct, muscleMassKg, userNotes]
      .some(val => val !== null && val !== '')

    if (!hasAnyField) {
      return { success: false, error: 'Please enter at least one measurement.' }
    }

    // Get client record
    const { data: clientRow } = await adminSupabase
      .from('clients')
      .select('id')
      .eq('user_id', session.id)
      .single()

    if (!clientRow) {
      return { success: false, error: 'Client profile not found.' }
    }

    const measuredAt = measuredAtStr ? new Date(measuredAtStr).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

    // Construct extra details note if calf/back/glutes/abs are supplied
    const extraDetails: string[] = []
    if (calfCm) extraDetails.push(`Calf: ${calfCm}cm`)
    if (backCm) extraDetails.push(`Back: ${backCm}cm`)
    if (userNotes) extraDetails.push(userNotes)

    const formattedNotes = extraDetails.length > 0 ? extraDetails.join(' | ') : null

    const { error: insertErr } = await adminSupabase.from('measurements').insert({
      client_id: clientRow.id,
      recorded_by_user_id: session.id,
      measured_at: measuredAt,
      chest_cm: chestCm,
      arm_cm: armCm,
      hips_cm: glutesCm,  // Glutes stored in hips_cm
      waist_cm: absCm,     // Abs stored in waist_cm
      thigh_cm: legCm,     // Leg stored in thigh_cm
      weight_kg: weightKg,
      body_fat_pct: bodyFatPct,
      muscle_mass_kg: muscleMassKg,
      notes: formattedNotes,
    })

    if (insertErr) {
      console.error('Insert measurement error:', insertErr)
      return { success: false, error: insertErr.message }
    }

    revalidatePath('/client/my-progress')
    revalidatePath('/client/dashboard')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'An error occurred while saving your measurements.' }
  }
}

/** Client can edit their own measurement */
export async function editClientMeasurementAction(prevState: any, formData: FormData) {
  try {
    const session = await requireClient()
    const adminSupabase = createAdminClient()

    const measurementId = formData.get('measurementId') as string
    if (!measurementId) return { success: false, error: 'Measurement ID is required.' }

    // Get client record
    const { data: clientRow } = await adminSupabase
      .from('clients')
      .select('id')
      .eq('user_id', session.id)
      .single()

    if (!clientRow) {
      return { success: false, error: 'Client profile not found.' }
    }

    const measuredAtStr = formData.get('measuredAt') as string
    const chestCm = formData.get('chestCm') ? parseFloat(formData.get('chestCm') as string) : null
    const armCm = formData.get('armCm') ? parseFloat(formData.get('armCm') as string) : null
    const glutesCm = formData.get('glutesCm') ? parseFloat(formData.get('glutesCm') as string) : null
    const absCm = formData.get('absCm') ? parseFloat(formData.get('absCm') as string) : null
    const legCm = formData.get('legCm') ? parseFloat(formData.get('legCm') as string) : null
    const calfCm = formData.get('calfCm') ? parseFloat(formData.get('calfCm') as string) : null
    const backCm = formData.get('backCm') ? parseFloat(formData.get('backCm') as string) : null
    const weightKg = formData.get('weightKg') ? parseFloat(formData.get('weightKg') as string) : null
    const bodyFatPct = formData.get('bodyFatPct') ? parseFloat(formData.get('bodyFatPct') as string) : null
    const muscleMassKg = formData.get('muscleMassKg') ? parseFloat(formData.get('muscleMassKg') as string) : null
    const userNotes = (formData.get('notes') as string) || ''

    const measuredAt = measuredAtStr ? new Date(measuredAtStr).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

    const extraDetails: string[] = []
    if (calfCm) extraDetails.push(`Calf: ${calfCm}cm`)
    if (backCm) extraDetails.push(`Back: ${backCm}cm`)
    if (userNotes) extraDetails.push(userNotes)

    const formattedNotes = extraDetails.length > 0 ? extraDetails.join(' | ') : null

    const { error: updateErr } = await adminSupabase
      .from('measurements')
      .update({
        measured_at: measuredAt,
        chest_cm: chestCm,
        arm_cm: armCm,
        hips_cm: glutesCm,
        waist_cm: absCm,
        thigh_cm: legCm,
        weight_kg: weightKg,
        body_fat_pct: bodyFatPct,
        muscle_mass_kg: muscleMassKg,
        notes: formattedNotes,
      } as any)
      .eq('id', measurementId)
      .eq('client_id', clientRow.id)

    if (updateErr) {
      console.error('Update measurement error:', updateErr)
      return { success: false, error: updateErr.message }
    }

    revalidatePath('/client/my-progress')
    revalidatePath('/client/dashboard')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while updating measurement.' }
  }
}

/** Client can delete their own measurement */
export async function deleteClientMeasurementAction(measurementId: string) {
  try {
    const session = await requireClient()
    const adminSupabase = createAdminClient()

    if (!measurementId) return { success: false, error: 'Measurement ID is required.' }

    // Get client record
    const { data: clientRow } = await adminSupabase
      .from('clients')
      .select('id')
      .eq('user_id', session.id)
      .single()

    if (!clientRow) {
      return { success: false, error: 'Client profile not found.' }
    }

    const { error } = await adminSupabase
      .from('measurements')
      .delete()
      .eq('id', measurementId)
      .eq('client_id', clientRow.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/client/my-progress')
    revalidatePath('/client/dashboard')
    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

