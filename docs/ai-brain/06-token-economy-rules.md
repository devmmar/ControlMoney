# 06 — Token Economy Rules: Regras de Economia de Tokens

> Regras para garantir que cada sessão de trabalho seja eficiente, focada e não desperdice contexto.
> Estas regras devem ser respeitadas por todos os agentes em todas as sessões.
> Última atualização: 2026-06-07

---

## Por que economizar tokens importa?

Cada sessão do Claude Code tem um limite de contexto. Quanto mais arquivos e informações desnecessárias forem carregados, menos espaço fica para o trabalho real. A estrutura modular do `ai-brain` existe exatamente para resolver isso: você só lê o que precisa para a tarefa atual.

---

## Regras Obrigatórias

### REGRA 1 — Leitura Mínima e Suficiente

**Nunca leia todos os arquivos sem necessidade.**

Antes de começar, identifique:
- Qual módulo será trabalhado?
- Qual agente está relacionado?
- Qual nó funcional será impactado?

Leia **apenas** esses arquivos + `00-project-scope.md` + `04-current-state.md`.

❌ Errado: Ler todos os 29 arquivos `.md` no início da sessão.
✅ Correto: Ler escopo, estado atual, agente relevante e nó relevante.

---

### REGRA 2 — Consultar o Escopo Primeiro, Sempre

O primeiro arquivo a ser lido é sempre `00-project-scope.md`.

Ele responde:
- O projeto está no caminho certo?
- A tarefa solicitada está dentro do escopo?
- Existe alguma regra que contrarie o que estou prestes a fazer?

Se a tarefa contradiz o escopo, sinalize ao usuário antes de continuar.

---

### REGRA 3 — Identificar o Agente e o Nó Antes de Codar

Antes de escrever qualquer linha de código, identifique:

1. Qual agente é responsável por essa tarefa?
2. Qual nó funcional será implementado ou modificado?
3. Esse nó depende de outros nós que ainda não foram implementados?

Isso evita retrabalho, inconsistências e código fora do padrão definido.

---

### REGRA 4 — Atualizar Apenas os Arquivos Impactados

Ao terminar uma tarefa, atualize **somente** os arquivos que foram impactados:

- `03-progress-history.md` — sempre atualizar com o resumo da sessão
- `04-current-state.md` — sempre atualizar o estado do projeto
- `05-next-actions.md` — marcar concluído, ajustar prioridades
- Nó funcional impactado — atualizar checklist e histórico do nó
- `02-decision-log.md` — apenas se uma nova decisão foi tomada
- Arquivo do agente — apenas se uma responsabilidade mudou

❌ Errado: Reescrever todos os arquivos ao final de cada sessão.
✅ Correto: Atualizar apenas o que mudou.

---

### REGRA 5 — Não Duplicar Informações Entre Arquivos

Cada informação deve existir em **um único lugar**.

Exemplos:
- A regra de cálculo do saldo está em `financial-summary-node.md` e em `00-project-scope.md`. Se precisar mudar, mude nos dois.
- Não repita a definição de uma tabela do banco em múltiplos arquivos.
- Use links (`→ [arquivo](caminho)`) para referenciar, não para copiar.

---

### REGRA 6 — Registros Curtos no Histórico

O arquivo `03-progress-history.md` deve ter registros concisos.

Cada sessão deve ter:
- O que foi solicitado (1-2 linhas)
- O que foi feito (lista de bullets)
- Arquivos impactados (lista)
- Próximo passo (1 linha)

❌ Errado: Escrever parágrafos longos descrevendo cada detalhe técnico.
✅ Correto: Bullets objetivos, sem redundância.

---

### REGRA 7 — Links em Vez de Cópias

Ao referenciar outro arquivo ou seção, use um link relativo.

```markdown
Ver regras de negócio → [financial-summary-node.md](nodes/financial-summary-node.md)
Decisão sobre stack → [D-001 em 02-decision-log.md](02-decision-log.md)
```

Isso mantém o contexto sem duplicar conteúdo.

---

### REGRA 8 — Não Documentar o Óbvio

Não escreva comentários ou documentação sobre coisas que são autoexplicativas no código.

O `ai-brain` existe para capturar:
- Decisões que não estão no código
- Regras de negócio que têm exceções
- Contexto histórico de por que algo foi feito de certa forma
- Estado atual e próximas ações

Não existe para documentar o que uma função faz (isso é responsabilidade do código limpo).

---

### REGRA 9 — Uma Tarefa por Sessão (quando possível)

Para manter foco e contexto, prefira trabalhar em **um módulo por vez**.

Exemplos de boas sessões:
- "Criar tabelas do banco de dados"
- "Implementar CRUD de categorias"
- "Criar tela de resumo financeiro"

Sessões muito amplas levam a arquivos incompletos, decisões apressadas e dificuldade de rastrear o que foi feito.

---

### REGRA 10 — Verificar Decisões Pendentes Antes de Codar

Antes de implementar qualquer módulo, verifique se há decisões pendentes em `02-decision-log.md` que impactam aquele módulo.

Se houver, resolva a decisão antes de escrever código para evitar retrabalho.

---

## Checklist de Início de Sessão (resumo rápido)

```
[ ] Li 00-project-scope.md?
[ ] Li 04-current-state.md?
[ ] Li 05-next-actions.md?
[ ] Identifiquei qual agente é responsável pela tarefa?
[ ] Identifiquei qual nó funcional será impactado?
[ ] Li o arquivo do agente específico?
[ ] Li o arquivo do nó específico?
[ ] Verifiquei se há decisões pendentes que bloqueiam a tarefa?
```

## Checklist de Encerramento de Sessão (resumo rápido)

```
[ ] Atualizei 03-progress-history.md com o resumo da sessão?
[ ] Atualizei 04-current-state.md com o novo estado?
[ ] Atualizei 05-next-actions.md (marcando concluído e ajustando fila)?
[ ] Atualizei o nó funcional impactado (checklist + histórico)?
[ ] Registrei novas decisões em 02-decision-log.md (se houver)?
[ ] Evitei duplicar informações entre arquivos?
```

---

## Estimativa de Tokens por Arquivo

Para ajudar a planejar quanto contexto carregar por sessão:

| Arquivo | Tokens Estimados | Quando Ler |
|---|---|---|
| `00-project-scope.md` | ~1.200 | Sempre — início de sessão |
| `04-current-state.md` | ~600 | Sempre — início de sessão |
| `05-next-actions.md` | ~800 | Sempre — início de sessão |
| `01-context-map.md` | ~700 | Quando precisar entender conexões |
| `02-decision-log.md` | ~500 | Antes de tomar uma decisão nova |
| Arquivo de agente | ~400-600 | Quando for trabalhar na área do agente |
| Arquivo de nó | ~500-800 | Quando for implementar aquela funcionalidade |
| `03-progress-history.md` | ~300-1.500 | Apenas se precisar contexto histórico |

**Total mínimo para uma sessão focada:** ~3.000-4.000 tokens de documentação.
**Total máximo com todos os arquivos:** ~20.000 tokens.
**Economia típica:** 75-85% do contexto máximo possível.
