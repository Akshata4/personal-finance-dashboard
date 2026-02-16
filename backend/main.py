from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import os
from database import get_connection, init_db
from models import (
    Transaction, TransactionCreate, Summary,
    MonthlyPoint, CategorySpend,
    Budget, BudgetCreate,
)

app = FastAPI(title="Personal Finance API")

_origins = ["http://localhost:5173"]
if os.getenv("FRONTEND_URL"):
    _origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()


# ── Transactions ──────────────────────────────────────────────────────────────

@app.get("/transactions", response_model=list[Transaction])
def get_transactions(
    type: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
):
    conditions = []
    params = []

    if type:
        conditions.append("type = ?")
        params.append(type)
    if category:
        conditions.append("category = ?")
        params.append(category)
    if search:
        conditions.append("(LOWER(note) LIKE ? OR LOWER(category) LIKE ?)")
        params.extend([f"%{search.lower()}%", f"%{search.lower()}%"])
    if date_from:
        conditions.append("date >= ?")
        params.append(date_from)
    if date_to:
        conditions.append("date <= ?")
        params.append(date_to)

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    sql = f"""
        SELECT id, amount, type, category, note, date, is_recurring, recurrence
        FROM transactions {where}
        ORDER BY date DESC
    """
    con = get_connection()
    rows = con.execute(sql, params).fetchall()
    con.close()
    return [
        Transaction(id=r[0], amount=r[1], type=r[2], category=r[3],
                    note=r[4], date=r[5], is_recurring=r[6], recurrence=r[7])
        for r in rows
    ]


@app.post("/transactions", response_model=Transaction, status_code=201)
def create_transaction(payload: TransactionCreate):
    con = get_connection()
    new_id = con.execute("SELECT nextval('transactions_id_seq')").fetchone()[0]
    con.execute(
        "INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [new_id, payload.amount, payload.type, payload.category,
         payload.note, payload.date, payload.is_recurring, payload.recurrence],
    )
    con.close()
    return Transaction(id=new_id, **payload.model_dump())


@app.delete("/transactions/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int):
    con = get_connection()
    affected = con.execute(
        "DELETE FROM transactions WHERE id = ?", [transaction_id]
    ).rowcount
    con.close()
    if affected == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")


# ── CSV Export ────────────────────────────────────────────────────────────────

@app.get("/transactions/export")
def export_csv():
    con = get_connection()
    rows = con.execute(
        "SELECT id, date, type, category, amount, note, is_recurring, recurrence "
        "FROM transactions ORDER BY date DESC"
    ).fetchall()
    con.close()

    output = io.StringIO()
    output.write("id,date,type,category,amount,note,is_recurring,recurrence\n")
    for r in rows:
        output.write(",".join(str(v) if v is not None else "" for v in r) + "\n")
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )


# ── Summary ───────────────────────────────────────────────────────────────────

@app.get("/summary", response_model=Summary)
def get_summary():
    con = get_connection()
    row = con.execute("""
        SELECT
            COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
        FROM transactions
    """).fetchone()
    con.close()
    total_income, total_expense = row
    return Summary(
        total_income=total_income,
        total_expense=total_expense,
        balance=total_income - total_expense,
    )


# ── Analytics ─────────────────────────────────────────────────────────────────

@app.get("/analytics/monthly", response_model=list[MonthlyPoint])
def analytics_monthly(months: int = Query(6, ge=1, le=24)):
    con = get_connection()
    rows = con.execute("""
        SELECT
            STRFTIME(date, '%Y-%m') AS month,
            COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions
        WHERE date >= (CURRENT_DATE - INTERVAL (?) MONTH)
        GROUP BY month
        ORDER BY month
    """, [months]).fetchall()
    con.close()
    return [MonthlyPoint(month=r[0], income=r[1], expense=r[2]) for r in rows]


@app.get("/analytics/by-category", response_model=list[CategorySpend])
def analytics_by_category(month: Optional[str] = None):
    """Expense breakdown by category. month = 'YYYY-MM', defaults to current month."""
    con = get_connection()
    if month:
        rows = con.execute("""
            SELECT category, SUM(amount) AS total
            FROM transactions
            WHERE type = 'expense' AND STRFTIME(date, '%Y-%m') = ?
            GROUP BY category
            ORDER BY total DESC
        """, [month]).fetchall()
    else:
        rows = con.execute("""
            SELECT category, SUM(amount) AS total
            FROM transactions
            WHERE type = 'expense'
              AND STRFTIME(date, '%Y-%m') = STRFTIME(CURRENT_DATE, '%Y-%m')
            GROUP BY category
            ORDER BY total DESC
        """).fetchall()
    con.close()
    return [CategorySpend(category=r[0], amount=r[1]) for r in rows]


# ── Budgets ───────────────────────────────────────────────────────────────────

@app.get("/budgets", response_model=list[Budget])
def get_budgets():
    con = get_connection()
    budgets = con.execute(
        "SELECT id, category, amount FROM budgets ORDER BY category"
    ).fetchall()
    # Get current month spend per category
    spent_rows = con.execute("""
        SELECT category, COALESCE(SUM(amount), 0)
        FROM transactions
        WHERE type = 'expense'
          AND STRFTIME(date, '%Y-%m') = STRFTIME(CURRENT_DATE, '%Y-%m')
        GROUP BY category
    """).fetchall()
    con.close()
    spent_map = {r[0]: r[1] for r in spent_rows}
    return [
        Budget(id=b[0], category=b[1], amount=b[2], spent=spent_map.get(b[1], 0.0))
        for b in budgets
    ]


@app.post("/budgets", response_model=Budget, status_code=201)
def create_budget(payload: BudgetCreate):
    con = get_connection()
    new_id = con.execute("SELECT nextval('budgets_id_seq')").fetchone()[0]
    try:
        con.execute(
            "INSERT INTO budgets VALUES (?, ?, ?)",
            [new_id, payload.category, payload.amount],
        )
    except Exception:
        con.close()
        raise HTTPException(status_code=409, detail="Budget for this category already exists")
    con.close()
    return Budget(id=new_id, category=payload.category, amount=payload.amount, spent=0.0)


@app.put("/budgets/{budget_id}", response_model=Budget)
def update_budget(budget_id: int, payload: BudgetCreate):
    con = get_connection()
    affected = con.execute(
        "UPDATE budgets SET category = ?, amount = ? WHERE id = ?",
        [payload.category, payload.amount, budget_id],
    ).rowcount
    if affected == 0:
        con.close()
        raise HTTPException(status_code=404, detail="Budget not found")
    spent_row = con.execute("""
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions
        WHERE type = 'expense' AND category = ?
          AND STRFTIME(date, '%Y-%m') = STRFTIME(CURRENT_DATE, '%Y-%m')
    """, [payload.category]).fetchone()
    con.close()
    return Budget(id=budget_id, category=payload.category,
                  amount=payload.amount, spent=spent_row[0])


@app.delete("/budgets/{budget_id}", status_code=204)
def delete_budget(budget_id: int):
    con = get_connection()
    affected = con.execute(
        "DELETE FROM budgets WHERE id = ?", [budget_id]
    ).rowcount
    con.close()
    if affected == 0:
        raise HTTPException(status_code=404, detail="Budget not found")
