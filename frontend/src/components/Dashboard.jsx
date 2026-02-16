function StatCard({ label, amount, color }) {
  return (
    <div className={`rounded-2xl p-5 ${color}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-1">
        ${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  )
}

export default function Dashboard({ summary }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard
        label="Balance"
        amount={summary.balance}
        color="bg-indigo-600 text-white"
      />
      <StatCard
        label="Total Income"
        amount={summary.total_income}
        color="bg-emerald-100 text-emerald-800"
      />
      <StatCard
        label="Total Expenses"
        amount={summary.total_expense}
        color="bg-rose-100 text-rose-800"
      />
    </div>
  )
}
