'use client'

import { useRef, useState, useTransition } from 'react'
import { saveProgramAction } from '@/app/coach/programs/actions'
import { Salad, Plus, Trash2, Copy, AlertTriangle, Calendar, Clock, Sparkles, Users } from 'lucide-react'

export type FoodItem = {
  name: string
  portion: string // e.g. "5 معالق", "100g", "2 بيضة", "نصف رغيف"
  calories: number | ''
  protein: number | ''
  carbs: number | ''
  fats: number | ''
}

export type Meal = {
  meal: string
  notes: string
  foods: FoodItem[]
}

function emptyFood(): FoodItem {
  return { name: '', portion: '', calories: '', protein: '', carbs: '', fats: '' }
}

function emptyMeal(): Meal {
  return { meal: '', notes: '', foods: [emptyFood()] }
}

type Client = { id: string; name: string; email?: string }

type Props = {
  clients: Client[]
  existingPlans?: any[]
  initialData?: {
    id: string
    clientId: string
    title: string
    notes: string
    meals: any[]
  } | null
}

const DURATION_OPTIONS = [
  { id: 'daily', label: 'Daily Routine' },
  { id: '1_week', label: '1 Week' },
  { id: '2_weeks', label: '2 Weeks' },
  { id: '1_month', label: '1 Month (4 Weeks)' },
  { id: '2_months', label: '2 Months (8 Weeks)' },
  { id: 'ongoing', label: 'Custom / Ongoing' },
]

export default function NutritionPlanForm({ clients, existingPlans = [], initialData }: Props) {
  // Extract initial meals & helper data
  const [meals, setMeals] = useState<Meal[]>(() => {
    if (initialData?.meals && Array.isArray(initialData.meals) && initialData.meals.length > 0) {
      return initialData.meals.map((m: any) => ({
        meal: m.meal || '',
        notes: m.notes || '',
        foods: Array.isArray(m.foods)
          ? m.foods.map((f: any) => ({
              name: f.name || '',
              portion: f.portion || (f.quantity ? `${f.quantity} ${f.unit || ''}`.trim() : ''),
              calories: f.calories ?? '',
              protein: f.protein ?? '',
              carbs: f.carbs ?? '',
              fats: f.fats ?? '',
            }))
          : [emptyFood()],
      }))
    }
    return [emptyMeal()]
  })

  // Target Client(s) selection (support assigning to one or multiple clients)
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(() => {
    if (initialData?.clientId) return [initialData.clientId]
    if (clients.length === 1) return [clients[0].id]
    return []
  })
  const [clientSearch, setClientSearch] = useState('')

  // Plan Duration / Timeframe
  const [duration, setDuration] = useState<string>(() => {
    const firstMeal: any = initialData?.meals?.[0]
    return firstMeal?.planDuration || 'daily'
  })

  // Optional Restricted Foods (قائمة الممنوعات)
  const [restrictedFoods, setRestrictedFoods] = useState<string>(() => {
    const firstMeal: any = initialData?.meals?.[0]
    return firstMeal?.restrictedFoods || ''
  })

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  // Meal manipulations
  function updateMeal(mealIdx: number, field: keyof Omit<Meal, 'foods'>, value: string) {
    setMeals((prev) =>
      prev.map((m, i) => (i === mealIdx ? { ...m, [field]: value } : m))
    )
  }

  function updateFood(mealIdx: number, foodIdx: number, field: keyof FoodItem, value: any) {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mealIdx
          ? {
              ...m,
              foods: m.foods.map((f, j) => (j === foodIdx ? { ...f, [field]: value } : f)),
            }
          : m
      )
    )
  }

  function addMeal() {
    setMeals((prev) => [...prev, emptyMeal()])
  }

  function removeMeal(idx: number) {
    if (meals.length <= 1) return
    setMeals((prev) => prev.filter((_, i) => i !== idx))
  }

  function addFood(mealIdx: number) {
    setMeals((prev) =>
      prev.map((m, i) => (i === mealIdx ? { ...m, foods: [...m.foods, emptyFood()] } : m))
    )
  }

  function removeFood(mealIdx: number, foodIdx: number) {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mealIdx ? { ...m, foods: m.foods.filter((_, j) => j !== foodIdx) } : m
      )
    )
  }

  // Apply from another plan (Reuse template for another client)
  function handleApplyTemplate(planId: string) {
    if (!planId) return
    const sourcePlan = existingPlans.find((p) => p.id === planId)
    if (!sourcePlan) return

    const sourceMeals = Array.isArray(sourcePlan.meals) ? sourcePlan.meals : []
    if (sourceMeals.length > 0) {
      setMeals(
        sourceMeals.map((m: any) => ({
          meal: m.meal || '',
          notes: m.notes || '',
          foods: Array.isArray(m.foods)
            ? m.foods.map((f: any) => ({
                name: f.name || '',
                portion: f.portion || (f.quantity ? `${f.quantity} ${f.unit || ''}`.trim() : ''),
                calories: f.calories ?? '',
                protein: f.protein ?? '',
                carbs: f.carbs ?? '',
                fats: f.fats ?? '',
              }))
            : [emptyFood()],
        }))
      )
      const firstM: any = sourceMeals[0]
      if (firstM?.planDuration) setDuration(firstM.planDuration)
      if (firstM?.restrictedFoods) setRestrictedFoods(firstM.restrictedFoods)
    }

    // Set title and notes in form
    if (formRef.current) {
      const titleInput = formRef.current.elements.namedItem('title') as HTMLInputElement | null
      const notesInput = formRef.current.elements.namedItem('notes') as HTMLTextAreaElement | null
      if (titleInput) titleInput.value = `${sourcePlan.title} (Applied)`
      if (notesInput && sourcePlan.notes) notesInput.value = sourcePlan.notes
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (selectedClientIds.length === 0) {
      setError('Please select at least one client to assign this plan to (يرجى اختيار عميل واحد على الأقل).')
      return
    }

    for (const m of meals) {
      if (!m.meal.trim()) {
        setError('Every meal must have a name (e.g. Breakfast, Pre-Workout, Lunch).')
        return
      }
    }

    const fd = new FormData(e.currentTarget)

    // Append all selected clients
    fd.delete('clientIds')
    for (const cid of selectedClientIds) {
      fd.append('clientIds', cid)
    }
    fd.set('clientId', selectedClientIds[0] || '')

    // Tag meals with duration and restrictedFoods so it persists cleanly in JSONB
    const mealsWithMeta = meals.map((m, idx) => ({
      ...m,
      foods: m.foods.map((f) => ({
        ...f,
        quantity: f.portion, // Keep backwards compatibility with string quantity
        unit: '',
      })),
      planDuration: duration,
      restrictedFoods: idx === 0 ? restrictedFoods.trim() : undefined,
    }))

    fd.set('items', JSON.stringify(mealsWithMeta))
    fd.set('kind', 'nutrition')

    startTransition(async () => {
      try {
        await saveProgramAction(fd)
      } catch (err: any) {
        if (err?.message === 'NEXT_REDIRECT' || err?.digest?.includes('NEXT_REDIRECT')) {
          return
        }
        setError(err?.message ?? 'Failed to save nutrition plan.')
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-5)' }}>
      {initialData && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="kind" value="nutrition" />

      {error && (
        <div className="badge badge-error" style={{ display: 'block', padding: '0.75rem 1rem' }}>
          {error}
        </div>
      )}

      {/* ── Reuse / Template Apply Section ── */}
      {existingPlans.length > 0 && !initialData && (
        <div
          style={{
            background: 'rgba(140, 86, 212, 0.06)',
            border: '1.5px dashed var(--brand-400, #a855f7)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Copy size={18} style={{ color: 'var(--brand-600)' }} />
            <div>
              <strong style={{ fontSize: 'var(--text-sm)', color: '#0f172a' }}>
                Apply from Saved Plan / Template
              </strong>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Copy meal structures and foods from any previously created plan
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={selectedTemplateId}
              onChange={(e) => {
                setSelectedTemplateId(e.target.value)
                handleApplyTemplate(e.target.value)
              }}
              style={{
                fontSize: '13px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontWeight: 600,
                color: '#0f172a',
              }}
            >
              <option value="">-- Choose saved template to copy --</option>
              {existingPlans.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.title} ({plan.clients?.users?.full_name || 'Client'})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Plan Title */}
      <label className="form-group" style={{ marginBottom: 0 }}>
        <span style={{ fontWeight: 700, color: '#0f172a' }}>Nutrition Plan Title / اسم الخطة الغذائية *</span>
        <input
          name="title"
          required
          maxLength={120}
          placeholder="e.g. 2200 kcal High Protein Lean Bulk"
          defaultValue={initialData?.title ?? ''}
          style={{ fontWeight: 600 }}
        />
      </label>

      {/* Plan Duration / Timeframe */}
      <div>
        <label style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Clock size={16} style={{ color: 'var(--brand-600)' }} />
          <span>Plan Timeframe / Duration *</span>
          <span style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>
            (Timeframe client adheres to this meal schedule)
          </span>
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DURATION_OPTIONS.map((item) => {
            const isSelected = duration === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDuration(item.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--brand-600)' : '1px solid #cbd5e1',
                  background: isSelected ? 'var(--brand-600)' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#1e293b',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* General Notes */}
      <label className="form-group">
        <span style={{ fontWeight: 600, color: '#0f172a' }}>General Instructions & Hydration Guidelines</span>
        <textarea
          name="notes"
          rows={2}
          placeholder="e.g. Drink 3.5L water daily, drink green tea, maintain 3 hours between main meals..."
          defaultValue={initialData?.notes ?? ''}
        />
      </label>

      {/* ── Optional Restricted Foods ── */}
      <div
        style={{
          background: '#fffbeb',
          border: '1.5px solid #fde68a',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
        }}
      >
        <label style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#92400e', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <AlertTriangle size={16} style={{ color: '#d97706' }} />
          <span>Restricted Foods & Dietary Limitations (Optional)</span>
        </label>
        <p style={{ fontSize: '12px', color: '#78350f', margin: '0 0 8px 0' }}>
          Specify any forbidden foods, allergies, or restrictions for this client (e.g. No refined sugars, no dairy, gluten-free, no fried foods).
        </p>
        <textarea
          value={restrictedFoods}
          onChange={(e) => setRestrictedFoods(e.target.value)}
          rows={2}
          placeholder="e.g. No white sugar, avoid fast food and sodas, lactose intolerant..."
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #f59e0b',
            background: '#ffffff',
            fontSize: '13px',
            color: '#1e293b',
          }}
        />
      </div>

      {/* ── Meals Builder ── */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Daily Meals ({meals.length} {meals.length === 1 ? 'Meal' : 'Meals'})
            </h3>
            <span className="badge badge-brand" style={{ fontSize: '11px' }}>
              Duration: {DURATION_OPTIONS.find((d) => d.id === duration)?.label}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={addMeal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--brand-700)',
              fontWeight: 600,
              background: 'rgba(140, 86, 212, 0.08)',
            }}
          >
            <Plus size={14} /> Add Meal
          </button>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {meals.map((meal, mealIdx) => (
            <div
              key={mealIdx}
              className="card"
              style={{
                padding: 'var(--space-4)',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {/* Meal Header */}
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                <span
                  style={{
                    background: 'var(--brand-600)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  Meal {mealIdx + 1}
                </span>

                {meals.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    onClick={() => removeMeal(mealIdx)}
                  >
                    <Trash2 size={13} /> Remove Meal
                  </button>
                )}
              </div>

              {/* Meal Name + Notes */}
              <div className="grid grid-2" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <label className="form-group" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                    Meal Name *
                  </span>
                  <input
                    value={meal.meal}
                    onChange={(e) => updateMeal(mealIdx, 'meal', e.target.value)}
                    placeholder="e.g. Breakfast, Pre-Workout, Lunch, Dinner, Snack"
                    required
                    style={{ fontWeight: 600 }}
                  />
                </label>
                <label className="form-group" style={{ marginBottom: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                    Timing or Meal Notes (Optional)
                  </span>
                  <input
                    value={meal.notes}
                    onChange={(e) => updateMeal(mealIdx, 'notes', e.target.value)}
                    placeholder="e.g. 9:00 AM or 1 hour before workout"
                  />
                </label>
              </div>

              {/* Foods List */}
              <div style={{ marginTop: 12 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#334155' }}>
                    Food Items ({meal.foods.length} {meal.foods.length === 1 ? 'item' : 'items'})
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => addFood(mealIdx)}
                    style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={13} /> Add Food
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                  {meal.foods.map((food, foodIdx) => (
                    <div
                      key={foodIdx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 'var(--radius-md, 8px)',
                        padding: '12px',
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                          Item #{foodIdx + 1}
                        </span>
                        {meal.foods.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => removeFood(mealIdx, foodIdx)}
                            style={{ color: '#dc2626', padding: '2px 6px', height: 22 }}
                            title="Remove food item"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Row 1: Food Name + Single Portion Field */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                          gap: '10px',
                          marginBottom: 8,
                        }}
                      >
                        <label className="form-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                            Food Name *
                          </span>
                          <input
                            value={food.name}
                            onChange={(e) => updateFood(mealIdx, foodIdx, 'name', e.target.value)}
                            placeholder="e.g. Oatmeal, Chicken Breast, White Rice, Boiled Eggs"
                            style={{ fontWeight: 600 }}
                          />
                        </label>

                        {/* SINGLE PORTION FIELD (Qty & Unit merged as text) */}
                        <label className="form-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                            Portion / Quantity *
                          </span>
                          <input
                            type="text"
                            value={food.portion}
                            onChange={(e) => updateFood(mealIdx, foodIdx, 'portion', e.target.value)}
                            placeholder="e.g. 4 spoons, 100g, 2 whole eggs, 1 cup"
                            style={{ fontWeight: 600 }}
                          />
                        </label>
                      </div>

                      {/* Row 2: Calories & Macros */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
                          gap: '8px',
                        }}
                      >
                        <label className="form-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#d97706' }}>
                            Calories (kcal)
                          </span>
                          <input
                            type="number"
                            value={food.calories}
                            onChange={(e) =>
                              updateFood(mealIdx, foodIdx, 'calories', e.target.value === '' ? '' : Number(e.target.value))
                            }
                            placeholder="0"
                            min={0}
                            style={{ fontSize: '12px' }}
                          />
                        </label>

                        <label className="form-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626' }}>
                            Protein (g)
                          </span>
                          <input
                            type="number"
                            value={food.protein}
                            onChange={(e) =>
                              updateFood(mealIdx, foodIdx, 'protein', e.target.value === '' ? '' : Number(e.target.value))
                            }
                            placeholder="0"
                            min={0}
                            style={{ fontSize: '12px' }}
                          />
                        </label>

                        <label className="form-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb' }}>
                            Carbs (g)
                          </span>
                          <input
                            type="number"
                            value={food.carbs}
                            onChange={(e) =>
                              updateFood(mealIdx, foodIdx, 'carbs', e.target.value === '' ? '' : Number(e.target.value))
                            }
                            placeholder="0"
                            min={0}
                            style={{ fontSize: '12px' }}
                          />
                        </label>

                        <label className="form-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>
                            Fats (g)
                          </span>
                          <input
                            type="number"
                            value={food.fats}
                            onChange={(e) =>
                              updateFood(mealIdx, foodIdx, 'fats', e.target.value === '' ? '' : Number(e.target.value))
                            }
                            placeholder="0"
                            min={0}
                            style={{ fontSize: '12px' }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Assign to Clients (Search + Multi-Select) ── */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #cbd5e1', padding: '16px', marginTop: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={18} style={{ color: 'var(--brand-600)' }} />
              Assign to Clients / اختر العملاء * ({selectedClientIds.length} Selected)
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              ابحث واختر العملاء المعينين لك لتطبيق هذا النظام الغذائي عليهم
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setSelectedClientIds(clients.map((c) => c.id))}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              Select All (تحديد الكل)
            </button>
            <button
              type="button"
              onClick={() => setSelectedClientIds([])}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '3px 8px', color: '#64748b' }}
            >
              Clear (إلغاء التحديد)
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            placeholder="🔍 Search clients by name or email..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
        </div>

        {clients.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>No assigned clients found. Contact admin to assign clients to you.</p>
        ) : (() => {
          const q = clientSearch.toLowerCase().trim()
          const filtered = q
            ? clients.filter((c) => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q)))
            : clients
          return filtered.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>No clients match &quot;{clientSearch}&quot;</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
              {filtered.map((c) => {
                const isChecked = selectedClientIds.includes(c.id)
                return (
                  <label
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isChecked ? '1.5px solid var(--brand-600)' : '1px solid #e2e8f0',
                      background: isChecked ? 'var(--brand-50, #fcfaff)' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClientIds((prev) => [...prev, c.id])
                        } else {
                          setSelectedClientIds((prev) => prev.filter((id) => id !== c.id))
                        }
                      }}
                      style={{ width: 16, height: 16, accentColor: 'var(--brand-600)' }}
                    />
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <strong style={{ fontSize: '13px', display: 'block', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name}
                      </strong>
                      {c.email && (
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.email}
                        </span>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          )
        })()}
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: 'var(--space-4)',
        }}
      >
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isPending}
          style={{ minWidth: 200, fontWeight: 700 }}
        >
          {isPending
            ? 'Saving & Assigning Plan…'
            : initialData
            ? 'Update & Assign Nutrition Plan'
            : 'Save & Assign Nutrition Plan'}
        </button>
      </div>
    </form>
  )
}
