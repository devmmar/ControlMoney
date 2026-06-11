# 01 — Context Map: Mapa de Conexões

> Mostra como agentes e nós funcionais se conectam no projeto ControlMoney.
> Última atualização: 2026-06-07

---

## Diagrama Textual de Conexões

```
                        ┌─────────────────────────────┐
                        │     00-project-scope.md      │
                        │  (Fonte de verdade do projeto)│
                        └──────────────┬──────────────┘
                                       │ todos os agentes respeitam
                                       ▼
              ┌────────────────────────────────────────────┐
              │           product-owner-agent              │
              │   (Guarda o escopo, regras de negócio)     │
              └──┬──────────────────────────────────────┬──┘
                 │ coordena                             │ valida
                 ▼                                      ▼
    ┌────────────────────┐                  ┌────────────────────┐
    │  frontend-senior   │                  │  backend-senior    │
    │      -agent        │◄────────────────►│      -agent        │
    │  (React, UI, hooks)│   integração     │  (services, lógica)│
    └─────────┬──────────┘                  └─────────┬──────────┘
              │ estiliza                              │ usa
              ▼                                       ▼
    ┌──────────────────┐                  ┌────────────────────────┐
    │   ui-ux-agent    │                  │  database-supabase     │
    │  (fluxos, UX)    │                  │       -agent           │
    └────────┬─────────┘                  │  (tabelas, RLS)        │
             │ define visual              └──────────┬─────────────┘
             ▼                                       │ protegido por
    ┌──────────────────────┐                         ▼
    │  design-system-agent │             ┌───────────────────────┐
    │ (cores, componentes) │             │  security-data-agent  │
    └──────────────────────┘             │ (auth, RLS, policies) │
                                         └───────────────────────┘

    ┌──────────────────────┐             ┌───────────────────────┐
    │  finance-rules-agent │             │    qa-testing-agent   │
    │ (cálculos, alertas)  │             │ (testes, validações)  │
    └──────────────────────┘             └───────────────────────┘
```

---

## Mapa Agente → Nós Conectados

### product-owner-agent
Conecta com **todos os nós**. É o guardião do escopo.
- [dashboard-node](nodes/dashboard-node.md)
- [financial-summary-node](nodes/financial-summary-node.md)
- [expenses-node](nodes/expenses-node.md)
- [income-receivable-node](nodes/income-receivable-node.md)
- [fixed-bills-node](nodes/fixed-bills-node.md)
- [categories-node](nodes/categories-node.md)
- [daily-summary-node](nodes/daily-summary-node.md)
- [alerts-node](nodes/alerts-node.md)
- [auth-user-node](nodes/auth-user-node.md)

---

### backend-senior-agent
Foca em lógica de servidor, integração Supabase e services.
- [auth-user-node](nodes/auth-user-node.md) — implementação de auth
- [expenses-node](nodes/expenses-node.md) — service de saídas
- [income-receivable-node](nodes/income-receivable-node.md) — service de entradas
- [fixed-bills-node](nodes/fixed-bills-node.md) — service de contas fixas
- [categories-node](nodes/categories-node.md) — service de categorias
- [financial-summary-node](nodes/financial-summary-node.md) — cálculos e aggregations
- [alerts-node](nodes/alerts-node.md) — lógica de alertas

---

### frontend-senior-agent
Foca em React, TypeScript, estrutura de componentes e hooks.
- [dashboard-node](nodes/dashboard-node.md) — página principal
- [financial-summary-node](nodes/financial-summary-node.md) — tela de resumo
- [expenses-node](nodes/expenses-node.md) — formulários e listas de saídas
- [income-receivable-node](nodes/income-receivable-node.md) — formulários de entradas
- [fixed-bills-node](nodes/fixed-bills-node.md) — tela de contas fixas
- [categories-node](nodes/categories-node.md) — tela de categorias
- [daily-summary-node](nodes/daily-summary-node.md) — tela de resumo diário

---

### database-supabase-agent
Foca em modelagem, tabelas, RLS, policies e integridade do banco.
- [auth-user-node](nodes/auth-user-node.md) — tabela de usuários, auth
- [expenses-node](nodes/expenses-node.md) — tabela `expenses`
- [income-receivable-node](nodes/income-receivable-node.md) — tabela `incomes`
- [fixed-bills-node](nodes/fixed-bills-node.md) — tabela `fixed_bills`
- [categories-node](nodes/categories-node.md) — tabela `categories`
- [financial-summary-node](nodes/financial-summary-node.md) — tabela `monthly_balances`
- [alerts-node](nodes/alerts-node.md) — tabela `alerts` (opcional)

---

### ui-ux-agent
Foca em fluxos de navegação, experiência do usuário e usabilidade.
- [dashboard-node](nodes/dashboard-node.md)
- [expenses-node](nodes/expenses-node.md)
- [income-receivable-node](nodes/income-receivable-node.md)
- [fixed-bills-node](nodes/fixed-bills-node.md)
- [categories-node](nodes/categories-node.md)
- [financial-summary-node](nodes/financial-summary-node.md)
- [daily-summary-node](nodes/daily-summary-node.md)
- [alerts-node](nodes/alerts-node.md)

---

### design-system-agent
Foca no sistema visual: cores, tipografia, componentes base.
- Conecta com **todas as telas** indiretamente
- Define os tokens de design usados por `frontend-senior-agent` e `ui-ux-agent`
- Não conecta diretamente a nós funcionais — define o **como** as telas se parecem

---

### security-data-agent
Foca em segurança, autenticação e proteção de dados financeiros.
- [auth-user-node](nodes/auth-user-node.md) — autenticação e RLS
- Todas as tabelas do Supabase — revisão de policies
- [expenses-node](nodes/expenses-node.md) — garantir isolamento de dados
- [income-receivable-node](nodes/income-receivable-node.md) — idem
- [fixed-bills-node](nodes/fixed-bills-node.md) — idem

---

### finance-rules-agent
Foca nos cálculos financeiros, regras de negócio numéricas e previsões.
- [financial-summary-node](nodes/financial-summary-node.md) — cálculos principais
- [alerts-node](nodes/alerts-node.md) — regras de disparo de alertas
- [expenses-node](nodes/expenses-node.md) — totais e médias
- [income-receivable-node](nodes/income-receivable-node.md) — totais recebidos/previstos
- [fixed-bills-node](nodes/fixed-bills-node.md) — total previsto de contas
- [categories-node](nodes/categories-node.md) — limites de categoria

---

### qa-testing-agent
Foca em testes e validação de comportamento esperado.
- Conecta com **todos os nós** para validar comportamento
- [financial-summary-node](nodes/financial-summary-node.md) — validar cálculos
- [alerts-node](nodes/alerts-node.md) — validar disparo correto de alertas
- [auth-user-node](nodes/auth-user-node.md) — validar isolamento de dados

---

## Mapa Nó → Impacto em Outros Nós

```
categories-node
    └── impacta → expenses-node (categoria das saídas)
    └── impacta → income-receivable-node (categoria das entradas)
    └── impacta → fixed-bills-node (categoria das contas fixas)
    └── impacta → alerts-node (limites por categoria)
    └── impacta → financial-summary-node (resumo por categoria)

expenses-node
    └── impacta → financial-summary-node (total de saídas)
    └── impacta → daily-summary-node (saídas por dia)
    └── impacta → alerts-node (gastos excessivos)
    └── impacta → dashboard-node (cards de resumo)

income-receivable-node
    └── impacta → financial-summary-node (total recebido / a receber)
    └── impacta → alerts-node (saldo baixo)
    └── impacta → dashboard-node (próximas entradas)

fixed-bills-node
    └── impacta → financial-summary-node (total de contas previstas)
    └── impacta → alerts-node (contas comprometendo renda)
    └── impacta → dashboard-node (próximas contas)

auth-user-node
    └── impacta → TODOS os nós (todos os dados são isolados por usuário)

financial-summary-node
    └── impacta → dashboard-node (cards principais)
    └── impacta → alerts-node (previsão baixa)

alerts-node
    └── impacta → dashboard-node (seção de alertas)
```

---

## Arquivos Relacionados

- → [00-project-scope.md](00-project-scope.md) — Escopo e regras principais
- → [agents/](agents/) — Detalhes de cada agente
- → [nodes/](nodes/) — Detalhes de cada nó funcional
