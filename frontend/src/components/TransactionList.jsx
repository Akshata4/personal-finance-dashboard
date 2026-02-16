const TYPE_STYLE = { income: 'text-emerald-600', expense: 'text-rose-500' }
const TYPE_BADGE = { income: 'bg-emerald-50 text-emerald-700', expense: 'bg-rose-50 text-rose-700' }

export default function TransactionList({ transactions, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100">
        No transactions match your filters.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-700 px-5 py-4 border-b border-gray-100">
        Transactions
        <span className="ml-2 text-sm font-normal text-gray-400">({transactions.length})</span>
      </h2>
      <ul className="divide-y divide-gray-50">
        {transactions.map(tx => (
          <li key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE[tx.type]}`}>
                {tx.category}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-700">{tx.note || tx.category}</p>
                  {tx.is_recurring && (
                    <span className="text-xs bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full">
                      ↻ {tx.recurrence}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-semibold ${TYPE_STYLE[tx.type]}`}>
                {tx.type === 'income' ? '+' : '-'}$
                {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <button onClick={() => onDelete(tx.id)}
                className="text-gray-300 hover:text-rose-400 transition-colors text-lg leading-none"
                title="Delete">
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
