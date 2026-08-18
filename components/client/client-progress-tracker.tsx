'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Award,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Dumbbell
} from 'lucide-react'

export type Measurement = {
  id: string
  client_id: string
  recorded_by_user_id: string
  measured_at: string
  weight_kg: number | null
  body_fat_pct: number | null
  muscle_mass_kg: number | null
  chest_cm: number | null
  arm_cm: number | null
  hips_cm: number | null
  waist_cm: number | null
  thigh_cm: number | null
  notes: string | null
  created_at?: string
}

interface Props {
  measurements: Measurement[]
}

// Helper to format deltas with color and direction
function renderDeltaBadge(
  delta: number | null,
  unit: string,
  invertGoodBad = false // true for body fat / weight where decrease is typically positive
) {
  if (delta === null || Math.abs(delta) < 0.01) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          background: 'var(--cream-300)',
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <Minus size={10} /> 0 {unit}
      </span>
    )
  }

  const isPositive = delta > 0
  // For muscle mass / strength: positive is green, negative is red
  // For body fat / waist: negative is green (loss is good), positive is amber/red
  const isGood = invertGoodBad ? !isPositive : isPositive

  const color = isGood ? '#15803d' : '#b91c1c'
  const bg = isGood ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)'
  const border = isGood ? '1px solid rgba(22, 163, 74, 0.2)' : '1px solid rgba(220, 38, 38, 0.2)'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        fontSize: '11px',
        fontWeight: 700,
        color: color,
        background: bg,
        border: border,
        padding: '2px 6px',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {isPositive ? `+${delta.toFixed(1)}` : delta.toFixed(1)} {unit}
    </span>
  )
}

export function ClientProgressTracker({ measurements }: Props) {
  const [activeTab, setActiveTab] = useState<'evolution' | 'comparison' | 'body-parts'>('evolution')

  if (!measurements || measurements.length === 0) {
    return (
      <div className="card empty-state" style={{ padding: 'var(--space-10)' }}>
        <div className="empty-icon">
          <TrendingUp size={28} />
        </div>
        <p style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>No measurement history recorded yet</p>
        <p className="text-secondary text-sm">
          Click &quot;Log Measurement&quot; to register your initial weight and body metrics.
        </p>
      </div>
    )
  }

  // Chronological order: oldest first for overall progress calculations
  const sortedOldest = [...measurements].sort(
    (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  )
  // Reverse: latest first for table display
  const sortedLatest = [...measurements].sort(
    (a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
  )

  const firstM = sortedOldest[0]
  const latestM = sortedLatest[0]
  const hasMultiple = sortedOldest.length > 1

  // Overall Transformations (Latest vs First)
  const totalWeightDelta =
    latestM.weight_kg != null && firstM.weight_kg != null ? latestM.weight_kg - firstM.weight_kg : null
  const totalBodyFatDelta =
    latestM.body_fat_pct != null && firstM.body_fat_pct != null ? latestM.body_fat_pct - firstM.body_fat_pct : null
  const totalMuscleDelta =
    latestM.muscle_mass_kg != null && firstM.muscle_mass_kg != null
      ? latestM.muscle_mass_kg - firstM.muscle_mass_kg
      : null

  // Body circumferences deltas (Latest vs First)
  const chestDelta = latestM.chest_cm != null && firstM.chest_cm != null ? latestM.chest_cm - firstM.chest_cm : null
  const armDelta = latestM.arm_cm != null && firstM.arm_cm != null ? latestM.arm_cm - firstM.arm_cm : null
  const waistDelta = latestM.waist_cm != null && firstM.waist_cm != null ? latestM.waist_cm - firstM.waist_cm : null
  const hipsDelta = latestM.hips_cm != null && firstM.hips_cm != null ? latestM.hips_cm - firstM.hips_cm : null
  const thighDelta = latestM.thigh_cm != null && firstM.thigh_cm != null ? latestM.thigh_cm - firstM.thigh_cm : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* ─── 1. OVERALL TRANSFORMATION SUMMARY CARDS ─────────────────────── */}
      <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
        {/* Weight Evolution */}
        <div
          className="stat-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(140,86,212,0.04), rgba(140,86,212,0.01))',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            className="stat-icon"
            style={{ background: 'rgba(140,86,212,0.12)', color: 'var(--brand-600)' }}
          >
            <Flame size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
              <span className="stat-label" style={{ fontWeight: 700 }}>Weight Evolution</span>
              {hasMultiple && totalWeightDelta != null && renderDeltaBadge(totalWeightDelta, 'kg', true)}
            </div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
              {latestM.weight_kg != null ? `${latestM.weight_kg} kg` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
              {hasMultiple && firstM.weight_kg != null
                ? `Started at ${firstM.weight_kg} kg on ${new Date(firstM.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'Current logged body weight'}
            </div>
          </div>
        </div>

        {/* Body Fat Evolution */}
        <div
          className="stat-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(234,179,8,0.04), rgba(234,179,8,0.01))',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            className="stat-icon"
            style={{ background: 'rgba(234,179,8,0.12)', color: '#ca8a04' }}
          >
            <Sparkles size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
              <span className="stat-label" style={{ fontWeight: 700 }}>Body Fat %</span>
              {hasMultiple && totalBodyFatDelta != null && renderDeltaBadge(totalBodyFatDelta, '%', true)}
            </div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
              {latestM.body_fat_pct != null ? `${latestM.body_fat_pct}%` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
              {hasMultiple && firstM.body_fat_pct != null
                ? `Started at ${firstM.body_fat_pct}% on ${new Date(firstM.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'Latest body fat assessment'}
            </div>
          </div>
        </div>

        {/* Muscle Mass Evolution */}
        <div
          className="stat-card"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(22,163,74,0.04), rgba(22,163,74,0.01))',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            className="stat-icon"
            style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a' }}
          >
            <Dumbbell size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
              <span className="stat-label" style={{ fontWeight: 700 }}>Muscle Mass</span>
              {hasMultiple && totalMuscleDelta != null && renderDeltaBadge(totalMuscleDelta, 'kg', false)}
            </div>
            <div className="stat-value" style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
              {latestM.muscle_mass_kg != null ? `${latestM.muscle_mass_kg} kg` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 4 }}>
              {hasMultiple && firstM.muscle_mass_kg != null
                ? `Started at ${firstM.muscle_mass_kg} kg on ${new Date(firstM.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : 'Latest skeletal muscle mass'}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. DETAILED EVOLUTION & MEASUREMENT COMPARISONS ───────────────── */}
      <div className="card">
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: 'var(--space-3)',
            marginBottom: 'var(--space-5)',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={20} style={{ color: 'var(--brand-600)' }} />
              Progress Evolution & Assessments
            </h2>
            <p className="text-secondary text-xs" style={{ marginTop: 2 }}>
              {measurements.length} total assessment{measurements.length !== 1 ? 's' : ''} logged • Tracking step-by-step physical changes.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6, background: 'var(--cream-300)', padding: 4, borderRadius: 'var(--radius-md)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('evolution')}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: 'var(--text-xs)',
                padding: '5px 12px',
                background: activeTab === 'evolution' ? '#fff' : 'transparent',
                boxShadow: activeTab === 'evolution' ? 'var(--shadow-sm)' : 'none',
                fontWeight: activeTab === 'evolution' ? 700 : 500,
                color: activeTab === 'evolution' ? 'var(--brand-700)' : 'var(--text-secondary)',
              }}
            >
              <Calendar size={13} /> Step-by-Step Delta
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('body-parts')}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: 'var(--text-xs)',
                padding: '5px 12px',
                background: activeTab === 'body-parts' ? '#fff' : 'transparent',
                boxShadow: activeTab === 'body-parts' ? 'var(--shadow-sm)' : 'none',
                fontWeight: activeTab === 'body-parts' ? 700 : 500,
                color: activeTab === 'body-parts' ? 'var(--brand-700)' : 'var(--text-secondary)',
              }}
            >
              <Layers size={13} /> Body Circumferences
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: 'var(--text-xs)',
                padding: '5px 12px',
                background: activeTab === 'comparison' ? '#fff' : 'transparent',
                boxShadow: activeTab === 'comparison' ? 'var(--shadow-sm)' : 'none',
                fontWeight: activeTab === 'comparison' ? 700 : 500,
                color: activeTab === 'comparison' ? 'var(--brand-700)' : 'var(--text-secondary)',
              }}
            >
              <Award size={13} /> Starting vs Current
            </button>
          </div>
        </div>

        {/* TAB 1: STEP-BY-STEP EVOLUTION WITH DELTAS */}
        {activeTab === 'evolution' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight (kg)</th>
                  <th>Weight Delta</th>
                  <th>Body Fat %</th>
                  <th>Fat Delta</th>
                  <th>Muscle Mass (kg)</th>
                  <th>Muscle Delta</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sortedLatest.map((m, idx) => {
                  // The next item in sortedLatest is the chronologically previous assessment
                  const prev = sortedLatest[idx + 1]

                  const wDelta =
                    m.weight_kg != null && prev?.weight_kg != null ? m.weight_kg - prev.weight_kg : null
                  const bfDelta =
                    m.body_fat_pct != null && prev?.body_fat_pct != null ? m.body_fat_pct - prev.body_fat_pct : null
                  const mDelta =
                    m.muscle_mass_kg != null && prev?.muscle_mass_kg != null
                      ? m.muscle_mass_kg - prev.muscle_mass_kg
                      : null

                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 700, fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                        {new Date(m.measured_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {idx === 0 && (
                          <span
                            className="badge badge-brand"
                            style={{ marginLeft: 8, fontSize: '10px', padding: '2px 6px' }}
                          >
                            Latest
                          </span>
                        )}
                        {idx === sortedLatest.length - 1 && sortedLatest.length > 1 && (
                          <span
                            className="badge"
                            style={{
                              marginLeft: 8,
                              fontSize: '10px',
                              padding: '2px 6px',
                              background: 'var(--cream-300)',
                              color: 'var(--text-muted)',
                            }}
                          >
                            Baseline
                          </span>
                        )}
                      </td>

                      {/* Weight & Delta */}
                      <td style={{ fontWeight: 700, color: 'var(--brand-700)' }}>
                        {m.weight_kg != null ? `${m.weight_kg} kg` : '—'}
                      </td>
                      <td>
                        {prev ? (
                          renderDeltaBadge(wDelta, 'kg', true)
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Initial baseline</span>
                        )}
                      </td>

                      {/* Body Fat & Delta */}
                      <td style={{ fontWeight: 600 }}>{m.body_fat_pct != null ? `${m.body_fat_pct}%` : '—'}</td>
                      <td>
                        {prev ? (
                          renderDeltaBadge(bfDelta, '%', true)
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Initial baseline</span>
                        )}
                      </td>

                      {/* Muscle Mass & Delta */}
                      <td style={{ fontWeight: 600 }}>{m.muscle_mass_kg != null ? `${m.muscle_mass_kg} kg` : '—'}</td>
                      <td>
                        {prev ? (
                          renderDeltaBadge(mDelta, 'kg', false)
                        ) : (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Initial baseline</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 200 }} className="truncate" title={m.notes ?? ''}>
                        {m.notes || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: BODY CIRCUMFERENCES & DIMENSIONS */}
        {activeTab === 'body-parts' && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Chest</th>
                  <th>Arm</th>
                  <th>Glutes (Hips)</th>
                  <th>Abs (Waist)</th>
                  <th>Leg (Thigh)</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sortedLatest.map((m, idx) => {
                  const prev = sortedLatest[idx + 1]

                  const cDelta = m.chest_cm != null && prev?.chest_cm != null ? m.chest_cm - prev.chest_cm : null
                  const aDelta = m.arm_cm != null && prev?.arm_cm != null ? m.arm_cm - prev.arm_cm : null
                  const hDelta = m.hips_cm != null && prev?.hips_cm != null ? m.hips_cm - prev.hips_cm : null
                  const wDelta = m.waist_cm != null && prev?.waist_cm != null ? m.waist_cm - prev.waist_cm : null
                  const tDelta = m.thigh_cm != null && prev?.thigh_cm != null ? m.thigh_cm - prev.thigh_cm : null

                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 700, fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                        {new Date(m.measured_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Chest */}
                      <td>
                        <div>{m.chest_cm != null ? `${m.chest_cm} cm` : '—'}</div>
                        {prev && cDelta != null && Math.abs(cDelta) >= 0.1 && (
                          <div style={{ marginTop: 2 }}>{renderDeltaBadge(cDelta, 'cm')}</div>
                        )}
                      </td>

                      {/* Arm */}
                      <td>
                        <div>{m.arm_cm != null ? `${m.arm_cm} cm` : '—'}</div>
                        {prev && aDelta != null && Math.abs(aDelta) >= 0.1 && (
                          <div style={{ marginTop: 2 }}>{renderDeltaBadge(aDelta, 'cm')}</div>
                        )}
                      </td>

                      {/* Glutes / Hips */}
                      <td>
                        <div>{m.hips_cm != null ? `${m.hips_cm} cm` : '—'}</div>
                        {prev && hDelta != null && Math.abs(hDelta) >= 0.1 && (
                          <div style={{ marginTop: 2 }}>{renderDeltaBadge(hDelta, 'cm')}</div>
                        )}
                      </td>

                      {/* Abs / Waist */}
                      <td>
                        <div>{m.waist_cm != null ? `${m.waist_cm} cm` : '—'}</div>
                        {prev && wDelta != null && Math.abs(wDelta) >= 0.1 && (
                          <div style={{ marginTop: 2 }}>{renderDeltaBadge(wDelta, 'cm', true)}</div>
                        )}
                      </td>

                      {/* Leg / Thigh */}
                      <td>
                        <div>{m.thigh_cm != null ? `${m.thigh_cm} cm` : '—'}</div>
                        {prev && tDelta != null && Math.abs(tDelta) >= 0.1 && (
                          <div style={{ marginTop: 2 }}>{renderDeltaBadge(tDelta, 'cm')}</div>
                        )}
                      </td>

                      {/* Notes */}
                      <td style={{ color: 'var(--text-secondary)', maxWidth: 180 }} className="truncate" title={m.notes ?? ''}>
                        {m.notes || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: STARTING VS CURRENT TRANSFORMATION COMPARISON */}
        {activeTab === 'comparison' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-4)',
              }}
            >
              {/* Metric Item: Weight */}
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Total Weight Shift
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Baseline: </span>
                    <strong>{firstM.weight_kg != null ? `${firstM.weight_kg} kg` : '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Current: </span>
                    <strong style={{ color: 'var(--brand-700)' }}>{latestM.weight_kg != null ? `${latestM.weight_kg} kg` : '—'}</strong>
                  </div>
                </div>
                <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Net Progress</span>
                  {renderDeltaBadge(totalWeightDelta, 'kg', true)}
                </div>
              </div>

              {/* Metric Item: Body Fat */}
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Body Fat % Change
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Baseline: </span>
                    <strong>{firstM.body_fat_pct != null ? `${firstM.body_fat_pct}%` : '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Current: </span>
                    <strong style={{ color: '#ca8a04' }}>{latestM.body_fat_pct != null ? `${latestM.body_fat_pct}%` : '—'}</strong>
                  </div>
                </div>
                <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Net Progress</span>
                  {renderDeltaBadge(totalBodyFatDelta, '%', true)}
                </div>
              </div>

              {/* Metric Item: Muscle Mass */}
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Muscle Mass Growth
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Baseline: </span>
                    <strong>{firstM.muscle_mass_kg != null ? `${firstM.muscle_mass_kg} kg` : '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Current: </span>
                    <strong style={{ color: '#16a34a' }}>{latestM.muscle_mass_kg != null ? `${latestM.muscle_mass_kg} kg` : '—'}</strong>
                  </div>
                </div>
                <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Net Progress</span>
                  {renderDeltaBadge(totalMuscleDelta, 'kg', false)}
                </div>
              </div>

              {/* Metric Item: Waist / Abs */}
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}
              >
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Waist Circumference
                </div>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Baseline: </span>
                    <strong>{firstM.waist_cm != null ? `${firstM.waist_cm} cm` : '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Current: </span>
                    <strong>{latestM.waist_cm != null ? `${latestM.waist_cm} cm` : '—'}</strong>
                  </div>
                </div>
                <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Net Progress</span>
                  {renderDeltaBadge(waistDelta, 'cm', true)}
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--cream-300)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Baseline Date: <strong>{new Date(firstM.measured_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Latest Assessment: <strong>{new Date(latestM.measured_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
