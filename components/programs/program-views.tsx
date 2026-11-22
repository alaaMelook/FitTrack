'use client'

import { useState } from 'react'
import {
  Flame,
  Salad,
  Dumbbell,
  Calendar,
  Clock,
  Video,
  Image as ImageIcon,
  Info,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react'

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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="badge badge-brand">Nutrition Plan</span>
                  {meals[0]?.planDuration && (
                    <span
                      className="badge"
                      style={{
                        fontSize: '11px',
                        background: 'rgba(22, 163, 74, 0.12)',
                        color: '#16a34a',
                        fontWeight: 600,
                      }}
                    >
                      Duration:{' '}
                      {meals[0].planDuration === 'daily'
                        ? 'Daily Routine'
                        : meals[0].planDuration === '1_week'
                        ? '1 Week'
                        : meals[0].planDuration === '2_weeks'
                        ? '2 Weeks'
                        : meals[0].planDuration === '1_month'
                        ? '1 Month (4 Weeks)'
                        : meals[0].planDuration === '2_months'
                        ? '2 Months (8 Weeks)'
                        : 'Ongoing'}
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{plan.title}</h2>
                {plan.updated_at && (
                  <p className="text-secondary text-xs" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Calendar size={12} /> Last updated: {new Date(plan.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            {/* Optional Restricted Foods (قائمة الممنوعات) */}
            {meals[0]?.restrictedFoods && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#92400e', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  <span>قائمة الممنوعات (Restricted & Forbidden Foods):</span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-sm)', color: '#78350f', fontWeight: 600 }}>
                  {meals[0].restrictedFoods}
                </p>
              </div>
            )}

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
                                <td style={{ fontWeight: 600, color: '#0f172a' }}>
                                  {food.portion || (food.quantity ? `${food.quantity} ${food.unit || ''}`.trim() : '—')}
                                </td>
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

/**
 * Interactive Single Workout Schedule View
 * Displays day selector cards at the top (training days only), showing exercises for the active day.
 */
function SingleWorkoutScheduleCard({ plan }: { plan: any }) {
  const schedule: any[] = Array.isArray(plan.schedule) ? plan.schedule : []

  // Filter training days for client view (hide rest days from tabs)
  const trainingDays = schedule.filter((d) => !d.restDay)
  const workoutDaysCount = trainingDays.length
  const restDaysCount = schedule.filter((d: any) => d.restDay).length

  // Default to first training day, or day 0 if all are rest days
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0)

  // Determine active day: from trainingDays if available, otherwise from schedule
  const activeDay = (trainingDays.length > 0 ? trainingDays[selectedDayIdx] : schedule[0]) ?? null
  const exercises: any[] = activeDay && Array.isArray(activeDay.exercises) ? activeDay.exercises : []

  const planDurationKey = schedule[0]?.planDuration || plan.duration || null
  const durationLabel =
    planDurationKey === '1_week'
      ? '1 Week Split'
      : planDurationKey === '2_weeks'
      ? '2 Weeks Cycle'
      : planDurationKey === '1_month'
      ? '1 Month (4 Weeks)'
      : planDurationKey === '2_months'
      ? '2 Months (8 Weeks)'
      : planDurationKey === '3_months'
      ? '3 Months (12 Weeks)'
      : planDurationKey === 'ongoing'
      ? 'Custom / Ongoing'
      : null

  return (
    <article className="card" style={{ padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Plan Header */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '3px 10px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#ffffff',
              }}
            >
              Workout Schedule
            </span>
            {durationLabel && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: 'rgba(124, 58, 237, 0.1)',
                  color: '#6d28d9',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                }}
              >
                {durationLabel}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{plan.title}</h2>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' }}>
            {plan.updated_at && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={13} /> Updated {new Date(plan.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            <span style={{ fontWeight: 600, color: '#334155' }}>
              {workoutDaysCount} Training Days • {restDaysCount} Rest Days
            </span>
          </div>
        </div>
      </div>

      {plan.notes && (
        <div
          style={{
            background: '#faf5ff',
            padding: '12px 18px',
            borderRadius: '12px',
            borderLeft: '4px solid #7c3aed',
            marginBottom: '1.5rem',
            fontSize: '13.5px',
            color: '#4c1d95',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ display: 'block', color: '#6d28d9', marginBottom: 2 }}>Coach Instructions:</strong>
          {plan.notes}
        </div>
      )}

      {/* ── 1. Weekly Schedule Day Selector Tabs (Training Days Only) ── */}
      {trainingDays.length > 0 ? (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} style={{ color: '#7c3aed' }} />
              Training Routines
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Select a routine to view assigned exercises
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))`,
              gap: '10px',
            }}
          >
            {trainingDays.map((dayItem: any, idx: number) => {
              const isSelected = idx === selectedDayIdx
              const exCount = Array.isArray(dayItem.exercises) ? dayItem.exercises.length : 0

              return (
                <button
                  key={`${dayItem.day}-${idx}`}
                  type="button"
                  onClick={() => setSelectedDayIdx(idx)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                    background: isSelected ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    outline: 'none',
                    boxShadow: isSelected ? '0 3px 10px rgba(124, 58, 237, 0.15)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: isSelected ? '#6d28d9' : '#64748b',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {dayItem.day}
                    </span>
                    <Dumbbell size={13} style={{ color: isSelected ? '#7c3aed' : '#94a3b8' }} />
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: isSelected ? '#5b21b6' : '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: 6,
                    }}
                    title={dayItem.workout || 'Workout Routine'}
                  >
                    {dayItem.workout || 'Workout Routine'}
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: isSelected ? '#7c3aed' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#475569',
                      }}
                    >
                      {exCount} {exCount === 1 ? 'Exercise' : 'Exercises'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* ── 2. Active Selected Day Details ── */}
      {activeDay && (
        <div
          style={{
            background: activeDay.restDay ? '#f8fafc' : '#ffffff',
            borderRadius: '14px',
            border: '1.5px solid #e2e8f0',
            padding: '20px',
          }}
        >
          {/* Day Title & Focus */}
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#6d28d9',
                    background: '#ede9fe',
                    padding: '3px 10px',
                    borderRadius: '6px',
                  }}
                >
                  {activeDay.day}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {activeDay.workout || (activeDay.restDay ? 'Rest & Recovery' : 'Training Routine')}
                </h3>
              </div>
              {activeDay.notes && (
                <p style={{ marginTop: 6, fontStyle: 'italic', margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  {activeDay.notes}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: activeDay.restDay ? '#f1f5f9' : '#f5f3ff',
                  color: activeDay.restDay ? '#475569' : '#6d28d9',
                  border: `1px solid ${activeDay.restDay ? '#cbd5e1' : '#ddd6fe'}`,
                }}
              >
                {activeDay.restDay ? 'Rest Day' : `${exercises.length} Exercises Assigned`}
              </span>
            </div>
          </div>

          {/* Training Day: List of exercises for this day */}
          {activeDay.restDay ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'inline-flex', padding: 12, borderRadius: '50%', background: '#f1f5f9', color: '#64748b', marginBottom: 10 }}>
                <Moon size={26} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Rest & Recovery Day
              </h4>
              <p style={{ color: '#64748b', fontSize: '13.5px', maxWidth: 460, margin: '0 auto 16px', lineHeight: 1.6 }}>
                Rest is essential for muscle hypertrophy and recovery. Prioritize quality sleep, hydration, and nutrition today.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {exercises.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '14px' }}>
                  No exercises listed for this routine yet.
                </div>
              ) : (
                exercises.map((ex: any, j: number) => (
                  <div
                    key={`${ex.name}-${j}`}
                    style={{
                      background: '#ffffff',
                      padding: '16px 18px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    {/* Exercise Header Row */}
                    <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#7c3aed',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {j + 1}
                        </span>
                        <div>
                          <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>
                            {ex.name}
                          </strong>
                          {ex.muscleGroup && (
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '1px 8px',
                                borderRadius: '5px',
                                background: '#f5f3ff',
                                color: '#6d28d9',
                                border: '1px solid #ddd6fe',
                                marginTop: 2,
                              }}
                            >
                              {ex.muscleGroup}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Video / Image link if available */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {ex.videoUrl && (
                          <a
                            href={ex.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#6d28d9',
                              background: '#f5f3ff',
                              border: '1px solid #ddd6fe',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                            }}
                          >
                            <Video size={13} /> Watch Technique Demo ↗
                          </a>
                        )}
                        {ex.imageUrl && (
                          <a
                            href={ex.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#64748b',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                            }}
                          >
                            <ImageIcon size={13} /> View Diagram
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Metrics Stat Cards */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                        gap: 8,
                        background: '#f8fafc',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        marginBottom: (ex.instructions || ex.notes) ? 12 : 0,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', fontWeight: 700, letterSpacing: '0.04em' }}>SETS</span>
                        <strong style={{ fontSize: '14px', color: '#6d28d9', fontWeight: 800 }}>
                          {ex.sets ? `${ex.sets} Sets` : '—'}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', fontWeight: 700, letterSpacing: '0.04em' }}>REPS</span>
                        <strong style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>
                          {ex.reps || '—'}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', fontWeight: 700, letterSpacing: '0.04em' }}>WEIGHT</span>
                        <strong style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800 }}>
                          {ex.weight || 'Bodyweight'}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', fontWeight: 700, letterSpacing: '0.04em' }}>REST PERIOD</span>
                        <strong style={{ fontSize: '14px', color: '#0f172a', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} style={{ color: '#7c3aed' }} />
                          {ex.restSeconds != null && ex.restSeconds !== '' ? `${ex.restSeconds} sec` : '60 sec'}
                        </strong>
                      </div>
                    </div>

                    {/* Technique Instructions & Additional Notes */}
                    {(ex.instructions || ex.notes) && (
                      <div style={{ display: 'grid', gap: 6, fontSize: '13px', paddingTop: 6 }}>
                        {ex.instructions && (
                          <div style={{ lineHeight: 1.5, color: '#475569' }}>
                            <strong style={{ color: '#0f172a' }}>Instructions: </strong>
                            {ex.instructions}
                          </div>
                        )}
                        {ex.notes && (
                          <div style={{ lineHeight: 1.5, color: '#6d28d9', background: '#f5f3ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd6fe' }}>
                            <strong>Coach Note: </strong>
                            {ex.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Navigation Controls: Previous / Next Routine */}
          {trainingDays.length > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={selectedDayIdx <= 0}
                onClick={() => setSelectedDayIdx((prev) => Math.max(0, prev - 1))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '13px', fontWeight: 600 }}
              >
                <ChevronLeft size={14} /> Previous Routine
              </button>

              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Routine {selectedDayIdx + 1} of {trainingDays.length}
              </span>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={selectedDayIdx >= trainingDays.length - 1}
                onClick={() => setSelectedDayIdx((prev) => Math.min(trainingDays.length - 1, prev + 1))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '13px', fontWeight: 600 }}
              >
                Next Routine <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
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
      {plans.map((plan) => (
        <SingleWorkoutScheduleCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}
