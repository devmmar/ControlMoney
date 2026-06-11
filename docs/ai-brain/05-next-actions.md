# 05 — Next Actions: Fila de Próximas Ações

> Fila priorizada de tarefas a executar no projeto.
> Atualizar ao final de cada sessão: marcar concluído, ajustar prioridades.
> Última atualização: 2026-06-07

---

## Legenda de Status

- `[ ]` — Pendente
- `[x]` — Concluído
- `[~]` — Em andamento
- `[!]` — Bloqueado (aguardando decisão)

---

## Prioridade Alta

### Fase 0 — Documentação e Decisões Iniciais

- [x] **DOC-001** — Criar estrutura `docs/ai-brain/` completa
  - Concluído em: 2026-06-07
  - Agente: Todos

- [!] **DEC-001** — Definir paleta de cores principal do Design System
  - Bloqueado: aguarda escolha do usuário (azul, roxo, verde?)
  - Agente: design-system-agent
  - Impacta: todos os componentes visuais

- [!] **DEC-002** — Definir como o fechamento de mês é acionado
  - Bloqueado: automático por data ou botão manual do usuário?
  - Agente: finance-rules-agent, product-owner-agent
  - Impacta: `financial-summary-node`, `monthly_balances`

### Fase 1 — Setup Técnico

- [x] **SETUP-001** — Criar projeto React com Vite + TypeScript — Concluído em 2026-06-07
- [x] **SETUP-002** — Configurar Tailwind CSS no projeto — Concluído em 2026-06-07
- [x] **SETUP-003** — Criar `.env.example` com as variáveis necessárias — Concluído em 2026-06-07
- [x] **SETUP-004** — Definir e criar estrutura de pastas do projeto React — Concluído em 2026-06-07
- [x] **SETUP-005** — Configurar React Router com todas as rotas — Concluído em 2026-06-07

- [ ] **SETUP-006** — **[AÇÃO DO USUÁRIO]** Criar projeto no Supabase e configurar `.env`
  - Ir em supabase.com → criar projeto → Settings → API → copiar URL e anon key para `.env`
  - Depende de: nada (ação manual)

### Fase 2 — Banco de Dados

- [ ] **DB-001** — Modelar e criar tabela `categories` com RLS no Supabase
  - Agente: database-supabase-agent, security-data-agent
  - Depende de: **SETUP-006** (usuário criar projeto Supabase + `.env`)
  - Nó: [categories-node](nodes/categories-node.md)

- [ ] **DB-002** — Modelar e criar tabela `expenses` com RLS
  - Agente: database-supabase-agent, security-data-agent
  - Depende de: DB-001
  - Nó: [expenses-node](nodes/expenses-node.md)

- [ ] **DB-003** — Modelar e criar tabela `incomes` com RLS
  - Agente: database-supabase-agent, security-data-agent
  - Depende de: SETUP-003
  - Nó: [income-receivable-node](nodes/income-receivable-node.md)

- [ ] **DB-004** — Modelar e criar tabela `fixed_bills` com RLS
  - Agente: database-supabase-agent, security-data-agent
  - Depende de: DB-001
  - Nó: [fixed-bills-node](nodes/fixed-bills-node.md)

- [ ] **DB-005** — Modelar e criar tabela `monthly_balances` com RLS
  - Agente: database-supabase-agent, finance-rules-agent
  - Depende de: DEC-002
  - Nó: [financial-summary-node](nodes/financial-summary-node.md)

### Fase 3 — Autenticação

- [x] **AUTH-001** — Login com email/senha via Supabase Auth — implementado em `Login.tsx`
- [x] **AUTH-002** — Tela de Login — `src/pages/Login.tsx` — Concluído em 2026-06-07
- [x] **AUTH-003** — Tela de Cadastro — `src/pages/Register.tsx` — Concluído em 2026-06-07
- [x] **AUTH-004** — PrivateRoute + AuthContext — Concluído em 2026-06-07

---

## Prioridade Média

### Fase 4 — Módulos Core

- [ ] **FEAT-001** — CRUD de Categorias
  - Agente: frontend-senior-agent, backend-senior-agent
  - Depende de: DB-001, AUTH-004
  - Nó: [categories-node](nodes/categories-node.md)

- [ ] **FEAT-002** — CRUD de Saídas
  - Agente: frontend-senior-agent, backend-senior-agent
  - Depende de: DB-002, FEAT-001
  - Nó: [expenses-node](nodes/expenses-node.md)

- [ ] **FEAT-003** — CRUD de Entradas a Receber
  - Agente: frontend-senior-agent, backend-senior-agent
  - Depende de: DB-003, AUTH-004
  - Nó: [income-receivable-node](nodes/income-receivable-node.md)

- [ ] **FEAT-004** — CRUD de Contas Fixas
  - Agente: frontend-senior-agent, backend-senior-agent
  - Depende de: DB-004, FEAT-001
  - Nó: [fixed-bills-node](nodes/fixed-bills-node.md)

- [ ] **FEAT-005** — Implementar Resumo Financeiro
  - Agente: frontend-senior-agent, finance-rules-agent
  - Depende de: FEAT-001 a FEAT-004, DB-005
  - Nó: [financial-summary-node](nodes/financial-summary-node.md)

- [ ] **FEAT-006** — Implementar Resumo Diário
  - Agente: frontend-senior-agent, finance-rules-agent
  - Depende de: FEAT-002
  - Nó: [daily-summary-node](nodes/daily-summary-node.md)

- [ ] **FEAT-007** — Criar Dashboard principal
  - Agente: frontend-senior-agent, ui-ux-agent
  - Depende de: FEAT-001 a FEAT-006
  - Nó: [dashboard-node](nodes/dashboard-node.md)

---

## Prioridade Baixa

### Fase 5 — Alertas e Refinamentos

- [ ] **FEAT-008** — Implementar Sistema de Alertas Inteligentes
  - Agente: finance-rules-agent, frontend-senior-agent
  - Depende de: FEAT-005, FEAT-006
  - Nó: [alerts-node](nodes/alerts-node.md)

- [ ] **FEAT-009** — Resumo por Categoria (com gráficos)
  - Agente: frontend-senior-agent, finance-rules-agent
  - Depende de: FEAT-002, FEAT-001

- [ ] **FEAT-010** — Dark mode (opcional para v1)
  - Agente: design-system-agent, frontend-senior-agent
  - Depende de: design system completo

### Fase 6 — Qualidade

- [ ] **QA-001** — Testes de validação das regras financeiras
  - Agente: qa-testing-agent, finance-rules-agent
  - Depende de: FEAT-005

- [ ] **QA-002** — Testes de isolamento de dados por usuário (RLS)
  - Agente: qa-testing-agent, security-data-agent
  - Depende de: todas as tabelas com RLS

- [ ] **QA-003** — Revisão de acessibilidade e responsividade
  - Agente: qa-testing-agent, ui-ux-agent
  - Depende de: todas as telas criadas

---

## Arquivos Relacionados

- → [04-current-state.md](04-current-state.md) — Estado atual (qual fase estamos)
- → [02-decision-log.md](02-decision-log.md) — Decisões pendentes que bloqueiam ações
- → [03-progress-history.md](03-progress-history.md) — O que já foi concluído
