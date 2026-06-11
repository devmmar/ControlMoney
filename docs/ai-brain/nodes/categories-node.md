# Categories Node — Categorias

> Nó funcional do sistema de categorias personalizadas do ControlMoney.

---

## Objetivo

Permitir ao usuário criar e gerenciar categorias personalizadas para organizar seus gastos e entradas. Cada categoria pode ter um limite mensal opcional que aciona alertas quando atingido.

---

## Dados Envolvidos

### Tabela: `categories`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | UUID | Sim | Chave primária |
| `user_id` | UUID | Sim | Dono da categoria |
| `name` | TEXT | Sim | Nome da categoria |
| `color` | TEXT | Sim | Cor em hex (#RRGGBB) |
| `icon` | TEXT | Não | Nome do ícone (Lucide) |
| `type` | TEXT | Sim | `income`, `expense` ou `both` |
| `monthly_limit` | DECIMAL(10,2) | Não | Limite mensal (nullable) |
| `created_at` | TIMESTAMPTZ | Auto | Criado em |
| `updated_at` | TIMESTAMPTZ | Auto | Atualizado em |

---

## Exemplos de Categorias Padrão (sugestões iniciais ao usuário)

| Nome | Cor | Ícone | Tipo |
|---|---|---|---|
| Alimentação | #F59E0B | `UtensilsCrossed` | expense |
| Transporte | #3B82F6 | `Car` | expense |
| Moradia | #8B5CF6 | `Home` | expense |
| Saúde | #EF4444 | `Heart` | expense |
| Lazer | #10B981 | `Smile` | expense |
| Educação | #6366F1 | `BookOpen` | expense |
| Assinaturas | #EC4899 | `CreditCard` | expense |
| Compras | #F97316 | `ShoppingBag` | expense |
| Salário | #10B981 | `Briefcase` | income |
| Freelance | #14B8A6 | `Laptop` | income |
| Outros | #9CA3AF | `MoreHorizontal` | both |

---

## Regras de Negócio

### RN-CAT-001 — Categorias são por Usuário
Cada usuário tem suas próprias categorias. Não existem categorias globais/padrão no banco — sugerir ao usuário que crie as suas.

### RN-CAT-002 — Nome Único por Usuário
Um usuário não pode ter duas categorias com o mesmo nome. Validar com constraint UNIQUE(user_id, name) ou validação no service.

### RN-CAT-003 — Tipo Determina Uso
- `income`: aparece apenas em formulários de entradas
- `expense`: aparece apenas em formulários de saídas
- `both`: aparece em ambos

### RN-CAT-004 — Limite Mensal e Alertas
Se `monthly_limit` estiver definido:
- Alerta a 80% de uso
- Alerta ao ultrapassar 100%
- O percentual de uso é calculado no frontend

### RN-CAT-005 — Exclusão com Dependências
Se uma categoria for excluída, as saídas/entradas vinculadas ficam com `category_id = NULL` (ON DELETE SET NULL no banco). Avisar o usuário sobre isso antes de confirmar a exclusão.

### RN-CAT-006 — Cor Obrigatória
A cor é obrigatória e tem padrão (#6366f1 — violeta). Usar um color picker simples no formulário.

---

## Agentes Conectados

| Agente | Papel |
|---|---|
| backend-senior-agent | Implementa `categoriesService.ts` e `useCategories` hook |
| frontend-senior-agent | Implementa tela de categorias e formulário |
| database-supabase-agent | Cria e mantém a tabela `categories` com RLS |
| finance-rules-agent | Usa limites de categoria para disparar alertas |
| design-system-agent | Define o color picker e o componente de ícone |
| ui-ux-agent | Define o fluxo de criação e gestão de categorias |

---

## Dependências

- [auth-user-node](auth-user-node.md) — `user_id` do usuário autenticado

---

## Impacta Quais Telas

- **Tela de Categorias** — tela principal deste nó
- **Formulário de Saídas** — campo "categoria" usa este nó
- **Formulário de Entradas** — campo "categoria" usa este nó
- **Formulário de Contas Fixas** — campo "categoria" usa este nó
- **Resumo por Categoria** — agrupa dados por categorias deste nó
- **Alertas** — usa limites mensais das categorias

---

## Checklist de Implementação

### Banco de Dados
- [ ] Tabela `categories` criada com RLS
- [ ] Constraint `UNIQUE(user_id, name)` configurada
- [ ] `CHECK (type IN ('income', 'expense', 'both'))` configurado
- [ ] `CHECK (monthly_limit > 0 OR monthly_limit IS NULL)` configurado

### Backend / Services
- [ ] `categoriesService.ts` com funções:
  - [ ] `getCategories(userId, type?)` — listar, opcionalmente filtrar por tipo
  - [ ] `getCategoryById(id)` — detalhes de uma categoria
  - [ ] `createCategory(data)` — criar
  - [ ] `updateCategory(id, data)` — atualizar
  - [ ] `deleteCategory(id)` — excluir
  - [ ] `getCategoriesWithUsage(userId, year, month)` — categorias com percentual de uso
- [ ] `useCategories` hook criado

### Frontend
- [ ] Página `CategoriesPage` criada com lista de categorias
- [ ] Formulário de criação com color picker e seletor de ícone
- [ ] Formulário de edição
- [ ] Confirmação de exclusão com aviso sobre dependências
- [ ] Estado vazio com sugestão de criar primeira categoria
- [ ] Componente `CategoryBadge` (ícone + cor + nome) reutilizável
- [ ] `CategorySelect` para uso nos formulários de saída/entrada

---

## Histórico do Nó

| Data | Evento | Responsável |
|---|---|---|
| 2026-06-07 | Nó criado e documentado | Sessão 001 |
| - | Tabela criada no Supabase | - |
| - | Services implementados | - |
| - | Tela implementada | - |
