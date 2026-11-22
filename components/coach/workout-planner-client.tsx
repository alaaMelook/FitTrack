'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  BookOpen,
  Dumbbell,
  Moon,
  Users,
  X,
} from 'lucide-react'
import WorkoutPlanForm from '@/components/coach/workout-plan-form'
import { saveWorkoutPlanAction, deleteWorkoutPlanAction } from '@/app/coach/workout-planner/actions'

type Client = { id: string; name: string; email: string }

type Props = {
  editId: string | null
  flashError: string | null
  flashSaved: string | null
  flashDeleted: string | null
  clientList: Client[]
  workoutPlans: any[]
  exerciseLibrary: any[]
}

const DURATION_LABELS: Record<string, string> = {
  '1_week': '1 Week Split',
  '2_weeks': '2 Weeks Cycle',
  '1_month': '1 Month (4 Weeks)',
  '2_months': '2 Months (8 Weeks)',
  '3_months': '3 Months (12 Weeks)',
  'ongoing': 'Custom / Ongoing',
}

export default function WorkoutPlannerClient({
  editId,
  flashError,
  flashSaved,
  flashDeleted,
  clientList,
  workoutPlans,
  exerciseLibrary,
}: Props) {
  const [showNewPlanForm, setShowNewPlanForm] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(editId)

  // Unique plans by id (a plan may appear once per client, group by title+schedule)
  // We show all plans — each plan card shows which clients it's assigned to
  const uniquePlanIds = Array.from(new Set(workoutPlans.map((p: any) => p.id)))

  const showForm = showNewPlanForm || Boolean(editingPlanId)
  const editPlan = editingPlanId ? workoutPlans.find((p: any) => p.id === editingPlanId) : null

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

      {/* ── Page Header ── */}
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
              flexShrink: 0,
            }}
          >
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Workout Planner / بانى جدول التمرين
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0', fontWeight: 500 }}>
              ابنِ جدول التمرين أولاً، ثم اختر العملاء الذين سيتبعونه
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            href="/coach/exercise-library"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              color: '#6d28d9',
              background: '#f5f3ff',
              border: '1.5px solid #ddd6fe',
              padding: '8px 16px',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            <BookOpen size={16} />
            Exercise Library ({exerciseLibrary.length})
          </Link>

          {!showForm && (
            <button
              type="button"
              onClick={() => {
                setShowNewPlanForm(true)
                setEditingPlanId(null)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
              }}
            >
              <Plus size={18} /> Create Workout Plan / خطة تمرين جديدة
            </button>
          )}
        </div>
      </div>

      {/* ── Flash Messages ── */}
      {flashError && (
        <div
          style={{
            padding: '12px 18px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: 10,
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: 14,
            border: '1px solid #f87171',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          ⚠️ {flashError === 'missing-fields' ? 'Please fill in all required fields (Title + at least one client).' : flashError}
        </div>
      )}
      {flashSaved && (
        <div
          style={{
            padding: '12px 18px',
            background: '#dcfce7',
            color: '#166534',
            borderRadius: 10,
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: 14,
            border: '1px solid #86efac',
          }}
        >
          ✓ تم حفظ وتعيين خطة التمرين بنجاح!
        </div>
      )}
      {flashDeleted && (
        <div
          style={{
            padding: '12px 18px',
            background: '#fef3c7',
            color: '#92400e',
            borderRadius: 10,
            marginBottom: '1.5rem',
            fontWeight: 600,
            fontSize: 14,
            border: '1px solid #fcd34d',
          }}
        >
          تم حذف خطة التمرين.
        </div>
      )}

      {/* ── PLAN BUILDER (Create / Edit) ── */}
      {showForm && (
        <section
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '2px solid #7c3aed',
            padding: '24px 28px',
            boxShadow: '0 8px 28px rgba(124, 58, 237, 0.09)',
            marginBottom: '2rem',
          }}
        >
          {/* Form Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {editPlan ? <Edit3 size={18} /> : <Plus size={18} />}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editPlan ? `Edit Plan: ${editPlan.title}` : 'Create New Workout Plan / إنشاء خطة تمرين'}
                </h2>
                <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>
                  {editPlan
                    ? 'عدّل تفاصيل الخطة ثم احفظ التغييرات'
                    : 'ابنِ الخطة أولاً، ثم اختر العملاء الذين سيتبعونها من الأسفل'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowNewPlanForm(false)
                setEditingPlanId(null)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                color: '#475569',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <X size={15} /> إغلاق / Cancel
            </button>
          </div>

          <WorkoutPlanForm
            key={editPlan?.id ?? 'new-plan'}
            clients={clientList}
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

      {/* ── EXISTING PLANS LIST ── */}
      <section
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1.5px solid #e2e8f0',
          padding: '20px 24px',
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Dumbbell size={20} style={{ color: '#7c3aed' }} />
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Workout Plans / خطط التمرين المحفوظة
              </h2>
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                {uniquePlanIds.length} plan{uniquePlanIds.length !== 1 ? 's' : ''} created
              </p>
            </div>
          </div>

          {!showForm && (
            <button
              type="button"
              onClick={() => {
                setShowNewPlanForm(true)
                setEditingPlanId(null)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> New Plan
            </button>
          )}
        </div>

        {workoutPlans.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: '#f8fafc',
              borderRadius: 12,
              border: '1px dashed #cbd5e1',
            }}
          >
            <Dumbbell size={40} style={{ color: '#94a3b8', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ color: '#475569', fontSize: 15, fontWeight: 700, margin: '0 0 6px' }}>
              لا توجد خطط تمرين حتى الآن
            </p>
            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 18px' }}>
              ابدأ بإنشاء خطة تمرين جديدة وعيّن العملاء لها
            </p>
            <button
              type="button"
              onClick={() => setShowNewPlanForm(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 22px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> Create First Workout Plan
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {workoutPlans.map((plan: any) => {
              const schedule: any[] = Array.isArray(plan.schedule) ? plan.schedule : []
              const workoutDays = schedule.filter((d: any) => !d.restDay)
              const restCount = schedule.filter((d: any) => d.restDay).length
              const isEditing = editingPlanId === plan.id
              const durationKey = schedule[0]?.planDuration || '1_month'
              const durationLabel = DURATION_LABELS[durationKey] || '1 Month'

              // Find the client name for this plan
              const assignedClient = clientList.find((c) => c.id === plan.client_id)
              const clientName = assignedClient?.name
                || plan.clients?.users?.full_name
                || 'Client'

              return (
                <div
                  key={plan.id}
                  style={{
                    borderRadius: 14,
                    border: isEditing ? '2px solid #7c3aed' : '1.5px solid #e2e8f0',
                    background: isEditing ? '#faf5ff' : '#ffffff',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isEditing ? '0 4px 20px rgba(124,58,237,0.1)' : 'none',
                  }}
                >
                  {/* Plan Header */}
                  <div
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
                          {plan.title || 'Workout Plan'}
                        </strong>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: 'rgba(124, 58, 237, 0.1)',
                            color: '#6d28d9',
                            border: '1px solid rgba(124, 58, 237, 0.2)',
                          }}
                        >
                          {durationLabel}
                        </span>
                        {isEditing && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 5,
                              background: '#fef3c7',
                              color: '#b45309',
                            }}
                          >
                            ✏️ جارى التعديل
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          gap: 14,
                          alignItems: 'center',
                          fontSize: 12,
                          color: '#64748b',
                          marginTop: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} />
                          Updated {new Date(plan.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#334155', fontWeight: 600 }}>
                          <Dumbbell size={12} /> {workoutDays.length} Training Days
                        </span>
                        {restCount > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Moon size={11} /> {restCount} Rest Days
                          </span>
                        )}
                        {/* Assigned client badge */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            color: '#15803d',
                            fontWeight: 700,
                          }}
                        >
                          <Users size={11} /> {clientName}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
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
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '7px 14px',
                          borderRadius: 8,
                          border: `1.5px solid ${isEditing ? '#fca5a5' : 'rgba(79, 70, 229, 0.25)'}`,
                          background: isEditing ? '#fee2e2' : 'rgba(79, 70, 229, 0.06)',
                          color: isEditing ? '#dc2626' : '#4f46e5',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
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
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '7px 14px',
                            borderRadius: 8,
                            border: '1.5px solid #fca5a5',
                            background: '#ffffff',
                            color: '#dc2626',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} /> حذف
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Workout Days Preview */}
                  {!isEditing && workoutDays.length > 0 && (
                    <div
                      style={{
                        padding: '10px 20px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        gap: 7,
                        flexWrap: 'wrap',
                        background: '#f8fafc',
                      }}
                    >
                      {workoutDays.map((day: any, i: number) => (
                        <span
                          key={i}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 7,
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#ede9fe',
                            color: '#6d28d9',
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
    </main>
  )
}
