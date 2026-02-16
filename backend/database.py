import duckdb
import os

DB_PATH = os.getenv("DB_PATH", "finance.duckdb")

def get_connection() -> duckdb.DuckDBPyConnection:
    return duckdb.connect(DB_PATH)


def init_db():
    con = get_connection()

    con.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id           INTEGER PRIMARY KEY,
            amount       DOUBLE  NOT NULL,
            type         VARCHAR NOT NULL CHECK (type IN ('income', 'expense')),
            category     VARCHAR NOT NULL,
            note         VARCHAR DEFAULT '',
            date         DATE    NOT NULL,
            is_recurring BOOLEAN DEFAULT FALSE,
            recurrence   VARCHAR DEFAULT NULL  -- 'weekly' | 'monthly' | NULL
        )
    """)

    con.execute("""
        CREATE SEQUENCE IF NOT EXISTS transactions_id_seq START 1
    """)

    con.execute("""
        CREATE TABLE IF NOT EXISTS budgets (
            id       INTEGER PRIMARY KEY,
            category VARCHAR NOT NULL UNIQUE,
            amount   DOUBLE  NOT NULL
        )
    """)

    con.execute("""
        CREATE SEQUENCE IF NOT EXISTS budgets_id_seq START 1
    """)

    # Migrate: add recurring columns if they don't exist yet (idempotent)
    existing = [r[0] for r in con.execute(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'transactions'"
    ).fetchall()]
    if 'is_recurring' not in existing:
        con.execute("ALTER TABLE transactions ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE")
    if 'recurrence' not in existing:
        con.execute("ALTER TABLE transactions ADD COLUMN recurrence VARCHAR DEFAULT NULL")

    con.close()
