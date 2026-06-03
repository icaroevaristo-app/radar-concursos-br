# Radar Concursos BR - Sprint 1 Handoff

Data: 2026-06-02

Este documento é um handoff técnico para outra IA ou outro desenvolvedor continuar o projeto sem depender do histórico da conversa anterior.

## 1. Resumo Executivo

O Radar Concursos BR é um web app independente para organizar e acompanhar concursos públicos municipais/estaduais a partir de fontes públicas. O produto não é órgão oficial, não representa governos, bancas ou prefeituras, e sempre deve orientar o usuário a conferir o edital/link oficial.

A Sprint 1 entregou a fundação do produto:

- Next.js com TypeScript e Tailwind CSS.
- Supabase Auth.
- PostgreSQL via Supabase com migrations, RLS e seed demo.
- Cadastro, login, logout e onboarding.
- Perfis e preferências de usuário.
- Radar com concursos publicados vindos do banco.
- Detalhes por id real.
- Meus Concursos com `saved_contests`.
- Admin protegido por `admin_users`.
- CRUD manual de fontes, concursos, cargos e datas.
- Publicar/despublicar concursos.
- Audit logs básicos.
- Testes unitários básicos com Vitest.

Ainda não há crawler, IA, pagamento, notificações reais, upload real de PDF, OCR, WhatsApp, Telegram ou app nativo.

## 2. Stack e Comandos

Stack:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Supabase JS.
- Supabase SSR.
- PostgreSQL/Supabase.
- Vitest.

Comandos principais:

```bash
npm install
npm run dev
npm run dev:turbo
npm run lint
npm run typecheck
npm run test
npm audit --audit-level=moderate
```

Observação importante:

- `npm run dev` usa `next dev --webpack` por estabilidade local.
- `npm run dev:turbo` usa `next dev` e fica disponível para testes futuros com Turbopack.

## 3. Variáveis de Ambiente

Arquivo esperado: `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Regras:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` podem ser usadas no client.
- `SUPABASE_SERVICE_ROLE_KEY` só pode ser usada server-side.
- Nunca importar ou usar `SUPABASE_SERVICE_ROLE_KEY` em Client Components.
- `src/lib/supabase/server.ts` usa `import "server-only"` para proteger o client service role.

## 4. Supabase Auth

Rotas principais:

- `/cadastro`
- `/login`
- `/logout`
- `/auth/callback`
- `/onboarding`

Configuração recomendada no Supabase Auth para dev local:

- Provider Email ativo.
- `Confirm email` como `OFF` para testar cadastro/login/onboarding no mesmo fluxo.
- Redirect URL: `http://localhost:3000/auth/callback`.

Fluxo atual:

1. `/cadastro` chama `signupAction`.
2. `signupAction` cria usuário via Supabase Auth usando client normal com anon key.
3. Após `signUp`, `profiles` é persistido via `createServiceRoleSupabaseClient()` server-side.
4. São salvos `full_name`, `email`, `terms_accepted_at`, `privacy_accepted_at` e `subscription_status = 'free'`.
5. `/login` autentica via Supabase Auth e redireciona para `/onboarding` ou `/radar`.
6. `/onboarding` salva `profiles.city`, `profiles.state`, `profiles.education_level`, marca `onboarding_completed = true` e faz upsert em `user_preferences`.
7. `/logout` encerra a sessão.

Arquivos relevantes:

- `src/lib/auth/actions.ts`
- `src/lib/auth/index.ts`
- `src/lib/auth/validation.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/middleware.ts`
- `middleware.ts`

## 5. Banco de Dados e Migrations

Migrations:

- `supabase/migrations/0001_sprint_1_foundation.sql`
- `supabase/migrations/0002_fix_profiles_signup_flow.sql`

Seed:

- `supabase/seed.sql`

Tabelas principais:

- `profiles`
- `user_preferences`
- `admin_users`
- `sources`
- `contests`
- `contest_roles`
- `contest_dates`
- `saved_contests`
- `audit_logs`

Funções SQL relevantes:

- `public.update_updated_at_column()`
- `public.handle_new_user()`
- `public.is_admin()`
- `public.is_owner()`

Triggers relevantes:

- `on_auth_user_created` em `auth.users`.
- Triggers de `updated_at`.
- Trigger para preencher `published_at` quando concurso é publicado.

RLS:

- RLS está ativo nas tabelas sensíveis.
- Usuário comum só lê concursos publicados.
- Usuário comum só gerencia seus próprios `saved_contests`.
- Admin é validado por `admin_users`.
- Admin gerencia fontes/concursos/cargos/datas via policies e actions server-side.
- Não desativar RLS.
- Não criar policy pública para insert em `profiles`, `sources`, `contests`, `contest_roles` ou `contest_dates`.

Aplicar migrations/seed:

```bash
supabase link --project-ref SEU_PROJECT_REF
supabase db push
supabase db seed
```

Ou aplicar manualmente pelo SQL Editor na ordem:

1. `0001_sprint_1_foundation.sql`
2. `0002_fix_profiles_signup_flow.sql`
3. `seed.sql`

## 6. Rotas Implementadas

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

Proteções:

- `middleware.ts` protege rotas autenticadas e admin.
- `src/app/(app)/layout.tsx` exige usuário logado e onboarding completo.
- `src/app/admin/layout.tsx` chama `requireAdmin()`.
- Todas as actions admin chamam `requireAdmin()` server-side.

## 7. Radar, Detalhes e Meus Concursos

Arquivos relevantes:

- `src/lib/contests/queries.ts`
- `src/lib/contests/actions.ts`
- `src/lib/contests/match.ts`
- `src/lib/contests/formatters.ts`
- `src/app/(app)/radar/page.tsx`
- `src/app/(app)/concursos/[id]/page.tsx`
- `src/app/(app)/meus-concursos/page.tsx`

Radar:

- Lê `contests` com `publication_status = 'published'`.
- Hidrata `contest_roles`, `contest_dates` e `sources`.
- Busca `saved_contests` do usuário logado.
- Calcula match simples por usuário.
- Abas atuais: Todos, Match forte, Novos, Encerrando.

Detalhes:

- Busca concurso por id real.
- Exige `publication_status = 'published'`.
- Se não existir ou não estiver publicado, usa `notFound()`.
- Mostra cargos, datas, link oficial e aviso de não-oficialidade.
- Campos ausentes devem aparecer como `não informado`.

Meus Concursos:

- Lê `saved_contests` apenas do usuário logado.
- Lista concursos salvos publicados.
- Permite remover dos salvos.

Salvar/remover:

- `saveContest`, `unsaveContest` e `toggleSaveContest` persistem em `saved_contests`.
- Revalidam `/radar`, `/meus-concursos` e `/concursos/[id]`.

## 8. Match Simples da Sprint 1

Arquivo:

- `src/lib/contests/match.ts`

Regras atuais:

- +25 se estado do concurso combina com `user_preferences.states` ou `profile.state`.
- +20 se cidade combina com `user_preferences.cities` ou `profile.city`.
- +20 se escolaridade de algum cargo combina com preferências ou perfil.
- +20 se cargo/área combina de forma simples com preferências.
- +10 se salário é maior ou igual a `min_salary`.
- -20 se cargo é cadastro reserva e usuário não aceita cadastro reserva.

Níveis:

- `strong`: score >= 70.
- `medium`: score >= 40.
- `weak`: score < 40.

Não há IA nem cálculo real de distância.

## 9. Admin

Arquivos relevantes:

- `src/lib/admin/queries.ts`
- `src/lib/admin/actions.ts`
- `src/lib/admin/validation.ts`
- `src/lib/admin/audit.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/fontes/page.tsx`
- `src/app/admin/fontes/nova/page.tsx`
- `src/app/admin/fontes/[id]/editar/page.tsx`
- `src/app/admin/concursos/page.tsx`
- `src/app/admin/concursos/novo/page.tsx`
- `src/app/admin/concursos/[id]/editar/page.tsx`

Dashboard:

- Total de fontes.
- Fontes ativas.
- Total de concursos.
- Concursos publicados.
- Concursos em draft/needs_review.
- Últimos 5 concursos.
- Últimas 5 fontes.

Fontes:

- Listar fontes reais.
- Criar fonte.
- Editar fonte.
- Pausar/reativar fonte.
- Campos de crawler existem apenas como preparação; nenhum crawler roda.

Concursos:

- Listar concursos reais.
- Criar concurso.
- Editar concurso.
- Publicar/despublicar.
- Gerenciar cargos.
- Gerenciar datas.
- Publicar exige `official_url`.
- Publicar define `publication_status = 'published'` e preenche `published_at`.
- Despublicar define `publication_status = 'unpublished'` sem deletar.

Audit logs:

- `logAdminAction()` grava em `audit_logs`.
- Ações cobertas: fontes, concursos, publicação, cargos e datas.

## 10. Primeiro Admin

Após criar usuário via `/cadastro`:

```sql
select id, email from auth.users order by created_at desc;

insert into public.admin_users (user_id, role)
values ('COLE_AQUI_O_ID_DO_USUARIO', 'owner')
on conflict (user_id) do update set role = 'owner';
```

Sem linha em `admin_users`, `/admin` deve bloquear/redirecionar o usuário.

## 11. Testes Automatizados

Framework:

- Vitest.

Config:

- `vitest.config.ts`

Testes existentes:

- `src/lib/contests/formatters.test.ts`
- `src/lib/contests/match.test.ts`
- `src/lib/admin/validation.test.ts`
- `src/lib/auth/validation.test.ts`

Rodar:

```bash
npm run test
```

Cobertura atual:

- Formatters de concursos.
- Match simples.
- Validações admin.
- Validações de auth/onboarding.

Não há testes de integração com Supabase real ainda.

## 12. Fluxo Manual de QA

1. Rodar `npm run dev`.
2. Criar conta em `/cadastro`.
3. Confirmar usuário em `auth.users`.
4. Confirmar linha em `public.profiles`.
5. Completar `/onboarding`.
6. Confirmar `profiles.onboarding_completed = true`.
7. Acessar `/radar`.
8. Confirmar que concursos publicados aparecem.
9. Salvar concurso.
10. Confirmar linha em `saved_contests`.
11. Acessar `/meus-concursos`.
12. Remover concurso salvo.
13. Acessar `/admin` com usuário não admin e confirmar bloqueio.
14. Promover usuário para owner/admin.
15. Acessar `/admin`.
16. Criar fonte.
17. Editar fonte.
18. Pausar/reativar fonte.
19. Criar concurso.
20. Adicionar cargo.
21. Adicionar data `registration_end`.
22. Publicar concurso.
23. Confirmar que aparece no Radar.
24. Despublicar concurso.
25. Confirmar que some do Radar.
26. Conferir `audit_logs`.

## 13. Revisão de Segurança

Estado atual:

- `SUPABASE_SERVICE_ROLE_KEY` é server-only.
- Client browser usa apenas anon key.
- Rotas admin têm proteção por middleware e layout server-side.
- Actions admin chamam `requireAdmin()`.
- Usuário comum não deve gerenciar fontes/concursos/cargos/datas.
- Usuário comum só deve ver concursos publicados.
- Usuário comum só deve ver seus próprios salvos.

Pontos a revalidar em staging:

- Policies de admin em `sources`, `contests`, `contest_roles`, `contest_dates`.
- Policies de `saved_contests` por usuário.
- Visibilidade de concursos não publicados para usuário comum.
- Bloqueio real de `/admin` para usuário não admin.

## 14. Logs

Logs temporários de debug foram removidos.

Mantidos:

- Logs de erro em `signupAction` para falha real de Supabase Auth ou persistência de profile.

Não imprimir:

- Service role.
- Anon key.
- Senhas.
- Tokens.
- Cookies.

## 15. Fora do Escopo Atual

Não implementar na Sprint 1:

- Crawler.
- IA.
- Pagamento.
- WhatsApp.
- Telegram.
- App nativo.
- OCR.
- Upload real de PDF.
- Notificações reais.
- Scraping nacional.
- Banco de questões.
- Simulados.
- Comunidade.
- Redesign visual completo.

## 16. Pendências Para Próxima Etapa

Prioridade recomendada antes da Sprint 2:

1. Rodar QA manual completo em Supabase real/staging.
2. Revisar RLS na prática com dois usuários: comum e admin.
3. Polir visual dos formulários admin e páginas autenticadas.
4. Melhorar UX de erros em Server Actions.
5. Criar página `/conta` para edição de perfil/preferências.
6. Criar testes de integração com Supabase local ou staging.

Sprint 2 sugerida:

- Planejar crawler controlado por fontes cadastradas.
- Criar logs operacionais de crawler.
- Criar entidades de documentos brutos, se necessário.
- Manter cobertura restrita e sem scraping nacional.

## 17. Última Validação Conhecida

Na última revisão técnica, os comandos abaixo passaram:

```bash
npm run lint
npm run typecheck
npm run test
npm audit --audit-level=moderate
```

Resultado conhecido:

- Lint passou.
- Typecheck passou.
- Vitest passou com 4 arquivos e 13 testes.
- Audit retornou `found 0 vulnerabilities`.
