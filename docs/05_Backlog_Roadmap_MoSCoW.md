# Radar Concursos BR — Backlog e Roadmap V1.0

## 1. Roadmap Geral

## Fase 1 — Fundação

Objetivo: criar base do produto.

Entregáveis:

- Autenticação.
- Cadastro.
- Preferências.
- Banco inicial.
- Painel básico.
- Estrutura de concursos.
- Tela Radar.
- Tela Detalhes.

## Fase 2 — Crawler Inicial

Objetivo: rastrear fontes controladas.

Entregáveis:

- Cadastro de fontes.
- Crawler por fonte.
- Download de HTML/PDF.
- Hash de duplicidade.
- Logs de execução.
- Painel de documentos.

## Fase 3 — IA e Extração

Objetivo: transformar edital em dados estruturados.

Entregáveis:

- Extração de texto.
- Classificação de documento.
- Extração JSON.
- Validação.
- Confidence score.
- Painel de extrações.

## Fase 4 — Publicação e Matching

Objetivo: transformar documentos em concursos recomendáveis.

Entregáveis:

- Publicação automática por confiança.
- Criação de concursos.
- Criação de cargos.
- Criação de datas.
- Matching com usuários.
- Tela personalizada.

## Fase 5 — Notificações

Objetivo: alertar usuários.

Entregáveis:

- Fila de e-mail.
- Alerta de novo concurso.
- Alerta de inscrição encerrando.
- Histórico de notificações.
- Preferências de notificação.

## Fase 6 — Monetização

Objetivo: testar receita.

Entregáveis:

- Plano grátis.
- Plano pago.
- Paywall.
- Integração de pagamento.
- Controle de assinatura.

## 2. Backlog MoSCoW

## Must Have

Essencial para o MVP automático.

### Produto

- Cadastro/login.
- Onboarding.
- Preferências.
- Lista de concursos.
- Detalhes do concurso.
- Salvar concurso.
- Alertas por e-mail.
- Aviso de não-oficialidade.
- Termos de uso.
- Política de privacidade.

### Admin

- Painel de fontes.
- Painel de documentos.
- Painel de extrações.
- Painel de concursos.
- Painel de erros.
- Logs básicos.

### Sistema

- Cadastro de fontes.
- Crawler.
- Extração de PDF/HTML.
- Classificação de documento.
- IA para extração.
- Validação.
- Confidence score.
- Deduplicação.
- Matching.
- Fila de notificações.

### Compliance

- Consentimento.
- Opt-out.
- Exclusão de conta.
- Minimização de dados.
- Aviso de fonte oficial.

## Should Have

Importante, mas pode vir depois do núcleo.

- Checklist.
- Alerta de inscrição encerrando.
- Retificação.
- Pagamento.
- Plano grátis/pago.
- Resumo simples.
- Painel de erros mais detalhado.
- Deduplicação avançada.
- Histórico de alterações.
- Exportação de logs.
- OCR básico.

## Could Have

Interessante, mas não crítico.

- Push notification.
- WhatsApp.
- Telegram bot.
- Plano de estudo.
- SEO programático.
- App mobile.
- Comparação entre concursos.
- OCR avançado.
- Ranking de melhores oportunidades.
- Indicação para amigos.
- Afiliados simples.

## Won’t Have Now

Não fazer no MVP.

- Banco de questões.
- Simulados.
- Comunidade.
- App nativo completo.
- Cobertura nacional.
- Marketplace de cursos.
- Afiliados avançados.
- Inscrição automática.
- Integração oficial com prefeituras.
- Consultoria individual.
- Garantia de aprovação.

## 3. Ordem Recomendada de Desenvolvimento

### Sprint 1

- Setup do projeto.
- Banco.
- Autenticação.
- Usuários.
- Preferências.
- Layout base.
- Tela Radar mockada.
- Admin base.

### Sprint 2

- Entidade Source.
- Cadastro de fontes.
- Crawler simples.
- Download de documento.
- Hash/deduplicação.
- Logs de crawler.

### Sprint 3

- Extração de texto.
- Classificação de documento.
- Integração IA.
- JSON estruturado.
- Painel de extrações.

### Sprint 4

- Validation Engine.
- Confidence Engine.
- Criação de concursos a partir da extração.
- Publicação automática de alta confiança.
- Tela Detalhes real.

### Sprint 5

- Matching Engine.
- Lista personalizada.
- Motivos do match.
- Salvar concurso.
- Checklist básico.

### Sprint 6

- Notification Engine.
- E-mail.
- Alertas de novo concurso.
- Alertas de prazo.
- Preferências de alerta.
- Logs de envio.

### Sprint 7

- Paywall.
- Planos.
- Pagamento.
- Limites de plano.
- Ajustes de UX.

### Sprint 8

- QA geral.
- Monitoramento.
- Ajustes.
- Beta fechado.
- Correções.

## 4. Critérios de Priorização

Priorizar o que:

1. Ajuda o usuário a encontrar concurso compatível.
2. Evita perder prazo.
3. Melhora confiança dos dados.
4. Reduz duplicidade.
5. Garante rastreabilidade.
6. Ajuda o sistema a automatizar sem virar caos.

Não priorizar o que:

1. Parece bonito mas não aumenta valor.
2. Imita plataforma gigante.
3. Aumenta suporte.
4. Exige escala nacional cedo.
5. Depende de dados que o sistema ainda não consegue capturar.
