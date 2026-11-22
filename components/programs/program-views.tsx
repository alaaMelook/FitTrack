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
 * Displays day selector cards at the top, showing only exercises for the active day.
 */
function SingleWorkoutScheduleCard({ plan }: { plan: any }) {
  const schedule: any[] = Array.isArray(plan.schedule) ? plan.schedule : []

  // Default to first training day, or day 0
  const firstTrainingIdx = schedule.findIndex((d) => !d.restDay)
  const initialIdx = firstTrainingIdx >= 0 ? firstTrainingIdx : 0
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(initialIdx)

  const activeDay = schedule[selectedDayIdx] ?? schedule[0] ?? null
  const exercises: any[] = activeDay && Array.isArray(activeDay.exercises) ? activeDay.exercises : []

  const workoutDaysCount = schedule.filter((d: any) => !d.restDay).length
  const restDaysCount = schedule.filter((d: any) => d.restDay).length

  const planDurationKey = schedule[0]?.planDuration || plan.duration || null
  const durationLabel =
    planDurationKey === '1_week'
      ? '1 Week Cycle'
      : planDurationKey === '2_weeks'
      ? '2 Weeks Cycle'
      : planDurationKey === '1_month'
      ? '1 Month (4 Weeks)'
      : planDurationKey === '2_months'
      ? '2 Months (8 Weeks)'
      : planDurationKey === '3_months'
      ? '3 Months (12 Weeks)'
      : planDurationKey === 'ongoing'
      ? 'Ongoing Plan'
      : null

  return (
    <article className="card" style={{ padding: 'var(--space-6)' }}>
      {/* Plan Header */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="badge badge-brand">Workout Schedule</span>
            {durationLabel && (
              <span
                className="badge"
                style={{
                  fontSize: '11px',
                  background: 'rgba(140, 86, 212, 0.12)',
                  color: 'var(--brand-700)',
                  fontWeight: 600,
                }}
              >
                Duration: {durationLabel}
              </span>
            )}
          </div>
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

      {/* ── 1. Weekly Schedule Day Selector Tabs/Cards ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} style={{ color: 'var(--brand-600)' }} />
            Weekly Workout Schedule
          </h3>
          <span className="text-secondary text-xs">
            Select a day to view exercises
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(schedule.length, 7)}, minmax(110px, 1fr))`,
            gap: 'var(--space-2)',
            overflowX: 'auto',
            paddingBottom: 6,
          }}
        >
          {schedule.map((dayItem: any, idx: number) => {
            const isSelected = idx === selectedDayIdx
            const isRest = dayItem.restDay === true
            const exCount = Array.isArray(dayItem.exercises) ? dayItem.exercises.length : 0

            return (
              <button
                key={`${dayItem.day}-${idx}`}
                type="button"
                onClick={() => setSelectedDayIdx(idx)}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected
                    ? '2px solid var(--brand-600)'
                    : isRest
                    ? '1px dashed var(--border-subtle)'
                    : '1px solid var(--border-subtle)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(140, 86, 212, 0.12), rgba(140, 86, 212, 0.04))'
                    : isRest
                    ? 'var(--cream-300)'
                    : 'var(--bg-elevated, #f8fafc)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  outline: 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isSelected ? 'var(--brand-700)' : 'var(--text-secondary)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {dayItem.day}
                  </span>
                  {isRest ? (
                    <Moon size={12} style={{ color: '#64748b' }} />
                  ) : (
                    <Dumbbell size={12} style={{ color: isSelected ? 'var(--brand-600)' : 'var(--text-muted)' }} />
                  )}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: isSelected ? 'var(--brand-700)' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: 6,
                  }}
                  title={dayItem.workout || (isRest ? 'Rest Day' : 'Workout')}
                >
                  {dayItem.workout || (isRest ? 'Rest Day' : 'Workout')}
                </div>

                <div>
                  {isRest ? (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#e2e8f0',
                        color: '#475569',
                      }}
                    >
                      Rest Day
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--brand-600)' : 'var(--border-subtle)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      }}
                    >
                      {exCount} {exCount === 1 ? 'Exercise' : 'Exercises'}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 2. Active Selected Day Details ── */}
      {activeDay && (
        <div
          style={{
            background: activeDay.restDay ? 'var(--cream-300)' : 'var(--bg-elevated, #f8fafc)',
            borderRadius: 'var(--radius-lg)',
            border: activeDay.restDay ? '1px dashed var(--border-subtle)' : '1px solid var(--border-subtle)',
            padding: 'var(--space-5)',
          }}
        >
          {/* Day Title & Focus */}
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'var(--brand-700)',
                    background: 'rgba(140, 86, 212, 0.1)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {activeDay.day}
                </span>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, margin: 0 }}>
                  {activeDay.workout || (activeDay.restDay ? 'Rest & Recovery' : 'Training Routine')}
                </h3>
              </div>
              {activeDay.notes && (
                <p className="text-secondary text-xs" style={{ marginTop: 6, fontStyle: 'italic', margin: '6px 0 0 0' }}>
                  {activeDay.notes}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`badge ${activeDay.restDay ? 'badge-neutral' : 'badge-brand'}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                {activeDay.restDay ? 'Rest Day' : `${exercises.length} Exercises Scheduled`}
              </span>
            </div>
          </div>

          {/* If Rest Day: show active recovery guidance */}
          {activeDay.restDay ? (
            <div
              style={{
                background: 'var(--bg-surface, #ffffff)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-6)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'inline-flex', padding: 14, borderRadius: '50%', background: 'rgba(100, 116, 139, 0.1)', color: '#475569', marginBottom: 10 }}>
                <Moon size={28} />
              </div>
              <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 6 }}>
                Active Rest & Recovery Day
              </h4>
              <p className="text-secondary text-sm" style={{ maxWidth: 500, margin: '0 auto 16px auto', lineHeight: 1.6 }}>
                Growth and strength adaptations happen during rest! Prioritize 8 hours of sleep, stay well hydrated, hit your daily protein target, and do gentle mobility or walking if desired.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-neutral" style={{ fontSize: '11px' }}>💧 3+ Liters Water</span>
                <span className="badge badge-neutral" style={{ fontSize: '11px' }}>🥩 Hit Protein Target</span>
                <span className="badge badge-neutral" style={{ fontSize: '11px' }}>🧘 15m Light Stretching</span>
                <span className="badge badge-neutral" style={{ fontSize: '11px' }}>😴 8h Quality Sleep</span>
              </div>
            </div>
          ) : (
            /* Training Day: List of exercises for this day */
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {exercises.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-secondary)' }}>
                  No exercises listed for this day yet.
                </div>
              ) : (
                exercises.map((ex: any, j: number) => (
                  <div
                    key={`${ex.name}-${j}`}
                    style={{
                      background: 'var(--bg-surface, #ffffff)',
                      padding: 'var(--space-4) var(--space-5)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    {/* Exercise Header Row */}
                    <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: 'var(--brand-600)',
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
                          <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', display: 'block' }}>
                            {ex.name}
                          </strong>
                          {ex.muscleGroup && (
                            <span className="badge badge-brand" style={{ fontSize: '10px', marginTop: 2 }}>
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
                            className="btn btn-ghost btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '11px',
                              color: 'var(--brand-600)',
                              background: 'rgba(140, 86, 212, 0.08)',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
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
                            className="btn btn-ghost btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              padding: '4px 8px',
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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: 8,
                        background: 'var(--cream-300)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: (ex.instructions || ex.notes) ? 12 : 0,
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>SETS</span>
                        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--brand-700)' }}>
                          {ex.sets || '—'} Sets
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>REPS</span>
                        <strong style={{ fontSize: 'var(--text-sm)' }}>
                          {ex.reps || '—'}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>WEIGHT</span>
                        <strong style={{ fontSize: 'var(--text-sm)' }}>
                          {ex.weight || 'Bodyweight'}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>REST PERIOD</span>
                        <strong style={{ fontSize: 'var(--text-sm)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} style={{ color: 'var(--brand-600)' }} />
                          {ex.restSeconds != null && ex.restSeconds !== '' ? `${ex.restSeconds} sec` : '60 sec'}
                        </strong>
                      </div>
                    </div>

                    {/* Technique Instructions & Additional Notes */}
                    {(ex.instructions || ex.notes) && (
                      <div style={{ display: 'grid', gap: 6, fontSize: 'var(--text-xs)', paddingTop: 4 }}>
                        {ex.instructions && (
                          <div style={{ lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>Instructions & Form Cues: </strong>
                            {ex.instructions}
                          </div>
                        )}
                        {ex.notes && (
                          <div style={{ lineHeight: 1.5, color: 'var(--brand-700)', background: 'rgba(140, 86, 212, 0.05)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
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

          {/* Navigation Controls: Previous / Next Day */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'var(--space-4)',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={selectedDayIdx <= 0}
              onClick={() => setSelectedDayIdx((prev) => Math.max(0, prev - 1))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <ChevronLeft size={14} /> Previous Day
            </button>

            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Day {selectedDayIdx + 1} of {schedule.length}
            </span>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={selectedDayIdx >= schedule.length - 1}
              onClick={() => setSelectedDayIdx((prev) => Math.min(schedule.length - 1, prev + 1))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              Next Day <ChevronRight size={14} />
            </button>
          </div>
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
