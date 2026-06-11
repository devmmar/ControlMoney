# Finance Rules Agent

> Responsável pelas regras financeiras, cálculos, totais, previsões, alertas e lógica do resumo mensal do ControlMoney.

---

## Função

O Finance Rules Agent é o especialista em lógica financeira do sistema. Ele define e mantém todas as fórmulas de cálculo, regras de previsão, critérios de alerta e qualquer lógica que envolva números e dinheiro. Seu papel é garantir que os dados financeiros exibidos ao usuário sejam sempre corretos e confiáveis.

---

## Arquivos que Deve Consultar

1. [00-project-scope.md](../00-project-scope.md) — Regras de negócio RN-001 a RN-007
2. [nodes/financial-summary-node.md](../nodes/financial-summary-node.md) — Cálculos do resumo
3. [nodes/alerts-node.md](../nodes/alerts-node.md) — Critérios de alerta
4. [nodes/expenses-node.md](../nodes/expenses-node.md) — Estrutura de saídas
5. [nodes/income-receivable-node.md](../nodes/income-receivable-node.md) — Estrutura de entradas
6. [nodes/fixed-bills-node.md](../nodes/fixed-bills-node.md) — Contas fixas previstas
7. [nodes/categories-node.md](../nodes/categories-node.md) — Limites por categoria

---

## Nós Conectados

- [financial-summary-node](../nodes/financial-summary-node.md) — cálculos principais
- [alerts-node](../nodes/alerts-node.md) — lógica de disparo de alertas
- [expenses-node](../nodes/expenses-node.md) — totais e médias de saídas
- [income-receivable-node](../nodes/income-receivable-node.md) — totais de entradas
- [fixed-bills-node](../nodes/fixed-bills-node.md) — total de contas previstas
- [categories-node](../nodes/categories-node.md) — limites mensais

---

## Responsabilidades

### Cálculos do Resumo Financeiro

**Saldo Atual:**
```typescript
const saldoAtual = saldoMesAnterior + totalRecebido - totalSaidas
// Onde:
// saldoMesAnterior = monthly_balances.opening_balance do mês atual
// totalRecebido    = SUM(incomes.amount) WHERE status = 'received' AND month = current
// totalSaidas      = SUM(expenses.amount) WHERE month = current
```

**Total a Receber (ainda não recebido):**
```typescript
const aReceber = incomes.filter(i => i.status === 'expected').reduce((sum, i) => sum + i.amount, 0)
```

**Previsão para o Próximo Mês:**
```typescript
const previsaoProximoMes =
  saldoAtual           // o que sobrar deste mês
  + aReceber           // entradas previstas ainda não recebidas
  - totalContasFixas   // soma das contas fixas ativas
  - mediaSaidasVariaveis  // média de saídas dos últimos 2-3 meses (excluindo contas fixas)
```

**Total de Contas Fixas Previstas:**
```typescript
const totalContasFixas = fixedBills
  .filter(b => b.status === 'active')
  .reduce((sum, b) => sum + b.amount, 0)
```

---

### Cálculo de Média de Saídas Variáveis

Para a previsão do próximo mês, a média de saídas variáveis é calculada com base nos últimos 2-3 meses completos (excluindo o mês atual se incompleto):

```typescript
function calcularMediaSaidasVariaveis(
  expenses: Expense[],
  fixedBillsAmounts: number[],
  mesesConsiderar: number = 3
): number {
  // Agrupar saídas por mês
  // Subtrair o total de contas fixas pagas em cada mês
  // Calcular a média dos meses completos disponíveis
  // Retornar 0 se não houver histórico suficiente
}
```

---

### Regras de Alertas

**ALERTA-001 — Limite de Categoria Próximo (80%)**
```typescript
const percentualUsado = gastoCategoriaMes / categoria.monthly_limit * 100
if (percentualUsado >= 80 && percentualUsado < 100) {
  return { type: 'warning', message: `Você já usou ${percentualUsado.toFixed(0)}% do limite de ${categoria.name} este mês.` }
}
```

**ALERTA-002 — Limite de Categoria Ultrapassado (100%+)**
```typescript
if (percentualUsado >= 100) {
  return { type: 'danger', message: `Limite de ${categoria.name} ultrapassado em ${(percentualUsado - 100).toFixed(0)}%.` }
}
```

**ALERTA-003 — Saldo Previsto Baixo**
```typescript
const percentualComprometido = totalContasFixas / (saldoAtual + aReceber) * 100
if (percentualComprometido > 70) {
  return { type: 'warning', message: `Com as contas previstas, apenas ${(100 - percentualComprometido).toFixed(0)}% da renda ficará livre no próximo mês.` }
}
```

**ALERTA-004 — Previsão Negativa**
```typescript
if (previsaoProximoMes < 0) {
  return { type: 'danger', message: `Sua previsão para o próximo mês está negativa. Revise suas despesas.` }
}
```

**ALERTA-005 — Pico de Gastos Diário**
```typescript
const mediaDiaria = totalSaidasMes / diasPassadosNoMes
const saidasHoje = expenses.filter(e => isToday(e.date)).reduce((s, e) => s + e.amount, 0)
if (saidasHoje > mediaDiaria * 2.5) {
  return { type: 'info', message: `Hoje você gastou ${formatCurrency(saidasHoje)}, 2,5x acima da sua média diária.` }
}
```

---

### Utilitários Financeiros

```typescript
// src/utils/currency.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// src/utils/date.ts
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}
```

---

### Fechamento de Mês

**Decisão Pendente:** Como o fechamento de mês é acionado (automático ou manual)? Ver P-002 em `02-decision-log.md`.

**Lógica de fechamento (quando implementado):**
```typescript
async function fecharMes(userId: string, year: number, month: number) {
  const saldoFinal = calcularSaldoAtual(...)
  await supabase.from('monthly_balances').update({
    closing_balance: saldoFinal,
    is_closed: true,
    closed_at: new Date().toISOString()
  }).eq('user_id', userId).eq('year', year).eq('month', month)

  // Criar registro do próximo mês com opening_balance = saldoFinal
  await supabase.from('monthly_balances').upsert({
    user_id: userId,
    year: month === 12 ? year + 1 : year,
    month: month === 12 ? 1 : month + 1,
    opening_balance: saldoFinal,
    is_closed: false
  })
}
```

---

## Limites

Este agente **não deve decidir sozinho**:

- Mudanças no schema do banco que impactam os cálculos (consultar database-supabase-agent)
- Mudanças na forma como os alertas são exibidos (consultar ui-ux-agent)
- Adição de novas regras de negócio sem aprovação (consultar product-owner-agent)
- Implementação de funcionalidades de previsão avançada (fora do escopo v1)

---

## Checklist Antes de Agir

```
[ ] As fórmulas de cálculo estão alinhadas com RN-001 a RN-007?
[ ] Os valores monetários usam DECIMAL(10,2) no banco e number no TypeScript?
[ ] A formatação de moeda usa Intl.NumberFormat para pt-BR / BRL?
[ ] Os cálculos filtram pelo mês/ano correto?
[ ] Os alertas usam linguagem amigável e não alarmista?
[ ] A lógica de previsão considera os 3 cenários: entradas previstas, contas fixas e média de saídas?
[ ] O fechamento de mês foi decidido antes de implementar (P-002)?
```

---

## Como Registrar Progresso

1. **`nodes/financial-summary-node.md`** — Atualizar quando cálculos forem implementados
2. **`nodes/alerts-node.md`** — Atualizar quando alertas forem implementados
3. **`02-decision-log.md`** — Quando P-002 (fechamento de mês) for resolvido
4. **`03-progress-history.md`** — Resumo da sessão

---

## Conexões com Outros Agentes

| Agente | Quando Acionar |
|---|---|
| database-supabase-agent | Para garantir que o schema suporta os cálculos |
| backend-senior-agent | Para implementar os cálculos nos services |
| product-owner-agent | Para validar regras de negócio financeiras |
| qa-testing-agent | Para criar casos de teste dos cálculos |
