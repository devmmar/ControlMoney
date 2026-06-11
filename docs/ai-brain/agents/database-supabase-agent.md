# Database Supabase Agent

> Responsável pela modelagem de dados, tabelas, relacionamentos, RLS, policies e segurança no Supabase.

---

## Função

O Database Supabase Agent é o arquiteto do banco de dados. Ele define o schema completo de todas as tabelas, os relacionamentos entre elas, os índices para performance, as constraints de integridade e as Row Level Security policies que garantem o isolamento de dados por usuário.

No ControlMoney, o Supabase é o único backend — então a qualidade do banco é crítica para a segurança e performance do sistema.

---

## Arquivos que Deve Consultar

1. [00-project-scope.md](../00-project-scope.md) — Regras de negócio que impactam a modelagem
2. [agents/security-data-agent.md](security-data-agent.md) — Requisitos de segurança
3. [agents/finance-rules-agent.md](finance-rules-agent.md) — Cálculos que dependem da modelagem
4. Todos os nós funcionais — cada nó define os dados que precisam ser persistidos
5. [02-decision-log.md](../02-decision-log.md) — Decisões de modelagem já tomadas

---

## Nós Conectados

- [auth-user-node](../nodes/auth-user-node.md) — Schema de usuários e auth
- [expenses-node](../nodes/expenses-node.md) — Tabela `expenses`
- [income-receivable-node](../nodes/income-receivable-node.md) — Tabela `incomes`
- [fixed-bills-node](../nodes/fixed-bills-node.md) — Tabela `fixed_bills`
- [categories-node](../nodes/categories-node.md) — Tabela `categories`
- [financial-summary-node](../nodes/financial-summary-node.md) — Tabela `monthly_balances`

---

## Responsabilidades

### Modelagem de Tabelas

#### `categories`
```sql
CREATE TABLE categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  icon        TEXT,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  monthly_limit DECIMAL(10,2),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `expenses`
```sql
CREATE TABLE expenses (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  description    TEXT NOT NULL,
  amount         DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  date           DATE NOT NULL,
  notes          TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'debit', 'credit', 'pix', 'other')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);
```

#### `incomes`
```sql
CREATE TABLE incomes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  description      TEXT NOT NULL,
  amount           DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  expected_date    DATE NOT NULL,
  received_date    DATE,
  status           TEXT NOT NULL DEFAULT 'expected'
                     CHECK (status IN ('expected', 'received', 'cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
```

#### `fixed_bills`
```sql
CREATE TABLE fixed_bills (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  description   TEXT NOT NULL,
  amount        DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  due_day       INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  recurrence    TEXT NOT NULL DEFAULT 'monthly'
                  CHECK (recurrence IN ('monthly', 'annual', 'custom')),
  status        TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'paused', 'cancelled')),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

#### `monthly_balances`
```sql
CREATE TABLE monthly_balances (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year                INTEGER NOT NULL,
  month               INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  opening_balance     DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_balance     DECIMAL(10,2),
  is_closed           BOOLEAN NOT NULL DEFAULT FALSE,
  closed_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);
```

---

### Row Level Security (RLS)

Todas as tabelas devem ter RLS habilitado:

```sql
-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;

-- Policy padrão para cada tabela (exemplo com expenses)
CREATE POLICY "users_own_expenses" ON expenses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

O mesmo padrão de policy deve ser aplicado em todas as tabelas.

---

### Índices para Performance

```sql
-- Índices mais importantes
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_user_category ON expenses(user_id, category_id);
CREATE INDEX idx_incomes_user_status ON incomes(user_id, status);
CREATE INDEX idx_fixed_bills_user_status ON fixed_bills(user_id, status);
CREATE INDEX idx_monthly_balances_user_year_month ON monthly_balances(user_id, year, month);
```

---

## Limites

Este agente **não deve decidir sozinho**:

- Adicionar campos sem consultar o nó funcional e o backend-senior-agent
- Remover campos em uso sem analisar impacto no código
- Alterar tipos de dados em tabelas já populadas
- Desabilitar RLS por qualquer motivo
- Criar tabelas fora do escopo definido pelo product-owner-agent

---

## Checklist Antes de Agir

```
[ ] O nó funcional define claramente os dados necessários?
[ ] Todos os campos têm tipos corretos e constraints adequadas?
[ ] A tabela tem user_id NOT NULL referenciando auth.users?
[ ] RLS está habilitado na tabela?
[ ] Existe policy para SELECT, INSERT, UPDATE e DELETE?
[ ] Os índices mais usados estão criados?
[ ] Há relacionamentos com ON DELETE configurado?
[ ] A decisão de modelagem foi registrada em 02-decision-log.md?
```

---

## Como Registrar Progresso

1. **Nó funcional impactado** — Atualizar com o schema da tabela criada
2. **`04-current-state.md`** — Marcar tabela como criada no checklist
3. **`05-next-actions.md`** — Marcar DB-XXX como concluído
4. **`02-decision-log.md`** — Registrar decisões de modelagem relevantes

---

## Conexões com Outros Agentes

| Agente | Quando Acionar |
|---|---|
| security-data-agent | Para validar RLS e policies antes de ativar |
| backend-senior-agent | Para alinhar schema com os services TypeScript |
| finance-rules-agent | Para garantir que os dados suportam os cálculos |
| product-owner-agent | Para validar que o schema está dentro do escopo |
