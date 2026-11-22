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
          <select name="clientId" required defaultValue={initialData?.clientId ?? ''}>
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
            defaultValue={initialData?.title ?? ''}
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
            <span>Plan Duration / مدة الخطة *</span>
            <span className="text-secondary text-xs" style={{ fontWeight: 400 }}>
              (Choose the cycle timeframe: weekly, monthly, 2 months, etc.)
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: '1_week', label: '1 Week (Weekly Split) / أسبوع' },
            { id: '2_weeks', label: '2 Weeks / أسبوعين' },
            { id: '1_month', label: '1 Month (4 Weeks) / شهر' },
            { id: '2_months', label: '2 Months (8 Weeks) / شهرين' },
            { id: '3_months', label: '3 Months (12 Weeks) / 3 شهور' },
            { id: 'ongoing', label: 'Custom / Ongoing / مستمر' },
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
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '12px' }}
            >
              <Plus size={14} /> Add Day
            </button>
          </div>
        </div>

        {/* Day Selector Pills */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 8,
            marginBottom: 'var(--space-4)',
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
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected
                    ? '2px solid var(--brand-600)'
                    : isRest
                    ? '1px dashed var(--border-subtle)'
                    : '1px solid var(--border-subtle)',
                  background: isSelected
                    ? 'var(--brand-600)'
                    : isRest
                    ? 'var(--cream-300)'
                    : 'var(--bg-elevated, #f8fafc)',
                  color: isSelected ? '#ffffff' : isRest ? '#64748b' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{dayItem.day}</span>
                <span
                  style={{
                    fontSize: '10px',
                    opacity: isSelected ? 0.9 : 0.7,
                  }}
                >
                  ({isRest ? 'Rest' : `${dayItem.exercises.length} ex`})
                </span>
              </button>
            )
          })}
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
      className="card"
      style={{
        padding: 'var(--space-5)',
        background: dayPlan.restDay ? 'var(--cream-300)' : 'var(--bg-surface, #ffffff)',
        border: dayPlan.restDay ? '1px dashed var(--border-subtle)' : '1px solid var(--border-subtle)',
      }}
    >
      {/* Day Top Bar */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Day Label input (e.g. Day 1, Monday) */}
          <input
            type="text"
            value={dayPlan.day}
            onChange={(e) => onUpdateDay(dayIdx, 'day', e.target.value)}
            placeholder="e.g. Day 1 or Monday"
            style={{
              fontWeight: 800,
              fontSize: 'var(--text-base)',
              width: 130,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          />

          {/* Workout / Muscle Focus Name (e.g. Chest & Triceps) */}
          <input
            type="text"
            value={dayPlan.workout}
            onChange={(e) => onUpdateDay(dayIdx, 'workout', e.target.value)}
            placeholder="e.g. Chest & Triceps"
            disabled={dayPlan.restDay}
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              width: 230,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              opacity: dayPlan.restDay ? 0.5 : 1,
            }}
          />

          {/* Rest Day Toggle */}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              fontWeight: 600,
              background: dayPlan.restDay ? 'rgba(100, 116, 139, 0.15)' : 'var(--bg-elevated)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-md)',
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
            <span>{dayPlan.restDay ? 'Rest Day (Active)' : 'Mark as Rest Day'}</span>
          </label>
        </div>

        {/* Day Actions: Move Left/Right, Add Exercise, Delete Day */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onMoveDay(dayIdx, dayIdx - 1)}
            disabled={dayIdx <= 0}
            title="Move Day Left"
            style={{ padding: '4px 8px' }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onMoveDay(dayIdx, dayIdx + 1)}
            disabled={dayIdx >= totalDays - 1}
            title="Move Day Right"
            style={{ padding: '4px 8px' }}
          >
            <ChevronRight size={14} />
          </button>

          {!dayPlan.restDay && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onAddExercise(dayIdx)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 'var(--text-xs)',
                color: 'var(--brand-700)',
                background: 'rgba(140, 86, 212, 0.08)',
              }}
            >
              <Plus size={13} /> Add Exercise
            </button>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onRemoveDay(dayIdx)}
            style={{ color: 'var(--error, #dc2626)', padding: '4px 8px' }}
            title="Delete this workout day"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Day Notes */}
      <input
        type="text"
        value={dayPlan.notes}
        onChange={(e) => onUpdateDay(dayIdx, 'notes', e.target.value)}
        placeholder="Day instructions (e.g. Dynamic mobility warm up 8 mins, strict 90s rest periods)"
        style={{
          width: '100%',
          fontSize: 'var(--text-xs)',
          padding: '6px 12px',
          marginBottom: dayPlan.restDay ? 0 : 14,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          background: 'transparent',
        }}
      />

      {/* Exercises List */}
      {!dayPlan.restDay && (
        <div style={{ display: 'grid', gap: 12 }}>
          {dayPlan.exercises.map((ex, exIdx) => (
            <div
              key={exIdx}
              style={{
                background: 'var(--bg-elevated, #f8fafc)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'grid',
                gap: 10,
              }}
            >
              {/* Exercise Header & Quick Controls (Reorder, Move, Delete) */}
              <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--brand-600)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {exIdx + 1}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    EXERCISE #{exIdx + 1}
                  </span>
                </div>

                {/* Move Up, Move Down, Move to Day, Delete */}
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {/* Reorder within day */}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={exIdx <= 0}
                    onClick={() => onMoveExerciseUp(dayIdx, exIdx)}
                    style={{ padding: '2px 6px', height: 26 }}
                    title="Move exercise up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={exIdx >= dayPlan.exercises.length - 1}
                    onClick={() => onMoveExerciseDown(dayIdx, exIdx)}
                    style={{ padding: '2px 6px', height: 26 }}
                    title="Move exercise down"
                  >
                    <ArrowDown size={13} />
                  </button>

                  {/* Move to another day selector */}
                  {allDays.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Move to:</span>
                      <select
                        value={dayIdx}
                        onChange={(e) => onMoveExerciseToDay(dayIdx, exIdx, Number(e.target.value))}
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          height: 26,
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
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--error, #dc2626)',
                      padding: '4px 6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                    title="Remove exercise"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Input Fields Row: Name, Muscle Group, Sets, Reps, Weight, Rest */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 8,
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>NAME *</span>
                  <input
                    type="text"
                    list="exercise-library-datalist"
                    value={ex.name}
                    onChange={(e) => onSelectExercise(dayIdx, exIdx, e.target.value)}
                    placeholder="e.g. Incline Dumbbell Press"
                    required
                    style={{
                      width: '100%',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>MUSCLE GROUP</span>
                  <input
                    type="text"
                    value={ex.muscleGroup}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'muscleGroup', e.target.value)}
                    placeholder="e.g. Upper Chest / Shoulders"
                    style={{
                      width: '100%',
                      fontSize: 'var(--text-xs)',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>SETS</span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={ex.sets}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'sets', e.target.value ? Number(e.target.value) : '')}
                    style={{
                      width: '100%',
                      fontSize: 'var(--text-xs)',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>REPS</span>
                  <input
                    type="text"
                    value={ex.reps}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                    placeholder="e.g. 8-12 or 15"
                    style={{
                      width: '100%',
                      fontSize: 'var(--text-xs)',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>WEIGHT</span>
                  <input
                    type="text"
                    value={ex.weight}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'weight', e.target.value)}
                    placeholder="e.g. 24kg or Bodyweight"
                    style={{
                      width: '100%',
                      fontSize: 'var(--text-xs)',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>REST TIME (SEC)</span>
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
                      fontSize: 'var(--text-xs)',
                      padding: '5px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                </div>
              </div>

              {/* Instructions & Notes Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>FORM CUES & INSTRUCTIONS</span>
                  <input
                    type="text"
                    value={ex.instructions}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'instructions', e.target.value)}
                    placeholder="e.g. 3-second eccentric tempo, pause at the bottom"
                    style={{
                      width: '100%',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface, #ffffff)',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>ADDITIONAL NOTES / TARGET</span>
                  <input
                    type="text"
                    value={ex.notes ?? ''}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'notes', e.target.value)}
                    placeholder="e.g. Try to increase weight by 2.5kg if hitting 12 reps on all sets"
                    style={{
                      width: '100%',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface, #ffffff)',
                    }}
                  />
                </div>
              </div>

              {/* Media URLs: Demonstration Video & Exercise Image */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>DEMONSTRATION VIDEO URL</span>
                  <input
                    type="url"
                    value={ex.videoUrl}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'videoUrl', e.target.value)}
                    placeholder="https://youtube.com/... or Vimeo / Loom"
                    style={{
                      width: '100%',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface, #ffffff)',
                    }}
                  />
                </div>

                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>EXERCISE IMAGE / DIAGRAM URL</span>
                  <input
                    type="url"
                    value={ex.imageUrl ?? ''}
                    onChange={(e) => onUpdateExercise(dayIdx, exIdx, 'imageUrl', e.target.value)}
                    placeholder="https://... (image URL)"
                    style={{
                      width: '100%',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface, #ffffff)',
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
                padding: 'var(--space-6)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
              }}
            >
              No exercises added yet for this day. Click &quot;Add Exercise&quot; above to start.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
