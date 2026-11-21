'use client'

import { useRef, useState, useTransition } from 'react'
import { saveProgramAction } from '@/app/coach/programs/actions'
import { Dumbbell, Plus, Trash2, Video, Info } from 'lucide-react'

export type ExerciseItem = {
  name: string
  muscleGroup: string
  sets: number | ''
  reps: string
  weight: string
  restSeconds: number | ''
  instructions: string
  videoUrl: string
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

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function emptyExercise(): ExerciseItem {
  return {
    name: '',
    muscleGroup: '',
    sets: 3,
    reps: '10-12',
    weight: '',
    restSeconds: 60,
    instructions: '',
    videoUrl: '',
  }
}

function emptyDay(dayName: string): DayPlan {
  return {
    day: dayName,
    workout: dayName === 'Sunday' ? 'Rest' : 'Full Body',
    restDay: dayName === 'Sunday',
    notes: '',
    exercises: dayName === 'Sunday' ? [] : [emptyExercise()],
  }
}

type Props = {
  clients: Client[]
  exerciseLibrary?: ExerciseOption[]
  initialData?: {
    id: string
    clientId: string
    title: string
    notes: string
    schedule: DayPlan[]
  } | null
}

export default function WorkoutPlanForm({ clients, exerciseLibrary = [], initialData }: Props) {
  const [schedule, setSchedule] = useState<DayPlan[]>(() => {
    if (initialData?.schedule && initialData.schedule.length > 0) {
      return initialData.schedule
    }
    return DAYS_OF_WEEK.map((d) => emptyDay(d))
  })

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function updateDay(dayIdx: number, field: keyof Omit<DayPlan, 'exercises'>, value: any) {
    setSchedule((prev) =>
      prev.map((d, i) => (i === dayIdx ? { ...d, [field]: value } : d))
    )
  }

  function addDay() {
    setSchedule((prev) => [...prev, emptyDay(`Day ${prev.length + 1}`)])
  }

  function removeDay(idx: number) {
    setSchedule((prev) => prev.filter((_, i) => i !== idx))
  }

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
        setError('Each day in the schedule must have a day label.')
        return
      }
      if (!d.restDay && d.exercises.length === 0) {
        setError(`"${d.day}" is set as a workout day but has no exercises. Either add exercises or mark it as a Rest Day.`)
        return
      }
    }

    const fd = new FormData(e.currentTarget)
    fd.set('items', JSON.stringify(schedule))
    fd.set('kind', 'workout')

    startTransition(async () => {
      try {
        await saveProgramAction(fd)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to save workout plan.')
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-5)' }}>
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="kind" value="workout" />

      {error && (
        <div className="badge badge-error" style={{ display: 'block', padding: '0.75rem 1rem' }}>
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-2" style={{ gap: 'var(--space-3)' }}>
        <label className="form-group">
          <span>Client *</span>
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
            placeholder="e.g. 4-Day Hypertrophy Split"
            defaultValue={initialData?.title ?? ''}
          />
        </label>
      </div>

      <label className="form-group">
        <span>Coach Notes / Instructions</span>
        <textarea
          name="notes"
          rows={2}
          placeholder="Special instructions, progressive overload rules, hydration tips…"
          defaultValue={initialData?.notes ?? ''}
        />
      </label>

      {/* Weekly Schedule Days */}
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Dumbbell size={18} style={{ color: 'var(--brand-600)' }} />
            Weekly Workout Schedule ({schedule.length} Days)
          </h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={addDay}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={14} /> Add Day
          </button>
        </div>

        {schedule.map((dayPlan, dayIdx) => (
          <div
            key={dayIdx}
            className="card"
            style={{
              padding: 'var(--space-4)',
              background: dayPlan.restDay ? 'var(--bg-subtle, #f8fafc)' : 'var(--bg-surface, #ffffff)',
              border: dayPlan.restDay ? '1px dashed var(--border-subtle)' : '1px solid var(--border-subtle)',
            }}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={dayPlan.day}
                  onChange={(e) => updateDay(dayIdx, 'day', e.target.value)}
                  placeholder="e.g. Monday"
                  style={{
                    fontWeight: 700,
                    fontSize: 'var(--text-base)',
                    width: 130,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                />
                <input
                  type="text"
                  value={dayPlan.workout}
                  onChange={(e) => updateDay(dayIdx, 'workout', e.target.value)}
                  placeholder="e.g. Upper Body Focus"
                  disabled={dayPlan.restDay}
                  style={{
                    fontSize: 'var(--text-sm)',
                    width: 200,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    opacity: dayPlan.restDay ? 0.6 : 1,
                  }}
                />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dayPlan.restDay}
                    onChange={(e) => {
                      const isRest = e.target.checked
                      updateDay(dayIdx, 'restDay', isRest)
                      if (isRest) {
                        updateDay(dayIdx, 'workout', 'Rest Day')
                      }
                    }}
                  />
                  <span>Mark as Rest Day</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {!dayPlan.restDay && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => addExercise(dayIdx)}
                    style={{ fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={13} /> Add Exercise
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeDay(dayIdx)}
                  style={{ color: 'var(--error, #dc2626)', padding: '2px 6px' }}
                  title="Remove Day"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Day Notes */}
            <input
              type="text"
              value={dayPlan.notes}
              onChange={(e) => updateDay(dayIdx, 'notes', e.target.value)}
              placeholder="Day notes (e.g. Warm up with 5 mins treadmill, focus on eccentric tempo)"
              style={{
                width: '100%',
                fontSize: 'var(--text-xs)',
                padding: '6px 10px',
                marginBottom: dayPlan.restDay ? 0 : 12,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
              }}
            />

            {/* Exercises List */}
            {!dayPlan.restDay && (
              <div style={{ display: 'grid', gap: 10 }}>
                {dayPlan.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    style={{
                      background: 'var(--bg-elevated, #f1f5f9)',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'grid',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                      {/* Name / Autocomplete from library */}
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>EXERCISE NAME</span>
                        <input
                          type="text"
                          list="exercise-library-datalist"
                          value={ex.name}
                          onChange={(e) => handleSelectExercise(dayIdx, exIdx, e.target.value)}
                          placeholder="Bench Press..."
                          required
                          style={{
                            width: '100%',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            padding: '4px 6px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                      </div>

                      {/* Muscle Group */}
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>MUSCLE GROUP</span>
                        <input
                          type="text"
                          value={ex.muscleGroup}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'muscleGroup', e.target.value)}
                          placeholder="Chest, Back..."
                          style={{
                            width: '100%',
                            fontSize: 'var(--text-xs)',
                            padding: '4px 6px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                      </div>

                      {/* Sets */}
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>SETS</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={ex.sets}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'sets', e.target.value ? Number(e.target.value) : '')}
                          style={{
                            width: '100%',
                            fontSize: 'var(--text-xs)',
                            padding: '4px 6px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                      </div>

                      {/* Reps */}
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>REPS</span>
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                          placeholder="8-12"
                          style={{
                            width: '100%',
                            fontSize: 'var(--text-xs)',
                            padding: '4px 6px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                      </div>

                      {/* Weight */}
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>WEIGHT</span>
                        <input
                          type="text"
                          value={ex.weight}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'weight', e.target.value)}
                          placeholder="e.g. 60kg / Bodyweight"
                          style={{
                            width: '100%',
                            fontSize: 'var(--text-xs)',
                            padding: '4px 6px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                      </div>

                      {/* Rest Seconds */}
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>REST (SEC)</span>
                        <input
                          type="number"
                          step="15"
                          min="0"
                          max="300"
                          value={ex.restSeconds}
                          onChange={(e) => updateExercise(dayIdx, exIdx, 'restSeconds', e.target.value ? Number(e.target.value) : '')}
                          placeholder="60"
                          style={{
                            width: '100%',
                            fontSize: 'var(--text-xs)',
                            padding: '4px 6px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        />
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeExercise(dayIdx, exIdx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--error, #dc2626)',
                          padding: 4,
                          marginTop: 14,
                        }}
                        title="Remove Exercise"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Instructions + Video URL in collapsible/compact row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                      <input
                        type="text"
                        value={ex.instructions}
                        onChange={(e) => updateExercise(dayIdx, exIdx, 'instructions', e.target.value)}
                        placeholder="Instructions / Cues: Retract scapula, keep elbows at 45°..."
                        style={{
                          width: '100%',
                          fontSize: '11px',
                          padding: '3px 6px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface, #fff)',
                        }}
                      />
                      <input
                        type="url"
                        value={ex.videoUrl}
                        onChange={(e) => updateExercise(dayIdx, exIdx, 'videoUrl', e.target.value)}
                        placeholder="Demo Video URL (YouTube / Loom...)"
                        style={{
                          width: '100%',
                          fontSize: '11px',
                          padding: '3px 6px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface, #fff)',
                        }}
                      />
                    </div>
                  </div>
                ))}

                {dayPlan.exercises.length === 0 && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                    No exercises added yet for this day. Click &quot;Add Exercise&quot; above.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Datalist for exercise name auto-complete from exercise library */}
      <datalist id="exercise-library-datalist">
        {exerciseLibrary.map((ex) => (
          <option key={ex.id} value={ex.name}>
            {ex.muscle_group}
          </option>
        ))}
      </datalist>

      {/* Submit Button */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
          style={{ minWidth: 160 }}
        >
          {isPending ? 'Saving Workout Plan…' : initialData ? 'Update Workout Plan' : 'Save Workout Plan'}
        </button>
      </div>
    </form>
  )
}
