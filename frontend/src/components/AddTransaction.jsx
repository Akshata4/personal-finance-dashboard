import { useState } from 'react'

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Other'],
  expense: ['Food', 'Rent', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'],
}

const today = new Date().toISOString().split('T')[0]
const empty = {
  amount: '', type: 'expense', category: 'Food',
  note: '', date: today, is_recurring: false, recurrence: 'monthly',
}

export default function AddTransaction({ onAdd }) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'type') next.category = CATEGORIES[value][0]
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onAdd({
      ...form,
      amount: parseFloat(form.amount),
      recurrence: form.is_recurring ? form.recurrence : null,
    })
    setForm(empty)
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Transaction</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Type toggle */}
        <div className="col-span-2 sm:col-span-1 flex rounded-lg overflow-hidden border border-gray-200">
          {['expense', 'income'].map(t => (
            <button key={t} type="button" onClick={() => set('type', t)}
              className={`flex-1 py-2 text-sm font-medium capitalize transition-colors
                ${form.type === t
                  ? t === 'income' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Amount */}
        <input type="number" min="0.01" step="0.01" required placeholder="Amount"
          value={form.amount} onChange={e => set('amount', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

        {/* Category */}
        <select value={form.category} onChange={e => set('category', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          {CATEGORIES[form.type].map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Date */}
        <input type="date" required value={form.date} onChange={e => set('date', e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

        {/* Note */}
        <input type="text" placeholder="Note (optional)" value={form.note}
          onChange={e => set('note', e.target.value)}
          className="col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

        {/* Recurring toggle */}
        <div className="col-span-2 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.is_recurring}
              onChange={e => set('is_recurring', e.target.checked)}
              className="accent-indigo-600" />
            Recurring
          </label>
          {form.is_recurring && (
            <select value={form.recurrence} onChange={e => set('recurrence', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={saving}
          className="col-span-2 sm:col-span-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : 'Add'}
        </button>
      </form>
    </div>
  )
}
