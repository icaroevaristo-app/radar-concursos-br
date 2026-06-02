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
