# Dashboard Node — Painel Principal

> Nó funcional da página inicial (Dashboard) do ControlMoney.

---

## Objetivo

Ser a primeira tela que o usuário vê após o login. O dashboard deve oferecer uma visão geral completa da situação financeira do mês atual, com atalhos rápidos para as ações mais frequentes e alertas visíveis sem precisar navegar.

---

## Dados Envolvidos

O dashboard agrega dados de vários nós — ele é uma tela de consumo, não de produção de dados:

| Dado | Origem |
|---|---|
| Saldo atual | [financial-summary-node](financial-summary-node.md) |
| Total de saídas | [expenses-node](expenses-node.md) |
| Total a receber | [income-receivable-node](income-receivable-node.md) |
| Total de contas fixas | [fixed-bills-node](fixed-bills-node.md) |
| Alertas ativos | [alerts-node](alerts-node.md) |
| Próximas contas a vencer | [fixed-bills-node](fixed-bills-node.md) |
| Próximas entradas esperadas | [income-receivable-node](income-receivable-node.md) |
| Resumo diário (semana atual) | [daily-summary-node](daily-summary-node.md) |

---

## Regras de Negócio

### RN-DASH-001 — Dados do Mês Atual
Por padrão, todos os indicadores do dashboard são do mês atual. Não há seletor de mês no dashboard — para ver meses anteriores, navegar para as abas específicas.

### RN-DASH-002 — Saldo em Destaque
O saldo atual é o elemento visual mais proeminente do dashboard. Deve ser grande, legível e colorido (verde = positivo, vermelho = negativo).

### RN-DASH-003 — Ação Rápida de Nova Saída
O botão de ação mais acessível do dashboard deve abrir o formulário de nova saída. Esta é a ação mais frequente do usuário.

### RN-DASH-004 — Alertas Limitados
Máximo de 3 alertas no dashboard. Se houver mais, mostrar "Ver todos os alertas (N)" com link para a tela de alertas.

### RN-DASH-005 — Estado de Boas-Vindas
Na primeira vez que o usuário entra (sem dados), o dashboard deve exibir um estado de boas-vindas com orientação sobre como começar.

---

## Agentes Conectados

| Agente | Papel |
|---|---|
| frontend-senior-agent | Implementa a página do dashboard |
| ui-ux-agent | Define o layout e fluxos de interação |
| design-system-agent | Define os componentes de card e layout |
| finance-rules-agent | Garante que os números exibidos estão corretos |

---

## Dependências

- **Todos os outros nós** — o dashboard é um agregador

---

## Impacta Quais Telas

- **Página Dashboard** — este é o nó
- É impactado por mudanças em todos os outros nós (uma nova saída atualiza os cards do dashboard)

---

## Layout do Dashboard

### Desktop (grid layout)

```
┌─────────────────────────────────────────────────────────────┐
│  Olá, [nome]! Mês: Junho 2026           [+ Nova Saída]      │
├────────────┬────────────┬────────────┬────────────────────  │
│ Saldo Atual│ Saídas     │ A Receber  │ Contas Fixas          │
│ R$ 2.450   │ R$ 1.847   │ R$ 800     │ R$ 1.200             │
│ (grande)   │ (médio)    │ (médio)    │ (médio)              │
├────────────┴────────────┴────────────┴────────────────────  │
│ ALERTAS (máximo 3)                                          │
│ ⚠ Você já usou 85% do limite de Lazer este mês.            │
│ ℹ Hoje você gastou 2x acima da média diária.               │
├─────────────────────────────┬───────────────────────────── │
│ PRÓXIMAS CONTAS (7 dias)    │ PRÓXIMAS ENTRADAS            │
│ • Netflix – R$ 39,90 dia 10 │ • Salário – R$ 3.200 dia 5  │
│ • Aluguel – R$ 800 dia 15   │                              │
├─────────────────────────────┴───────────────────────────── │
│ RESUMO DIÁRIO (7 últimos dias)                              │
│ Ter  Qua  Qui  Sex  Sáb  Dom  Seg                          │
│ 45   230  67   312  0    145  88                            │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (stack vertical)

```
┌──────────────────────────────────┐
│ Saldo Atual: R$ 2.450,00         │
│ Junho 2026                       │
├──────────────────────────────────┤
│ [Saídas R$ 1.847] [A Receber R$800] │
│ [Contas R$ 1.200] [Recebido R$ 3.200]│
├──────────────────────────────────┤
│ ⚠ Alerta 1                       │
│ ℹ Alerta 2                       │
├──────────────────────────────────┤
│ Próximas contas: Netflix dia 10  │
│ Próximas entradas: Salário dia 5 │
├──────────────────────────────────┤
│ [+ Nova Saída]  (botão flutuante)│
└──────────────────────────────────┘
```

---

## Checklist de Implementação

### Dados e Hooks
- [ ] `useDashboardSummary(userId, year, month)` hook criado
  - Agrega dados de todos os nós necessários em uma única chamada ou calls paralelas
- [ ] Loading states individuais por seção (não bloquear tudo por causa de um dado lento)

### UI — Cards de Resumo
- [ ] Card "Saldo Atual" — grande, verde/vermelho
- [ ] Card "Total de Saídas" — valor com ícone
- [ ] Card "A Receber" — entradas previstas
- [ ] Card "Contas Fixas" — total previsto

### UI — Seções
- [ ] Seção de alertas (máximo 3, link "ver todos")
- [ ] Seção "Próximas Contas" (7 dias)
- [ ] Seção "Próximas Entradas"
- [ ] Seção "Resumo Diário" (últimos 7 dias com barra visual)

### UI — Interatividade
- [ ] Botão flutuante / CTA para "Nova Saída"
- [ ] Cards clicáveis que navegam para a tela correspondente
- [ ] Estado de boas-vindas para usuário sem dados
- [ ] Refresh automático após criar uma nova saída

---

## Histórico do Nó

| Data | Evento | Responsável |
|---|---|---|
| 2026-06-07 | Nó criado e documentado | Sessão 001 |
| - | Layout finalizado com ui-ux-agent | - |
| - | Dashboard implementado | - |
