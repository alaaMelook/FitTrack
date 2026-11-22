'use client'

import { useRef, useState, useTransition } from 'react'
import { saveProgramAction } from '@/app/coach/programs/actions'
import {
  Dumbbell,
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Moon,
  Check
} from 'lucide-react'

export type ExerciseItem = {
  name: string
  muscleGroup: string
  sets: number | ''
  reps: string
  weight: string
  restSeconds: number | ''
  instructions: string
  notes?: string
  videoUrl: string
  imageUrl?: string
}

export type DayPlan = {
  day: string
  workout: string
  restDay: boolean
  notes: string
  exercises: ExerciseItem[]
}

export type ExerciseOption = {
  id: string
  name: string
  muscle_group: string
  video_url?: string | null
}

type Client = { id: string; name: string }

const DEFAULT_DAYS = [
  { day: 'Day 1', workout: 'Chest & Triceps', restDay: false },
  { day: 'Day 2', workout: 'Back & Biceps', restDay: false },
  { day: 'Day 3', workout: 'Legs & Calves', restDay: false },
  { day: 'Day 4', workout: 'Shoulders & Abs', restDay: false },
  { day: 'Day 5', workout: 'Full Body / Conditioning', restDay: false },
  { day: 'Day 6', workout: 'Cardio & Mobility', restDay: false },
  { day: 'Day 7', workout: 'Rest Day', restDay: true },
]

function emptyExercise(): ExerciseItem {
  return {
    name: '',
    muscleGroup: '',
    sets: 3,
    reps: '10-12',
    weight: '',
    restSeconds: 60,
    instructions: '',
    notes: '',
    videoUrl: '',
    imageUrl: '',
  }
}

function createDay(dayLabel: string, workoutName = 'Training Session', restDay = false): DayPlan {
  return {
    day: dayLabel,
    workout: restDay ? 'Rest & Recovery' : workoutName,
    restDay,
    notes: '',
    exercises: restDay ? [] : [emptyExercise()],
  }
}

type Props = {
  clients: Client[]
  exerciseLibrary?: ExerciseOption[]
  saveAction?: (formData: FormData) => Promise<void>
  initialData?: {
    id: string
    clientId: string
    title: string
    notes: string
    schedule: DayPlan[]
  } | null
}

export default function WorkoutPlanForm({ clients, exerciseLibrary = [], saveAction, initialData }: Props) {
  const [schedule, setSchedule] = useState<DayPlan[]>(() => {
    if (initialData?.schedule && initialData.schedule.length > 0) {
      return initialData.schedule
    }
    return DEFAULT_DAYS.map((d) => createDay(d.day, d.workout, d.restDay))
  })

  // Plan Duration state (1 week, 2 weeks, 1 month, 2 months, 3 months, ongoing)
  const [planDuration, setPlanDuration] = useState<string>(() => {
    const firstDay: any = initialData?.schedule?.[0]
    return firstDay?.planDuration || '1_month'
  })

  // Controlled state for clientId and title to avoid false/0 defaults
  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (initialData?.clientId) return initialData.clientId
    if (clients.length === 1) return clients[0].id
    return ''
  })
  const [planTitle, setPlanTitle] = useState<string>(initialData?.title ?? '')

  // Selected Day tab in the editor
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0)
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  // Day manipulations
  function updateDay(dayIdx: number, field: keyof Omit<DayPlan, 'exercises'>, value: any) {
    setSchedule((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, [field]: value } : d))
    )
  }

  function addDay() {
    setSchedule((prev) => {
      const newDay = createDay(`Day ${prev.length + 1}`, 'New Workout Routine', false)
      const next = [...prev, newDay]
      setActiveDayIdx(next.length - 1)
      setViewMode('single')
      return next
    })
  }

  function removeDay(idx: number) {
    if (schedule.length <= 1) {
      setError('A workout plan must contain at least one day.')
      return
    }
    setSchedule((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      setActiveDayIdx((current) => Math.min(current, next.length - 1))
      return next
    })
  }

  function moveDay(fromIdx: number, toIdx: number) {
    if (toIdx < 0 || toIdx >= schedule.length) return
    setSchedule((prev) => {
      const clone = [...prev]
      const [removed] = clone.splice(fromIdx, 1)
      clone.splice(toIdx, 0, removed)
      return clone
    })
    setActiveDayIdx(toIdx)
  }

  // Exercise manipulations within days
  function addExercise(dayIdx: number) {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, exercises: [...d.exercises, emptyExercise()] } : d
      )
    )
  }

  function removeExercise(dayIdx: number, exIdx: number) {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) }
          : d
      )
    )
  }

  function updateExercise(dayIdx: number, exIdx: number, field: keyof ExerciseItem, value: any) {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              exercises: d.exercises.map((ex, j) =>
                j === exIdx ? { ...ex, [field]: value } : ex
              ),
            }
          : d
      )
    )
  }

  // Reorder exercise within a day
  function moveExerciseUp(dayIdx: number, exIdx: number) {
    if (exIdx <= 0) return
    setSchedule((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx) return d
        const exs = [...d.exercises]
        const [moved] = exs.splice(exIdx, 1)
        exs.splice(exIdx - 1, 0, moved)
        return { ...d, exercises: exs }
      })
    )
  }

  function moveExerciseDown(dayIdx: number, exIdx: number) {
    setSchedule((prev) =>
      prev.map((d, i) => {
        if (i !== dayIdx || exIdx >= d.exercises.length - 1) return d
        const exs = [...d.exercises]
        const [moved] = exs.splice(exIdx, 1)
        exs.splice(exIdx + 1, 0, moved)
        return { ...d, exercises: exs }
      })
    )
  }

  // Move exercise to another day
  function moveExerciseToDay(fromDayIdx: number, exIdx: number, toDayIdx: number) {
    if (fromDayIdx === toDayIdx || toDayIdx < 0 || toDayIdx >= schedule.length) return
    setSchedule((prev) => {
      const sourceDay = prev[fromDayIdx]
      const exToMove = sourceDay.exercises[exIdx]
      if (!exToMove) return prev

      return prev.map((d, i) => {
        if (i === fromDayIdx) {
          return { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) }
        }
        if (i === toDayIdx) {
          return { ...d, exercises: [...d.exercises, exToMove] }
        }
        return d
      })
    })
  }

  // Autocomplete select from global exercise library
  function handleSelectExercise(dayIdx: number, exIdx: number, exName: string) {
    const found = exerciseLibrary.find((e) => e.name.toLowerCase() === exName.toLowerCase())
    if (found) {
      setSchedule((prev) =>
        prev.map((d, i) =>
          i === dayIdx
            ? {
                ...d,
                exercises: d.exercises.map((ex, j) =>
                  j === exIdx
                    ? {
                        ...ex,
                        name: found.name,
                        muscleGroup: found.muscle_group || ex.muscleGroup,
                        videoUrl: found.video_url || ex.videoUrl,
                      }
                    : ex
                ),
              }
            : d
        )
      )
    } else {
      updateExercise(dayIdx, exIdx, 'name', exName)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (schedule.length === 0) {
      setError('Please add at least one day to the schedule.')
      return
    }

    for (const d of schedule) {
      if (!d.day.trim()) {
        setError('Each day in the schedule must have a day label (e.g. Day 1, Monday).')
        return
      }
      if (!d.restDay && d.exercises.length === 0) {
        setError(`"${d.day}" is set as a workout day but has no exercises. Either add exercises or mark it as a Rest Day.`)
        return
      }
    }

    const fd = new FormData(e.currentTarget)
    // Tag each day with planDuration so it persists cleanly in JSONB
    const scheduleWithDuration = schedule.map((d) => ({
      ...d,
      planDuration,
    }))
    fd.set('items', JSON.stringify(scheduleWithDuration))
    fd.set('kind', 'workout')
    fd.set('duration', planDuration)

    startTransition(async () => {
      try {
        const actionToRun = saveAction ?? saveProgramAction
        await actionToRun(fd)
      } catch (err: any) {
        if (err?.message === 'NEXT_REDIRECT' || err?.digest?.includes('NEXT_REDIRECT')) {
          return
        }
        setError(err?.message ?? 'Failed to save workout plan.')
      }
    })
  }

  const activeDay = schedule[activeDayIdx] ?? schedule[0]

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-5)' }}>
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="kind" value="workout" />

      {error && (
        <div className="badge badge-error" style={{ display: 'block', padding: '0.75rem 1rem' }}>
          {error}
        </div>
      )}

      {/* Basic Info: Client, Title, Notes */}
      <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
        <label className="form-group">
          <span>Target Client *</span>
          <select
            name="clientId"
            required
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="" disabled>Select a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="form-group">
          <span>Workout Plan Title *</span>
          <input
            name="title"
            required
            maxLength={120}
            placeholder="e.g. 5-Day Push / Pull / Legs Hypertrophy Split"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
          />
        </label>
      </div>

      <label className="form-group">
        <span>Overall Plan Notes / Recommendations</span>
        <textarea
          name="notes"
          rows={2}
          placeholder="General training guidelines, progressive overload targets, warm-up routines..."
          defaultValue={initialData?.notes ?? ''}
        />
      </label>

      {/* ── Plan Duration Selector (Duration: Week, Month, 2 Months, etc.) ── */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-4)',
        }}
      >
        <div style={{ marginBottom: '0.6rem' }}>
          <label style={{ fontWeight: 700, fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={16} style={{ color: 'var(--brand-600)' }} />
            <span>Plan Duration *</span>
            <span className="text-secondary text-xs" style={{ fontWeight: 400 }}>
              (Select timeframe: weekly split, monthly cycle, 2 months, etc.)
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: '1_week', label: '1 Week Split' },
            { id: '2_weeks', label: '2 Weeks Split' },
            { id: '1_month', label: '1 Month (4 Weeks)' },
            { id: '2_months', label: '2 Months (8 Weeks)' },
            { id: '3_months', label: '3 Months (12 Weeks)' },
            { id: 'ongoing', label: 'Custom / Ongoing' },
          ].map((item) => {
            const isSelected = planDuration === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPlanDuration(item.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--brand-600)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--brand-600)' : 'var(--bg-elevated)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
        <input type="hidden" name="duration" value={planDuration} />
      </div>

      {/* ── Day Management Bar (Schedule Days) ── */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-4)',
        }}
      >
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={18} style={{ color: 'var(--brand-600)' }} />
              Schedule Days ({schedule.length} Days)
            </h3>
            <span
              className="badge"
              style={{
                fontSize: '11px',
                background: 'rgba(140, 86, 212, 0.12)',
                color: 'var(--brand-700)',
                fontWeight: 600,
              }}
            >
              {planDuration === '1_week'
                ? '1 Week Cycle'
                : planDuration === '2_weeks'
                ? '2 Weeks Cycle'
                : planDuration === '1_month'
                ? '1 Month (4 Wks Cycle)'
                : planDuration === '2_months'
                ? '2 Months (8 Wks Cycle)'
                : planDuration === '3_months'
                ? '3 Months Cycle'
                : 'Custom Cycle'}
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
              {schedule.filter((d) => !d.restDay).length} Workouts • {schedule.filter((d) => d.restDay).length} Rest
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Split Presets */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSchedule(DEFAULT_DAYS.map((d) => createDay(d.day, d.workout, d.restDay)))
                  setActiveDayIdx(0)
                }}
                style={{ fontSize: '11px', padding: '4px 8px' }}
                title="Reset to default 7-day week split"
              >
                7-Day Split
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSchedule([
                    createDay('Day 1', 'Push (Chest, Shoulders, Triceps)', false),
                    createDay('Day 2', 'Pull (Back, Biceps)', false),
                    createDay('Day 3', 'Legs & Core', false),
                    createDay('Day 4', 'Rest & Recovery', true),
                  ])
                  setActiveDayIdx(0)
                }}
                style={{ fontSize: '11px', padding: '4px 8px' }}
                title="Use 3-Day Push/Pull/Legs Split"
              >
                3-Day PPL
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSchedule([
                    createDay('Day 1', 'Upper Body A', false),
                    createDay('Day 2', 'Lower Body A', false),
                    createDay('Day 3', 'Rest Day', true),
                    createDay('Day 4', 'Upper Body B', false),
                    createDay('Day 5', 'Lower Body B', false),
                    createDay('Day 6', 'Rest Day', true),
                    createDay('Day 7', 'Active Recovery', true),
                  ])
                  setActiveDayIdx(0)
                }}
                style={{ fontSize: '11px', padding: '4px 8px' }}
                title="Use 4-Day Upper/Lower Split"
              >
                4-Day Upper/Lower
              </button>
            </div>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--cream-300)', padding: 2, borderRadius: 'var(--radius-md)' }}>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: viewMode === 'single' ? '#ffffff' : 'transparent',
                  color: viewMode === 'single' ? 'var(--brand-700)' : 'var(--text-secondary)',
                  boxShadow: viewMode === 'single' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                Day-by-Day Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: viewMode === 'all' ? '#ffffff' : 'transparent',
                  color: viewMode === 'all' ? 'var(--brand-700)' : 'var(--text-secondary)',
                  boxShadow: viewMode === 'all' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                View All Days
              </button>
            </div>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={addDay}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '12px',
                fontWeight: 700,
                color: '#6d28d9',
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                borderRadius: '8px',
                padding: '5px 12px',
              }}
            >
              <Plus size={14} /> Add Day
            </button>
          </div>
        </div>

        {/* Day Selector Pills — Wrappable grid so new days never get hidden */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
            padding: '4px 0',
            marginBottom: '1.25rem',
          }}
        >
          {schedule.map((dayItem, idx) => {
            const isSelected = idx === activeDayIdx && viewMode === 'single'
            const isRest = dayItem.restDay

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveDayIdx(idx)
                  setViewMode('single')
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: isSelected
                    ? '2px solid #7c3aed'
                    : isRest
                    ? '1.5px dashed #cbd5e1'
                    : '1.5px solid #cbd5e1',
                  background: isSelected
                    ? '#7c3aed'
                    : isRest
                    ? '#f1f5f9'
                    : '#ffffff',
                  color: isSelected ? '#ffffff' : isRest ? '#64748b' : '#0f172a',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 3px 10px rgba(124, 58, 237, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <span>{dayItem.day}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    opacity: isSelected ? 0.95 : 0.75,
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.06)',
                  }}
                >
                  {isRest ? 'Rest' : `${dayItem.exercises.length} Ex`}
                </span>
              </button>
            )
          })}

          {/* Inline + Add Day Pill Button */}
          <button
            type="button"
            onClick={addDay}
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              border: '1.5px dashed #7c3aed',
              background: '#f5f3ff',
              color: '#6d28d9',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={15} /> Add Day
          </button>
        </div>
      </div>

      {/* ── Days Render Section ── */}
      {viewMode === 'single' && activeDay ? (
        <DayEditorCard
          dayPlan={activeDay}
          dayIdx={activeDayIdx}
          totalDays={schedule.length}
          exerciseLibrary={exerciseLibrary}
          allDays={schedule.map((d, i) => ({ idx: i, label: d.day }))}
          onUpdateDay={updateDay}
          onRemoveDay={removeDay}
          onMoveDay={moveDay}
          onAddExercise={addExercise}
          onRemoveExercise={removeExercise}
          onUpdateExercise={updateExercise}
          onMoveExerciseUp={moveExerciseUp}
          onMoveExerciseDown={moveExerciseDown}
          onMoveExerciseToDay={moveExerciseToDay}
          onSelectExercise={handleSelectExercise}
        />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {schedule.map((dayItem, dIdx) => (
            <DayEditorCard
              key={dIdx}
              dayPlan={dayItem}
              dayIdx={dIdx}
              totalDays={schedule.length}
              exerciseLibrary={exerciseLibrary}
              allDays={schedule.map((d, i) => ({ idx: i, label: d.day }))}
              onUpdateDay={updateDay}
              onRemoveDay={removeDay}
              onMoveDay={moveDay}
              onAddExercise={addExercise}
              onRemoveExercise={removeExercise}
              onUpdateExercise={updateExercise}
              onMoveExerciseUp={moveExerciseUp}
              onMoveExerciseDown={moveExerciseDown}
              onMoveExerciseToDay={moveExerciseToDay}
              onSelectExercise={handleSelectExercise}
            />
          ))}
        </div>
      )}

      {/* Datalist for auto-completing exercise library names */}
      <datalist id="exercise-library-datalist">
        {exerciseLibrary.map((ex) => (
          <option key={ex.id} value={ex.name}>
            {ex.muscle_group}
          </option>
        ))}
      </datalist>

      {/* Submit Action */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: 'var(--space-4)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-4)',
        }}
      >
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
          style={{ minWidth: 180 }}
        >
          {isPending ? 'Saving Workout Plan…' : initialData ? 'Update Workout Plan' : 'Save Workout Plan'}
        </button>
      </div>
    </form>
  )
}

/**
 * Individual Day Editor Card Component
 */
function DayEditorCard({
  dayPlan,
  dayIdx,
  totalDays,
  exerciseLibrary,
  allDays,
  onUpdateDay,
  onRemoveDay,
  onMoveDay,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onMoveExerciseUp,
  onMoveExerciseDown,
  onMoveExerciseToDay,
  onSelectExercise,
}: {
  dayPlan: DayPlan
  dayIdx: number
  totalDays: number
  exerciseLibrary: ExerciseOption[]
  allDays: { idx: number; label: string }[]
  onUpdateDay: (dayIdx: number, field: keyof Omit<DayPlan, 'exercises'>, value: any) => void
  onRemoveDay: (dayIdx: number) => void
  onMoveDay: (fromIdx: number, toIdx: number) => void
  onAddExercise: (dayIdx: number) => void
  onRemoveExercise: (dayIdx: number, exIdx: number) => void
  onUpdateExercise: (dayIdx: number, exIdx: number, field: keyof ExerciseItem, value: any) => void
  onMoveExerciseUp: (dayIdx: number, exIdx: number) => void
  onMoveExerciseDown: (dayIdx: number, exIdx: number) => void
  onMoveExerciseToDay: (fromDayIdx: number, exIdx: number, toDayIdx: number) => void
  onSelectExercise: (dayIdx: number, exIdx: number, exName: string) => void
}) {
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: dayPlan.restDay ? '#f8fafc' : '#ffffff',
        border: dayPlan.restDay ? '2px dashed #cbd5e1' : '1.5px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Day Header Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Day Label (e.g. Day 1, Monday) */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
              Day Label
            </span>
            <input
              type="text"
              value={dayPlan.day}
              onChange={(e) => onUpdateDay(dayIdx, 'day', e.target.value)}
              placeholder="e.g. Day 1 or Monday"
              style={{
                fontWeight: 800,
                fontSize: '15px',
                color: '#0f172a',
                width: 140,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
              }}
            />
          </div>

          {/* Workout / Muscle Focus (e.g. Chest & Triceps) */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
              Focus / Muscle Groups
            </span>
            <input
              type="text"
              value={dayPlan.workout}
              onChange={(e) => onUpdateDay(dayIdx, 'workout', e.target.value)}
              placeholder="e.g. Chest & Triceps"
              disabled={dayPlan.restDay}
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0f172a',
                width: 280,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                background: dayPlan.restDay ? '#f1f5f9' : '#ffffff',
                opacity: dayPlan.restDay ? 0.6 : 1,
              }}
            />
          </div>

          {/* Rest Day Toggle */}
          <div style={{ alignSelf: 'flex-end', marginBottom: 2 }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 700,
                background: dayPlan.restDay ? '#fee2e2' : '#f1f5f9',
                color: dayPlan.restDay ? '#991b1b' : '#334155',
                padding: '8px 14px',
                borderRadius: '8px',
                border: dayPlan.restDay ? '1px solid #fca5a5' : '1px solid #e2e8f0',
              }}
            >
              <input
                type="checkbox"
                checked={dayPlan.restDay}
                onChange={(e) => {
                  const isRest = e.target.checked
                  onUpdateDay(dayIdx, 'restDay', isRest)
                  if (isRest) {
                    onUpdateDay(dayIdx, 'workout', 'Rest & Recovery')
                  }
                }}
              />
              <span>{dayPlan.restDay ? '✓ Rest Day' : 'Mark as Rest Day'}</span>
            </label>
          </div>
        </div>

        {/* Day Actions (Move, Add Exercise, Delete Day) */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onMoveDay(dayIdx, dayIdx - 1)}
              disabled={dayIdx <= 0}
              title="Move Day Left"
              style={{ padding: '6px 10px', height: 34, border: '1px solid #e2e8f0' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onMoveDay(dayIdx, dayIdx + 1)}
              disabled={dayIdx >= totalDays - 1}
              title="Move Day Right"
              style={{ padding: '6px 10px', height: 34, border: '1px solid #e2e8f0' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {!dayPlan.restDay && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onAddExercise(dayIdx)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '13px',
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: '8px',
              }}
            >
              <Plus size={15} /> Add Exercise
            </button>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onRemoveDay(dayIdx)}
            style={{ color: '#dc2626', padding: '6px 10px', height: 34, border: '1px solid #fecaca' }}
            title="Delete this workout day"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Day Instructions / Notes */}
      <div style={{ marginBottom: dayPlan.restDay ? 0 : 20 }}>
        <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
          Routine Notes & Guidelines
        </label>
        <input
          type="text"
          value={dayPlan.notes}
          onChange={(e) => onUpdateDay(dayIdx, 'notes', e.target.value)}
          placeholder="e.g. 10m dynamic warm-up, 90s rest between sets, maintain strict form"
          style={{
            width: '100%',
            fontSize: '14px',
            color: '#0f172a',
            fontWeight: 500,
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            background: '#ffffff',
          }}
        />
      </div>

      {/* ── Exercises List ── */}
      {!dayPlan.restDay && (
        <div style={{ display: 'grid', gap: 16 }}>
          {dayPlan.exercises.map((ex, exIdx) => (
            <div
              key={exIdx}
              style={{
                background: '#ffffff',
                padding: '18px 20px',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'grid',
                gap: 14,
              }}
            >
              {/* Exercise Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#7c3aed',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    {exIdx + 1}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                    Exercise #{exIdx + 1}
                  </span>
                  {ex.name && (
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: '6px',
                        background: 'rgba(124, 58, 237, 0.08)',
                        color: '#6d28d9',
                      }}
                    >
                      {ex.name}
                    </span>
                  )}
                </div>

                {/* Move Up, Down, Move to Day, Delete */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={exIdx <= 0}
                    onClick={() => onMoveExerciseUp(dayIdx, exIdx)}
                    style={{ padding: '4px 8px', height: 30, border: '1px solid #e2e8f0' }}
                    title="Move exercise up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={exIdx >= dayPlan.exercises.length - 1}
                    onClick={() => onMoveExerciseDown(dayIdx, exIdx)}
                    style={{ padding: '4px 8px', height: 30, border: '1px solid #e2e8f0' }}
                    title="Move exercise down"
                  >
                    <ArrowDown size={14} />
                  </button>

                  {/* Move to another day */}
                  {allDays.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Move to:</span>
                      <select
                        value={dayIdx}
                        onChange={(e) => onMoveExerciseToDay(dayIdx, exIdx, Number(e.target.value))}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          height: 30,
                          background: '#ffffff',
                          color: '#0f172a',
                        }}
                      >
                        {allDays.map((d) => (
                          <option key={d.idx} value={d.idx} disabled={d.idx === dayIdx}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemoveExercise(dayIdx, exIdx)}
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#dc2626',
                      padding: '4px 8px',
                      height: 30,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                    title="Remove exercise"
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>

              {/* Row 1: Exercise Name (Library Autocomplete) & Muscle Group */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#0f172a', display: 'block', fontWeight: 700, marginBottom: 4 }}>
                    Exercise Name *
                  </span>
                  <input
                    type="text"
                    list="exercise-library-datalist"
                    value={ex.name}
                    onChange={(e) => onSelectExercise(dayIdx, exIdx, e.target.value)}
                    placeholder="Select from library or enter custom name..."
                    required
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#0f172a',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '13px', color: '#0f172a', display: 'block', fontWeight: 700, marginBottom: 4 }}>
                    Target Muscle Group
                  </span>
                  <input
                    type="text"
                    value={ex.muscleGroup}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'muscleGroup', e.target.value)}
                    placeholder="e.g. Chest, Back, Legs..."
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0f172a',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                  />
                </div>
              </div>

              {/* Row 2: 4 Clear Metric Boxes (Sets, Reps, Weight, Rest) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
                  gap: 12,
                  background: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', color: '#7c3aed', display: 'block', fontWeight: 800, marginBottom: 4 }}>
                    SETS *
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={ex.sets}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'sets', e.target.value ? Number(e.target.value) : '')}
                    placeholder="3"
                    style={{
                      width: '100%',
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#0f172a',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#2563eb', display: 'block', fontWeight: 800, marginBottom: 4 }}>
                    REPS *
                  </span>
                  <input
                    type="text"
                    value={ex.reps}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                    placeholder="e.g. 10-12 or failure"
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#0f172a',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#059669', display: 'block', fontWeight: 800, marginBottom: 4 }}>
                    WEIGHT
                  </span>
                  <input
                    type="text"
                    value={ex.weight}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'weight', e.target.value)}
                    placeholder="e.g. 20kg or Bodyweight"
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#0f172a',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#d97706', display: 'block', fontWeight: 800, marginBottom: 4 }}>
                    REST (Seconds)
                  </span>
                  <input
                    type="number"
                    step="15"
                    min="0"
                    max="300"
                    value={ex.restSeconds}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'restSeconds', e.target.value ? Number(e.target.value) : '')}
                    placeholder="60"
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#0f172a',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Instructions & Video URL */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#475569', display: 'block', fontWeight: 700, marginBottom: 4 }}>
                    Technique & Form Cues
                  </span>
                  <input
                    type="text"
                    value={ex.instructions}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'instructions', e.target.value)}
                    placeholder="e.g. 3s eccentric tempo, 1s pause at stretch, chest up"
                    style={{
                      width: '100%',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#0f172a',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '12px', color: '#475569', display: 'block', fontWeight: 700, marginBottom: 4 }}>
                    Video Demo URL (Optional)
                  </span>
                  <input
                    type="url"
                    value={ex.videoUrl}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'videoUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    style={{
                      width: '100%',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#0f172a',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {dayPlan.exercises.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              No exercises added to this routine yet. Click &quot;Add Exercise&quot; above to begin.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
