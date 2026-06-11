# Financial Summary Node — Resumo Financeiro

> Nó funcional da aba de Resumo Financeiro do ControlMoney.

---

## Objetivo

Apresentar ao usuário uma visão completa e calculada de sua situação financeira no mês atual, incluindo saldo herdado, entradas, saídas, contas previstas e previsão para o próximo mês.

---

## Dados Envolvidos

| Campo | Origem | Tipo |
|---|---|---|
| Saldo herdado do mês passado | `monthly_balances.opening_balance` | DECIMAL |
| Total a receber | `incomes WHERE status = 'expected'` | DECIMAL calculado |
| Total já recebido | `incomes WHERE status = 'received'` | DECIMAL calculado |
| Total de contas fixas | `fixed_bills WHERE status = 'active'` | DECIMAL calculado |
| Total de saídas | `expenses` do mês atual | DECIMAL calculado |
| Saldo atual | Calculado em runtime | DECIMAL calculado |
| Previsão próximo mês | Calculado em runtime | DECIMAL calculado |

---

## Regras de Negócio

### RN-001 — Fórmula do Saldo Atual
```
Saldo Atual = opening_balance (mês atual) + Total Recebido - Total de Saídas
```

### RN-002 — Herança de Saldo Mensal
- O `opening_balance` do mês atual é o `closing_balance` do mês anterior
- No primeiro uso do sistema, `opening_balance` = 0 (ou valor informado pelo usuário)
- O fechamento automático x manual ainda está pendente (ver P-002 em `02-decision-log.md`)

### RN-003 — Fórmula da Previsão do Próximo Mês
```
Previsão = Saldo Atual + Total a Receber - Total Contas Fixas Ativas - Média de Saídas Variáveis
```
Onde "Média de Saídas Variáveis" = média dos últimos 2-3 meses (excluindo contas fixas).

### RN-004 — Saldo Negativo
- Saldo negativo é possível e deve ser exibido
- Cor vermelha para valores negativos, verde para positivos

### RN-005 — Mês de Referência
- Por padrão, exibir o mês atual
- Deve permitir navegar para meses anteriores para consulta histórica

---

## Agentes Conectados

| Agente | Papel |
|---|---|
| finance-rules-agent | Define as fórmulas e lógica de cálculo |
| backend-senior-agent | Implementa queries de aggregation no Supabase |
| frontend-senior-agent | Implementa a tela e os cards visuais |
| database-supabase-agent | Mantém a tabela `monthly_balances` |
| ui-ux-agent | Define o layout e experiência da tela |

---

## Dependências

Este nó depende de:
- [auth-user-node](auth-user-node.md) — precisa do `user_id` autenticado
- [income-receivable-node](income-receivable-node.md) — dados de entradas
- [expenses-node](expenses-node.md) — dados de saídas
- [fixed-bills-node](fixed-bills-node.md) — total de contas fixas

---

## Impacta Quais Telas

- **Tela de Resumo Financeiro** — tela principal deste nó
- **Dashboard** — cards de resumo exibem subconjunto dos dados deste nó

---

## Checklist de Implementação

### Banco de Dados
- [ ] Tabela `monthly_balances` criada com RLS
- [ ] Policy de acesso configurada
- [ ] Lógica de criação automática do `opening_balance` para cada mês

### Backend / Services
- [ ] `summaryService.ts` com função `getFinancialSummary(userId, year, month)`
- [ ] Query para total de saídas do mês
- [ ] Query para total recebido do mês
- [ ] Query para total a receber do mês
- [ ] Query para total de contas fixas ativas
- [ ] Cálculo do saldo atual
- [ ] Cálculo da previsão do próximo mês
- [ ] `useFinancialSummary` hook criado

### Frontend
- [ ] Página `FinancialSummaryPage` criada
- [ ] Card: "Saldo do Mês Anterior" (verde/vermelho conforme valor)
- [ ] Card: "Total a Receber" (azul/info)
- [ ] Card: "Já Recebido" (verde)
- [ ] Card: "Contas Fixas Previstas" (laranja/warning)
- [ ] Card: "Total de Saídas" (vermelho)
- [ ] Card: "Saldo Atual" (destaque maior, verde/vermelho)
- [ ] Card: "Previsão Próximo Mês" (com indicador visual)
- [ ] Navegação entre meses (anterior/próximo)
- [ ] Estado de loading com skeletons
- [ ] Estado para primeiro mês sem histórico

---

## Histórico do Nó

| Data | Evento | Responsável |
|---|---|---|
| 2026-06-07 | Nó criado e documentado | Sessão 001 |
| - | Banco de dados criado | - |
| - | Services implementados | - |
| - | Tela implementada | - |
