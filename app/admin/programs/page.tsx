import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  adminDeleteNutritionPlan,
  adminUpdateNutritionPlan,
  adminDeleteWorkoutPlan,
  adminUpdateWorkoutPlan,
  adminSaveExercise,
  adminDeleteExercise,
} from './actions'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Programs Management — FitTrack' }

/* ─── helpers ─────────────────────────────────────────────────── */

function totalCalories(meals: unknown): number {
  if (!Array.isArray(meals)) return 0
  let total = 0
  for (const meal of meals) {
    if (Array.isArray(meal?.foods)) {
      for (const food of meal.foods) {
        total += Number(food?.calories ?? food?.kcal ?? 0)
      }
    }
  }
  return total
}

function countWorkoutDays(schedule: unknown): { total: number; workout: number; rest: number } {
  if (!Array.isArray(schedule)) return { total: 0, workout: 0, rest: 0 }
  const total = schedule.length
  const rest = schedule.filter(
    (d: any) => d?.type === 'rest' || d?.rest === true || d?.is_rest === true || d?.restDay === true,
  ).length
  return { total, workout: total - rest, rest }
}

/* ─── Tab navigation link (Next.js Link with scroll={false}) ─── */
function TabLink({
  label,
  tabKey,
  active,
}: {
  label: string
  tabKey: string
  active: boolean
}) {
  return (
    <Link
      href={`/admin/programs?tab=${tabKey}`}
      scroll={false}
      style={{
        padding: '8px 20px',
        borderRadius: 'var(--radius-md)',
        fontWeight: active ? 700 : 500,
        fontSize: 'var(--text-sm)',
        background: active ? 'var(--brand-600)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        textDecoration: 'none',
        transition: 'all 0.15s',
        border: active ? 'none' : '1px solid var(--border-subtle)',
      }}
    >
      {label}
    </Link>
  )
}

/* ─── Flash banner ───────────────────────────────────────────── */
function Flash({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
        fontSize: 'var(--text-sm)',
        background: type === 'success' ? 'var(--success-bg, #d1fae5)' : 'var(--error-bg, #fee2e2)',
        color: type === 'success' ? 'var(--success-text, #065f46)' : 'var(--error-text, #991b1b)',
        border: `1px solid ${type === 'success' ? 'var(--success-border, #6ee7b7)' : 'var(--error-border, #fca5a5)'}`,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Empty state ────────────────────────────────────────────── */
function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="card"
      style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}
    >
      {message}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string; saved?: string; deleted?: string; edit?: string }>
}) {
  await requireAdmin()

  const params = await searchParams
  const tab = params.tab === 'workout' ? 'workout' : params.tab === 'exercises' ? 'exercises' : 'nutrition'
  const editId = params.edit ?? null

  const db: any = createAdminClient()

  /* ── data fetching ── */
  const [
    { data: nutritionPlans },
    { data: workoutPlans },
    { data: exercises },
  ] = await Promise.all([
    db
      .from('nutrition_plans')
      .select(
        'id,title,notes,meals,updated_at,clients(users(full_name)),coach:coach_user_id(full_name)',
      )
      .order('updated_at', { ascending: false }),
    db
      .from('workout_plans')
      .select(
        'id,title,notes,schedule,updated_at,clients(users(full_name)),coach:coach_user_id(full_name)',
      )
      .order('updated_at', { ascending: false }),
    db
      .from('exercise_library')
      .select('id,name,muscle_group,description,video_url')
      .order('name', { ascending: true }),
  ])

  /* ── inline edit target ── */
  const editNutritionPlan =
    tab === 'nutrition' && editId ? (nutritionPlans ?? []).find((p: any) => p.id === editId) : null
  const editWorkoutPlan =
    tab === 'workout' && editId ? (workoutPlans ?? []).find((p: any) => p.id === editId) : null

  return (
    <div className="page-body animate-fade-in">
      {/* ── header ── */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: 'var(--space-4)' }}
      >
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: '0.25rem' }}>
            Programs Management
          </h1>
          <p className="text-secondary text-sm">
            Manage nutrition plans, workout plans, and exercise library.
          </p>
        </div>
      </div>

      {/* ── flash messages ── */}
      {params.saved === '1' && <Flash type="success">Changes saved successfully.</Flash>}
      {params.deleted === '1' && <Flash type="success">Item deleted successfully.</Flash>}
      {params.error === 'invalid_json' && (
        <Flash type="error">Invalid JSON — please check the content and try again.</Flash>
      )}
      {params.error === 'missing_fields' && (
        <Flash type="error">Name and muscle group are required.</Flash>
      )}

      {/* ── tab bar ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <TabLink label={`Nutrition Plans (${nutritionPlans?.length ?? 0})`} tabKey="nutrition" active={tab === 'nutrition'} />
        <TabLink label={`Workout Plans (${workoutPlans?.length ?? 0})`} tabKey="workout" active={tab === 'workout'} />
        <TabLink label={`Exercise Library (${exercises?.length ?? 0})`} tabKey="exercises" active={tab === 'exercises'} />
      </div>

      {/* ══════════════════════════════════════════
          TAB 1 — NUTRITION PLANS
      ══════════════════════════════════════════ */}
      {tab === 'nutrition' && (
        <section>
          {!nutritionPlans || nutritionPlans.length === 0 ? (
            <EmptyState message="No nutrition plans have been created yet." />
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {(nutritionPlans as any[]).map((plan) => {
                const clientName = (plan.clients as any)?.users?.full_name ?? '—'
                const coachName = (plan.coach as any)?.full_name ?? (plan.coaches as any)?.users?.full_name ?? '—'
                const mealCount = Array.isArray(plan.meals) ? plan.meals.length : 0
                const kcal = totalCalories(plan.meals)
                const isEditing = editId === plan.id

                return (
                  <article className="card" key={plan.id}>
                    {/* ── plan header ── */}
                    <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: 'var(--text-base)' }}>{plan.title}</strong>
                        <span
                          className="badge badge-brand"
                          style={{ marginLeft: 8, fontSize: '0.7rem' }}
                        >
                          Nutrition
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a
                          href={`/admin/programs?tab=nutrition&edit=${isEditing ? '' : plan.id}`}
                          className="btn btn-ghost"
                          style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}
                        >
                          {isEditing ? 'Cancel' : 'Edit'}
                        </a>
                        <form
                          action={adminDeleteNutritionPlan.bind(null, plan.id)}
                          onSubmit={undefined}
                        >
                          <button
                            type="submit"
                            className="btn btn-ghost"
                            style={{
                              fontSize: 'var(--text-xs)',
                              padding: '4px 12px',
                              color: 'var(--error, #dc2626)',
                            }}
                            onClick={undefined}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* ── meta row ── */}
                    <p className="text-secondary text-sm" style={{ marginTop: '0.4rem' }}>
                      Client: <strong>{clientName}</strong> &nbsp;·&nbsp; Coach:{' '}
                      <strong>{coachName}</strong> &nbsp;·&nbsp; Updated{' '}
                      {new Date(plan.updated_at).toLocaleDateString()} &nbsp;·&nbsp;{' '}
                      <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
                        {mealCount} meal{mealCount !== 1 ? 's' : ''}
                      </span>{' '}
                      {kcal > 0 && (
                        <span
                          className="badge"
                          style={{
                            fontSize: '0.7rem',
                            background: 'var(--cream-300)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {kcal} kcal
                        </span>
                      )}
                    </p>

                    {/* ── inline edit form ── */}
                    {isEditing && (
                      <form
                        action={adminUpdateNutritionPlan}
                        style={{
                          marginTop: '1rem',
                          display: 'grid',
                          gap: 'var(--space-3)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          background: 'var(--cream-100, #fafaf8)',
                        }}
                      >
                        <input type="hidden" name="id" value={plan.id} />

                        <div className="form-group">
                          <label htmlFor={`nutrition-title-${plan.id}`}>Title</label>
                          <input
                            id={`nutrition-title-${plan.id}`}
                            name="title"
                            type="text"
                            defaultValue={plan.title}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`nutrition-notes-${plan.id}`}>Notes</label>
                          <textarea
                            id={`nutrition-notes-${plan.id}`}
                            name="notes"
                            rows={3}
                            defaultValue={plan.notes ?? ''}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`nutrition-meals-${plan.id}`}>
                            Meals (JSON)
                          </label>
                          <textarea
                            id={`nutrition-meals-${plan.id}`}
                            name="meals"
                            rows={10}
                            style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                            defaultValue={JSON.stringify(plan.meals, null, 2)}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <a
                            href={`/admin/programs?tab=nutrition`}
                            className="btn btn-ghost"
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Cancel
                          </a>
                          <button type="submit" className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
                            Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════
          TAB 2 — WORKOUT PLANS
      ══════════════════════════════════════════ */}
      {tab === 'workout' && (
        <section>
          {!workoutPlans || workoutPlans.length === 0 ? (
            <EmptyState message="No workout plans have been created yet." />
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {(workoutPlans as any[]).map((plan) => {
                const clientName = (plan.clients as any)?.users?.full_name ?? '—'
                const coachName = (plan.coach as any)?.full_name ?? (plan.coaches as any)?.users?.full_name ?? '—'
                const days = countWorkoutDays(plan.schedule)
                const isEditing = editId === plan.id

                return (
                  <article className="card" key={plan.id}>
                    {/* ── plan header ── */}
                    <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <strong style={{ fontSize: 'var(--text-base)' }}>{plan.title}</strong>
                        <span
                          className="badge"
                          style={{
                            marginLeft: 8,
                            fontSize: '0.7rem',
                            background: 'var(--purple-100, #ede9fe)',
                            color: 'var(--purple-700, #6d28d9)',
                          }}
                        >
                          Workout
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <a
                          href={`/admin/programs?tab=workout&edit=${isEditing ? '' : plan.id}`}
                          className="btn btn-ghost"
                          style={{ fontSize: 'var(--text-xs)', padding: '4px 12px' }}
                        >
                          {isEditing ? 'Cancel' : 'Edit'}
                        </a>
                        <form action={adminDeleteWorkoutPlan.bind(null, plan.id)}>
                          <button
                            type="submit"
                            className="btn btn-ghost"
                            style={{
                              fontSize: 'var(--text-xs)',
                              padding: '4px 12px',
                              color: 'var(--error, #dc2626)',
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* ── meta row ── */}
                    <p className="text-secondary text-sm" style={{ marginTop: '0.4rem' }}>
                      Client: <strong>{clientName}</strong> &nbsp;·&nbsp; Coach:{' '}
                      <strong>{coachName}</strong> &nbsp;·&nbsp; Updated{' '}
                      {new Date(plan.updated_at).toLocaleDateString()} &nbsp;·&nbsp;{' '}
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.7rem',
                          background: 'var(--purple-100, #ede9fe)',
                          color: 'var(--purple-700, #6d28d9)',
                        }}
                      >
                        {days.total} day{days.total !== 1 ? 's' : ''}
                      </span>{' '}
                      {days.total > 0 && (
                        <>
                          <span
                            className="badge"
                            style={{ fontSize: '0.7rem', background: 'var(--cream-300)', color: 'var(--text-primary)' }}
                          >
                            {days.workout} workout
                          </span>{' '}
                          <span
                            className="badge badge-neutral"
                            style={{ fontSize: '0.7rem' }}
                          >
                            {days.rest} rest
                          </span>
                        </>
                      )}
                    </p>

                    {/* ── structured schedule viewer ── */}
                    {!isEditing && Array.isArray(plan.schedule) && plan.schedule.length > 0 && (
                      <details style={{ marginTop: '0.75rem', fontSize: 'var(--text-xs)' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--brand-700)' }}>
                          View Weekly Schedule ({plan.schedule.length} Days)
                        </summary>
                        <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                          {plan.schedule.map((dayItem: any, dIdx: number) => (
                            <div
                              key={dIdx}
                              style={{
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-sm)',
                                background: dayItem.restDay ? 'var(--cream-300)' : 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong>{dayItem.day} — {dayItem.workout || (dayItem.restDay ? 'Rest' : 'Workout')}</strong>
                                <span className={dayItem.restDay ? 'badge badge-neutral' : 'badge badge-brand'} style={{ fontSize: '10px' }}>
                                  {dayItem.restDay ? 'Rest Day' : `${dayItem.exercises?.length ?? 0} Exercises`}
                                </span>
                              </div>
                              {!dayItem.restDay && Array.isArray(dayItem.exercises) && dayItem.exercises.length > 0 && (
                                <div style={{ marginTop: 6, paddingLeft: 8, display: 'grid', gap: 2 }}>
                                  {dayItem.exercises.map((ex: any, eIdx: number) => (
                                    <div key={eIdx} style={{ color: 'var(--text-secondary)' }}>
                                      • <strong>{ex.name}</strong> ({ex.muscleGroup || 'General'}) — {ex.sets} sets × {ex.reps} reps {ex.weight ? `· ${ex.weight}` : ''}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* ── inline edit form ── */}
                    {isEditing && (
                      <form
                        action={adminUpdateWorkoutPlan}
                        style={{
                          marginTop: '1rem',
                          display: 'grid',
                          gap: 'var(--space-3)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          background: 'var(--cream-100, #fafaf8)',
                        }}
                      >
                        <input type="hidden" name="id" value={plan.id} />

                        <div className="form-group">
                          <label htmlFor={`workout-title-${plan.id}`}>Title</label>
                          <input
                            id={`workout-title-${plan.id}`}
                            name="title"
                            type="text"
                            defaultValue={plan.title}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`workout-notes-${plan.id}`}>Notes</label>
                          <textarea
                            id={`workout-notes-${plan.id}`}
                            name="notes"
                            rows={3}
                            defaultValue={plan.notes ?? ''}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor={`workout-schedule-${plan.id}`}>
                            Schedule (JSON)
                          </label>
                          <textarea
                            id={`workout-schedule-${plan.id}`}
                            name="schedule"
                            rows={12}
                            style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                            defaultValue={JSON.stringify(plan.schedule, null, 2)}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <a
                            href={`/admin/programs?tab=workout`}
                            className="btn btn-ghost"
                            style={{ fontSize: 'var(--text-sm)' }}
                          >
                            Cancel
                          </a>
                          <button type="submit" className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
                            Save Changes
                          </button>
                        </div>
                      </form>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════
          TAB 3 — EXERCISE LIBRARY
      ══════════════════════════════════════════ */}
      {tab === 'exercises' && (
        <section>
          {/* ── add new exercise form ── */}
          <div
            className="card"
            style={{ marginBottom: '1.5rem' }}
          >
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: '1rem', fontWeight: 700 }}>
              Add New Exercise
            </h2>
            <form
              action={adminSaveExercise}
              style={{ display: 'grid', gap: 'var(--space-3)' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                <div className="form-group">
                  <label htmlFor="ex-name">
                    Name <span style={{ color: 'var(--error, #dc2626)' }}>*</span>
                  </label>
                  <input id="ex-name" name="name" type="text" placeholder="e.g. Barbell Squat" required />
                </div>
                <div className="form-group">
                  <label htmlFor="ex-muscle">
                    Muscle Group <span style={{ color: 'var(--error, #dc2626)' }}>*</span>
                  </label>
                  <input
                    id="ex-muscle"
                    name="muscle_group"
                    type="text"
                    placeholder="e.g. Quadriceps"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ex-video">Video URL</label>
                  <input
                    id="ex-video"
                    name="video_url"
                    type="url"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="ex-desc">Description</label>
                <textarea id="ex-desc" name="description" rows={2} placeholder="Optional description..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
                  Add Exercise
                </button>
              </div>
            </form>
          </div>

          {/* ── exercise list ── */}
          {!exercises || exercises.length === 0 ? (
            <EmptyState message="No exercises in the library yet. Add one above." />
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Muscle Group</th>
                    <th>Description</th>
                    <th>Video</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(exercises as any[]).map((ex) => (
                    <tr key={ex.id}>
                      <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{ex.name}</td>
                      <td>
                        <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
                          {ex.muscle_group}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-secondary)',
                          maxWidth: '260px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ex.description
                          ? ex.description.length > 80
                            ? ex.description.slice(0, 80) + '…'
                            : ex.description
                          : '—'}
                      </td>
                      <td>
                        {ex.video_url ? (
                          <a
                            href={ex.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="badge badge-brand"
                            style={{ fontSize: '0.7rem', textDecoration: 'none' }}
                          >
                            Watch ↗
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <form action={adminDeleteExercise.bind(null, ex.id)} style={{ display: 'inline' }}>
                          <button
                            type="submit"
                            className="btn btn-ghost"
                            style={{
                              fontSize: 'var(--text-xs)',
                              padding: '3px 10px',
                              color: 'var(--error, #dc2626)',
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
