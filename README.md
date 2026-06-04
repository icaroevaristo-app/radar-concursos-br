# Radar Concursos BR

Fundação funcional da Sprint 1 do Radar Concursos BR: web app independente para organizar concursos públicos municipais/estaduais, com Supabase Auth, preferências de usuário, Radar com dados reais do Supabase, Meus Concursos e Admin manual.

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
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
npm audit --audit-level=moderate
```

`npm run dev` usa `next dev --webpack` por estabilidade local. `npm run dev:turbo` mantém o Turbopack disponível para testes futuros.

## Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_CONTACT_EMAIL=
NEXT_PUBLIC_PREMIUM_CHECKOUT_URL=
```

Regras:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` é pública por design e pode ser usada no browser com RLS ativo.
- `SUPABASE_SERVICE_ROLE_KEY` é server-side apenas. Nunca exponha em Client Components, logs, browser ou repositório público.
- Em desenvolvimento, use `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
- Em produção, use `NEXT_PUBLIC_APP_URL=https://SEU-DOMINIO`.
- `NEXT_PUBLIC_CONTACT_EMAIL` é opcional e aparece em Termos/Privacidade. Se ficar vazio, o app usa `radarconcursosbr@gmail.com`.
- `NEXT_PUBLIC_PREMIUM_CHECKOUT_URL` é opcional e abre o checkout externo do Premium quando configurado. Deixe vazio enquanto Mercado Pago/webhook não estiver pronto.

## Analytics e Funil

O app possui eventos internos simples via `/api/events` e suporte opcional a GA4/Meta Pixel para trafego pago.

Variaveis opcionais:

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`

Se ficarem vazias, GA4 e Meta Pixel nao carregam. Os eventos nao enviam nome, e-mail, telefone, chaves, cookies ou dados sensiveis para analytics.

Eventos principais: `landing_view`, `click_create_free_alert`, `click_view_contests`, `contest_list_viewed`, `contest_card_clicked`, `signup_started`, `signup_completed`, `onboarding_completed`, `preferences_viewed`, `preferences_updated`, `contest_viewed` e `official_link_clicked`.

## Radar Premium

O projeto possui uma base inicial de assinatura manual em `subscriptions`:

- Oferta pública em `/assinar`: 7 dias grátis, depois R$ 9,90/mês.
- Página protegida em `/minha-conta/assinatura`.
- Admin em `/admin/assinaturas` para marcar status manualmente como `active`, `canceled` ou `expired`.
- Usuário gratuito pode salvar até 3 concursos; Premium/trial ativo pode salvar ilimitado.
- `NEXT_PUBLIC_PREMIUM_CHECKOUT_URL` pode apontar para um checkout externo quando estiver configurado.

Ainda não há webhook de pagamento, Mercado Pago completo, WhatsApp API real, cobrança automática ou envio real de notificações.

## Supabase Auth

Configuração em desenvolvimento:

- Site URL: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/onboarding`
  - `http://localhost:3000/radar`
- Para testar localmente, `Confirm email` pode ficar `OFF`.

Configuração em produção:

- Site URL: `https://SEU-DOMINIO`
- Redirect URLs:
  - `https://SEU-DOMINIO/auth/callback`
  - `https://SEU-DOMINIO/onboarding`
  - `https://SEU-DOMINIO/radar`
- Decida antes do go-live se `Confirm email` ficará `ON` ou `OFF`.

Fluxo:

- `/cadastro` cria usuário real no Supabase Auth e persiste `profiles` server-side.
- `/login` autentica e redireciona para `/onboarding` ou `/radar`.
- `/onboarding` salva `profiles` e `user_preferences`.
- `/logout` encerra a sessão.
- `/admin` exige usuário em `admin_users`.

## Supabase Banco

Aplicar migrations via CLI:

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

Aplicar seed demo via CLI:

```bash
supabase db seed
```

Aplicar pelo SQL Editor:

1. Abra o painel do Supabase.
2. Vá em SQL Editor.
3. Execute, nesta ordem:
   - `supabase/migrations/0001_sprint_1_foundation.sql`
   - `supabase/migrations/0002_fix_profiles_signup_flow.sql`
   - `supabase/seed.sql`, se quiser dados demo.

O seed é apenas demonstração. Ele marca concursos com `is_demo = true`, usa URLs seguras de demonstração e não afirma que oportunidades estão realmente abertas.

## Primeiro Admin

Depois de criar o usuário via `/cadastro`, promova pelo SQL Editor:

```sql
select id, email from auth.users order by created_at desc;

insert into public.admin_users (user_id, role)
values ('USER_ID', 'owner')
on conflict (user_id) do update set role = 'owner';
```

Sem registro em `admin_users`, o acesso a `/admin` será bloqueado.

## GitHub

Se ainda não houver repositório:

```bash
git init
git add .
git commit -m "feat: complete Sprint 1 foundation"
git branch -M main
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

Antes do commit, confira que `.gitignore` está protegendo:

- `.env`
- `.env.local`
- `.env*.local`
- `node_modules`
- `.next`
- arquivos temporários de debug

Nunca commite `.env.local` ou qualquer chave real do Supabase.

## Vercel

1. Crie ou escolha o repositório no GitHub.
2. Na Vercel, importe o projeto pelo GitHub.
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Install command: `npm install`
5. Build command: `npm run build`
6. Output: padrão do Next.js.
7. Depois do deploy, atualize o Supabase Auth com a URL real da Vercel/domínio.

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

## Validação Local

Antes de abrir PR ou deploy:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --audit-level=moderate
```

Testes unitários cobrem formatters de concursos, match simples e validações de auth/admin.

## Pós-Deploy

Após publicar na Vercel:

1. Acesse `/api/health`.
2. Teste cadastro.
3. Teste login.
4. Complete onboarding.
5. Acesse Radar.
6. Salve e remova concurso.
7. Promova um usuário para owner/admin.
8. Teste `/admin`.
9. Crie fonte.
10. Crie concurso, cargo e data.
11. Publique o concurso.
12. Confirme que aparece no Radar.
13. Despublique e confirme que some do Radar.
14. Confira `audit_logs`.

## Handoff e Checklists

Leia também:

- `docs/SPRINT_1_STATUS.md`
- `docs/DEPLOY_CHECKLIST.md`
- `docs/SPRINT_1_QA_CHECKLIST.md`
