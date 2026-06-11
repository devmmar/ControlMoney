# 02 — Decision Log: Registro de Decisões

> Registro de todas as decisões técnicas e de produto tomadas ao longo do projeto.
> Cada decisão deve ser registrada aqui com motivo e impacto.
> Última atualização: 2026-06-07

---

## Como usar este arquivo

Sempre que uma decisão técnica ou de produto for tomada, adicione uma linha na tabela abaixo.
Decições revogadas devem ter o status atualizado para `Revogada` com nota de substituição.

---

## Registro de Decisões

| # | Data | Decisão | Motivo | Impacto | Agentes Envolvidos | Status |
|---|---|---|---|---|---|---|
| D-001 | 2026-06-07 | Usar React JS como framework frontend | Ecossistema maduro, componentização, grande comunidade e suporte | Toda a camada de UI será React | frontend-senior-agent, ui-ux-agent | Ativa |
| D-002 | 2026-06-07 | Usar TypeScript em todo o projeto | Segurança de tipos, prevenção de bugs em tempo de desenvolvimento, melhor DX | Todos os arquivos `.tsx` e `.ts` | frontend-senior-agent, backend-senior-agent | Ativa |
| D-003 | 2026-06-07 | Usar Tailwind CSS para estilização | Velocidade de desenvolvimento, consistência visual, responsividade nativa | Nenhum CSS customizado, apenas classes Tailwind | design-system-agent, frontend-senior-agent | Ativa |
| D-004 | 2026-06-07 | Usar Supabase como banco de dados, autenticação e backend | BaaS completo, sem necessidade de servidor próprio, RLS nativo, Auth integrado | Toda a persistência e autenticação passam pelo Supabase | backend-senior-agent, database-supabase-agent, security-data-agent | Ativa |
| D-005 | 2026-06-07 | Estrutura de documentação modular em `docs/ai-brain/` | Evitar arquivo `.md` monolítico, economizar tokens em sessões futuras, manter contexto por módulo | Toda sessão de trabalho começa lendo os arquivos relevantes desta pasta | Todos os agentes | Ativa |
| D-006 | 2026-06-07 | Separar funcionalidades em nós independentes | Cada nó tem sua própria documentação, facilitando manutenção e contexto | 9 nós funcionais criados, cada um com escopo próprio | product-owner-agent | Ativa |
| D-007 | 2026-06-07 | Saldo do mês anterior é calculado automaticamente | Evitar entrada manual de saldo inicial a cada mês, reduzir erros humanos | Criar tabela `monthly_balances` para armazenar fechamentos mensais | finance-rules-agent, database-supabase-agent | Ativa |
| D-008 | 2026-06-07 | Contas fixas são previsões, não saídas reais | Separar o planejado do realizado para previsão mais precisa | Tabela `fixed_bills` separada de `expenses` | finance-rules-agent, database-supabase-agent | Ativa |
| D-009 | 2026-06-07 | Usar Row Level Security (RLS) em todas as tabelas sensíveis | Garantir isolamento de dados financeiros por usuário no nível do banco | Policies de SELECT/INSERT/UPDATE/DELETE baseadas em `auth.uid()` | security-data-agent, database-supabase-agent | Ativa |
| D-010 | 2026-06-07 | Não incluir Open Banking na v1 | Fora do escopo inicial, aumentaria complexidade significativamente | Nenhum impacto na v1 | product-owner-agent | Ativa |
| D-011 | 2026-06-07 | Categorias são criadas pelo próprio usuário | Cada usuário tem suas próprias categorias personalizadas | Tabela `categories` com `user_id` | database-supabase-agent, frontend-senior-agent | Ativa |
| D-012 | 2026-06-07 | Alertas calculados no frontend com dados do Supabase | Evitar Edge Functions na v1 para reduzir complexidade | Lógica de alertas em hooks React com dados já carregados | finance-rules-agent, frontend-senior-agent | Ativa |
| D-013 | 2026-06-07 | Paleta de cores primária: Violeta (#7C3AED / violet-600) | Identidade fintech moderna, diferenciada de bancos tradicionais (azul) | Todos os componentes usam `primary = violet-600` no Tailwind config | design-system-agent | Ativa |
| D-014 | 2026-06-07 | Fechamento de mês automático: criado ao primeiro acesso do mês seguinte | Não exigir ação manual do usuário; `monthly_balances` é criado automaticamente no service quando não existe | Lógica no `summaryService.ts` ao fazer fetch do mês atual | finance-rules-agent, backend-senior-agent | Ativa |
| D-015 | 2026-06-07 | Não vincular saída real a conta fixa na v1 | Adiciona complexidade de UI e lógica sem ganho essencial para o controle básico | Contas fixas e saídas permanecem tabelas independentes na v1 | product-owner-agent | Ativa |
| D-016 | 2026-06-07 | Deploy no Vercel | CI/CD automático a partir do repositório, tier gratuito suficiente para v1 | Configurar `vercel.json` antes do primeiro deploy | backend-senior-agent | Ativa |
| D-017 | 2026-06-07 | Alertas apenas visuais no dashboard na v1 (sem email/push) | Notificações externas requerem backend dedicado; fora do escopo v1 | Alertas exibidos como cards/banners dentro do app apenas | product-owner-agent | Ativa |

---

## Decisões Pendentes

Decisões que precisam ser tomadas antes do desenvolvimento de determinados módulos:

| # | Módulo | Questão em Aberto | Prazo Necessário |
|---|---|---|---|
~~Todas as decisões pendentes foram resolvidas em 2026-06-07 — ver D-013 a D-017 abaixo.~~

---

## Como Registrar uma Nova Decisão

Ao tomar uma decisão nova, adicione uma linha na tabela com:

1. **#** — próximo número sequencial (D-XXX)
2. **Data** — data atual no formato YYYY-MM-DD
3. **Decisão** — descrição objetiva da decisão tomada
4. **Motivo** — por que essa decisão foi tomada
5. **Impacto** — o que muda no projeto por causa disso
6. **Agentes Envolvidos** — quais agentes foram impactados
7. **Status** — `Ativa`, `Revogada` ou `Em revisão`

---

## Arquivos Relacionados

- → [00-project-scope.md](00-project-scope.md) — Escopo que motivou as decisões
- → [03-progress-history.md](03-progress-history.md) — Quando as decisões foram implementadas
- → [04-current-state.md](04-current-state.md) — Estado atual impactado pelas decisões
