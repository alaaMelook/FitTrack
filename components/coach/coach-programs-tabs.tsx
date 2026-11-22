'use client'

import { useState } from 'react'
import Link from 'next/link'
import NutritionPlanForm from '@/components/coach/nutrition-plan-form'
import WorkoutPlanForm from '@/components/coach/workout-plan-form'
import { deleteProgramAction, coachSaveExerciseAction, coachDeleteExerciseAction } from '@/app/coach/programs/actions'
import { Salad, Dumbbell, BookOpen, Plus, Trash2, Edit3, Calendar, User, Search, Video } from 'lucide-react'

type Props = {
  initialTab?: string
  editId?: string | null
  searchQuery?: string
  clientList: { id: string; name: string; email: string }[]
  nutritionPlans: any[]
  workoutPlans: any[]
  exerciseLibrary: any[]
}

export default function CoachProgramsTabs({
  initialTab = 'nutrition',
  editId = null,
  searchQuery = '',
  clientList,
  nutritionPlans,
  workoutPlans,
  exerciseLibrary,
}: Props) {
  const [tab, setTab] = useState<'nutrition' | 'workout' | 'exercises'>(() => {
    if (initialTab === 'workout') return 'workout'
    if (initialTab === 'exercises') return 'exercises'
    return 'nutrition'
  })

  const [filterQuery, setFilterQuery] = useState(searchQuery)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(editId)
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null)

  // Find exercise being edited
  const editingExercise = editingExerciseId
    ? exerciseLibrary.find((e: any) => e.id === editingExerciseId)
    : null

  // Find plan being edited
  const editNutritionPlan = editingPlanId && tab === 'nutrition'
    ? nutritionPlans.find((p) => p.id === editingPlanId)
    : null

  const editWorkoutPlan = editingPlanId && tab === 'workout'
    ? workoutPlans.find((p) => p.id === editingPlanId)
    : null

  // Filter exercises
  const filteredExercises = exerciseLibrary.filter((ex: any) => {
    if (!filterQuery) return true
    const q = filterQuery.toLowerCase()
    return (
      ex.name.toLowerCase().includes(q) ||
      (ex.muscle_group && ex.muscle_group.toLowerCase().includes(q)) ||
      (ex.description && ex.description.toLowerCase().includes(q))
    )
  })

  return (
    <div>
      {/* Tab Navigation Buttons - Instant Client-side switching */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setTab('nutrition')
            setEditingPlanId(null)
          }}
          className={`btn ${tab === 'nutrition' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Salad size={16} /> Nutrition Plans ({nutritionPlans.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('workout')
            setEditingPlanId(null)
          }}
          className={`btn ${tab === 'workout' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Dumbbell size={16} /> Workout Plans ({workoutPlans.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setTab('exercises')
            setEditingPlanId(null)
          }}
          className={`btn ${tab === 'exercises' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <BookOpen size={16} /> Exercise Library ({exerciseLibrary.length})
        </button>
      </div>

      {/* ── TAB 1: NUTRITION ── */}
      {tab === 'nutrition' && (
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
                <button
                  type="button"
                  onClick={() => setEditingPlanId(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <NutritionPlanForm
              key={editNutritionPlan?.id ?? 'new-nutrition'}
              clients={clientList}
              existingPlans={nutritionPlans}
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

            {nutritionPlans.length === 0 ? (
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
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlanId(plan.id)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Edit3 size={14} /> Edit
                          </button>
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

      {/* ── TAB 2: WORKOUTS ── */}
      {tab === 'workout' && (
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
                <button
                  type="button"
                  onClick={() => setEditingPlanId(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <WorkoutPlanForm
              key={editWorkoutPlan?.id ?? 'new-workout'}
              clients={clientList}
              exerciseLibrary={exerciseLibrary}
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

            {workoutPlans.length === 0 ? (
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
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlanId(plan.id)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Edit3 size={14} /> Edit
                          </button>
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

      {/* ── TAB 3: EXERCISES ── */}
      {tab === 'exercises' && (
        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          {/* Quick Add / Edit Exercise Form */}
          <section className="card" style={editingExercise ? { border: '2px solid var(--brand)', background: 'var(--brand-surface, #fcfaff)' } : undefined}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem', flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                {editingExercise ? `Edit Exercise: ${editingExercise.name}` : 'Contribute Exercise to Global Library'}
              </h2>
              {editingExercise && (
                <button
                  type="button"
                  onClick={() => setEditingExerciseId(null)}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '12px' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <p className="text-secondary text-xs" style={{ marginBottom: '1rem' }}>
              {editingExercise
                ? 'Update movement details, instructions, or demonstration video link.'
                : 'Add a new movement to the exercise directory for your workout schedules.'}
            </p>

            <form
              key={editingExercise?.id ?? 'new-exercise'}
              action={coachSaveExerciseAction}
              style={{ display: 'grid', gap: 'var(--space-3)' }}
            >
              {editingExercise && <input type="hidden" name="id" value={editingExercise.id} />}

              <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
                <label className="form-group">
                  <span>Exercise Name *</span>
                  <input
                    name="name"
                    required
                    defaultValue={editingExercise?.name ?? ''}
                    placeholder="e.g. Romanian Deadlift"
                  />
                </label>
                <label className="form-group">
                  <span>Muscle Group *</span>
                  <input
                    name="muscle_group"
                    required
                    defaultValue={editingExercise?.muscle_group ?? ''}
                    placeholder="e.g. Hamstrings / Glutes"
                  />
                </label>
              </div>

              <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
                <label className="form-group">
                  <span>Instructions & Technique Notes</span>
                  <input
                    name="description"
                    defaultValue={editingExercise?.description ?? ''}
                    placeholder="Key cues, foot placement, range of motion..."
                  />
                </label>
                <label className="form-group">
                  <span>Demonstration Video URL</span>
                  <input
                    name="video_url"
                    type="url"
                    defaultValue={editingExercise?.video_url ?? ''}
                    placeholder="https://youtube.com/..."
                  />
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                {editingExercise && (
                  <button
                    type="button"
                    onClick={() => setEditingExerciseId(null)}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                )}
                <button type="submit" className="btn btn-primary btn-sm" style={{ minWidth: 140 }}>
                  {editingExercise ? (
                    <>
                      <Edit3 size={14} /> Update Exercise
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Add to Library
                    </>
                  )}
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

              {/* Instant Search Bar */}
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter by name or muscle..."
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 'var(--text-sm)',
                    minWidth: 220,
                  }}
                />
              </div>
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
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExercises.map((ex: any) => (
                      <tr
                        key={ex.id}
                        style={editingExerciseId === ex.id ? { backgroundColor: 'var(--brand-surface, #fcfaff)' } : undefined}
                      >
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
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExerciseId(ex.id)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              title="Edit Exercise"
                            >
                              <Edit3 size={13} /> Edit
                            </button>
                            <form action={coachDeleteExerciseAction} style={{ display: 'inline' }}>
                              <input type="hidden" name="id" value={ex.id} />
                              <button
                                type="submit"
                                onClick={(e) => {
                                  if (!confirm(`Are you sure you want to delete "${ex.name}"?`)) {
                                    e.preventDefault()
                                  }
                                }}
                                className="btn btn-ghost btn-sm"
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  color: 'var(--error, #dc2626)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                                title="Delete Exercise"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </form>
                          </div>
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
    </div>
  )
}
