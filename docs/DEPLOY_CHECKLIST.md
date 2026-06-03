# Radar Concursos BR - Deploy Checklist

Use este checklist para preparar GitHub, Supabase e Vercel sem depender do histórico do projeto.

## 1. Pré-Deploy Local

- [ ] Rodar `npm install`.
- [ ] Confirmar `.env.local` configurado.
- [ ] Confirmar `.env.local` não será commitado.
- [ ] Rodar `npm run lint`.
- [ ] Rodar `npm run typecheck`.
- [ ] Rodar `npm run test`.
- [ ] Rodar `npm run build`.
- [ ] Rodar `npm audit --audit-level=moderate`.
- [ ] Confirmar que `/api/health` responde localmente.
- [ ] Confirmar que não há chaves reais hardcoded no código.
- [ ] Confirmar que `SUPABASE_SERVICE_ROLE_KEY` só aparece em código server-side.
- [ ] Confirmar que o aviso de não-oficialidade está visível nas telas principais.

## 2. GitHub

- [ ] Confirmar `.gitignore` cobrindo `.env`, `.env.local`, `.env*.local`, `node_modules`, `.next` e logs.
- [ ] Inicializar git, se necessário: `git init`.
- [ ] Revisar arquivos alterados: `git status`.
- [ ] Adicionar arquivos: `git add .`.
- [ ] Criar commit: `git commit -m "feat: complete Sprint 1 foundation"`.
- [ ] Renomear branch: `git branch -M main`.
- [ ] Criar repositório no GitHub.
- [ ] Adicionar remoto: `git remote add origin URL_DO_REPOSITORIO`.
- [ ] Enviar: `git push -u origin main`.

## 3. Supabase

- [ ] Criar ou selecionar projeto Supabase.
- [ ] Copiar Project URL.
- [ ] Copiar anon key.
- [ ] Copiar service role/secret key com cuidado.
- [ ] Aplicar `supabase/migrations/0001_sprint_1_foundation.sql`.
- [ ] Aplicar `supabase/migrations/0002_fix_profiles_signup_flow.sql`.
- [ ] Aplicar `supabase/seed.sql`, se quiser dados demo.
- [ ] Confirmar que RLS está ativo nas tabelas sensíveis.
- [ ] Configurar Auth Site URL de desenvolvimento: `http://localhost:3000`.
- [ ] Configurar Redirect URLs de desenvolvimento:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `http://localhost:3000/onboarding`
  - [ ] `http://localhost:3000/radar`
- [ ] Configurar Auth Site URL de produção: `https://SEU-DOMINIO`.
- [ ] Configurar Redirect URLs de produção:
  - [ ] `https://SEU-DOMINIO/auth/callback`
  - [ ] `https://SEU-DOMINIO/onboarding`
  - [ ] `https://SEU-DOMINIO/radar`
- [ ] Decidir se `Confirm email` ficará `ON` ou `OFF` em produção.
- [ ] Criar primeiro usuário pelo app.
- [ ] Promover primeiro owner/admin:

```sql
select id, email from auth.users order by created_at desc;

insert into public.admin_users (user_id, role)
values ('USER_ID', 'owner')
on conflict (user_id) do update set role = 'owner';
```

## 4. Vercel

- [ ] Importar projeto pelo GitHub.
- [ ] Configurar Install Command: `npm install`.
- [ ] Configurar Build Command: `npm run build`.
- [ ] Manter Output padrão do Next.js.
- [ ] Configurar variáveis:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] Confirmar que `NEXT_PUBLIC_APP_URL` aponta para a URL de produção.
- [ ] Fazer deploy.
- [ ] Atualizar Supabase Auth com a URL real da Vercel/domínio.

## 5. Pós-Deploy

- [ ] Acessar `/api/health`.
- [ ] Acessar landing `/`.
- [ ] Criar conta.
- [ ] Completar onboarding.
- [ ] Acessar `/radar`.
- [ ] Abrir detalhes de um concurso publicado.
- [ ] Salvar concurso.
- [ ] Ver concurso em `/meus-concursos`.
- [ ] Remover concurso salvo.
- [ ] Confirmar bloqueio de `/admin` para usuário comum.
- [ ] Confirmar acesso de owner/admin.
- [ ] Criar fonte.
- [ ] Criar concurso.
- [ ] Adicionar cargo.
- [ ] Adicionar data.
- [ ] Publicar concurso.
- [ ] Confirmar aparição no Radar.
- [ ] Despublicar concurso.
- [ ] Confirmar remoção do Radar para usuário comum.
- [ ] Conferir `audit_logs`.

## 6. Testes de Produção

- [ ] Testar desktop.
- [ ] Testar mobile.
- [ ] Testar fluxo autenticado em janela anônima.
- [ ] Testar erro de login inválido.
- [ ] Testar usuário sem onboarding.
- [ ] Testar usuário com onboarding completo.
- [ ] Testar usuário admin.
- [ ] Testar usuário comum.
- [ ] Confirmar que campos ausentes aparecem como `não informado`.
- [ ] Confirmar que link oficial aparece nos detalhes.
- [ ] Confirmar que seed/demo está marcado como demonstração.

## 7. Rollback Básico

- [ ] Na Vercel, voltar para o deployment anterior se o novo deploy quebrar fluxo crítico.
- [ ] Não rodar rollback destrutivo no banco sem backup.
- [ ] Se uma migration nova falhar no futuro, pausar deploy e corrigir em nova migration.
- [ ] Se variáveis estiverem erradas, corrigir Environment Variables na Vercel e redeployar.
- [ ] Se Auth redirect falhar, corrigir URLs no Supabase Auth e testar novamente.
