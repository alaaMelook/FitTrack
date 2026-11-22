import type { Metadata } from 'next'
import Link from 'next/link'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { coachSaveExerciseAction, coachDeleteExerciseAction } from './actions'
import { BookOpen, Plus, Trash2, Edit3, Video, Search, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Exercise Library — FitTrack' }

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Abs / Core',
  'Cardio',
  'Full Body',
  'Other',
]

export default async function ExerciseLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    edit?: string
    error?: string
    saved?: string
    deleted?: string
  }>
}) {
  const session = await requireCoach()
  const params = await searchParams
  const db: any = createAdminClient()
  const q = params.q?.toLowerCase() ?? ''

  const { data: exercises } = await db
    .from('exercise_library')
    .select('id, name, muscle_group, description, video_url, created_by_user_id')
    .order('muscle_group', { ascending: true })
    .order('name', { ascending: true })

  const allExercises: any[] = exercises ?? []

  const filtered = q
    ? allExercises.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          (ex.muscle_group && ex.muscle_group.toLowerCase().includes(q)) ||
          (ex.description && ex.description.toLowerCase().includes(q))
      )
    : allExercises

  const editingExercise = params.edit
    ? allExercises.find((ex) => ex.id === params.edit)
    : null

  // Group by muscle group
  const grouped: Record<string, any[]> = {}
  for (const ex of filtered) {
    const group = ex.muscle_group || 'Other'
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(ex)
  }

  return (
    <main className="page-body animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <BookOpen size={28} style={{ color: 'var(--brand-600)' }} />
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Exercise Library</h1>
          </div>
          <p className="text-secondary text-sm">
            Manage the centralized exercise database. Add, edit, or customize exercises to use in client workout plans.
          </p>
        </div>

        <Link
          href="/coach/workout-planner"
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <span>Go to Workout Planner</span>
          <ArrowRight size={14} />
        </Link>
      </header>

      {/* Flash Messages */}
      {params.error && (
        <div className="badge badge-error" style={{ display: 'block', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          {params.error === 'missing-fields' ? 'Exercise name and muscle group are required.' : params.error}
        </div>
      )}
      {params.saved && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#d1fae5',
            color: '#065f46',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontWeight: 600,
          }}
        >
          ✓ Exercise saved successfully to the library.
        </div>
      )}
      {params.deleted && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#fef3c7',
            color: '#92400e',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontWeight: 600,
          }}
        >
          Exercise removed from the library.
        </div>
      )}

      {/* Add / Edit Exercise Form */}
      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '0.25rem' }}>
          {editingExercise ? `Edit Exercise: ${editingExercise.name}` : 'Add New Exercise to Library'}
        </h2>
        <p className="text-secondary text-xs" style={{ marginBottom: '1rem' }}>
          {editingExercise
            ? 'Update the exercise details below. Only exercises you contributed can be modified.'
            : 'Add a new movement to the global exercise library so you can assign it in any client workout schedule.'}
        </p>

        <form action={coachSaveExerciseAction} style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {editingExercise && <input type="hidden" name="id" value={editingExercise.id} />}

          <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
            <label className="form-group">
              <span>Exercise Name *</span>
              <input
                name="name"
                required
                placeholder="e.g. Incline Dumbbell Press"
                defaultValue={editingExercise?.name ?? ''}
              />
            </label>
            <label className="form-group">
              <span>Target Muscle Group *</span>
              <select name="muscle_group" required defaultValue={editingExercise?.muscle_group ?? ''}>
                <option value="" disabled>Select muscle group…</option>
                {MUSCLE_GROUPS.map((mg) => (
                  <option key={mg} value={mg}>{mg}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
            <label className="form-group">
              <span>Instructions & Technique Notes</span>
              <textarea
                name="description"
                rows={3}
                placeholder="Form cues, angle, foot positioning, tempo, breathing..."
                defaultValue={editingExercise?.description ?? ''}
              />
            </label>
            <label className="form-group">
              <span>Demonstration Video URL (Optional)</span>
              <input
                name="video_url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                defaultValue={editingExercise?.video_url ?? ''}
              />
              <span className="text-xs text-secondary" style={{ marginTop: 4 }}>
                Supports YouTube, Vimeo, or MP4 video links.
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
            {editingExercise && (
              <a href="/coach/exercise-library" className="btn btn-ghost btn-sm">
                Cancel Edit
              </a>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ minWidth: 160, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={15} /> {editingExercise ? 'Update Exercise' : 'Save to Exercise Library'}
            </button>
          </div>
        </form>
      </section>

      {/* Search & Directory Section */}
      <section className="card">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
              Central Exercise Directory
              <span className="badge badge-neutral" style={{ marginLeft: 8, fontSize: '12px' }}>
                {allExercises.length} total
              </span>
            </h2>
            <p className="text-secondary text-xs">All exercises available when building client schedules.</p>
          </div>

          {/* Search Form */}
          <form method="GET" action="/coach/exercise-library" style={{ display: 'flex', gap: 6 }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                }}
              />
              <input
                name="q"
                type="text"
                defaultValue={params.q ?? ''}
                placeholder="Search by name or muscle..."
                style={{
                  paddingLeft: 32,
                  paddingRight: 12,
                  paddingTop: 7,
                  paddingBottom: 7,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: 'var(--text-sm)',
                  minWidth: 220,
                }}
              />
            </div>
            <button type="submit" className="btn btn-ghost btn-sm">Search</button>
            {params.q && (
              <Link href="/coach/exercise-library" className="btn btn-ghost btn-sm">
                Clear
              </Link>
            )}
          </form>
        </div>

        {filtered.length === 0 ? (
          <div className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            {q ? `No exercises found matching "${params.q}".` : 'No exercises in the library yet. Add your first exercise above.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
            {Object.entries(grouped).map(([group, exList]) => (
              <div key={group}>
                <h3
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 700,
                    color: 'var(--brand-700)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: 8,
                  }}
                >
                  {group} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({exList.length})</span>
                </h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Exercise Name</th>
                        <th>Muscle Group</th>
                        <th>Instructions</th>
                        <th>Video Demo</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exList.map((ex: any) => {
                        return (
                          <tr key={ex.id}>
                            <td>
                              <strong>{ex.name}</strong>
                            </td>
                            <td>
                              <span className="badge badge-brand">{ex.muscle_group}</span>
                            </td>
                            <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: 320 }}>
                              {ex.description || '—'}
                            </td>
                            <td>
                              {ex.video_url ? (
                                <a
                                  href={ex.video_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-ghost btn-sm"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '11px' }}
                                >
                                  <Video size={12} /> Watch Demo
                                </a>
                              ) : (
                                <span className="text-secondary" style={{ fontSize: '11px' }}>—</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <Link
                                  href={`/coach/exercise-library?edit=${ex.id}`}
                                  className="btn btn-ghost btn-sm"
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                >
                                  <Edit3 size={13} /> Edit
                                </Link>
                                <form action={coachDeleteExerciseAction}>
                                  <input type="hidden" name="id" value={ex.id} />
                                  <button
                                    type="submit"
                                    className="btn btn-ghost btn-sm"
                                    style={{ color: 'var(--error, #dc2626)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  >
                                    <Trash2 size={13} /> Delete
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
