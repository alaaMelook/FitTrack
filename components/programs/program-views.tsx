'use client'

import { Flame, Salad, Dumbbell, Calendar, Clock, Video, Info, CheckCircle2 } from 'lucide-react'

export function NutritionPlanView({ plans }: { plans: any[] }) {
  if (!plans || !plans.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a', marginBottom: 12 }}>
          <Salad size={32} />
        </div>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 4 }}>No Nutrition Plan Assigned</h3>
        <p className="text-secondary text-sm">
          Your coach has not assigned a personalized nutrition plan yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      {plans.map((plan) => {
        const meals = Array.isArray(plan.meals) ? plan.meals : []

        // Calculate macro totals across all meals
        const totals = meals.reduce(
          (acc: any, meal: any) => {
            const foods = Array.isArray(meal.foods) ? meal.foods : []
            for (const f of foods) {
              acc.calories += Number(f.calories) || 0
              acc.protein += Number(f.protein) || 0
              acc.carbs += Number(f.carbs) || 0
              acc.fats += Number(f.fats) || 0
            }
            return acc
          },
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        )

        return (
          <article className="card" key={plan.id} style={{ padding: 'var(--space-6)' }}>
            {/* Plan Header */}
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12, marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-brand" style={{ marginBottom: 6 }}>Nutrition Plan</span>
                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{plan.title}</h2>
                {plan.updated_at && (
                  <p className="text-secondary text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Calendar size={12} /> Last updated: {new Date(plan.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {plan.notes && (
              <div
                style={{
                  background: 'var(--cream-300)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--brand-600)',
                  marginBottom: '1.5rem',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <strong style={{ display: 'block', color: 'var(--brand-700)', marginBottom: 2 }}>Coach Note:</strong>
                {plan.notes}
              </div>
            )}

            {/* Daily Macro Targets Card Row */}
            <div className="stat-grid-4" style={{ marginBottom: '1.75rem' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
                  <Flame size={20} />
                </div>
                <div>
                  <div className="stat-value">{totals.calories.toFixed(0)} <span style={{ fontSize: '13px', fontWeight: 500 }}>kcal</span></div>
                  <div className="stat-label">Daily Calories</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
                  <Salad size={20} />
                </div>
                <div>
                  <div className="stat-value">{totals.protein.toFixed(1)} <span style={{ fontSize: '13px', fontWeight: 500 }}>g</span></div>
                  <div className="stat-label">Protein</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <Salad size={20} />
                </div>
                <div>
                  <div className="stat-value">{totals.carbs.toFixed(1)} <span style={{ fontSize: '13px', fontWeight: 500 }}>g</span></div>
                  <div className="stat-label">Carbohydrates</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
                  <Salad size={20} />
                </div>
                <div>
                  <div className="stat-value">{totals.fats.toFixed(1)} <span style={{ fontSize: '13px', fontWeight: 500 }}>g</span></div>
                  <div className="stat-label">Healthy Fats</div>
                </div>
              </div>
            </div>

            {/* Meals Section */}
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1rem' }}>
              Daily Meals Breakdown ({meals.length} Meals)
            </h3>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {meals.map((meal: any, i: number) => {
                const foods = Array.isArray(meal.foods) ? meal.foods : []
                const mealCals = foods.reduce((sum: number, f: any) => sum + (Number(f.calories) || 0), 0)

                return (
                  <section
                    key={`${meal.meal}-${i}`}
                    style={{
                      background: 'var(--bg-elevated, #f8fafc)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      padding: 'var(--space-4)',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>
                        {meal.meal}
                      </h4>
                      <span className="badge badge-brand" style={{ fontSize: '11px' }}>
                        ~{mealCals.toFixed(0)} kcal
                      </span>
                    </div>

                    {meal.notes && (
                      <p className="text-secondary text-xs" style={{ fontStyle: 'italic', marginBottom: 12 }}>
                        {meal.notes}
                      </p>
                    )}

                    {foods.length === 0 ? (
                      <p className="text-secondary text-xs" style={{ margin: 0 }}>
                        No specific foods listed for this meal.
                      </p>
                    ) : (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Food Item</th>
                              <th>Portion / Quantity</th>
                              <th>Calories</th>
                              <th>Protein</th>
                              <th>Carbs</th>
                              <th>Fats</th>
                            </tr>
                          </thead>
                          <tbody>
                            {foods.map((food: any, j: number) => (
                              <tr key={`${food.name}-${j}`}>
                                <td style={{ fontWeight: 600 }}>{food.name}</td>
                                <td>{food.quantity} {food.unit || 'g'}</td>
                                <td><strong>{Number(food.calories || 0).toFixed(0)}</strong></td>
                                <td>{Number(food.protein || 0).toFixed(1)}g</td>
                                <td>{Number(food.carbs || 0).toFixed(1)}g</td>
                                <td>{Number(food.fats || 0).toFixed(1)}g</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export function WorkoutPlanView({ plans }: { plans: any[] }) {
  if (!plans || !plans.length) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'rgba(140, 86, 212, 0.1)', color: 'var(--brand-600)', marginBottom: 12 }}>
          <Dumbbell size={32} />
        </div>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 4 }}>No Workout Plan Assigned</h3>
        <p className="text-secondary text-sm">
          Your coach has not assigned a personalized workout schedule yet. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
      {plans.map((plan) => {
        const schedule = Array.isArray(plan.schedule) ? plan.schedule : []
        const workoutDaysCount = schedule.filter((d: any) => !d.restDay).length
        const restDaysCount = schedule.filter((d: any) => d.restDay).length

        return (
          <article className="card" key={plan.id} style={{ padding: 'var(--space-6)' }}>
            {/* Header */}
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12, marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-brand" style={{ marginBottom: 6 }}>Workout Schedule</span>
                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{plan.title}</h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                  {plan.updated_at && (
                    <span className="text-secondary text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} /> Last updated: {new Date(plan.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                    {workoutDaysCount} Training Days • {restDaysCount} Rest Days
                  </span>
                </div>
              </div>
            </div>

            {plan.notes && (
              <div
                style={{
                  background: 'var(--cream-300)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--brand-600)',
                  marginBottom: '1.5rem',
                  fontSize: 'var(--text-sm)',
                }}
              >
                <strong style={{ display: 'block', color: 'var(--brand-700)', marginBottom: 2 }}>Coach Instructions:</strong>
                {plan.notes}
              </div>
            )}

            {/* Weekly Schedule Days */}
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {schedule.map((day: any, i: number) => {
                const exercises = Array.isArray(day.exercises) ? day.exercises : []

                return (
                  <section
                    key={`${day.day}-${i}`}
                    style={{
                      padding: 'var(--space-5)',
                      borderRadius: 'var(--radius-lg)',
                      background: day.restDay ? 'var(--cream-300)' : 'var(--bg-elevated, #f8fafc)',
                      border: day.restDay ? '1px dashed var(--border-subtle)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {day.day}
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            — {day.workout || (day.restDay ? 'Rest & Recovery' : 'Workout')}
                          </span>
                        </h3>
                      </div>
                      <span className={`badge ${day.restDay ? 'badge-neutral' : 'badge-brand'}`} style={{ fontSize: '11px' }}>
                        {day.restDay ? 'Rest Day' : `${exercises.length} Exercises`}
                      </span>
                    </div>

                    {day.notes && (
                      <p className="text-secondary text-xs" style={{ marginBottom: 12, fontStyle: 'italic' }}>
                        {day.notes}
                      </p>
                    )}

                    {/* Rest Day Message */}
                    {day.restDay && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>
                        Active recovery or full rest. Stay hydrated, stretch, and hit your protein goals today.
                      </p>
                    )}

                    {/* Exercises List for training day */}
                    {!day.restDay && (
                      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                        {exercises.map((ex: any, j: number) => (
                          <div
                            key={`${ex.name}-${j}`}
                            style={{
                              background: 'var(--bg-surface, #ffffff)',
                              padding: '12px 16px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-subtle)',
                              display: 'grid',
                              gap: 8,
                            }}
                          >
                            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                                  {j + 1}. {ex.name}
                                </strong>
                                {ex.muscleGroup && (
                                  <span className="badge badge-brand" style={{ fontSize: '10px' }}>
                                    {ex.muscleGroup}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className="badge badge-neutral" style={{ fontSize: '11px', fontWeight: 700 }}>
                                  {ex.sets} Sets × {ex.reps} Reps
                                </span>
                                {ex.weight && (
                                  <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                                    Weight: {ex.weight}
                                  </span>
                                )}
                                {ex.restSeconds != null && ex.restSeconds !== '' && (
                                  <span className="badge badge-neutral" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={11} /> {ex.restSeconds}s Rest
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Cues / Instructions */}
                            {ex.instructions && (
                              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Cues: </strong>
                                {ex.instructions}
                              </p>
                            )}

                            {/* Demo Video Link */}
                            {ex.videoUrl && (
                              <div>
                                <a
                                  href={ex.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-ghost btn-sm"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    fontSize: '11px',
                                    padding: '4px 8px',
                                    color: 'var(--brand-600)',
                                  }}
                                >
                                  <Video size={13} /> Watch Demonstration Video ↗
                                </a>
                              </div>
                            )}
                          </div>
                        ))}

                        {exercises.length === 0 && (
                          <p className="text-secondary text-xs" style={{ margin: 0 }}>
                            No exercises added for this training day yet.
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </article>
        )
      })}
    </div>
  )
}
