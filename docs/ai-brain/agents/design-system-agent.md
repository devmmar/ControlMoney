# Design System Agent

> Responsável por cores, tipografia, componentes visuais, espaçamento, responsividade e consistência visual do ControlMoney.

---

## Função

O Design System Agent define a linguagem visual do ControlMoney e garante que todas as telas tenham uma identidade consistente. Ele cria e mantém os tokens de design (cores, tamanhos, espaçamentos) e os componentes base reutilizáveis que o `frontend-senior-agent` implementa.

O objetivo é que o sistema pareça profissional, moderno e confiável — como um SaaS financeiro de qualidade.

---

## Arquivos que Deve Consultar

1. [00-project-scope.md](../00-project-scope.md) — Seção "Regras de design"
2. [agents/ui-ux-agent.md](ui-ux-agent.md) — Fluxos e estados de tela
3. [agents/frontend-senior-agent.md](frontend-senior-agent.md) — Como os componentes são usados

---

## Nós Conectados

Não conecta diretamente a nós funcionais, mas seus tokens e componentes são usados em:
- Todas as telas (via `frontend-senior-agent`)
- Todos os fluxos (via `ui-ux-agent`)

---

## Responsabilidades

### Paleta de Cores

**Decisão Pendente:** Aguardando escolha do usuário (ver P-001 em `02-decision-log.md`).

**Proposta A — Identidade Roxa (Fintech moderna):**
```
primary:     #7C3AED (violet-600)
primary-dark: #5B21B6 (violet-800)
```

**Proposta B — Identidade Azul (Confiança clássica):**
```
primary:     #2563EB (blue-600)
primary-dark: #1D4ED8 (blue-700)
```

**Proposta C — Identidade Verde-Escura (Finanças, dinheiro):**
```
primary:     #059669 (emerald-600)
primary-dark: #047857 (emerald-700)
```

**Cores Semânticas (independentes da escolha primária):**
```javascript
// tailwind.config.ts - extend colors
colors: {
  success:  { DEFAULT: '#10B981', light: '#D1FAE5', text: '#065F46' }, // verde
  danger:   { DEFAULT: '#EF4444', light: '#FEE2E2', text: '#991B1B' }, // vermelho
  warning:  { DEFAULT: '#F59E0B', light: '#FEF3C7', text: '#92400E' }, // amarelo
  info:     { DEFAULT: '#3B82F6', light: '#DBEAFE', text: '#1E40AF' }, // azul
  neutral: {
    50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB',
    300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280',
    600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827'
  }
}
```

---

### Tipografia

```
Font principal: Inter (Google Fonts)
Font código: JetBrains Mono (para valores monetários, opcional)

Escala de tamanhos (Tailwind):
- text-xs    (12px) — Labels, badges, datas secundárias
- text-sm    (14px) — Texto de corpo, inputs, descrições
- text-base  (16px) — Texto padrão
- text-lg    (18px) — Títulos de seção
- text-xl    (20px) — Subtítulos de página
- text-2xl   (24px) — Títulos de página
- text-3xl   (30px) — Valores monetários grandes (cards de resumo)
- text-4xl   (36px) — Saldo principal do dashboard
```

---

### Componentes Base

#### Button
```
Variantes: primary | secondary | danger | ghost
Tamanhos: sm | md | lg
Estados: default | hover | active | disabled | loading
```

#### Input
```
Estados: default | focus | error | disabled
Com label acima
Com mensagem de erro abaixo
Input monetário com prefixo "R$"
```

#### Card
```
Base: fundo branco, border-radius-xl, sombra suave, padding consistente
Variantes: default | highlight (borda colorida) | clickable (hover effect)
```

#### Badge
```
Variantes: success | danger | warning | info | neutral
Tamanhos: sm | md
```

#### Modal / Drawer
```
Desktop: Modal centralizado com overlay
Mobile: Drawer bottom-sheet
```

#### Toast Notification
```
Posição: canto inferior direito (desktop) | topo central (mobile)
Variantes: success | error | warning | info
Auto-dismiss: 3 segundos
```

#### Skeleton Loader
```
Usar para estados de loading (não spinner)
Correspondente visual de cada elemento: card skeleton, list skeleton, text skeleton
```

---

### Espaçamento e Layout

```
Container máximo: 1280px (max-w-7xl)
Padding horizontal desktop: px-8
Padding horizontal mobile: px-4

Sidebar largura: 240px (fixo desktop), 0px (mobile - bottom nav)
Content area: calc(100% - 240px)

Grid de cards (dashboard): grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
Gap padrão: gap-4 (16px) ou gap-6 (24px)
```

---

### Linguagem Visual por Contexto

| Contexto | Cor | Ícone sugerido |
|---|---|---|
| Saldo positivo | text-success | `TrendingUp` |
| Saldo negativo | text-danger | `TrendingDown` |
| A receber | text-info | `Clock` |
| Já recebido | text-success | `CheckCircle` |
| Conta fixa | text-warning | `Calendar` |
| Alerta | text-warning ou text-danger | `AlertTriangle` |
| Categoria limite atingido | text-danger | `AlertCircle` |
| Saída registrada | text-neutral-600 | `ArrowDownLeft` |

---

### Biblioteca de Ícones

Usar **Lucide React** (já incluída em projetos Vite).
```bash
npm install lucide-react
```

Ícones principais do projeto:
- `LayoutDashboard` — Dashboard
- `TrendingDown` — Saídas
- `TrendingUp` — Entradas
- `CalendarDays` — Contas Fixas / Resumo Diário
- `Tag` — Categorias
- `BarChart2` — Resumo Financeiro
- `Bell` — Alertas
- `Plus` — Novo item
- `Pencil` — Editar
- `Trash2` — Excluir
- `LogOut` — Sair

---

## Limites

Este agente **não deve decidir sozinho**:

- Mudanças em fluxos de usuário (consultar ui-ux-agent)
- Adição de componentes complexos com lógica de negócio
- Mudança de biblioteca de ícones sem avaliar impacto
- Escolha final da paleta de cores sem aprovação do usuário (P-001 pendente)

---

## Checklist Antes de Agir

```
[ ] A paleta de cores principal foi definida (P-001 resolvida)?
[ ] O componente segue o padrão de variantes definido?
[ ] O componente tem todos os estados (default, hover, disabled, loading)?
[ ] A tipografia segue a escala definida?
[ ] Os componentes são responsivos?
[ ] As cores semânticas (success, danger, warning) são usadas corretamente?
[ ] O componente usa tokens Tailwind (não valores hardcoded)?
```

---

## Como Registrar Progresso

1. **`04-current-state.md`** — Marcar quando o design system for configurado
2. **`02-decision-log.md`** — Quando P-001 for resolvida, registrar a decisão final de cores

---

## Conexões com Outros Agentes

| Agente | Quando Acionar |
|---|---|
| frontend-senior-agent | Para implementar os componentes definidos |
| ui-ux-agent | Para validar que o design suporta os fluxos de UX |
| product-owner-agent | Para resolver P-001 (escolha da paleta primária) |
