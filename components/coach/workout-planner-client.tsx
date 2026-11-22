'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays, User, Plus, Edit3, Trash2, Calendar,
  BookOpen, Dumbbell, Layers, Moon
} from 'lucide-react'
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
  '1_week': 'أسبوع واحد',
  '2_weeks': 'أسبوعين',
  '1_month': 'شهر (4 أسابيع)',
  '2_months': 'شهرين (8 أسابيع)',
  '3_months': '3 أشهر (12 أسبوع)',
  'ongoing': 'مستمر / مخصص',
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
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 14px rgba(124,58,237,.28)',
          }}>
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Client Workout Planner
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0', fontWeight: 500 }}>
              مخطط الجداول التدريبية الأسبوعية والشهرية للعملاء
            </p>
          </div>
        </div>

        <Link
          href="/coach/exercise-library"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 13, fontWeight: 700, color: '#4f46e5',
            background: 'rgba(79,70,229,.08)', border: '1.5px solid rgba(79,70,229,.2)',
            padding: '8px 16px', borderRadius: 10, textDecoration: 'none',
          }}
        >
          <BookOpen size={16} />
          مكتبة التمارين ({exerciseLibrary.length})
        </Link>
      </div>

      {/* ── Flash Messages ── */}
      {flashError && (
        <div style={{
          padding: '12px 18px', background: '#fee2e2', color: '#991b1b',
          borderRadius: 10, marginBottom: '1.5rem', fontWeight: 600, fontSize: 14,
          border: '1px solid #f87171', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ⚠️ {flashError === 'missing-fields' ? 'يرجى ملء جميع الحقول المطلوبة.' : flashError}
        </div>
      )}
      {flashSaved && (
        <div style={{
          padding: '12px 18px', background: '#dcfce7', color: '#166534',
          borderRadius: 10, marginBottom: '1.5rem', fontWeight: 600, fontSize: 14,
          border: '1px solid #86efac',
        }}>
          ✓ تم حفظ خطة التمارين بنجاح.
        </div>
      )}
      {flashDeleted && (
        <div style={{
          padding: '12px 18px', background: '#fef3c7', color: '#92400e',
          borderRadius: 10, marginBottom: '1.5rem', fontWeight: 600, fontSize: 14,
          border: '1px solid #fcd34d',
        }}>
          🗑️ تم حذف الخطة التدريبية.
        </div>
      )}

      {/* ── STEP 1: Select Client ── */}
      <section style={{
        background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0',
        padding: '20px 24px', marginBottom: '1.75rem',
        boxShadow: '0 1px 6px rgba(0,0,0,.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%', background: '#7c3aed',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>1</span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>اختر العميل</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{clientList.length} عميل مشترك معك</p>
            </div>
          </div>
        </div>

        {clientList.length === 0 ? (
          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1', textAlign: 'center' }}>
            <User size={28} style={{ color: '#94a3b8', marginBottom: 8 }} />
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>لا يوجد عملاء مخصصين لك. يجب على الأدمن تعيين عملاء أولاً.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10 }}>
            {clientList.map((client) => {
              const isActive = client.id === selectedClientId
              const planCount = workoutPlans.filter((p: any) => p.client_id === client.id).length
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => { setSelectedClientId(client.id); setShowNewPlanForm(false); setEditingPlanId(null) }}
                  style={{
                    padding: '12px 16px', borderRadius: 12,
                    border: isActive ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                    background: isActive ? '#f5f3ff' : '#fff',
                    color: '#0f172a', cursor: 'pointer', textAlign: 'left',
                    transition: 'all .15s', boxShadow: isActive ? '0 4px 12px rgba(124,58,237,.12)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#6d28d9' : '#0f172a' }}>
                      {client.name}
                    </div>
                    {client.email && (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, direction: 'ltr' }}>{client.email}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 7,
                    background: isActive ? '#7c3aed' : '#f1f5f9',
                    color: isActive ? '#fff' : '#475569',
                    flexShrink: 0,
                  }}>
                    {planCount} خطة
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* ── STEP 2 & 3: Client Workspace ── */}
      {selectedClient && (
        <div>

          {/* STEP 2: Plans List */}
          <section style={{
            background: '#fff', borderRadius: 16, border: '1.5px solid #e2e8f0',
            padding: '20px 24px', marginBottom: '1.75rem',
            boxShadow: '0 1px 6px rgba(0,0,0,.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#7c3aed',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>2</span>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    خطط <span style={{ color: '#7c3aed' }}>{selectedClient.name}</span>
                  </h2>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                    {clientPlans.length} خطة تدريبية مخصصة
                  </p>
                </div>
              </div>

              {!showForm && (
                <button
                  type="button"
                  onClick={() => { setShowNewPlanForm(true); setEditingPlanId(null) }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(124,58,237,.25)',
                  }}
                >
                  <Plus size={15} /> خطة تمارين جديدة
                </button>
              )}
            </div>

            {clientPlans.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '2.5rem 1rem',
                background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1',
              }}>
                <Dumbbell size={34} style={{ color: '#94a3b8', margin: '0 auto 10px', display: 'block' }} />
                <p style={{ color: '#475569', fontSize: 14, fontWeight: 600, margin: '0 0 14px' }}>
                  لا توجد خطط بعد لـ {selectedClient.name}
                </p>
                <button
                  type="button"
                  onClick={() => setShowNewPlanForm(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 18px', borderRadius: 9, border: 'none',
                    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                    color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> ابدأ بإنشاء أول خطة
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {clientPlans.map((plan: any) => {
                  const schedule: any[] = Array.isArray(plan.schedule) ? plan.schedule : []
                  const workoutDays = schedule.filter((d: any) => !d.restDay)
                  const restCount = schedule.filter((d: any) => d.restDay).length
                  const isEditing = editingPlanId === plan.id
                  const durationKey = schedule[0]?.planDuration || '1_month'
                  const durationLabel = DURATION_LABELS[durationKey] || 'شهر'

                  return (
                    <div
                      key={plan.id}
                      style={{
                        borderRadius: 14,
                        border: isEditing ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                        background: isEditing ? '#faf5ff' : '#fafafa',
                        overflow: 'hidden',
                        transition: 'all .2s',
                      }}
                    >
                      {/* Plan Header */}
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                              {plan.title}
                            </strong>
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                              background: 'rgba(124,58,237,.1)', color: '#6d28d9',
                            }}>
                              {durationLabel}
                            </span>
                            {isEditing && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 5,
                                background: '#fef3c7', color: '#b45309',
                              }}>
                                ✏️ جاري التعديل
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 12, color: '#94a3b8', marginTop: 6, flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} />
                              {new Date(plan.updated_at).toLocaleDateString('ar-EG')}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#475569', fontWeight: 600 }}>
                              <Dumbbell size={12} /> {workoutDays.length} يوم تمرين
                            </span>
                            {restCount > 0 && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#94a3b8' }}>
                                <Moon size={11} /> {restCount} راحة
                              </span>
                            )}
                            {plan.notes && (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                {plan.notes.length > 50 ? plan.notes.slice(0, 50) + '…' : plan.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditing) { setEditingPlanId(null); setShowNewPlanForm(false) }
                              else { setEditingPlanId(plan.id); setShowNewPlanForm(false) }
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '7px 14px', borderRadius: 8,
                              border: `1.5px solid ${isEditing ? '#fca5a5' : 'rgba(79,70,229,.25)'}`,
                              background: isEditing ? '#fee2e2' : 'rgba(79,70,229,.06)',
                              color: isEditing ? '#dc2626' : '#4f46e5',
                              fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            }}
                          >
                            <Edit3 size={13} />
                            {isEditing ? 'إلغاء' : 'تعديل'}
                          </button>

                          <form action={deleteWorkoutPlanAction}>
                            <input type="hidden" name="id" value={plan.id} />
                            <input type="hidden" name="clientId" value={plan.client_id} />
                            <button
                              type="submit"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '7px 14px', borderRadius: 8,
                                border: '1.5px solid #fca5a5',
                                background: '#fff',
                                color: '#dc2626',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} /> حذف
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Workout Days Preview — Rest days HIDDEN */}
                      {!isEditing && workoutDays.length > 0 && (
                        <div style={{
                          padding: '12px 20px', borderTop: '1px solid #f1f5f9',
                          display: 'flex', gap: 7, flexWrap: 'wrap', background: '#fff',
                        }}>
                          {workoutDays.map((day: any, i: number) => (
                            <span
                              key={i}
                              style={{
                                padding: '5px 13px', borderRadius: 8,
                                fontSize: 12, fontWeight: 700,
                                background: '#ede9fe', color: '#6d28d9',
                                border: '1px solid #ddd6fe',
                              }}
                            >
                              {day.day}{day.workout && day.workout !== day.day ? ` – ${day.workout}` : ''}
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

          {/* STEP 3: Plan Builder */}
          {showForm && (
            <section style={{
              background: '#fff', borderRadius: 16,
              border: '2px solid #7c3aed',
              padding: '24px 28px',
              boxShadow: '0 8px 28px rgba(124,58,237,.09)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1.5rem', borderBottom: '1.5px solid #f1f5f9',
                paddingBottom: '1rem', flexWrap: 'wrap', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: '50%', background: '#7c3aed',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, flexShrink: 0,
                  }}>3</span>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {editPlan
                        ? `تعديل: ${editPlan.title}`
                        : `خطة جديدة — ${selectedClient.name}`}
                    </h2>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                      حدد مدة الخطة، قسّم الأيام، واختر التمارين مع العدات والأوزان
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setShowNewPlanForm(false); setEditingPlanId(null) }}
                  style={{
                    padding: '7px 16px', borderRadius: 8,
                    border: '1.5px solid #e2e8f0', background: '#f8fafc',
                    color: '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
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
