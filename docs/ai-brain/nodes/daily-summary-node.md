# Daily Summary Node — Resumo Diário

> Nó funcional da aba de Resumo Diário do ControlMoney.

---

## Objetivo

Exibir ao usuário todos os dias do mês com o valor total gasto em cada dia, permitindo identificar rapidamente em quais dias os gastos foram mais altos e entender o padrão de consumo ao longo do mês.

---

## Dados Envolvidos

Este nó não tem tabela própria — consome dados da tabela `expenses`.

| Dado | Origem | Cálculo |
|---|---|---|
| Total por dia | `expenses` | `SUM(amount) GROUP BY date` para o mês selecionado |
| Dias do mês | Gerado em runtime | Todos os dias do mês, mesmo sem saídas (valor = 0) |
| Mês de referência | Parâmetro/state | `year` e `month` selecionados pelo usuário |

---

## Regras de Negócio

### RN-DAILY-001 — Todos os Dias Aparecem
Mesmo que não haja saídas em um dia, o dia deve aparecer na lista com valor R$ 0,00. Isso evita confusão sobre dias "faltantes".

### RN-DAILY-002 — Agrupamento por Data
As saídas são agrupadas pela coluna `date` da tabela `expenses`. Uma saída registrada no dia 15 aparece na linha do dia 15.

### RN-DAILY-003 — Navegação por Mês
O usuário pode navegar entre meses (anterior/próximo). O mês atual é o padrão.

### RN-DAILY-004 — Destaque Visual para Dias de Alto Gasto
Dias com gasto acima de 1,5x a média diária do mês devem ter destaque visual para ajudar na identificação de picos.

### RN-DAILY-005 — Total do Mês
Exibir o total somado de todos os dias no topo ou rodapé da tela.

---

## Agentes Conectados

| Agente | Papel |
|---|---|
| backend-senior-agent | Implementa query de `getExpensesByDay(userId, year, month)` |
| frontend-senior-agent | Implementa a tela com lista ou calendário de dias |
| finance-rules-agent | Define a lógica de destaque de dias de alto gasto |
| ui-ux-agent | Define o layout visual da tela (lista ou calendário?) |

---

## Dependências

- [auth-user-node](auth-user-node.md) — `user_id`
- [expenses-node](expenses-node.md) — dados de saídas por dia

---

## Impacta Quais Telas

- **Tela de Resumo Diário** — tela principal deste nó
- **Dashboard** — mini-versão do resumo diário (semana atual)

---

## Proposta de Layout

**Opção A — Lista vertical de dias:**
```
Junho 2026                    Total: R$ 1.847,00
───────────────────────────────────────────────
Dom 01    R$ 0,00            ░░░░░░░░░░░░░░░░░░
Seg 02    R$ 45,90           ░░░░░░░░░░
Ter 03    R$ 0,00            ░░░░░░░░░░░░░░░░░░
Qua 04    R$ 230,00  ⚠       ████████████████
Qui 05    R$ 67,50           ░░░░░░░░░░░░░░
Sáb 07    R$ 312,00  ⚠       ██████████████████████
...
```
Barra proporcional ao valor. Ícone ⚠ para dias acima de 1,5x a média.

**Opção B — Calendário mensal com heatmap:**
Cada célula do calendário colorida de acordo com o valor (verde leve = pouco, laranja/vermelho = muito).

A decisão entre as opções fica para o `ui-ux-agent`.

---

## Checklist de Implementação

### Backend / Services
- [ ] Função `getExpensesByDay(userId, year, month)` no `expensesService.ts`
  - Agrupa saídas por `date`, soma os valores
  - Retorna array com todos os dias do mês (incluindo dias sem saídas como 0)
- [ ] `useDailySummary(year, month)` hook criado

### Frontend
- [ ] Página `DailySummaryPage` criada
- [ ] Componente de lista/calendário de dias
- [ ] Total do mês exibido no topo
- [ ] Navegação entre meses
- [ ] Destaque visual para dias acima de 1,5x a média
- [ ] Ao clicar em um dia, mostrar as saídas daquele dia (drawer ou modal)
- [ ] Estado de loading com skeletons
- [ ] Estado vazio (nenhuma saída no mês)

---

## Histórico do Nó

| Data | Evento | Responsável |
|---|---|---|
| 2026-06-07 | Nó criado e documentado | Sessão 001 |
| - | Query implementada | - |
| - | Tela implementada | - |
