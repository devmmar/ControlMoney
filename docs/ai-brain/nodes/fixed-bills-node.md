# Fixed Bills Node — Contas Fixas Previstas

> Nó funcional da aba de Contas Fixas do ControlMoney.

---

## Objetivo

Permitir ao usuário cadastrar e gerenciar contas fixas recorrentes (aluguel, internet, streaming, academia, etc.) que impactam o planejamento financeiro. Essas contas são **previsões**, não saídas reais — elas alimentam o cálculo de "Total de Contas Previstas" no resumo financeiro.

---

## Dados Envolvidos

### Tabela: `fixed_bills`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Chave primária |
| `user_id` | UUID | Sim | Dono do registro |
| `category_id` | UUID | Não | Categoria (nullable) |
| `description` | TEXT | Sim | Nome da conta (ex: "Aluguel", "Netflix") |
| `amount` | DECIMAL(10,2) | Sim | Valor previsto |
| `due_day` | INTEGER | Sim | Dia do mês de vencimento (1-31) |
| `recurrence` | TEXT | Sim | `monthly`, `annual`, `custom` |
| `status` | TEXT | Sim | `active`, `paused`, `cancelled` |
| `notes` | TEXT | Não | Observações |
| `created_at` | TIMESTAMPTZ | Auto | Criado em |
| `updated_at` | TIMESTAMPTZ | Auto | Atualizado em |

---

## Regras de Negócio

### RN-FB-001 — Contas Fixas São Previsões, Não Saídas
Contas fixas cadastradas **não entram** no registro de saídas. Elas são planejamento. Quando o usuário efetivamente pagar a conta, deve registrar a saída separadamente.

Isso permite:
- Planejar o mês antes das despesas acontecerem
- Comparar o planejado com o realizado

**Decisão Pendente P-003:** Deve haver vinculação entre uma saída real e a conta fixa prevista? Aguarda decisão.

### RN-FB-002 — Apenas Contas Ativas Entram no Total
`SUM(amount) WHERE status = 'active'` é o valor usado no resumo financeiro.
- `paused` = conta existe mas está temporariamente suspensa (ex: plano pausado)
- `cancelled` = conta foi cancelada definitivamente

### RN-FB-003 — Dia de Vencimento
O `due_day` indica qual dia do mês a conta vence. Se o dia não existir no mês (ex: dia 31 em fevereiro), considerar o último dia do mês.

### RN-FB-004 — Recorrência
- `monthly` = todo mês (o mais comum)
- `annual` = uma vez por ano (ex: IPVA, licenciamento)
- `custom` = definição futura (v2)

Para contas anuais (`annual`), só impactam o mês do vencimento.

### RN-FB-005 — Próximas Contas a Vencer
O dashboard deve exibir as contas fixas com vencimento nos próximos 7 dias, ordenadas por `due_day`.

---

## Agentes Conectados

| Agente | Papel |
|---|---|
| backend-senior-agent | Implementa `fixedBillsService.ts` e hook |
| frontend-senior-agent | Implementa tela e formulário |
| database-supabase-agent | Cria tabela `fixed_bills` com RLS |
| finance-rules-agent | Usa o total de contas ativas na previsão financeira |
| ui-ux-agent | Define fluxo de gestão de contas recorrentes |

---

## Dependências

- [auth-user-node](auth-user-node.md) — `user_id`
- [categories-node](categories-node.md) — categorias para vincular às contas

---

## Impacta Quais Telas

- **Tela de Contas Fixas** — tela principal deste nó
- **Resumo Financeiro** — total de contas fixas ativas
- **Dashboard** — próximas contas a vencer
- **Alertas** — contas comprometendo muito da renda

---

## Checklist de Implementação

### Banco de Dados
- [ ] Tabela `fixed_bills` criada com RLS
- [ ] `CHECK (due_day BETWEEN 1 AND 31)` configurado
- [ ] `CHECK (recurrence IN ('monthly', 'annual', 'custom'))` configurado
- [ ] `CHECK (status IN ('active', 'paused', 'cancelled'))` configurado

### Backend / Services
- [ ] `fixedBillsService.ts` com funções:
  - [ ] `getFixedBills(userId)` — listar todas as contas
  - [ ] `getActiveFixedBills(userId)` — apenas ativas
  - [ ] `getTotalFixedBills(userId)` — total para o resumo financeiro
  - [ ] `getUpcomingBills(userId, days)` — vencendo nos próximos N dias
  - [ ] `createFixedBill(data)` — criar
  - [ ] `updateFixedBill(id, data)` — atualizar (incluindo mudar status)
  - [ ] `deleteFixedBill(id)` — excluir
- [ ] `useFixedBills` hook criado

### Frontend
- [ ] Página `FixedBillsPage` criada
- [ ] Lista de contas agrupadas por status (ativas / pausadas)
- [ ] Chip de status com cor correspondente
- [ ] Formulário de criação/edição
- [ ] Botão rápido para mudar status (ativa ↔ pausada)
- [ ] Total de contas ativas visível no topo
- [ ] Estado vazio com CTA para adicionar primeira conta
- [ ] Indicador visual de dia de vencimento (próximo? vencido?)

---

## Histórico do Nó

| Data | Evento | Responsável |
|---|---|---|
| 2026-06-07 | Nó criado e documentado | Sessão 001 |
| - | Tabela criada | - |
| - | Services implementados | - |
| - | Tela implementada | - |
