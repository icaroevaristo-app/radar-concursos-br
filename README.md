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

Ela cria as tabelas da Sprint 1, funções auxiliares, triggers, RLS e policies. A migration `supabase/migrations/0002_fix_profiles_signup_flow.sql` reforça o trigger de criação de `profiles` após signup e os grants seguros para `service_role`. Não cria crawler, IA, pagamento ou notificações reais.

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

### Supabase Auth

No painel Supabase, configure Authentication com e-mail/senha e adicione as URLs de redirect:

```text
http://localhost:3000/auth/callback
http://localhost:3000/onboarding
http://localhost:3000/radar
```

Em produção, adicione os mesmos caminhos no domínio final, por exemplo:

```text
https://seu-dominio.com/auth/callback
https://seu-dominio.com/onboarding
https://seu-dominio.com/radar
```

Fluxo esperado:

- `/cadastro` cria usuário no Supabase Auth, envia `full_name` como metadata e salva `terms_accepted_at` e `privacy_accepted_at` no `profile`.
- `/login` autentica com Supabase Auth e redireciona para `/onboarding` ou `/radar`.
- `/onboarding` salva `profiles.city`, `profiles.state`, `profiles.education_level`, marca `onboarding_completed = true` e faz upsert em `user_preferences`.
- `/logout` encerra a sessão e redireciona para `/login`.
- `/admin` fica bloqueado até o usuário autenticado existir em `admin_users`.

Em desenvolvimento local, deixe `Authentication > Providers > Email > Confirm email` como `OFF` para testar cadastro, login e onboarding no mesmo fluxo. Se a confirmação de e-mail ficar ativa, o usuário pode ser criado sem uma sessão imediata; nesse caso, mantenha `SUPABASE_SERVICE_ROLE_KEY` configurada apenas no servidor para permitir salvar os aceites no `profile`.

Se o cadastro criar o usuário no Auth mas falhar em `profiles` com erro RLS (`42501`), verifique:

- `SUPABASE_SERVICE_ROLE_KEY` existe em `.env.local`.
- O servidor Next.js foi reiniciado depois de editar `.env.local`.
- A migration `0002_fix_profiles_signup_flow.sql` foi aplicada no Supabase.

Para criar o primeiro owner:

```sql
select id, email from auth.users order by created_at desc;

insert into public.admin_users (user_id, role)
values ('COLE_AQUI_O_ID_DO_USUARIO', 'owner')
on conflict (user_id) do update set role = 'owner';
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

## Radar e concursos

A tela `/radar` lê concursos publicados diretamente do Supabase:

- `contests` com `publication_status = 'published'`
- `contest_roles`
- `contest_dates`
- `sources`, quando vinculada
- `saved_contests` do usuário logado

O seed continua sendo demo, mas agora vem do banco. Os cards marcados com `Seed/demo` não indicam concursos reais em aberto.

O match da Sprint 1 é simples e sem IA. Ele soma pontos por estado, cidade, escolaridade, cargo/área, salário mínimo e preferência sobre cadastro reserva. Não há geolocalização real por distância nesta etapa.

Para testar salvar/remover concurso:

1. Entre com um usuário autenticado e com onboarding completo.
2. Acesse `/radar`.
3. Clique em `Salvar concurso`.
4. Acesse `/meus-concursos` e confirme que o item aparece.
5. Clique em `Remover dos salvos` e confirme que ele desaparece após a atualização.

## Admin Sprint 1

O painel `/admin` é acessível apenas para usuários presentes em `public.admin_users`. Usuários comuns são redirecionados.

Fluxo manual disponível:

- `/admin`: dashboard com totais reais de fontes e concursos.
- `/admin/fontes`: lista fontes reais, pausa/reativa e abre edição.
- `/admin/fontes/nova`: cria fonte manual.
- `/admin/fontes/[id]/editar`: edita fonte.
- `/admin/concursos`: lista concursos reais, publica/despublica e abre edição.
- `/admin/concursos/novo`: cria concurso em draft ou outro status permitido.
- `/admin/concursos/[id]/editar`: edita concurso, cargos e datas.

Publicar concurso exige `official_url`. Ao publicar, `publication_status` vira `published` e `published_at` é preenchido. Despublicar altera para `unpublished` sem deletar o registro.

As ações administrativas registram `audit_logs` básicos. Crawler, IA, upload real de PDF, OCR e notificações continuam fora do escopo.

## Próxima tarefa recomendada

Evoluir o Radar para filtros persistentes/editáveis e preparar a leitura real do painel admin sem implementar crawler ou IA ainda.
