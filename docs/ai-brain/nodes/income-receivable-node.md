# Income Receivable Node — Entradas a Receber

> Nó funcional da aba de Entradas a Receber do ControlMoney.

---

## Objetivo

Permitir ao usuário registrar os valores que espera receber (salário, freelance, aluguéis, etc.) e controlar o que já foi recebido. Essas entradas alimentam o cálculo de saldo e a previsão financeira.

---

## Dados Envolvidos

### Tabela: `incomes`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Chave primária |
| `user_id` | UUID | Sim | Dono do registro |
| `category_id` | UUID | Não | Categoria opcional |
| `description` | TEXT | Sim | Descrição (ex: "Salário", "Freela XYZ") |
| `amount` | DECIMAL(10,2) | Sim | Valor esperado |
| `expected_date` | DATE | Sim | Data prevista de recebimento |
| `received_date` | DATE | Não | Data real de recebimento (nullable) |
| `status` | TEXT | Sim | `expected`, `received`, `cancelled` |
| `notes` | TEXT | Não | Observações |
| `created_at` | TIMESTAMPTZ | Auto | Criado em |
| `updated_at` | TIMESTAMPTZ | Auto | Atualizado em |

---

## Regras de Negócio

### RN-INC-001 — Status Determina o Impacto no Saldo

| Status | Impacto no Saldo Atual | Impacto na Previsão |
|---|---|---|
| `expected` | Não entra no saldo atual | Entra na previsão ("a receber") |
| `received` | Entra no saldo atual (total recebido) | Não entra na previsão (já foi recebido) |
| `cancelled` | Não entra em nenhum cálculo | Não entra em nenhum cálculo |

### RN-INC-002 — Marcar Como Recebido
Quando o usuário clica em "Marcar como Recebido":
- `status` muda de `expected` para `received`
- `received_date` é preenchida com a data atual (editável)
- O saldo atual é recalculado automaticamente

### RN-INC-003 — Valor é o Previsto, Não o Real
O campo `amount` representa o valor que o usuário esperava receber. Se o valor real diferir, o usuário pode editar o `amount` ao marcar como recebido.

### RN-INC-004 — Cancelamento
Cancelar uma entrada prevista (ex: freela que não saiu) não exclui o registro — apenas muda o status para `cancelled`. Isso mantém o histórico.

### RN-INC-005 — Entrada Recebida Impacta o Resumo do Mês
Uma entrada com `status = received` e `received_date` no mês atual impacta:
- "Total já recebido" no resumo financeiro do mês atual
- O saldo atual calculado

---

## Agentes Conectados

| Agente | Papel |
|---|---|
| backend-senior-agent | Implementa `incomesService.ts` e hook |
| frontend-senior-agent | Implementa tela e formulário |
| database-supabase-agent | Cria tabela `incomes` com RLS |
| finance-rules-agent | Define como entradas impactam saldo e previsão |
| ui-ux-agent | Define o fluxo de marcar entrada como recebida |

---

## Dependências

- [auth-user-node](auth-user-node.md) — `user_id`
- [categories-node](categories-node.md) — categorias de entradas

---

## Impacta Quais Telas

- **Tela de Entradas** — tela principal deste nó
- **Resumo Financeiro** — total a receber e total recebido
- **Dashboard** — próximas entradas esperadas
- **Alertas** — saldo baixo em relação às entradas esperadas

---

## Checklist de Implementação

### Banco de Dados
- [ ] Tabela `incomes` criada com RLS
- [ ] `CHECK (status IN ('expected', 'received', 'cancelled'))` configurado
- [ ] `CHECK (amount > 0)` configurado
- [ ] Índice em `(user_id, status)` criado
- [ ] Índice em `(user_id, expected_date)` criado

### Backend / Services
- [ ] `incomesService.ts` com funções:
  - [ ] `getIncomes(userId, filters?)` — listar com filtros
  - [ ] `getIncomesByMonth(userId, year, month)` — por mês
  - [ ] `getTotalReceived(userId, year, month)` — total recebido no mês
  - [ ] `getTotalExpected(userId, year, month)` — total ainda a receber
  - [ ] `createIncome(data)` — criar
  - [ ] `updateIncome(id, data)` — atualizar
  - [ ] `markAsReceived(id, receivedDate?, actualAmount?)` — ação específica
  - [ ] `cancelIncome(id)` — cancelar
  - [ ] `deleteIncome(id)` — excluir
- [ ] `useIncomes` hook criado

### Frontend
- [ ] Página `IncomesPage` criada
- [ ] Lista separada em seções: "A Receber" | "Recebido" | "Cancelado"
- [ ] Botão de ação rápida "Marcar como Recebido" em cada item pendente
- [ ] Formulário de criação/edição
- [ ] Modal de confirmação ao marcar como recebido (com campo de valor real)
- [ ] Totais por seção visíveis
- [ ] Estado vazio com CTA
- [ ] Chip de status colorido em cada item (azul=esperado, verde=recebido, cinza=cancelado)

---

## Histórico do Nó

| Data | Evento | Responsável |
|---|---|---|
| 2026-06-07 | Nó criado e documentado | Sessão 001 |
| - | Tabela criada | - |
| - | Services implementados | - |
| - | Tela implementada | - |
