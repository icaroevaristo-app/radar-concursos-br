# Radar Concursos BR

Fundação funcional da Sprint 1 do Radar Concursos BR: um web app independente para organizar concursos públicos municipais/estaduais, com Supabase Auth, preferências de usuário, Radar com dados reais do Supabase, Meus Concursos e Admin manual.

O Radar Concursos BR não é órgão público, não representa governos, bancas ou prefeituras. As informações devem ser sempre conferidas no edital e no link oficial.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase JS / Supabase SSR
- PostgreSQL via Supabase
- Supabase Auth
- Vitest

## Comandos

```bash
npm install
npm run dev
npm run dev:turbo
npm run lint
npm run typecheck
npm run test
npm audit --audit-level=moderate
```

`npm run dev` usa `next dev --webpack` por estabilidade no ambiente local. `npm run dev:turbo` mantém o Turbopack disponível para testes futuros.

## Ambiente

Crie `.env.local` com:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Regras:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` podem ser usadas no client.
- `SUPABASE_SERVICE_ROLE_KEY` é server-side apenas.
- Nunca exponha a service role em Client Components.

## Supabase

Aplicar migrations via CLI:

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

Aplicar seed demo:

```bash
supabase db seed
```

Ou execute manualmente pelo SQL Editor:

1. `supabase/migrations/0001_sprint_1_foundation.sql`
2. `supabase/migrations/0002_fix_profiles_signup_flow.sql`
3. `supabase/seed.sql`

O seed é apenas demonstração. Ele marca concursos com `is_demo = true`, usa URLs seguras de demonstração e não afirma que as oportunidades estão realmente abertas.

## Supabase Auth

No painel Supabase:

- Ative Email/Password.
- Em desenvolvimento local, deixe `Confirm email` como `OFF` para testar cadastro/login/onboarding no mesmo fluxo.
- Configure redirect URL: `http://localhost:3000/auth/callback`.

Fluxo:

- `/cadastro` cria usuário real no Supabase Auth e persiste `profiles` server-side.
- `/login` autentica e redireciona para `/onboarding` ou `/radar`.
- `/onboarding` salva `profiles` e `user_preferences`.
- `/logout` encerra a sessão.
- `/admin` exige usuário em `admin_users`.

## Primeiro Admin

Depois de criar o usuário via `/cadastro`, promova pelo SQL Editor:

```sql
select id, email from auth.users order by created_at desc;

insert into public.admin_users (user_id, role)
values ('COLE_AQUI_O_ID_DO_USUARIO', 'owner')
on conflict (user_id) do update set role = 'owner';
```

Sem registro em `admin_users`, o acesso a `/admin` será bloqueado.

## Rotas

Públicas:

- `/`
- `/login`
- `/cadastro`
- `/auth/callback`
- `/api/health`

Autenticadas:

- `/onboarding`
- `/radar`
- `/concursos/[id]`
- `/meus-concursos`
- `/logout`

Admin:

- `/admin`
- `/admin/fontes`
- `/admin/fontes/nova`
- `/admin/fontes/[id]/editar`
- `/admin/concursos`
- `/admin/concursos/novo`
- `/admin/concursos/[id]/editar`

## Radar e Meus Concursos

O Radar lê dados reais do Supabase:

- `contests` publicados.
- `contest_roles`.
- `contest_dates`.
- `sources`.
- `saved_contests` do usuário logado.

O match da Sprint 1 é simples e sem IA. Ele considera estado, cidade, escolaridade, cargo/área, salário e cadastro reserva.

Para testar salvar/remover:

1. Faça login com usuário que completou onboarding.
2. Acesse `/radar`.
3. Clique em `Salvar`.
4. Acesse `/meus-concursos`.
5. Clique em `Remover`.

## Admin

O admin é manual e protegido por `admin_users`.

Funcionalidades:

- Dashboard com métricas reais.
- CRUD de fontes.
- CRUD de concursos.
- Publicar/despublicar concursos.
- CRUD de cargos.
- CRUD de datas.
- Audit logs básicos.

Crawler, IA, upload real de PDF, OCR e notificações reais continuam fora do escopo.

## UI

A UI foi polida com base visual no protótipo `prototype/radar-concursos-br.html`, sem copiar o HTML empacotado nem scripts minificados.

Direção aplicada:

- Tema escuro premium.
- Acentos âmbar/dourado.
- Cards modernos.
- Badges legíveis.
- Inputs com foco visível.
- Landing, Auth, Onboarding, Radar, Detalhes, Meus Concursos e Admin mais consistentes.

## Testes

```bash
npm run lint
npm run typecheck
npm run test
npm audit --audit-level=moderate
```

Testes unitários cobrem formatters de concursos, match simples e validações de auth/admin.

## Handoff

Leia também:

- `docs/SPRINT_1_STATUS.md`

Esse documento contém o estado real da Sprint 1, decisões técnicas, fluxo manual de QA, segurança, pendências e próximos passos.
