'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarDays, User, Plus, Edit3, Trash2, Calendar, BookOpen, Clock, Dumbbell, Layers, CheckCircle2 } from 'lucide-react'
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
  '1_week': '1 Week (Weekly Split)',
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
    <main className="page-body animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* ── Page Header ── */}
      <header
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              }}
            >
              <CalendarDays size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Client Workout Planner
              </h1>
              <p style={{ fontSize: '14px', color: '#475569', margin: '4px 0 0', fontWeight: 500 }}>
                مخطط التمارين والجداول الأسبوعية والشهرية للعملاء
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/coach/exercise-library"
          className="btn btn-ghost"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '14px',
            fontWeight: 600,
            color: '#4f46e5',
            background: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            padding: '8px 16px',
            borderRadius: '10px',
          }}
        >
          <BookOpen size={17} />
          <span>مكتبة التمارين ({exerciseLibrary.length} تمرين)</span>
        </Link>
      </header>

      {/* ── Flash Notifications ── */}
      {flashError && (
        <div
          style={{
            padding: '12px 18px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '14px',
            border: '1px solid #f87171',
          }}
        >
          {flashError === 'missing-fields' ? 'يرجى ملء جميع الحقول المطلوبة وحفظ الخطة.' : flashError}
        </div>
      )}
      {flashSaved && (
        <div
          style={{
            padding: '12px 18px',
            background: '#dcfce7',
            color: '#166534',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '14px',
            border: '1px solid #86efac',
          }}
        >
          ✓ تم حفظ خطة التمارين بنجاح وتطبيقها على العميل.
        </div>
      )}
      {flashDeleted && (
        <div
          style={{
            padding: '12px 18px',
            background: '#fef3c7',
            color: '#92400e',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: '14px',
            border: '1px solid #fcd34d',
          }}
        >
          تم حذف الخطة التدريبية.
        </div>
      )}

      {/* ── STEP 1: Select Client ── */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          padding: '20px 24px',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#7c3aed',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 800,
              }}
            >
              1
            </span>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              اختر العميل (Select Client)
            </h2>
          </div>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            {clientList.length} عميل مشترك معك
          </span>
        </div>

        {clientList.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            لا يوجد عملاء مخصصين لك حالياً. يجب على الأدمن تعيين عملاء لحسابك للبدء في إنشاء الجداول.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
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
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: isActive ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                    background: isActive ? '#f5f3ff' : '#ffffff',
                    color: '#0f172a',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.15)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: isActive ? '#6d28d9' : '#0f172a' }}>
                      {client.name}
                    </div>
                    {client.email && (
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                        {client.email}
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: isActive ? '#7c3aed' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                    }}
                  >
                    {planCount} خطة
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* ── STEP 2 & 3: Selected Client Workspace ── */}
      {selectedClient && (
        <div>
          {/* STEP 2: Current Plans for Client */}
          <section
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              padding: '20px 24px',
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#7c3aed',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                  }}
                >
                  2
                </span>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    خطط تمارين العميل: <span style={{ color: '#7c3aed' }}>{selectedClient.name}</span>
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>
                    {clientPlans.length} خطة تدريبية مخصصة لهذا العميل
                  </p>
                </div>
              </div>

              {!showForm && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowNewPlanForm(true)
                    setEditingPlanId(null)
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '8px 18px',
                    borderRadius: '10px',
                  }}
                >
                  <Plus size={16} /> خطة تمارين جديدة
                </button>
              )}
            </div>

            {clientPlans.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1rem',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1',
                }}
              >
                <Dumbbell size={36} style={{ color: '#94a3b8', margin: '0 auto 10px', display: 'block' }} />
                <p style={{ color: '#475569', fontSize: '15px', fontWeight: 600, margin: '0 0 12px' }}>
                  لم يتم إنشاء أي خطة تمارين بعد للعميل {selectedClient.name}
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowNewPlanForm(true)}
                  style={{ fontWeight: 700, padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={15} /> ابدأ بإنشاء أول خطة
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {clientPlans.map((plan: any) => {
                  const schedule: any[] = Array.isArray(plan.schedule) ? plan.schedule : []
                  const workoutDays = schedule.filter((d: any) => !d.restDay).length
                  const restDays = schedule.filter((d: any) => d.restDay).length
                  const isEditing = editingPlanId === plan.id
                  const planDurationKey = schedule[0]?.planDuration || '1_month'
                  const planDurationLabel = DURATION_LABELS[planDurationKey] || '1 Month'

                  return (
                    <div
                      key={plan.id}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '12px',
                        border: isEditing ? '2.5px solid #7c3aed' : '1.5px solid #e2e8f0',
                        background: isEditing ? '#faf5ff' : '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12,
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                              {plan.title}
                            </strong>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: '6px',
                                background: 'rgba(124, 58, 237, 0.1)',
                                color: '#6d28d9',
                              }}
                            >
                              مدة الخطة: {planDurationLabel}
                            </span>
                            {isEditing && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: '#fef3c7',
                                  color: '#b45309',
                                }}
                              >
                                جاري التعديل الآن
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              gap: 16,
                              alignItems: 'center',
                              fontSize: '13px',
                              color: '#64748b',
                              marginTop: 6,
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={13} /> آخر تحديث: {new Date(plan.updated_at).toLocaleDateString()}
                            </span>
                            <span style={{ fontWeight: 600, color: '#334155' }}>
                              {schedule.length} أيام ({workoutDays} تمرين • {restDays} راحة)
                            </span>
                          </div>

                          {plan.notes && (
                            <p style={{ fontSize: '13px', color: '#475569', margin: '8px 0 0', fontWeight: 500 }}>
                              تعليمات: {plan.notes}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
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
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '13px',
                              fontWeight: 700,
                              color: isEditing ? '#dc2626' : '#4f46e5',
                            }}
                          >
                            <Edit3 size={14} /> {isEditing ? 'إلغاء التعديل' : 'تعديل الخطة'}
                          </button>

                          <form action={deleteWorkoutPlanAction}>
                            <input type="hidden" name="id" value={plan.id} />
                            <input type="hidden" name="clientId" value={plan.client_id} />
                            <button
                              type="submit"
                              className="btn btn-ghost btn-sm"
                              style={{
                                color: '#dc2626',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '13px',
                                fontWeight: 600,
                              }}
                            >
                              <Trash2 size={14} /> حذف
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Day tags preview */}
                      {!isEditing && schedule.length > 0 && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {schedule.map((day: any, i: number) => (
                            <span
                              key={i}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                background: day.restDay ? '#f1f5f9' : '#ede9fe',
                                color: day.restDay ? '#64748b' : '#6d28d9',
                                border: day.restDay ? '1px dashed #cbd5e1' : '1px solid #ddd6fe',
                              }}
                            >
                              {day.day}
                              {day.workout && day.workout !== day.day ? ` – ${day.workout}` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* STEP 3: Plan Builder (Day-by-Day Editor) */}
          {showForm && (
            <section
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '2px solid #7c3aed',
                padding: '24px 28px',
                boxShadow: '0 8px 24px rgba(124, 58, 237, 0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  borderBottom: '1.5px solid #f1f5f9',
                  paddingBottom: '1rem',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: '#7c3aed',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 800,
                    }}
                  >
                    3
                  </span>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {editPlan ? `تعديل جدول التمارين: ${editPlan.title}` : `بناء جدول تمارين جديد للعميل ${selectedClient.name}`}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
                      حدد مدة الخطة، قسّم الأيام التدريبية، واختر التمارين ومقدار المجموعات والعدات والأوزان
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowNewPlanForm(false)
                    setEditingPlanId(null)
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ fontWeight: 700, fontSize: '13px' }}
                >
                  إلغاء وإغلاق
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
        </div>
      )}
    </main>
  )
}
