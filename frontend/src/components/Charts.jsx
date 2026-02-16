import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PIE_COLORS = ['#6366f1','#f43f5e','#10b981','#f59e0b','#3b82f6','#8b5cf6','#ec4899']

export default function Charts() {
  const [monthly, setMonthly] = useState([])
  const [byCategory, setByCategory] = useState([])

  useEffect(() => {
    fetch(`${API}/analytics/monthly?months=6`).then(r => r.json()).then(setMonthly)
    fetch(`${API}/analytics/by-category`).then(r => r.json()).then(setByCategory)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Monthly bar chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Last 6 Months</h2>
        {monthly.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={v => `$${v.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} name="Income" />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4,4,0,0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category pie chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Spending This Month</h2>
        {byCategory.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No expense data this month</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCategory} dataKey="amount" nameKey="category"
                cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) =>
                  `${category} ${(percent * 100).toFixed(0)}%`}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => `$${v.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
