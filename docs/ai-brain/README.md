# AI Brain — Cérebro Modular do Projeto ControlMoney

Esta pasta é o **sistema de memória modular** do projeto ControlMoney. Ela foi projetada para permitir que o Claude Code (e qualquer colaborador técnico) retome o trabalho em qualquer sessão sem perder contexto, sem depender de um único arquivo gigante e sem desperdiçar tokens relendo informações desnecessárias.

---

## O que é o AI Brain?

O `ai-brain` é uma coleção de arquivos `.md` organizados como **agentes especializados**, **nós funcionais** e **registros de histórico**. Cada arquivo tem uma responsabilidade única e clara. Juntos, eles formam o cérebro do projeto.

**Princípio fundamental:** Nenhum arquivo deve conter informação que já está em outro arquivo. Cada nó é a fonte de verdade daquele contexto específico.

---

## Estrutura da pasta

```
docs/ai-brain/
├── README.md                        ← Este arquivo. Leia primeiro.
├── 00-project-scope.md              ← Escopo, regras, stack e visão do produto
├── 01-context-map.md                ← Mapa de conexões entre agentes e nós
├── 02-decision-log.md               ← Registro de decisões técnicas e de produto
├── 03-progress-history.md           ← Histórico de sessões e progresso
├── 04-current-state.md              ← Estado atual do projeto (sempre atualizado)
├── 05-next-actions.md               ← Fila priorizada de próximas ações
├── 06-token-economy-rules.md        ← Regras para economizar tokens por sessão
│
├── agents/
│   ├── product-owner-agent.md       ← Visão de produto, escopo, regras de negócio
│   ├── backend-senior-agent.md      ← Supabase, services, lógica de negócio
│   ├── frontend-senior-agent.md     ← React, TypeScript, componentes, hooks
│   ├── database-supabase-agent.md   ← Tabelas, RLS, policies, indexes
│   ├── ui-ux-agent.md               ← Experiência do usuário, fluxos, navegação
│   ├── design-system-agent.md       ← Cores, tipografia, componentes visuais
│   ├── security-data-agent.md       ← Segurança, autenticação, proteção de dados
│   ├── finance-rules-agent.md       ← Cálculos financeiros, alertas, previsões
│   └── qa-testing-agent.md          ← Testes, validações, casos de erro
│
├── nodes/
│   ├── financial-summary-node.md    ← Resumo financeiro completo
│   ├── expenses-node.md             ← Cadastro e gestão de saídas
│   ├── categories-node.md           ← Sistema de categorias personalizadas
│   ├── daily-summary-node.md        ← Resumo de gastos por dia
│   ├── fixed-bills-node.md          ← Contas fixas previstas
│   ├── income-receivable-node.md    ← Entradas a receber
│   ├── alerts-node.md               ← Alertas inteligentes de gastos
│   ├── auth-user-node.md            ← Autenticação e isolamento por usuário
│   └── dashboard-node.md            ← Página principal / dashboard
│
└── templates/
    ├── session-start-template.md    ← Template para iniciar uma sessão
    ├── session-end-template.md      ← Template para encerrar uma sessão
    └── agent-report-template.md     ← Template para relatório de agente
```

---

## Ordem de leitura recomendada por sessão

Antes de executar qualquer tarefa, siga esta ordem de leitura para garantir contexto completo com o menor número de arquivos:

| Prioridade | Arquivo | Por quê ler |
|---|---|---|
| 1 | `00-project-scope.md` | Entender o que é o projeto e o que ele deve fazer |
| 2 | `04-current-state.md` | Saber onde o projeto está agora |
| 3 | `05-next-actions.md` | Identificar qual tarefa deve ser feita |
| 4 | `01-context-map.md` | Entender como os agentes e nós se conectam |
| 5 | Agente da tarefa | Entender a responsabilidade do agente envolvido |
| 6 | Nó da funcionalidade | Entender as regras do nó que será implementado |
| 7 | `02-decision-log.md` | Verificar se alguma decisão já foi tomada sobre o assunto |
| 8 | `03-progress-history.md` | Verificar o que já foi feito anteriormente (se necessário) |

**Regra de ouro:** Nunca leia todos os arquivos sem necessidade. Leia apenas o que é relevante para a tarefa atual.

---

## O que fazer ao terminar uma tarefa

Sempre que uma tarefa for concluída, atualize obrigatoriamente:

- [ ] `03-progress-history.md` — registre o que foi feito na sessão
- [ ] `04-current-state.md` — atualize o estado atual do projeto
- [ ] `05-next-actions.md` — atualize a fila de ações (marque concluído, ajuste prioridades)
- [ ] Nó funcional impactado — atualize o histórico do nó
- [ ] `02-decision-log.md` — registre se alguma decisão nova foi tomada

---

## Princípios do AI Brain

1. **Modularidade:** Cada arquivo tem uma responsabilidade única.
2. **Não duplicação:** A mesma informação nunca deve estar em dois arquivos.
3. **Conexão por links:** Arquivos se referenciam com `→ [nome-do-arquivo]`.
4. **Atualização incremental:** Só atualize o que mudou, não reescreva tudo.
5. **Economia de tokens:** Leia apenas o necessário para a tarefa atual.
6. **Fonte de verdade:** `00-project-scope.md` é a lei. Nenhum agente pode contrariá-lo.
