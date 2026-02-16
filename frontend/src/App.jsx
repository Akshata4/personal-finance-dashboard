import { useState, useEffect, useCallback } from 'react'
import Dashboard from './components/Dashboard'
import AddTransaction from './components/AddTransaction'
import TransactionList from './components/TransactionList'
import FilterBar from './components/FilterBar'
import Charts from './components/Charts'
import BudgetLimits from './components/BudgetLimits'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const EMPTY_FILTERS = { search: '', type: '', category: '', date_from: '', date_to: '' }

export default function App() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({ balance: 0, total_income: 0, total_expense: 0 })
  const [budgets, setBudgets] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview') // 'overview' | 'analytics' | 'budgets'

  // Build query string from filters, omitting empty values
  function buildQuery(f) {
    const p = new URLSearchParams()
    Object.entries(f).forEach(([k, v]) => { if (v) p.append(k, v) })
    return p.toString()
  }

  const fetchTransactions = useCallback(async (f = filters) => {
    const qs = buildQuery(f)
    const res = await fetch(`${API}/transactions${qs ? `?${qs}` : ''}`)
    setTransactions(await res.json())
  }, [filters])

  const fetchSummary = useCallback(async () => {
    const res = await fetch(`${API}/summary`)
    setSummary(await res.json())
  }, [])

  const fetchBudgets = useCallback(async () => {
    const res = await fetch(`${API}/budgets`)
    setBudgets(await res.json())
  }, [])

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchSummary(), fetchBudgets()])
      .then(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFilterChange(newFilters) {
    setFilters(newFilters)
    await fetchTransactions(newFilters)
  }

  async function addTransaction(data) {
    await fetch(`${API}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await Promise.all([fetchTransactions(), fetchSummary(), fetchBudgets()])
  }

  async function deleteTransaction(id) {
    await fetch(`${API}/transactions/${id}`, { method: 'DELETE' })
    await Promise.all([fetchTransactions(), fetchSummary(), fetchBudgets()])
  }

  async function addBudget(data) {
    await fetch(`${API}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchBudgets()
  }

  async function deleteBudget(id) {
    await fetch(`${API}/budgets/${id}`, { method: 'DELETE' })
    await fetchBudgets()
  }

  function exportCSV() {
    window.open(`${API}/transactions/export`, '_blank')
  }

  const TABS = ['overview', 'analytics', 'budgets']

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Personal Finance</h1>
          <nav className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors
                  ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                {t}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <p className="text-center text-gray-400 py-12">Loading…</p>
        ) : (
          <>
            <Dashboard summary={summary} />

            {tab === 'overview' && (
              <>
                <AddTransaction onAdd={addTransaction} />
                <FilterBar filters={filters} onChange={handleFilterChange} onExport={exportCSV} />
                <TransactionList transactions={transactions} onDelete={deleteTransaction} />
              </>
            )}

            {tab === 'analytics' && <Charts />}

            {tab === 'budgets' && (
              <BudgetLimits budgets={budgets} onAdd={addBudget} onDelete={deleteBudget} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
