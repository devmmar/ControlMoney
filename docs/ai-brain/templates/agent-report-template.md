# Template: Relatório de Agente

> Use este template quando um agente precisa reportar o resultado de uma tarefa específica.
> Útil para registrar o trabalho de forma estruturada antes de atualizar o histórico.

---

## Identificação

**Agente:** _[nome-do-agente]_
**Data:** _[YYYY-MM-DD]_
**Tarefa:** _[ID da tarefa em 05-next-actions.md, ex: FEAT-001]_
**Nó(s) Impactado(s):** _[nome dos nós]_

---

## Contexto Lido Antes de Agir

_Lista dos arquivos consultados para contextualizar a tarefa:_

```
[ ] 00-project-scope.md — seção relevante: [...]
[ ] 04-current-state.md
[ ] agents/[nome-agente].md
[ ] nodes/[nome-no].md
[ ] 02-decision-log.md — decisões relevantes: [D-XXX, D-YYY]
```

---

## O Que Foi Executado

### Descrição do Trabalho
> _[Descreva objetivamente o que foi feito]_

### Itens Completados

| # | Item | Status | Observação |
|---|---|---|---|
| 1 | _[descrição]_ | ✅ Completo | _[nota se houver]_ |
| 2 | _[descrição]_ | ✅ Completo | |
| 3 | _[descrição]_ | ⚠ Parcial | _[o que ficou faltando]_ |
| 4 | _[descrição]_ | ❌ Não feito | _[motivo]_ |

---

## Arquivos Criados ou Modificados

| Arquivo | Ação | Descrição da Mudança |
|---|---|---|
| `src/services/expensesService.ts` | Criado | Service completo de CRUD |
| `src/hooks/useExpenses.ts` | Criado | Hook com loading e error |
| `docs/ai-brain/nodes/expenses-node.md` | Modificado | Checklist atualizado |

---

## Decisões Tomadas Durante a Execução

_[Se nenhuma decisão nova: "Nenhuma decisão nova — seguindo decisões existentes."]_

**Decisão:** _[Descrição da escolha técnica feita]_
**Motivo:** _[Por que essa escolha]_
**Impacto:** _[O que muda]_
**Deve ser registrada em `02-decision-log.md`?** [ ] Sim  [ ] Não

---

## Problemas Encontrados

_[Se nenhum problema: "Nenhum problema encontrado."]_

| Problema | Como Foi Resolvido | Ficou Pendente? |
|---|---|---|
| _[descrição]_ | _[solução]_ | Sim / Não |

---

## Conformidade com Regras

```
[ ] Código segue as regras de negócio do escopo principal?
[ ] Nenhuma informação sensível hardcoded?
[ ] RLS e user_id respeitados (se aplicável)?
[ ] TypeScript sem 'any' não justificado?
[ ] Estados de loading e error implementados?
[ ] Comportamento testado manualmente?
```

---

## Próxima Ação Recomendada

> _[O que deve ser feito depois desta tarefa para continuar o progresso]_
> Próxima tarefa em `05-next-actions.md`: _[ID]_

---

## Resumo para o `03-progress-history.md`

> _[Cole este resumo compacto no arquivo de histórico]_

**Sessão XXX — YYYY-MM-DD | Agente: [nome]**
Executado: _[bullet resumido do que foi feito]_
Arquivos: _[lista compacta]_
Pendente: _[se houver]_
Próximo: _[próxima tarefa]_
