import { useState } from 'react'

const API = 'http://localhost:8000'
const EXPENSE_CATEGORIES = ['Food', 'Rent', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other']

function BudgetRow({ budget, onDelete }) {
  const pct = Math.min((budget.spent / budget.amount) * 100, 100)
  const over = budget.spent > budget.amount
  const warn = pct >= 80

  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-gray-700">{budget.category}</span>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${over ? 'text-rose-500' : warn ? 'text-amber-500' : 'text-gray-600'}`}>
            ${budget.spent.toFixed(2)}
            <span className="text-gray-400 font-normal"> / ${budget.amount.toFixed(2)}</span>
          </span>
          <button onClick={() => onDelete(budget.id)}
            className="text-gray-300 hover:text-rose-400 transition-colors text-lg leading-none">
            ×
          </button>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-rose-500' : warn ? 'bg-amber-400' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && (
        <p className="text-xs text-rose-500 mt-1">
          Over budget by ${(budget.spent - budget.amount).toFixed(2)}
        </p>
      )}
    </div>
  )
}

export default function BudgetLimits({ budgets, onAdd, onDelete }) {
  const [category, setCategory] = useState('Food')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onAdd({ category, amount: parseFloat(amount) })
    setAmount('')
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Monthly Budgets</h2>

      {/* Add budget form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="number" min="1" step="0.01" required placeholder="Limit ($)"
          value={amount} onChange={e => setAmount(e.target.value)}
          className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <button type="submit" disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50">
          {saving ? '…' : 'Set'}
        </button>
      </form>

      {/* Budget list */}
      {budgets.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No budgets set yet</p>
      ) : (
        <div>
          {budgets.map(b => (
            <BudgetRow key={b.id} budget={b} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
