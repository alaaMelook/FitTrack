'use server'

import { revalidatePath } from 'next/cache'
import { requireCoach } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function addMeasurementAction(prevState: any, formData: FormData) {
  try {
    const session = await requireCoach()
    const supabase = await createClient()

    const clientId = formData.get('clientId') as string
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
    const coachNotes = (formData.get('notes') as string) || ''

    if (!clientId) {
      return { success: false, error: 'Client ID is required.' }
    }

    const hasAnyField = [chestCm, armCm, glutesCm, absCm, legCm, calfCm, backCm, weightKg, bodyFatPct, muscleMassKg, coachNotes]
      .some(val => val !== null && val !== '')

    if (!hasAnyField) {
      return { success: false, error: 'Please enter at least one measurement.' }
    }

    const measuredAt = measuredAtStr ? new Date(measuredAtStr).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]

    // Construct extra details note if calf/back are supplied
    const extraDetails: string[] = []
    if (calfCm) extraDetails.push(`Calf: ${calfCm}cm`)
    if (backCm) extraDetails.push(`Back: ${backCm}cm`)
    if (coachNotes) extraDetails.push(coachNotes)

    const formattedNotes = extraDetails.length > 0 ? extraDetails.join(' | ') : null

    const { error: insertError } = await supabase.from('measurements').insert({
      client_id: clientId,
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

    if (insertError) {
      console.error('Insert measurement error:', insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath(`/coach/my-clients/${clientId}`)
    revalidatePath('/coach/dashboard')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Action error:', err)
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}
