# Personal Finance Dashboard

A full-stack personal finance tracker built with FastAPI, DuckDB, React, and TailwindCSS.

**Live Demo:** https://personal-finance-dashboard-three-eta.vercel.app/

---

## Features

### Transaction Management
- Add income and expense transactions with amount, category, note, and date
- Mark transactions as recurring (weekly or monthly)
- Delete transactions
- View all transactions with real-time count

### Dashboard Overview
- Summary cards showing Total Balance, Total Income, and Total Expenses
- Color-coded badges for quick visual distinction between income and expenses

### Analytics
- 6-month bar chart comparing income vs. expenses over time
- Pie chart breaking down spending by category
- Monthly category-level analytics with date filtering

### Filtering & Export
- Filter transactions by type (income/expense), category, and date range
- Free-text search across notes and categories
- Export filtered transactions to CSV

### Budget Management
- Set monthly spending limits per expense category
- Visual progress bars showing budget utilization
- Warnings at 80% usage, red alerts on overage

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite 7, TailwindCSS 4   |
| Charts    | Recharts 3                        |
| Backend   | FastAPI, Python 3                 |
| Database  | DuckDB (embedded, file-based)     |
| Validation| Pydantic 2                        |
| Server    | Uvicorn                           |
| Deploy    | Vercel (frontend)                 |

---

## Project Structure

```
personal-finance-dashboard/
├── backend/
│   ├── main.py          # All API routes & CORS middleware
│   ├── models.py        # Pydantic request/response models
│   ├── database.py      # DuckDB connection & schema init
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Centralized state & data fetching
│   │   └── components/
│   │       ├── Dashboard.jsx    # Summary cards
│   │       ├── AddTransaction.jsx
│   │       ├── TransactionList.jsx
│   │       ├── FilterBar.jsx    # Filtering + CSV export
│   │       ├── Charts.jsx       # Bar & pie charts
│   │       └── BudgetLimits.jsx
│   └── vite.config.js
└── README.md
```

---

## API Endpoints

| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| GET    | `/transactions`        | List all transactions (filterable) |
| POST   | `/transactions`        | Create a transaction               |
| DELETE | `/transactions/{id}`   | Delete a transaction               |
| GET    | `/summary`             | Total balance, income, expenses    |
| GET    | `/analytics/monthly`   | Monthly income vs expense data     |
| GET    | `/analytics/category`  | Spending breakdown by category     |
| GET    | `/budgets`             | List all budgets with spent amount |
| POST   | `/budgets`             | Create or update a budget limit    |
| DELETE | `/budgets/{id}`        | Delete a budget                    |

---

## Running Locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` in a `.env` file to point to your backend:

```
VITE_API_URL=http://localhost:8000
```

The app will be available at `http://localhost:5173`.
