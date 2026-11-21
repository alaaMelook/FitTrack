'use client'

import { useRef, useState, useTransition } from 'react'
import { saveProgramAction } from '@/app/coach/programs/actions'

type FoodItem = {
  name: string
  quantity: number | ''
  unit: 'g' | 'ml' | 'pcs'
  calories: number | ''
  protein: number | ''
  carbs: number | ''
  fats: number | ''
}

type Meal = {
  meal: string
  notes: string
  foods: FoodItem[]
}

function emptyFood(): FoodItem {
  return { name: '', quantity: '', unit: 'g', calories: '', protein: '', carbs: '', fats: '' }
}

function emptyMeal(): Meal {
  return { meal: '', notes: '', foods: [emptyFood()] }
}

type Client = { id: string; name: string }

type Props = {
  clients: Client[]
  initialData?: {
    id: string
    clientId: string
    title: string
    notes: string
    meals: Meal[]
  } | null
}

export default function NutritionPlanForm({ clients, initialData }: Props) {
  const [meals, setMeals] = useState<Meal[]>(initialData?.meals ?? [emptyMeal()])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  function updateMeal(mealIdx: number, field: keyof Omit<Meal, 'foods'>, value: string) {
    setMeals((prev) =>
      prev.map((m, i) => (i === mealIdx ? { ...m, [field]: value } : m))
    )
  }

  function updateFood(mealIdx: number, foodIdx: number, field: keyof FoodItem, value: string | number) {
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mealIdx
          ? { ...m, foods: m.foods.map((f, j) => (j === foodIdx ? { ...f, [field]: value } : f)) }
          : m
      )
    )
  }

  function addMeal() {
    setMeals((prev) => [...prev, emptyMeal()])
  }

  function removeMeal(idx: number) {
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    for (const m of meals) {
      if (!m.meal.trim()) {
        setError('Every meal must have a name.')
        return
      }
    }

    const fd = new FormData(e.currentTarget)
    fd.set('items', JSON.stringify(meals))
    fd.set('kind', 'nutrition')

    startTransition(async () => {
      try {
        await saveProgramAction(fd)
      } catch (err: any) {
        setError(err?.message ?? 'Failed to save plan.')
      }
    })
  }

  function resetForm() {
    setMeals([emptyMeal()])
    setError(null)
    formRef.current?.reset()
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

      {/* Client + Title + Notes */}
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
          <span>Plan Title *</span>
          <input
            name="title"
            required
            maxLength={120}
            placeholder="e.g. High Protein Cut Plan"
            defaultValue={initialData?.title ?? ''}
          />
        </label>
      </div>

      <label className="form-group">
        <span>Notes</span>
        <textarea
          name="notes"
          rows={2}
          placeholder="General notes for this plan…"
          defaultValue={initialData?.notes ?? ''}
        />
      </label>

      {/* Meals Builder */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
            Meals ({meals.length})
          </h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={addMeal}>
            + Add Meal
          </button>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {meals.map((meal, mealIdx) => (
            <div
              key={mealIdx}
              className="card"
              style={{ padding: 'var(--space-4)', background: 'var(--surface-2, #f8f9fa)' }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                <span className="badge badge-brand">Meal {mealIdx + 1}</span>
                {meals.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--color-error, #dc2626)' }}
                    onClick={() => removeMeal(mealIdx)}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-2" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <label className="form-group">
                  <span>Meal Name *</span>
                  <input
                    value={meal.meal}
                    onChange={(e) => updateMeal(mealIdx, 'meal', e.target.value)}
                    placeholder="e.g. Breakfast"
                    required
                  />
                </label>
                <label className="form-group">
                  <span>Meal Notes</span>
                  <input
                    value={meal.notes}
                    onChange={(e) => updateMeal(mealIdx, 'notes', e.target.value)}
                    placeholder="Optional notes…"
                  />
                </label>
              </div>

              {/* Foods */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                  <span className="text-sm text-secondary">Foods ({meal.foods.length})</span>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => addFood(mealIdx)}>
                    + Add Food
                  </button>
                </div>

                {meal.foods.length === 0 && (
                  <p className="text-sm text-secondary" style={{ padding: '0.5rem 0' }}>
                    No foods yet. Click &quot;+ Add Food&quot; to add items.
                  </p>
                )}

                <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
                  {meal.foods.map((food, foodIdx) => (
                    <div
                      key={foodIdx}
                      style={{
                        background: 'var(--surface-1, #fff)',
                        border: '1px solid var(--border, #e5e7eb)',
                        borderRadius: 'var(--radius-md, 8px)',
                        padding: 'var(--space-3)',
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                        <span className="text-sm text-secondary">Food {foodIdx + 1}</span>
                        {meal.foods.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => removeFood(mealIdx, foodIdx)}
                            style={{ fontSize: '0.75rem' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Row 1: name + quantity + unit */}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                        <label className="form-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '0.75rem' }}>Food Name</span>
                          <input
                            value={food.name}
                            onChange={(e) => updateFood(mealIdx, foodIdx, 'name', e.target.value)}
                            placeholder="e.g. Oats"
                          />
                        </label>
                        <label className="form-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '0.75rem' }}>Qty</span>
                          <input
                            type="number"
                            value={food.quantity}
                            onChange={(e) => updateFood(mealIdx, foodIdx, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="100"
                            min={0}
                          />
                        </label>
                        <label className="form-group" style={{ marginBottom: 0 }}>
                          <span style={{ fontSize: '0.75rem' }}>Unit</span>
                          <select
                            value={food.unit}
                            onChange={(e) => updateFood(mealIdx, foodIdx, 'unit', e.target.value as FoodItem['unit'])}
                          >
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="pcs">pcs</option>
                          </select>
                        </label>
                      </div>

                      {/* Row 2: macros */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                        {(['calories', 'protein', 'carbs', 'fats'] as const).map((macro) => (
                          <label key={macro} className="form-group" style={{ marginBottom: 0 }}>
                            <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{macro}</span>
                            <input
                              type="number"
                              value={food[macro]}
                              onChange={(e) =>
                                updateFood(mealIdx, foodIdx, macro, e.target.value === '' ? '' : Number(e.target.value))
                              }
                              placeholder="0"
                              min={0}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
        <button className="btn btn-primary" type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : initialData ? 'Update Plan' : 'Save Plan'}
        </button>
        {initialData && (
          <button type="button" className="btn btn-ghost" onClick={resetForm}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
