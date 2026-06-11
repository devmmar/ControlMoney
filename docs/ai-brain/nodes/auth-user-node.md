# Auth User Node — Autenticação e Usuário

> Nó funcional do sistema de autenticação e isolamento de dados por usuário do ControlMoney.

---

## Objetivo

Garantir que cada usuário possa criar uma conta, fazer login com segurança e acessar **apenas seus próprios dados financeiros**. Este nó é a base de segurança de todo o sistema — todos os outros nós dependem dele.

---

## Dados Envolvidos

### Gerenciado pelo Supabase Auth (não criamos estas tabelas)
- `auth.users` — tabela interna do Supabase com email, senha hasheada, metadados

### Supabase Auth Session
- Access token JWT armazenado em memória pelo Supabase client
- `auth.uid()` disponível nas policies RLS de todas as tabelas

---

## Regras de Negócio

### RN-AUTH-001 — Isolamento Absoluto de Dados
Cada usuário só pode ver, criar, editar e excluir seus próprios dados.
Implementado via:
1. `user_id UUID NOT NULL REFERENCES auth.users(id)` em todas as tabelas
2. RLS habilitado com policy `auth.uid() = user_id`
3. Queries no frontend sempre filtradas por `user_id` (redundância intencional)

### RN-AUTH-002 — Cadastro com Email/Senha
- Email único no sistema
- Senha com no mínimo 8 caracteres
- Supabase Auth gerencia o hash da senha (nunca armazenamos a senha)
- Confirmação de email: recomendado para produção (configurar no Supabase dashboard)

### RN-AUTH-003 — Login Persistente
- Supabase gerencia refresh tokens automaticamente
- Sessão persiste entre recargas da página
- Ao detectar sessão inválida ou expirada, redirecionar para login

### RN-AUTH-004 — Proteção de Rotas
Todas as rotas exceto `/login` e `/cadastro` requerem autenticação.
O componente `PrivateRoute` valida `useAuth().user` antes de renderizar.

### RN-AUTH-005 — Logout
- Chamar `supabase.auth.signOut()` — limpa o token local
- Redirecionar para `/login`
- Nenhum dado financeiro deve ficar em memória após logout

### RN-AUTH-006 — Nunca Expor Dados do Usuário
- Não exibir email em URLs
- Não logar tokens de acesso
- Não armazenar dados financeiros em localStorage

---

## Agentes Conectados

| Agente | Papel |
|---|---|
| security-data-agent | Define e revisa todas as políticas de segurança |
| backend-senior-agent | Implementa `AuthContext` e integração Supabase Auth |
| frontend-senior-agent | Cria telas de login, cadastro e `PrivateRoute` |
| database-supabase-agent | Garante `user_id` e RLS em todas as tabelas |

---

## Dependências

Este nó **não depende** de outros nós — é a base de todos.
Todos os outros nós dependem deste.

---

## Impacta Quais Telas

- **Tela de Login** `/login` — pública
- **Tela de Cadastro** `/cadastro` — pública
- **Todas as outras telas** — protegidas por `PrivateRoute`

---

## Implementação do AuthContext

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

---

## Checklist de Implementação

### Configuração Supabase
- [ ] Projeto Supabase criado
- [ ] `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env`
- [ ] `.env` no `.gitignore`
- [ ] Confirmação de email configurada (Supabase Dashboard → Auth)

### Código
- [ ] `src/lib/supabaseClient.ts` criado com inicialização do cliente
- [ ] `src/context/AuthContext.tsx` criado (AuthProvider + useAuth)
- [ ] `src/components/auth/PrivateRoute.tsx` criado
- [ ] `AuthProvider` wrapping o app no `main.tsx`
- [ ] Tela de Login criada com validação de formulário
- [ ] Tela de Cadastro criada com validação de formulário
- [ ] Botão/link de Logout no header ou sidebar
- [ ] Redirecionamento após login para dashboard
- [ ] Redirecionamento de rotas protegidas para `/login`

### Segurança
- [ ] RLS habilitado em todas as tabelas (ver `security-data-agent.md`)
- [ ] Nenhuma `service_role` key no código frontend
- [ ] Sem `console.log` de dados sensíveis

---

## Histórico do Nó

| Data | Evento | Responsável |
|---|---|---|
| 2026-06-07 | Nó criado e documentado | Sessão 001 |
| - | Supabase Auth configurado | - |
| - | AuthContext implementado | - |
| - | Telas de login/cadastro criadas | - |
| - | PrivateRoute implementado | - |
