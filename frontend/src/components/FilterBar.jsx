const CATEGORIES = ['Food', 'Rent', 'Transport', 'Shopping', 'Bills', 'Entertainment',
  'Salary', 'Freelance', 'Investment', 'Other']

export default function FilterBar({ filters, onChange, onExport }) {
  function set(field, value) {
    onChange({ ...filters, [field]: value })
  }

  return (
    <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
      {/* Search */}
      <input
        type="text"
        placeholder="Search note or category…"
        value={filters.search}
        onChange={e => set('search', e.target.value)}
        className="flex-1 min-w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />

      {/* Type */}
      <select value={filters.type} onChange={e => set('type', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
        <option value="">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      {/* Category */}
      <select value={filters.category} onChange={e => set('category', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
        <option value="">All categories</option>
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>

      {/* Date range */}
      <input type="date" value={filters.date_from} onChange={e => set('date_from', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      <span className="text-gray-400 text-sm">to</span>
      <input type="date" value={filters.date_to} onChange={e => set('date_to', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

      {/* Export */}
      <button onClick={onExport}
        className="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
        Export CSV
      </button>
    </div>
  )
}
