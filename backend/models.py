from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import date


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    type: Literal["income", "expense"]
    category: str
    note: str = ""
    date: date
    is_recurring: bool = False
    recurrence: Optional[Literal["weekly", "monthly"]] = None


class Transaction(TransactionCreate):
    id: int


class Summary(BaseModel):
    balance: float
    total_income: float
    total_expense: float


# ── Analytics ─────────────────────────────────────────────────────────────────

class MonthlyPoint(BaseModel):
    month: str          # "2025-01"
    income: float
    expense: float

class CategorySpend(BaseModel):
    category: str
    amount: float


# ── Budgets ───────────────────────────────────────────────────────────────────

class BudgetCreate(BaseModel):
    category: str
    amount: float = Field(..., gt=0)

class Budget(BudgetCreate):
    id: int
    spent: float = 0.0  # current month spend, computed on read
