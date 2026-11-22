import { createAdminClient } from '@/lib/supabase/admin'

interface LogActivityParams {
  actorUserId?: string | null
  action: string
  entityType?: string | null
  entityId?: string | null
  targetUserId?: string | null
  gymId?: string | null
  metadata?: Record<string, any>
}

export async function logActivity({
  actorUserId,
  action,
  entityType = null,
  entityId = null,
  targetUserId = null,
  gymId = 'a0000000-0000-0000-0000-000000000001',
  metadata = {},
}: LogActivityParams) {
  try {
    const db: any = createAdminClient()
    await db.from('activity_logs').insert({
      actor_user_id: actorUserId || null,
      action,
      entity_type: entityType,
      entity_id: entityId,
      target_user_id: targetUserId,
      gym_id: gymId,
      metadata: metadata || {},
    })
  } catch (err) {
    console.error('[logActivity Error]', err)
  }
}
