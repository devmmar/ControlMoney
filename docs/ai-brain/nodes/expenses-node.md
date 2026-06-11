# Expenses Node — Saídas

> Nó funcional da aba de Saídas do ControlMoney.

---

## Objetivo

Permitir ao usuário registrar, visualizar, editar e excluir todas as saídas de dinheiro (gastos) do mês atual e de meses anteriores, organizadas por data e categoria.

---

## Dados Envolvidos

### Tabela: `expenses`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Chave primária |
| `user_id` | UUID | Sim | Dono do registro |
| `category_id` | UUID | Não | Categoria da saída (nullable) |
| `description` | TEXT | Sim | Descrição do gasto |
| `amount` | DECIMAL(10,2) | Sim | Valor (deve ser > 0) |
| `date` | DATE | Sim | Data do gasto |
| `notes` | TEXT | Não | Observação livre |
| `payment_method` | TEXT | Não | cash, debit, credit, pix, other |
| `created_at` | TIMESTAMPTZ | Auto | Criado em |
| `updated_at` | TIMESTAMPTZ | Auto | Atualizado em |

---

## Regras de Negócio

### RN-EXP-001 — Valor Positivo
O valor de uma saída deve ser sempre maior que zero. Validar no frontend e no banco via `CHECK (amount > 0)`.

### RN-EXP-002 — Data Obrigatória
Toda saída deve ter uma data. O padrão é a data atual, mas o usuário pode alterar.

### RN-EXP-003 — Categoria Opcional mas Recomendada
A categoria é opcional para não bloquear o registro rápido, mas o sistema deve incentivar o usuário a categorizar para melhorar os relatórios.

### RN-EXP-004 — Impacto no Resumo
Toda saída cadastrada impacta imediatamente:
- Total de saídas no resumo financeiro do mês correspondente
- Resumo diário do dia da saída
- Percentual de uso da categoria (se tiver categoria com limite)
- Alertas inteligentes (se aplicável)

### RN-EXP-005 — Saídas de Meses Anteriores
O usuário pode registrar uma saída com data de mês anterior (lançamento retroativo). Nesses casos, a saída impacta o mês correspondente, não o mês atual.

### RN-EXP-006 — Exclusão Definitiva
Excluir uma saída é definitivo. Não há lixeira ou soft delete na v1.

---

## Agentes Conectados

| Agente | Papel |
|---|---|
| backend-senior-agent | Implementa `expensesService.ts` e `useExpenses` hook |
| frontend-senior-agent | Implementa formulário e lista de saídas |
| database-supabase-agent | Cria e mantém a tabela `expenses` com RLS |
| finance-rules-agent | Define como as saídas impactam os cálculos do resumo |
| ui-ux-agent | Define o fluxo de cadastro rápido de saída |
| security-data-agent | Garante isolamento por `user_id` |

---

## Dependências

- [auth-user-node](auth-user-node.md) — `user_id` do usuário autenticado
- [categories-node](categories-node.md) — categorias disponíveis para vincular

---

## Impacta Quais Telas

- **Tela de Saídas** — tela principal deste nó
- **Dashboard** — total de saídas no card de resumo
- **Resumo Financeiro** — total de saídas no cálculo do saldo
- **Resumo Diário** — saídas agrupadas por dia
- **Alertas** — gastos excessivos por categoria

---

## Checklist de Implementação

### Banco de Dados
- [ ] Tabela `expenses` criada (ver schema em `database-supabase-agent.md`)
- [ ] RLS habilitado com policy `auth.uid() = user_id`
- [ ] Índice em `(user_id, date DESC)` criado
- [ ] Índice em `(user_id, category_id)` criado

### Backend / Services
- [ ] `expensesService.ts` criado com funções:
  - [ ] `getExpenses(userId, filters?)` — listar com filtros opcionais
  - [ ] `getExpensesByMonth(userId, year, month)` — por mês
  - [ ] `getTotalExpensesByMonth(userId, year, month)` — aggregation
  - [ ] `getExpensesByDay(userId, year, month)` — para resumo diário
  - [ ] `createExpense(data)` — criar
  - [ ] `updateExpense(id, data)` — atualizar
  - [ ] `deleteExpense(id)` — excluir
- [ ] `useExpenses` hook criado retornando `{ expenses, loading, error, refetch }`

### Frontend
- [ ] Página `ExpensesPage` criada
- [ ] Lista de saídas ordenadas por data (mais recente primeiro)
- [ ] Filtros por mês e categoria
- [ ] Formulário de criação (modal ou drawer)
- [ ] Formulário de edição
- [ ] Confirmação de exclusão
- [ ] Estado vazio: "Nenhuma saída registrada. Que dia feliz! 🎉"
- [ ] Estado de loading com skeletons
- [ ] Total do mês visível no topo da lista
- [ ] Botão rápido no dashboard para nova saída

---

## Histórico do Nó

| Data | Evento | Responsável |
|---|---|---|
| 2026-06-07 | Nó criado e documentado | Sessão 001 |
| - | Tabela criada no Supabase | - |
| - | Services implementados | - |
| - | Tela implementada | - |
