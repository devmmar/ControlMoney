-- ============================================================
-- ControlMoney — Script de criação do banco de dados
-- Rodar no Supabase SQL Editor (https://supabase.com/dashboard)
-- Projeto → SQL Editor → New Query → colar e executar
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CATEGORIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  color         TEXT        NOT NULL DEFAULT '#7c3aed',
  icon          TEXT,
  type          TEXT        NOT NULL DEFAULT 'expense'
                              CHECK (type IN ('income', 'expense', 'both')),
  monthly_limit DECIMAL(10,2) CHECK (monthly_limit IS NULL OR monthly_limit > 0),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories: acesso proprio" ON categories
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

-- ─────────────────────────────────────────────────────────────
-- 2. EXPENSES (saídas)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id    UUID        REFERENCES categories(id) ON DELETE SET NULL,
  description    TEXT        NOT NULL,
  amount         DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date           DATE        NOT NULL,
  notes          TEXT,
  payment_method TEXT        CHECK (
                   payment_method IS NULL OR
                   payment_method IN ('cash','debit','credit','pix','other')
                 ),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses: acesso proprio" ON expenses
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date     ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON expenses(user_id, category_id);

-- ─────────────────────────────────────────────────────────────
-- 3. INCOMES (entradas a receber)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incomes (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   UUID        REFERENCES categories(id) ON DELETE SET NULL,
  description   TEXT        NOT NULL,
  amount        DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  expected_date DATE        NOT NULL,
  received_date DATE,
  status        TEXT        NOT NULL DEFAULT 'expected'
                              CHECK (status IN ('expected','received','cancelled')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "incomes: acesso proprio" ON incomes
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_incomes_user_status ON incomes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_incomes_user_date   ON incomes(user_id, expected_date);

-- ─────────────────────────────────────────────────────────────
-- 4. FIXED_BILLS (contas fixas previstas)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fixed_bills (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID        REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT        NOT NULL,
  amount      DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  due_day     INTEGER     NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  recurrence  TEXT        NOT NULL DEFAULT 'monthly'
                            CHECK (recurrence IN ('monthly','annual','custom')),
  status      TEXT        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active','paused','cancelled')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fixed_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fixed_bills: acesso proprio" ON fixed_bills
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fixed_bills_user_status ON fixed_bills(user_id, status);

-- ─────────────────────────────────────────────────────────────
-- 5. MONTHLY_BALANCES (fechamento mensal / saldo herdado)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS monthly_balances (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year            INTEGER     NOT NULL,
  month           INTEGER     NOT NULL CHECK (month BETWEEN 1 AND 12),
  opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(10,2),
  is_closed       BOOLEAN     NOT NULL DEFAULT FALSE,
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monthly_balances: acesso proprio" ON monthly_balances
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_monthly_balances_user ON monthly_balances(user_id, year, month);

-- ─────────────────────────────────────────────────────────────
-- 6. FUNÇÃO updated_at automático
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_incomes_updated_at
  BEFORE UPDATE ON incomes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_fixed_bills_updated_at
  BEFORE UPDATE ON fixed_bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Verificação final — todas as tabelas devem ter rowsecurity = true
-- ─────────────────────────────────────────────────────────────
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
