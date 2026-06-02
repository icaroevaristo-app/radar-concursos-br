# Radar Concursos BR

Fundação do produto em Next.js para a Sprint 1.

## Análise inicial

Documentos lidos em `docs/`:

- Manifesto: produto independente para organizar concursos municipais e estaduais compatíveis com o perfil do usuário.
- PRD: landing, cadastro/login, onboarding, Radar, detalhes, Meus Concursos, alertas futuros e admin.
- Blueprint: arquitetura modular com web app, API, Supabase/PostgreSQL, fontes, concursos, matching e observabilidade futura.
- Modelo conceitual: base para profiles, preferences, sources, contests, roles, dates, saved contests e admin users.
- QA/LGPD: foco em fonte oficial, dados mínimos, campos ausentes como "não informado", consentimento e aviso de não-oficialidade.

Protótipo analisado em `prototype/radar-concursos-br.html`:

- Elementos visuais reaproveitáveis: fundo escuro, cor âmbar como ação principal, cards compactos, badges de status, onboarding em etapas, listas tipo radar e painel admin tabular.
- O protótipo tem dados e navegação empacotados/hardcoded. A busca/listagem não deve permanecer assim: a implementação real deve consultar Supabase (`contests`, `contest_roles`, `contest_dates`, `saved_contests` e preferências do usuário).
- O HTML empacotado não foi usado como base do código.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase JS
- PostgreSQL via Supabase
- Supabase Auth preparado
- Supabase Storage preparado para uso futuro

## Estrutura

```text
src/
  app/
    (auth)/
      cadastro/
      login/
      onboarding/
    (app)/
      concursos/[id]/
      meus-concursos/
      radar/
    admin/
      concursos/
      fontes/
    api/health/
  components/
    contests/
    layout/
    shared/
    ui/
  lib/
    supabase/
  types/
supabase/
  migrations/
```

## Rotas

- `/` página inicial pública
- `/login`
- `/cadastro`
- `/onboarding`
- `/radar`
- `/concursos/[id]`
- `/meus-concursos`
- `/admin`
- `/admin/fontes`
- `/admin/concursos`
- `/api/health`

## Ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Supabase

Crie um projeto Supabase e copie a URL e a anon key para `.env.local`. A service role key deve ficar apenas em ambiente server-side e nunca deve ser exposta no cliente.

### Aplicar migrations via CLI

Com o Supabase CLI autenticado e o projeto linkado:

```bash
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase db push
```

A migration principal está em:

```text
supabase/migrations/0001_sprint_1_foundation.sql
```

Ela cria as tabelas da Sprint 1, funções auxiliares, triggers, RLS e policies. Não cria crawler, IA, pagamento ou notificações reais.

### Aplicar seed demo

Depois da migration:

```bash
supabase db seed
```

ou, pelo SQL Editor do painel Supabase, execute:

```text
supabase/seed.sql
```

O seed é apenas demonstração. Ele usa URLs `https://example.com/...`, marca concursos com `is_demo = true` e não afirma que as oportunidades estão realmente abertas.

### Admin inicial

Admins são controlados por `public.admin_users`. Para promover o primeiro usuário, crie uma conta pelo Supabase Auth e insira manualmente o `user_id` como `owner` pelo SQL Editor ou usando a service role em ambiente seguro:

```sql
insert into public.admin_users (user_id, role)
values ('USER_ID_DO_AUTH', 'owner');
```

Não use a anon key para ações administrativas.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
```

## Aviso legal

O produto inclui aviso de não-oficialidade nas páginas principais:

> O Radar Concursos BR não é órgão público, não representa prefeituras, bancas ou governos. As informações são organizadas a partir de fontes públicas e podem conter erros. Antes de tomar qualquer decisão, consulte sempre o edital oficial e o site da banca/órgão responsável.

## Limites desta entrega

Não foram implementados crawler, IA, pagamento, WhatsApp, Telegram, app nativo, banco de questões, simulados, comunidade, scraping nacional ou notificações reais.

Dados exibidos no Radar são `seed/demo` e estão marcados visualmente.

## Próxima tarefa recomendada

Conectar Supabase Auth real nas telas de login/cadastro, trocar o Radar para ler `contests`, `contest_roles` e `contest_dates` publicados, e fazer `saved_contests` funcionar com o usuário autenticado.
