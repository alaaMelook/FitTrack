import type { Metadata } from 'next'
import Link from 'next/link'
import { requireCoach } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteProgramAction, coachAddExerciseAction } from './actions'
import NutritionPlanForm from '@/components/coach/nutrition-plan-form'
import WorkoutPlanForm from '@/components/coach/workout-plan-form'
import { Salad, Dumbbell, BookOpen, Plus, Trash2, Edit3, Calendar, User, Search, Video } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Nutrition & Workout Plans — FitTrack' }

export default async function CoachProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string
    error?: string
    saved?: string
    deleted?: string
    edit?: string
    q?: string
  }>
}) {
  const session = await requireCoach()
  const params = await searchParams
  const activeTab = params.tab === 'workout' ? 'workout' : params.tab === 'exercises' ? 'exercises' : 'nutrition'
  const editId = params.edit ?? null
  const searchQuery = (params.q ?? '').toLowerCase().trim()

  const db: any = createAdminClient()

  // 1. Get coach profile
  const { data: coach } = await db.from('coaches').select('id').eq('user_id', session.id).maybeSingle()

  // 2. Get coach's assigned clients
  const { data: assignments } = coach
    ? await db
        .from('coach_assignments')
        .select('client_id, clients(id, users(full_name, email))')
        .eq('coach_id', coach.id)
        .is('ended_at', null)
    : { data: [] }

  const clientList = (assignments ?? [])
    .map((a: any) => ({
      id: a.clients?.id,
      name: a.clients?.users?.full_name || 'Client',
      email: a.clients?.users?.email || '',
    }))
    .filter((c: any) => Boolean(c.id))

  const clientIds = clientList.map((c: any) => c.id)

  // 3. Fetch nutrition plans, workout plans, and exercise library
  const [{ data: nutritionPlans }, { data: workoutPlans }, { data: exerciseLibrary }] = await Promise.all([
    clientIds.length > 0
      ? db
          .from('nutrition_plans')
          .select('id, client_id, title, notes, meals, updated_at, clients(users(full_name))')
          .in('client_id', clientIds)
          .order('updated_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    clientIds.length > 0
      ? db
          .from('workout_plans')
          .select('id, client_id, title, notes, schedule, updated_at, clients(users(full_name))')
          .in('client_id', clientIds)
          .order('updated_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    db
      .from('exercise_library')
      .select('id, name, muscle_group, description, video_url')
      .order('name', { ascending: true }),
  ])

  // If edit mode is active, find the plan being edited
  const editNutritionPlan = editId && activeTab === 'nutrition'
    ? (nutritionPlans ?? []).find((p: any) => p.id === editId)
    : null

  const editWorkoutPlan = editId && activeTab === 'workout'
    ? (workoutPlans ?? []).find((p: any) => p.id === editId)
    : null

  // Filter exercises if search query present
  const filteredExercises = (exerciseLibrary ?? []).filter((ex: any) => {
    if (!searchQuery) return true
    return (
      ex.name.toLowerCase().includes(searchQuery) ||
      (ex.muscle_group && ex.muscle_group.toLowerCase().includes(searchQuery)) ||
      (ex.description && ex.description.toLowerCase().includes(searchQuery))
    )
  })

  return (
    <main className="page-body animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Nutrition & Workout Management</h1>
        <p className="text-secondary text-sm">
          Create, customize, and assign personalized meal & training schedules for your assigned clients.
        </p>
      </header>

      {/* Flash Messages */}
      {params.error && (
        <div className="badge badge-error" style={{ display: 'block', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          {params.error}
        </div>
      )}
      {params.saved && (
        <div style={{ padding: '0.75rem 1rem', background: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600 }}>
          ✓ Plan saved successfully.
        </div>
      )}
      {params.deleted && (
        <div style={{ padding: '0.75rem 1rem', background: '#fef3c7', color: '#92400e', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600 }}>
          Plan deleted.
        </div>
      )}

      {/* Warning if no assigned clients */}
      {clientList.length === 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--cream-300)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            You do not currently have any active assigned clients. Clients must be assigned to you by an admin before you can assign plans.
          </p>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <Link
          href="/coach/programs?tab=nutrition"
          className={`btn ${activeTab === 'nutrition' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Salad size={16} /> Nutrition Plans ({nutritionPlans?.length ?? 0})
        </Link>
        <Link
          href="/coach/programs?tab=workout"
          className={`btn ${activeTab === 'workout' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Dumbbell size={16} /> Workout Plans ({workoutPlans?.length ?? 0})
        </Link>
        <Link
          href="/coach/programs?tab=exercises"
          className={`btn ${activeTab === 'exercises' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <BookOpen size={16} /> Exercise Library ({exerciseLibrary?.length ?? 0})
        </Link>
      </div>

      {/* TAB 1: NUTRITION */}
      {activeTab === 'nutrition' && (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Builder Form Card */}
          <section className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                  {editNutritionPlan ? `Edit Plan: ${editNutritionPlan.title}` : 'Create New Nutrition Plan'}
                </h2>
                <p className="text-secondary text-xs">
                  Set up meals, foods, quantities, calories, and macronutrient breakdowns.
                </p>
              </div>
              {editNutritionPlan && (
                <Link href="/coach/programs?tab=nutrition" className="btn btn-ghost btn-sm">
                  Cancel Edit
                </Link>
              )}
            </div>

            <NutritionPlanForm
              clients={clientList}
              initialData={
                editNutritionPlan
                  ? {
                      id: editNutritionPlan.id,
                      clientId: editNutritionPlan.client_id,
                      title: editNutritionPlan.title,
                      notes: editNutritionPlan.notes ?? '',
                      meals: editNutritionPlan.meals ?? [],
                    }
                  : null
              }
            />
          </section>

          {/* Existing Nutrition Plans List */}
          <section>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1rem' }}>
              Assigned Nutrition Plans
            </h2>

            {(!nutritionPlans || nutritionPlans.length === 0) ? (
              <div className="card text-secondary" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                No nutrition plans assigned yet. Use the form above to create your first plan.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {nutritionPlans.map((plan: any) => {
                  const clientName = plan.clients?.users?.full_name || 'Assigned Client'
                  const mealCount = Array.isArray(plan.meals) ? plan.meals.length : 0
                  const totalCals = Array.isArray(plan.meals)
                    ? plan.meals.reduce(
                        (sum: number, m: any) =>
                          sum +
                          (Array.isArray(m.foods)
                            ? m.foods.reduce((fSum: number, f: any) => fSum + (Number(f.calories) || 0), 0)
                            : 0),
                        0
                      )
                    : 0

                  return (
                    <article key={plan.id} className="card" style={{ padding: 'var(--space-4)' }}>
                      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span className="badge badge-brand">Nutrition</span>
                            <strong style={{ fontSize: 'var(--text-base)' }}>{plan.title}</strong>
                          </div>
                          <div className="text-secondary text-xs" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <User size={12} /> {clientName}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} /> Updated {new Date(plan.updated_at).toLocaleDateString()}
                            </span>
                            <span>{mealCount} Meals</span>
                            <strong style={{ color: 'var(--brand-700)' }}>~{totalCals.toFixed(0)} kcal/day</strong>
                          </div>
                          {plan.notes && (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
                              Note: {plan.notes}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Link
                            href={`/coach/programs?tab=nutrition&edit=${plan.id}`}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Edit3 size={14} /> Edit
                          </Link>
                          <form action={deleteProgramAction}>
                            <input type="hidden" name="kind" value="nutrition" />
                            <input type="hidden" name="id" value={plan.id} />
                            <input type="hidden" name="clientId" value={plan.client_id} />
                            <button
                              type="submit"
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--error, #dc2626)' }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: WORKOUTS */}
      {activeTab === 'workout' && (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Builder Form Card */}
          <section className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                  {editWorkoutPlan ? `Edit Workout Plan: ${editWorkoutPlan.title}` : 'Create New Workout Plan'}
                </h2>
                <p className="text-secondary text-xs">
                  Build day-by-day workout splits with sets, reps, weights, rest periods, and exercise guides.
                </p>
              </div>
              {editWorkoutPlan && (
                <Link href="/coach/programs?tab=workout" className="btn btn-ghost btn-sm">
                  Cancel Edit
                </Link>
              )}
            </div>

            <WorkoutPlanForm
              clients={clientList}
              exerciseLibrary={exerciseLibrary ?? []}
              initialData={
                editWorkoutPlan
                  ? {
                      id: editWorkoutPlan.id,
                      clientId: editWorkoutPlan.client_id,
                      title: editWorkoutPlan.title,
                      notes: editWorkoutPlan.notes ?? '',
                      schedule: editWorkoutPlan.schedule ?? [],
                    }
                  : null
              }
            />
          </section>

          {/* Existing Workout Plans List */}
          <section>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1rem' }}>
              Assigned Workout Plans
            </h2>

            {(!workoutPlans || workoutPlans.length === 0) ? (
              <div className="card text-secondary" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                No workout plans assigned yet. Use the form above to build and assign a routine.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {workoutPlans.map((plan: any) => {
                  const clientName = plan.clients?.users?.full_name || 'Assigned Client'
                  const schedule = Array.isArray(plan.schedule) ? plan.schedule : []
                  const workoutDays = schedule.filter((d: any) => !d.restDay).length
                  const restDays = schedule.filter((d: any) => d.restDay).length

                  return (
                    <article key={plan.id} className="card" style={{ padding: 'var(--space-4)' }}>
                      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span className="badge badge-brand">Workout</span>
                            <strong style={{ fontSize: 'var(--text-base)' }}>{plan.title}</strong>
                          </div>
                          <div className="text-secondary text-xs" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <User size={12} /> {clientName}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} /> Updated {new Date(plan.updated_at).toLocaleDateString()}
                            </span>
                            <span>{schedule.length} Days ({workoutDays} Workouts, {restDays} Rest)</span>
                          </div>
                          {plan.notes && (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
                              Note: {plan.notes}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Link
                            href={`/coach/programs?tab=workout&edit=${plan.id}`}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Edit3 size={14} /> Edit
                          </Link>
                          <form action={deleteProgramAction}>
                            <input type="hidden" name="kind" value="workout" />
                            <input type="hidden" name="id" value={plan.id} />
                            <input type="hidden" name="clientId" value={plan.client_id} />
                            <button
                              type="submit"
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--error, #dc2626)' }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: EXERCISE LIBRARY */}
      {activeTab === 'exercises' && (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Quick Add Exercise Form */}
          <section className="card">
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '0.5rem' }}>
              Contribute Exercise to Global Library
            </h2>
            <p className="text-secondary text-xs" style={{ marginBottom: '1rem' }}>
              Add a new movement to the exercise directory for your workout schedules.
            </p>

            <form action={coachAddExerciseAction} style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
                <label className="form-group">
                  <span>Exercise Name *</span>
                  <input name="name" required placeholder="e.g. Bulgarian Split Squat" />
                </label>
                <label className="form-group">
                  <span>Muscle Group *</span>
                  <input name="muscle_group" required placeholder="e.g. Quads / Glutes" />
                </label>
              </div>

              <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
                <label className="form-group">
                  <span>Instructions & Technique Notes</span>
                  <input name="description" placeholder="Key cues, foot placement, range of motion..." />
                </label>
                <label className="form-group">
                  <span>Demonstration Video URL</span>
                  <input name="video_url" type="url" placeholder="https://youtube.com/..." />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary btn-sm" style={{ minWidth: 140 }}>
                  <Plus size={14} /> Add to Library
                </button>
              </div>
            </form>
          </section>

          {/* Exercise Search & Directory */}
          <section className="card">
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Exercise Library</h2>
                <p className="text-secondary text-xs">Browse all standard exercises available for assignment.</p>
              </div>

              {/* Search bar */}
              <form method="GET" action="/coach/programs" style={{ display: 'flex', gap: 6 }}>
                <input type="hidden" name="tab" value="exercises" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q ?? ''}
                  placeholder="Search by name or muscle..."
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 'var(--text-sm)',
                    minWidth: 220,
                  }}
                />
                <button type="submit" className="btn btn-ghost btn-sm">
                  <Search size={14} />
                </button>
              </form>
            </div>

            {filteredExercises.length === 0 ? (
              <div className="text-secondary" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                No exercises found matching your search.
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Exercise</th>
                      <th>Muscle Group</th>
                      <th>Instructions</th>
                      <th>Demonstration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExercises.map((ex: any) => (
                      <tr key={ex.id}>
                        <td>
                          <strong>{ex.name}</strong>
                        </td>
                        <td>
                          <span className="badge badge-brand">{ex.muscle_group}</span>
                        </td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: 300 }}>
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
                              <Video size={13} /> Watch Demo
                            </a>
                          ) : (
                            <span className="text-secondary" style={{ fontSize: '11px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
