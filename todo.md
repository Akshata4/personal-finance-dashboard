# Personal Finance App - 1 Hour Build Plan

## Tech Stack
- **Backend:** Python + FastAPI
- **Database:** DuckDB (embedded, file-based, analytics-ready)
- **Frontend:** React + Vite + TailwindCSS
- **API:** REST (FastAPI auto-generates docs at /docs)

---

## Features (MVP - Keep it Simple)

### Core
- [ ] Add a transaction (amount, type: income/expense, category, note, date)
- [ ] View all transactions (list)
- [ ] Delete a transaction
- [ ] Dashboard summary: Total Balance, Total Income, Total Expenses

### Nice-to-have (only if time allows)
- [ ] Filter by type (income/expense)
- [ ] Simple bar/pie chart for spending by category

---

## App Structure

```
personal-finance-dashboard/
├── backend/
│   ├── main.py          # FastAPI app + all routes
│   ├── models.py        # Table schema definitions
│   ├── database.py      # DuckDB connection setup
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx   # Summary cards
│   │   │   ├── AddTransaction.jsx
│   │   │   └── TransactionList.jsx
│   └── package.json
└── todo.md
```

---

## Build Order (60 min)

| Step | Task | Time |
|------|------|------|
| 1 | Backend: FastAPI setup + SQLite DB + models | 10 min |
| 2 | Backend: CRUD API routes (GET, POST, DELETE) | 10 min |
| 3 | Frontend: Vite + Tailwind setup | 5 min |
| 4 | Frontend: Dashboard summary cards | 10 min |
| 5 | Frontend: Add Transaction form | 10 min |
| 6 | Frontend: Transaction list with delete | 10 min |
| 7 | Wire frontend to backend, test end-to-end | 5 min |

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/transactions` | Get all transactions |
| POST | `/transactions` | Add a transaction |
| DELETE | `/transactions/{id}` | Delete a transaction |
| GET | `/summary` | Get balance, income, expense totals |

---

## Data Model

```json
Transaction {
  id: int,
  amount: float,
  type: "income" | "expense",
  category: string,   // e.g. Food, Salary, Rent, etc.
  note: string,
  date: string        // YYYY-MM-DD
}
```

---

## Categories
**Income:** Salary, Freelance, Investment, Other
**Expense:** Food, Rent, Transport, Shopping, Bills, Entertainment, Other
