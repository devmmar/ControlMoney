# 00 — Project Scope: ControlMoney

> **Fonte de verdade principal do projeto. Todos os agentes devem respeitar este arquivo.**
> Última atualização: 2026-06-07 | Status: Ativo

---

## Nome do Projeto

**ControlMoney**

---

## Objetivo do Sistema

Criar uma aplicação web moderna de controle financeiro pessoal que permita ao usuário:

- Registrar e acompanhar entradas e saídas de dinheiro
- Organizar gastos por categorias personalizadas
- Acompanhar contas fixas previstas
- Visualizar resumos financeiros mensais e diários
- Receber alertas inteligentes sobre o comportamento financeiro
- Prever o saldo do próximo mês com base no histórico

O sistema deve ser **simples de usar**, **visualmente moderno** e **seguro**, com foco em usuários que querem controle financeiro sem complexidade excessiva.

---

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Frontend framework | React JS | Ecossistema maduro, componentes reutilizáveis |
| Linguagem | TypeScript | Segurança de tipos, manutenibilidade |
| Estilização | Tailwind CSS | Rapidez, consistência, responsividade |
| Backend / Banco | Supabase | BaaS completo, Auth, RLS, realtime, sem servidor próprio |
| Autenticação | Supabase Auth | Integrado ao banco, suporta OAuth e email/senha |
| Deploy | A definir (Vercel recomendado) | CI/CD simples, gratuito para projetos pequenos |

---

## Visão Geral das Funcionalidades

### Módulo 1: Resumo Financeiro
Painel principal com todos os indicadores do mês atual:
- Saldo herdado do mês anterior
- Total a receber / já recebido
- Total de contas fixas previstas
- Total de saídas registradas
- Saldo atual calculado
- Previsão para o próximo mês

### Módulo 2: Saídas
- Cadastrar, editar, visualizar e excluir saídas
- Campos: descrição, data, valor, categoria, observação, forma de pagamento
- Filtros por período e categoria

### Módulo 3: Entradas a Receber
- Registrar valores esperados (salário, freelance, etc.)
- Marcar como recebido quando o dinheiro chegar
- Distinguir entre previsto, recebido e cancelado

### Módulo 4: Contas Fixas Previstas
- Cadastrar contas recorrentes (aluguel, internet, planos, etc.)
- Vincular a categorias e dia de vencimento
- Alimentar automaticamente o total de contas no resumo financeiro

### Módulo 5: Categorias
- Criar categorias personalizadas com nome, cor e ícone
- Definir se é para entradas, saídas ou ambos
- Definir limite mensal por categoria (opcional)

### Módulo 6: Resumo por Categoria
- Mostrar quanto foi gasto em cada categoria no mês
- Comparar com o limite configurado
- Exibir percentual de uso

### Módulo 7: Resumo Diário
- Mostrar todos os dias do mês
- Valor gasto em cada dia
- Facilitar a visualização de picos de gasto

### Módulo 8: Alertas Inteligentes
- Alertas baseados em comportamento financeiro
- Notificações quando limites de categoria são ultrapassados
- Avisos de saldo baixo e previsão negativa

### Módulo 9: Dashboard
- Visão geral de todos os indicadores
- Cards de resumo, gráficos simples, próximas contas, atalhos rápidos

---

## Regras de Negócio Principais

### RN-001: Cálculo do Saldo Atual
```
Saldo Atual = Saldo Herdado do Mês Anterior + Total Recebido - Total de Saídas Registradas
```

### RN-002: Herança de Saldo Mensal
- O que sobrar no mês atual automaticamente vira o "Dinheiro que sobrou do mês passado" no mês seguinte.
- Esse valor não é inserido manualmente — é calculado com base no fechamento do mês anterior.

### RN-003: Previsão do Próximo Mês
```
Previsão = Saldo Atual + Total a Receber (ainda não recebido) - Contas Fixas Previstas - Média de Saídas Variáveis
```

### RN-004: Limite de Categoria
- Se uma categoria tiver limite configurado, o sistema deve alertar quando o gasto atingir 80% do limite.
- Alertar novamente ao ultrapassar 100%.

### RN-005: Isolamento de Dados por Usuário
- Cada usuário só pode ver, criar, editar e excluir seus próprios dados.
- Implementado via `user_id` em todas as tabelas e RLS no Supabase.

### RN-006: Contas Fixas como Previsão
- Contas fixas cadastradas são previstas (não são saídas reais).
- Quando a saída real acontecer, ela é registrada separadamente na aba de saídas.
- O sistema pode vincular uma saída real a uma conta fixa prevista.

### RN-007: Status das Entradas
- Uma entrada pode estar em 3 estados: `previsto`, `recebido`, `cancelado`.
- Apenas entradas com status `recebido` entram no cálculo do saldo atual.
- Entradas com status `previsto` entram no cálculo da previsão do próximo mês.

---

## Regras de Experiência do Usuário

- Cadastrar uma saída deve levar no máximo 3 cliques a partir do dashboard
- Toda ação deve ter feedback visual (loading, sucesso, erro)
- Estados vazios devem ser explicativos e motivacionais (não apenas "nenhum dado")
- Alertas devem ser amigáveis, claros e nunca agressivos
- O sistema deve funcionar bem em mobile e desktop
- Navegação entre abas deve ser fluida e clara
- Formulários devem ter validação em tempo real
- Dados financeiros sensíveis nunca devem aparecer em URLs ou logs

---

## Regras de Segurança

- Supabase Auth para todos os usuários
- Todas as tabelas com `user_id` (UUID, NOT NULL)
- RLS habilitado em todas as tabelas sensíveis
- Policies para SELECT, INSERT, UPDATE e DELETE baseadas em `auth.uid()`
- Nenhuma chave secreta (`service_role`, etc.) no frontend
- Variáveis de ambiente para `SUPABASE_URL` e `SUPABASE_ANON_KEY`
- Validação de dados tanto no frontend quanto em constraints no banco
- HTTPS obrigatório em produção

---

## O Que o Projeto NÃO Deve Fazer

- Não integrar com bancos ou cartões reais (Open Banking) — fora do escopo v1
- Não ter funcionalidades multi-usuário ou familiares — escopo individual apenas
- Não ter relatórios exportáveis (PDF, Excel) — fora do escopo v1
- Não enviar e-mails ou notificações push — fora do escopo v1
- Não ter modo offline — depende do Supabase
- Não gerenciar investimentos — fora do escopo v1
- Não ter IA generativa para análise financeira — fora do escopo v1
- Não ter gamificação — fora do escopo v1

---

## Limites de Escopo (v1)

A versão inicial deve ser funcional, estável e cobrir os 9 módulos listados acima. Funcionalidades avançadas ficam para versões futuras.

**Prioridade v1:**
1. Autenticação funcional
2. CRUD de categorias
3. CRUD de saídas
4. CRUD de entradas a receber
5. CRUD de contas fixas
6. Resumo financeiro calculado corretamente
7. Resumo diário
8. Alertas básicos por categoria
9. Dashboard com visão geral

---

## Prioridades da Versão Inicial

| # | Módulo | Prioridade | Complexidade |
|---|---|---|---|
| 1 | Autenticação | Alta | Baixa |
| 2 | Categorias | Alta | Baixa |
| 3 | Saídas | Alta | Média |
| 4 | Entradas | Alta | Média |
| 5 | Contas Fixas | Alta | Média |
| 6 | Resumo Financeiro | Alta | Alta |
| 7 | Dashboard | Alta | Alta |
| 8 | Resumo Diário | Média | Baixa |
| 9 | Alertas | Média | Alta |
| 10 | Resumo por Categoria | Média | Média |

---

## Arquivos Relacionados

- → [01-context-map.md](01-context-map.md) — Como os módulos se conectam
- → [02-decision-log.md](02-decision-log.md) — Decisões tomadas sobre o escopo
- → [04-current-state.md](04-current-state.md) — Estado atual de implementação
- → [05-next-actions.md](05-next-actions.md) — Próximas tarefas
