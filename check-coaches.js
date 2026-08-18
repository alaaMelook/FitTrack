// Script to check coaches status in Supabase
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://msetuzytnckcufrrsmed.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZXR1enl0bmNrY3VmcnJzbWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzA3NDI1OCwiZXhwIjoyMTAyNjUwMjU4fQ.agV4I1Z46oxYApCLlT55CSx-Sk55Ax3-cwY7GgP5syQ'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function checkCoaches() {
  console.log('=== Checking coaches table ===')
  const { data: coaches, error } = await supabase
    .from('coaches')
    .select('id, user_id, is_active, bio')

  if (error) {
    console.error('Error fetching coaches:', error)
    return
  }

  console.log('All coaches:', JSON.stringify(coaches, null, 2))

  // Also fetch user names
  if (coaches && coaches.length > 0) {
    const userIds = coaches.map(c => c.user_id)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, is_active')
      .in('id', userIds)

    if (usersError) {
      console.error('Error fetching users:', usersError)
    } else {
      console.log('\nMatching users:', JSON.stringify(users, null, 2))
    }

    // Active coaches only
    const activeCoaches = coaches.filter(c => c.is_active === true)
    console.log(`\nActive coaches (is_active=true): ${activeCoaches.length} / ${coaches.length}`)
  }
}

checkCoaches().catch(console.error)
