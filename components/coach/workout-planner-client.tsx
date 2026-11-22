'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarDays, User, Plus, Edit3, Trash2, Calendar, BookOpen, Clock, Dumbbell } from 'lucide-react'
import WorkoutPlanForm from '@/components/coach/workout-plan-form'
import { saveWorkoutPlanAction, deleteWorkoutPlanAction } from '@/app/coach/workout-planner/actions'

type Client = { id: string; name: string; email: string }

type Props = {
  selectedClientId: string | null
  editId: string | null
  flashError: string | null
  flashSaved: string | null
  flashDeleted: string | null
  clientList: Client[]
  workoutPlans: any[]
  exerciseLibrary: any[]
}

const DURATION_LABELS: Record<string, string> = {
  '1_week': '1 Week',
  '2_weeks': '2 Weeks',
  '1_month': '1 Month (4 Weeks)',
  '2_months': '2 Months (8 Weeks)',
  '3_months': '3 Months (12 Weeks)',
  'ongoing': 'Custom / Ongoing',
}

export default function WorkoutPlannerClient({
  selectedClientId: initialClientId,
  editId,
  flashError,
  flashSaved,
  flashDeleted,
  clientList,
  workoutPlans,
  exerciseLibrary,
}: Props) {
  // If only 1 client, select them by default
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || (clientList.length === 1 ? clientList[0].id : '')
  )
  const [showNewPlanForm, setShowNewPlanForm] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(editId)

  const selectedClient = clientList.find((c) => c.id === selectedClientId)
  const clientPlans = workoutPlans.filter((p: any) => p.client_id === selectedClientId)
  const editPlan = editingPlanId ? clientPlans.find((p: any) => p.id === editingPlanId) : null

  const showForm = showNewPlanForm || Boolean(editPlan)

  return (
    <main className="page-body animate-fade-in">
      {/* Header */}
      <header
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <CalendarDays size={28} style={{ color: 'var(--brand-600)' }} />
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>Client Workout Planner</h1>
          </div>
          <p className="text-secondary text-sm">
            Select a client and build personalized weekly or monthly training schedules with exercises from the library.
          </p>
        </div>

        <Link
          href="/coach/exercise-library"
          className="btn btn-ghost btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <BookOpen size={15} />
          <span>Exercise Library ({exerciseLibrary.length})</span>
        </Link>
      </header>

      {/* Flash Messages */}
      {flashError && (
        <div className="badge badge-error" style={{ display: 'block', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          {flashError === 'missing-fields' ? 'Please fill in all required fields.' : flashError}
        </div>
      )}
      {flashSaved && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#d1fae5',
            color: '#065f46',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontWeight: 600,
          }}
        >
          ✓ Workout plan saved successfully.
        </div>
      )}
      {flashDeleted && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#fef3c7',
            color: '#92400e',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontWeight: 600,
          }}
        >
          Workout plan deleted.
        </div>
      )}

      {/* Step 1: Select Client */}
      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <User size={18} style={{ color: 'var(--brand-600)' }} />
          <span>Step 1: Select Assigned Client</span>
        </h2>

        {clientList.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            You do not currently have any active assigned clients. Clients must be assigned to you by an admin before you can assign workout plans.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {clientList.map((client) => {
              const isActive = client.id === selectedClientId
              const planCount = workoutPlans.filter((p: any) => p.client_id === client.id).length
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    setSelectedClientId(client.id)
                    setShowNewPlanForm(false)
                    setEditingPlanId(null)
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: isActive ? '2px solid var(--brand-600)' : '1px solid var(--border-subtle)',
                    background: isActive ? 'var(--brand-600)' : 'var(--bg-elevated)',
                    color: isActive ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{client.name}</div>
                  <div style={{ fontSize: '11px', opacity: isActive ? 0.9 : 0.6, marginTop: 2 }}>
                    {planCount} workout plan{planCount !== 1 ? 's' : ''}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Step 2 & 3: Selected Client's Plans and Plan Builder */}
      {selectedClient && (
        <>
          {/* Step 2: Client's Assigned Plans */}
          <section style={{ marginBottom: '1.5rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>
                  {selectedClient.name}'s Workout Plans
                </h2>
                <p className="text-secondary text-xs" style={{ margin: '2px 0 0' }}>
                  {clientPlans.length} plan{clientPlans.length !== 1 ? 's' : ''} assigned
                </p>
              </div>
              {!showForm && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowNewPlanForm(true)
                    setEditingPlanId(null)
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={15} /> New Workout Plan
                </button>
              )}
            </div>

            {clientPlans.length === 0 ? (
              <div className="card text-secondary" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                No workout plans created yet for {selectedClient.name}.
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowNewPlanForm(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={15} /> Create First Plan
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {clientPlans.map((plan: any) => {
                  const schedule: any[] = Array.isArray(plan.schedule) ? plan.schedule : []
                  const workoutDays = schedule.filter((d: any) => !d.restDay).length
                  const restDays = schedule.filter((d: any) => d.restDay).length
                  const isEditing = editingPlanId === plan.id
                  const planDurationKey = schedule[0]?.planDuration || '1_month'
                  const planDurationLabel = DURATION_LABELS[planDurationKey] || '1 Month'

                  return (
                    <article
                      key={plan.id}
                      className="card"
                      style={{
                        padding: 'var(--space-4)',
                        border: isEditing ? '2px solid var(--brand-600)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span className="badge badge-brand">Workout</span>
                            <strong style={{ fontSize: 'var(--text-base)' }}>{plan.title}</strong>
                            <span
                              className="badge"
                              style={{
                                fontSize: '11px',
                                background: 'rgba(140, 86, 212, 0.12)',
                                color: 'var(--brand-700)',
                                fontWeight: 600,
                              }}
                            >
                              Duration: {planDurationLabel}
                            </span>
                            {isEditing && (
                              <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                                Currently Editing
                              </span>
                            )}
                          </div>
                          <div className="text-secondary text-xs" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} /> Updated {new Date(plan.updated_at).toLocaleDateString()}
                            </span>
                            <span>
                              {schedule.length} Days ({workoutDays} Workouts, {restDays} Rest)
                            </span>
                          </div>
                          {plan.notes && (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '6px 0 0' }}>
                              Note: {plan.notes}
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) {
                                setEditingPlanId(null)
                                setShowNewPlanForm(false)
                              } else {
                                setEditingPlanId(plan.id)
                                setShowNewPlanForm(false)
                              }
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <Edit3 size={14} /> {isEditing ? 'Cancel Edit' : 'Edit Plan'}
                          </button>
                          <form action={deleteWorkoutPlanAction}>
                            <input type="hidden" name="id" value={plan.id} />
                            <input type="hidden" name="clientId" value={plan.client_id} />
                            <button
                              type="submit"
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--error, #dc2626)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Day tags preview */}
                      {!isEditing && schedule.length > 0 && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {schedule.map((day: any, i: number) => (
                            <span
                              key={i}
                              style={{
                                padding: '3px 10px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: day.restDay ? 'var(--cream-300)' : 'rgba(140, 86, 212, 0.08)',
                                color: day.restDay ? 'var(--text-secondary)' : 'var(--brand-700)',
                                border: day.restDay
                                  ? '1px dashed var(--border-subtle)'
                                  : '1px solid rgba(140, 86, 212, 0.2)',
                              }}
                            >
                              {day.day}
                              {day.workout && day.workout !== day.day ? ` – ${day.workout}` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* Step 3: Interactive Workout Plan Builder Form */}
          {showForm && (
            <section className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                    {editPlan ? `Edit Workout Plan: ${editPlan.title}` : `Build Workout Plan for ${selectedClient.name}`}
                  </h2>
                  <p className="text-secondary text-xs">
                    Choose duration (weekly, monthly, 2 months), organize Schedule Days, and assign exercises from the library.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPlanForm(false)
                    setEditingPlanId(null)
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>

              <WorkoutPlanForm
                key={editPlan?.id ?? `new-${selectedClientId}`}
                clients={[{ id: selectedClient.id, name: selectedClient.name }]}
                exerciseLibrary={exerciseLibrary}
                saveAction={saveWorkoutPlanAction}
                initialData={
                  editPlan
                    ? {
                        id: editPlan.id,
                        clientId: editPlan.client_id,
                        title: editPlan.title,
                        notes: editPlan.notes ?? '',
                        schedule: editPlan.schedule ?? [],
                      }
                    : null
                }
              />
            </section>
          )}
        </>
      )}
    </main>
  )
}
