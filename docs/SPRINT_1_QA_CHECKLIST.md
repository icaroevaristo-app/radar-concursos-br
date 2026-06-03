# Radar Concursos BR - Sprint 1 QA Checklist

Checklist manual final para validar a Sprint 1 em ambiente local, staging ou produção.

## 1. Autenticação

- [ ] Acessar `/cadastro`.
- [ ] Criar usuário com nome, e-mail, senha, aceite de termos e aceite de privacidade.
- [ ] Confirmar usuário em `auth.users`.
- [ ] Confirmar profile em `public.profiles`.
- [ ] Confirmar `terms_accepted_at` preenchido.
- [ ] Confirmar `privacy_accepted_at` preenchido.
- [ ] Acessar `/login`.
- [ ] Fazer login com credenciais válidas.
- [ ] Testar login inválido e confirmar mensagem amigável.
- [ ] Confirmar redirecionamento para `/onboarding` quando onboarding não estiver completo.
- [ ] Fazer logout em `/logout` ou pelo botão de sair.
- [ ] Confirmar redirecionamento para `/login`.

## 2. Onboarding

- [ ] Preencher cidade.
- [ ] Preencher UF.
- [ ] Preencher raio em km.
- [ ] Selecionar escolaridade principal.
- [ ] Selecionar escolaridades aceitas.
- [ ] Selecionar áreas.
- [ ] Selecionar cargos.
- [ ] Preencher salário mínimo, se desejado.
- [ ] Marcar/desmarcar preferências de temporário, cadastro reserva e prova em outra cidade.
- [ ] Selecionar canal de notificação preparado.
- [ ] Selecionar frequência.
- [ ] Salvar onboarding.
- [ ] Confirmar `profiles.onboarding_completed = true`.
- [ ] Confirmar linha em `user_preferences`.
- [ ] Confirmar redirecionamento para `/radar`.

## 3. Radar

- [ ] Acessar `/radar` autenticado.
- [ ] Confirmar que concursos publicados aparecem.
- [ ] Confirmar que dados vêm do Supabase, não de array hardcoded.
- [ ] Confirmar roles reais em cards.
- [ ] Confirmar datas reais em cards.
- [ ] Confirmar fonte, quando vinculada.
- [ ] Testar aba Todos.
- [ ] Testar aba Match forte.
- [ ] Testar aba Novos.
- [ ] Testar aba Encerrando.
- [ ] Confirmar que concursos demo aparecem marcados como `Seed/demo`.
- [ ] Confirmar aviso de seed/demo quando houver itens demo.
- [ ] Confirmar que campos ausentes aparecem como `não informado`.

## 4. Detalhes do Concurso

- [ ] Abrir detalhes de concurso real pelo card do Radar.
- [ ] Confirmar URL `/concursos/[id]` com id real.
- [ ] Confirmar título.
- [ ] Confirmar organização.
- [ ] Confirmar cidade/UF.
- [ ] Confirmar banca ou `não informado`.
- [ ] Confirmar fonte ou `não informado`.
- [ ] Confirmar resumo.
- [ ] Confirmar cargos.
- [ ] Confirmar datas.
- [ ] Confirmar link oficial visível.
- [ ] Confirmar aviso de não-oficialidade visível.
- [ ] Testar id inexistente e confirmar not found/estado adequado.
- [ ] Confirmar que concurso não publicado não aparece para usuário comum.

## 5. Salvar e Remover Concurso

- [ ] No Radar, clicar em `Salvar`.
- [ ] Confirmar linha em `saved_contests`.
- [ ] Confirmar que o card muda para ação de remover.
- [ ] Acessar `/meus-concursos`.
- [ ] Confirmar que o concurso salvo aparece.
- [ ] Remover concurso salvo.
- [ ] Confirmar que a linha em `saved_contests` foi removida.
- [ ] Confirmar que `/meus-concursos` não mostra salvos de outro usuário.

## 6. Admin - Acesso

- [ ] Acessar `/admin` como usuário comum.
- [ ] Confirmar bloqueio ou redirecionamento.
- [ ] Promover usuário para owner/admin em `admin_users`.
- [ ] Acessar `/admin` como owner/admin.
- [ ] Confirmar dashboard com métricas reais.

## 7. Admin - Fontes

- [ ] Acessar `/admin/fontes`.
- [ ] Confirmar listagem real de fontes.
- [ ] Criar fonte em `/admin/fontes/nova`.
- [ ] Confirmar fonte criada no Supabase.
- [ ] Editar fonte em `/admin/fontes/[id]/editar`.
- [ ] Confirmar alterações persistidas.
- [ ] Pausar fonte.
- [ ] Confirmar status `paused`.
- [ ] Reativar fonte.
- [ ] Confirmar status `active`.
- [ ] Confirmar audit log para criação/edição/status.

## 8. Admin - Concursos

- [ ] Acessar `/admin/concursos`.
- [ ] Confirmar listagem real de concursos.
- [ ] Criar concurso em `/admin/concursos/novo`.
- [ ] Confirmar concurso criado no Supabase.
- [ ] Editar concurso em `/admin/concursos/[id]/editar`.
- [ ] Confirmar alterações persistidas.
- [ ] Adicionar cargo.
- [ ] Confirmar cargo em `contest_roles`.
- [ ] Editar cargo.
- [ ] Remover cargo.
- [ ] Adicionar data.
- [ ] Confirmar data em `contest_dates`.
- [ ] Editar data.
- [ ] Remover data.
- [ ] Publicar concurso com `official_url`.
- [ ] Confirmar `publication_status = 'published'`.
- [ ] Confirmar `published_at` preenchido.
- [ ] Confirmar que concurso publicado aparece no Radar.
- [ ] Despublicar concurso.
- [ ] Confirmar `publication_status = 'unpublished'`.
- [ ] Confirmar que concurso despublicado some do Radar para usuário comum.
- [ ] Confirmar audit logs das ações principais.

## 9. Segurança e Compliance

- [ ] Confirmar que não há coleta de CPF.
- [ ] Confirmar que não há coleta de RG.
- [ ] Confirmar que não há coleta de endereço completo.
- [ ] Confirmar que o produto não usa linguagem de órgão oficial.
- [ ] Confirmar aviso de não-oficialidade visível.
- [ ] Confirmar que usuário comum não cria fonte.
- [ ] Confirmar que usuário comum não edita fonte.
- [ ] Confirmar que usuário comum não cria concurso.
- [ ] Confirmar que usuário comum não edita concurso.
- [ ] Confirmar que usuário comum só vê concursos publicados.
- [ ] Confirmar que service role não aparece no client.

## 10. UI e Responsividade

- [ ] Landing em desktop.
- [ ] Landing em mobile.
- [ ] Login/cadastro em desktop.
- [ ] Login/cadastro em mobile.
- [ ] Onboarding em desktop.
- [ ] Onboarding em mobile.
- [ ] Radar em desktop.
- [ ] Radar em mobile.
- [ ] Detalhes em desktop.
- [ ] Detalhes em mobile.
- [ ] Meus Concursos em desktop.
- [ ] Meus Concursos em mobile.
- [ ] Admin em desktop.
- [ ] Admin em mobile, ainda que operacional e não perfeito.
- [ ] Foco visível em inputs e botões.
- [ ] Contraste aceitável em badges e textos.
