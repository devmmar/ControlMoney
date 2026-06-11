# Alerts Node — Alertas Inteligentes

> Nó funcional do sistema de alertas do ControlMoney.

---

## Objetivo

Notificar o usuário de forma proativa e amigável sobre comportamentos financeiros que merecem atenção: limites de categoria atingidos, saldo baixo, previsão negativa, picos de gasto e contas que comprometem a renda.

---

## Dados Envolvidos

Este nó não tem tabela própria na v1 — os alertas são calculados em runtime com base nos dados existentes.

| Fonte de Dados | Uso |
|---|---|
| `expenses` + `categories.monthly_limit` | Alertas de limite de categoria |
| `financial-summary-node` (calculado) | Alertas de saldo baixo e previsão negativa |
| `fixed_bills` | Alertas de contas comprometendo a renda |
| `expenses` agregados por dia | Alertas de pico diário |

---

## Regras de Negócio (Critérios de Disparo)

### ALERTA-001 — Limite de Categoria Próximo
```
Dispara quando: gasto_categoria_mes / monthly_limit >= 0.80 E < 1.00
Tipo: warning (amarelo)
Mensagem: "Você já usou {X}% do limite de {categoria} este mês."
```

### ALERTA-002 — Limite de Categoria Ultrapassado
```
Dispara quando: gasto_categoria_mes / monthly_limit >= 1.00
Tipo: danger (vermelho)
Mensagem: "Limite de {categoria} ultrapassado! Você gastou {X}% a mais do planejado."
```

### ALERTA-003 — Previsão do Próximo Mês Abaixo de 20% da Renda
```
Dispara quando: previsao_proximo_mes < (total_recebido_mes * 0.20)
Tipo: warning
Mensagem: "Sua previsão para o próximo mês está baixa. Considere revisar os gastos."
```

### ALERTA-004 — Previsão do Próximo Mês Negativa
```
Dispara quando: previsao_proximo_mes < 0
Tipo: danger
Mensagem: "Atenção: sua previsão para o próximo mês está negativa (R$ {valor})."
```

### ALERTA-005 — Contas Fixas Comprometendo Mais de 70% da Renda
```
Dispara quando: total_contas_fixas / total_recebido > 0.70
Tipo: warning
Mensagem: "Suas contas fixas representam {X}% da sua renda. Fique de olho!"
```

### ALERTA-006 — Pico de Gasto Diário
```
Dispara quando: gasto_hoje > media_diaria_mes * 2.5 E gasto_hoje > 50 (threshold mínimo)
Tipo: info (azul)
Mensagem: "Hoje você gastou {R$ valor}, bem acima da sua média diária ({R$ media})."
```

### ALERTA-007 — Mês Com Mais de 80% do Orçamento Usado
```
Dispara quando: total_saidas_mes / (total_recebido + saldo_anterior) >= 0.80
E ainda faltam mais de 5 dias no mês
Tipo: warning
Mensagem: "Você já usou {X}% do seu orçamento e o mês ainda não acabou."
```

---

## Regras de Apresentação

### Tom de Linguagem
- Nunca alarmista. Nunca culpar o usuário.
- Usar primeira pessoa ("Você gastou..." não "LIMITE EXCEDIDO!")
- Informativo e útil — sempre dar um contexto
- Sugerir uma ação quando possível

### Hierarquia Visual
1. `danger` (vermelho) — situações críticas que requerem atenção
2. `warning` (amarelo) — avisos preventivos
3. `info` (azul) — informações úteis sem urgência

### Onde Aparecem
- **Dashboard:** os 3 alertas mais relevantes em destaque
- **Tela de Alertas:** lista completa de todos os alertas ativos
- **Tela de Categorias:** badge de percentual de uso ao lado de cada categoria com limite

### Ordem de Prioridade
1. Alertas `danger` primeiro
2. Dentro de cada tipo, ordenar por relevância financeira (maior impacto primeiro)
3. Máximo de 3 alertas visíveis no dashboard (ver mais = navegar para tela de alertas)

---

## Agentes Conectados

| Agente | Papel |
|---|---|
| finance-rules-agent | Define as fórmulas e critérios de disparo |
| frontend-senior-agent | Implementa o componente de alerta e a tela |
| ui-ux-agent | Define como os alertas são apresentados visualmente |
| backend-senior-agent | Coleta os dados necessários para calcular alertas |

---

## Dependências

- [auth-user-node](auth-user-node.md) — `user_id`
- [financial-summary-node](financial-summary-node.md) — saldo atual, previsão
- [expenses-node](expenses-node.md) — saídas por categoria e por dia
- [categories-node](categories-node.md) — limites mensais das categorias
- [fixed-bills-node](fixed-bills-node.md) — total de contas fixas
- [income-receivable-node](income-receivable-node.md) — total recebido

---

## Impacta Quais Telas

- **Dashboard** — seção de alertas ativos
- **Tela de Alertas** — lista completa

---

## Checklist de Implementação

### Hook de Alertas
- [ ] `useAlerts(userId, year, month)` hook criado
  - [ ] Calcula ALERTA-001 e ALERTA-002 (limites de categoria)
  - [ ] Calcula ALERTA-003 e ALERTA-004 (previsão)
  - [ ] Calcula ALERTA-005 (contas vs. renda)
  - [ ] Calcula ALERTA-006 (pico diário)
  - [ ] Calcula ALERTA-007 (orçamento mensal)
  - [ ] Retorna lista ordenada por prioridade
  - [ ] Filtra alertas com dados insuficientes (ex: sem contas nem limites)

### Frontend
- [ ] Componente `AlertCard` criado (3 variantes: danger, warning, info)
- [ ] Seção de alertas no Dashboard (máximo 3)
- [ ] Página `AlertsPage` com lista completa
- [ ] Badge numérico no nav indicando quantidade de alertas ativos
- [ ] Estado "sem alertas" com mensagem positiva ("Suas finanças estão em ordem! 🎉")

---

## Histórico do Nó

| Data | Evento | Responsável |
|---|---|---|
| 2026-06-07 | Nó criado e documentado | Sessão 001 |
| - | Hook de alertas implementado | - |
| - | Tela implementada | - |
