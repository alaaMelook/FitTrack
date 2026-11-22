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

        const hasMacroTargets = totals.calories > 0 || totals.protein > 0 || totals.carbs > 0 || totals.fats > 0

        return (
          <article className="card" key={plan.id} style={{ padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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
                      background: 'linear-gradient(135deg, #16a34a, #059669)',
                      color: '#ffffff',
                    }}
                  >
                    Nutrition Plan
                  </span>
                  {meals[0]?.planDuration && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        background: 'rgba(22, 163, 74, 0.1)',
                        color: '#15803d',
                        border: '1px solid rgba(22, 163, 74, 0.2)',
                      }}
                    >
                      Duration:{' '}
                      {meals[0].planDuration === 'daily'
                        ? 'Daily Routine'
                        : meals[0].planDuration === '1_week'
                        ? '1 Week Split'
                        : meals[0].planDuration === '2_weeks'
                        ? '2 Weeks Split'
                        : meals[0].planDuration === '1_month'
                        ? '1 Month (4 Weeks)'
                        : meals[0].planDuration === '2_months'
                        ? '2 Months (8 Weeks)'
                        : 'Ongoing'}
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
                    {meals.length} {meals.length === 1 ? 'Meal Routine' : 'Meals Routine'}
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Restricted Foods (قائمة الممنوعات) */}
            {meals[0]?.restrictedFoods && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1.5px solid #fde68a',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400e', fontWeight: 800, fontSize: '14px', marginBottom: 4 }}>
                  <span>⚠️</span>
                  <span>Restricted Foods & Guidelines / قائمة الممنوعات:</span>
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#78350f', fontWeight: 600, lineHeight: 1.5 }}>
                  {meals[0].restrictedFoods}
                </p>
              </div>
            )}

            {plan.notes && (
              <div
                style={{
                  background: '#f8fafc',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  borderLeft: '4px solid #16a34a',
                  marginBottom: '1.5rem',
                  fontSize: '13.5px',
                  color: '#334155',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ display: 'block', color: '#15803d', marginBottom: 2 }}>Coach Note:</strong>
                {plan.notes}
              </div>
            )}

            {/* Daily Macro Targets — Only displayed if macro targets are specified */}
            {hasMacroTargets && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: '1.75rem' }}>
                <div style={{ background: '#fffbeb', padding: '14px 16px', borderRadius: '12px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(217, 119, 6, 0.15)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#92400e' }}>
                      {totals.calories.toFixed(0)} <span style={{ fontSize: '12px', fontWeight: 600 }}>kcal</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 700 }}>DAILY CALORIES</div>
                  </div>
                </div>

                <div style={{ background: '#fef2f2', padding: '14px 16px', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Salad size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#991b1b' }}>
                      {totals.protein.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 600 }}>g</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 700 }}>PROTEIN</div>
                  </div>
                </div>

                <div style={{ background: '#eff6ff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Salad size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>
                      {totals.carbs.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 600 }}>g</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 700 }}>CARBOHYDRATES</div>
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '14px 16px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(22, 163, 74, 0.15)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Salad size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#166534' }}>
                      {totals.fats.toFixed(1)} <span style={{ fontSize: '12px', fontWeight: 600 }}>g</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>HEALTHY FATS</div>
                  </div>
                </div>
              </div>
            )}

            {/* Meals Section */}
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Salad size={18} style={{ color: '#16a34a' }} />
              Assigned Meals Breakdown ({meals.length} {meals.length === 1 ? 'Meal' : 'Meals'})
            </h3>

            <div style={{ display: 'grid', gap: '14px' }}>
              {meals.map((meal: any, i: number) => {
                const foods = Array.isArray(meal.foods) ? meal.foods : []
                const mealCals = foods.reduce((sum: number, f: any) => sum + (Number(f.calories) || 0), 0)

                return (
                  <section
                    key={`${meal.meal}-${i}`}
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      padding: '18px 20px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div className="flex items-center justify-between" style={{ marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#16a34a',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {meal.meal}
                        </h4>
                      </div>

                      {mealCals > 0 && (
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            background: 'rgba(217, 119, 6, 0.1)',
                            color: '#b45309',
                            border: '1px solid rgba(217, 119, 6, 0.2)',
                          }}
                        >
                          🔥 ~{mealCals.toFixed(0)} kcal
                        </span>
                      )}
                    </div>

                    {/* Meal Notes / Instructions (e.g. prep timing, hydration notes) */}
                    {meal.notes && (
                      <div
                        style={{
                          background: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          marginBottom: 12,
                          fontSize: '13px',
                          color: '#334155',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: '15px' }}>💡</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                          <strong style={{ color: '#0f172a' }}>Instructions / تعليمات الوجبة:</strong>
                          <span dir="auto">{meal.notes}</span>
                        </div>
                      </div>
                    )}

                    {foods.length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
                        No specific foods listed for this meal.
                      </p>
                    ) : (
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {foods.map((food: any, j: number) => {
                          const rawPortion = String(food.portion ?? '').trim()
                          const rawQuantity = String(food.quantity ?? '').trim()
                          const rawUnit = String(food.unit ?? '').trim()

                          // Resolve clean portion string
                          let displayPortion = ''
                          if (rawPortion && rawPortion !== 'g' && rawPortion !== 'null' && rawPortion !== 'undefined') {
                            displayPortion = rawPortion
                          } else if (rawQuantity && rawQuantity !== '0') {
                            displayPortion = rawUnit ? `${rawQuantity} ${rawUnit}` : rawQuantity
                          } else {
                            displayPortion = '1 Serving'
                          }

                          const fCal = Number(food.calories || 0)
                          const fProt = Number(food.protein || 0)
                          const fCarb = Number(food.carbs || 0)
                          const fFat = Number(food.fats || 0)
                          const hasFoodMacros = fCal > 0 || fProt > 0 || fCarb > 0 || fFat > 0

                          return (
                            <div
                              key={`${food.name}-${j}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 12,
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    background: '#ecfdf5',
                                    border: '1px solid #a7f3d0',
                                    color: '#059669',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    flexShrink: 0,
                                  }}
                                >
                                  🥗
                                </div>
                                <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                                  {food.name}
                                </strong>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    padding: '5px 12px',
                                    borderRadius: '8px',
                                    background: '#ffffff',
                                    border: '1.5px solid #cbd5e1',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      color: '#64748b',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                    }}
                                  >
                                    Portion / الكمية:
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: 800,
                                      color: '#0f172a',
                                    }}
                                    dir="auto"
                                  >
                                    {displayPortion}
                                  </span>
                                </div>

                                {hasFoodMacros && (
                                  <div style={{ display: 'flex', gap: 6, fontSize: '11px', fontWeight: 700, flexWrap: 'wrap' }}>
                                    {fCal > 0 && (
                                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                                        🔥 {fCal.toFixed(0)} kcal
                                      </span>
                                    )}
                                    {fProt > 0 && (
                                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                                        {fProt.toFixed(1)}g P
                                      </span>
                                    )}
                                    {fCarb > 0 && (
                                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                                        {fCarb.toFixed(1)}g C
                                      </span>
                                    )}
                                    {fFat > 0 && (
                                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                                        {fFat.toFixed(1)}g F
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
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
