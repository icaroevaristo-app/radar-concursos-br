# Prompt Mestre para IA/Dev — Radar Concursos BR V1.0

Use este prompt com Codex, Claude, Gemini, ChatGPT ou outra IA/dev para iniciar o desenvolvimento do Radar Concursos BR sem perder contexto.

---

## Prompt

Você deve atuar como uma equipe sênior multidisciplinar composta por:

- Product Manager sênior.
- Desenvolvedor full stack sênior.
- Arquiteto de software.
- Especialista em crawlers.
- Especialista em IA aplicada a documentos.
- UX/UI designer.
- QA engineer rigoroso.
- Especialista em LGPD e riscos digitais.

## Produto

Vamos desenvolver o **Radar Concursos BR**, um micro-SaaS B2C para pessoas físicas no Brasil que querem acompanhar concursos públicos municipais e estaduais compatíveis com seu perfil.

O produto deve rastrear fontes públicas, identificar novos editais, extrair informações relevantes, interpretar dados com apoio de IA, cruzar oportunidades com o perfil do usuário e enviar alertas personalizados.

## Posicionamento

O Radar Concursos BR deve ser posicionado como:

> Um radar simples e inteligente para encontrar concursos municipais e estaduais compatíveis com seu perfil, entender editais e não perder prazos.

O produto NÃO deve ser:

- Curso preparatório.
- Plataforma de questões.
- Simulado.
- Comunidade gigante.
- Órgão oficial.
- Site governamental.
- Garantia de aprovação.
- Consultoria jurídica.
- Sistema de inscrição automática.

## Escopo do MVP

Construir um **web app automático controlado**, não operação manual e não scraping nacional.

O MVP deve conter:

### Usuário

- Cadastro.
- Login.
- Onboarding de preferências.
- Cidade/UF.
- Raio de distância.
- Escolaridade.
- Áreas de interesse.
- Cargos de interesse.
- Salário mínimo.
- Lista personalizada de concursos.
- Página de detalhes do concurso.
- Salvar concurso.
- Checklist básico.
- Alertas por e-mail.
- Plano grátis/pago.

### Sistema

- Cadastro de fontes.
- Crawler de fontes.
- Download de PDFs/HTML.
- Extração de texto.
- Classificação de documento.
- Extração com IA.
- Validação automática.
- Cálculo de confiança.
- Deduplicação.
- Publicação automática com alta confiança.
- Matching com perfil do usuário.
- Fila de notificações.

### Admin

- Painel de fontes.
- Painel de documentos encontrados.
- Painel de extrações.
- Painel de concursos publicados.
- Painel de erros.
- Logs de crawler.
- Logs de IA.
- Logs de notificação.
- Possibilidade de corrigir casos críticos.

## Fora do MVP

Não desenvolver agora:

- App nativo.
- WhatsApp automático.
- Telegram bot.
- Banco de questões.
- Simulados.
- Comunidade.
- Ranking.
- Marketplace.
- Inscrição automática.
- Cobertura nacional.
- Crawlers para todas as prefeituras.
- Garantia de aprovação.

## Stack Recomendada

Use preferencialmente:

- Frontend: Next.js.
- Backend: Node.js com NestJS ou Fastify.
- Banco: PostgreSQL.
- Fila: Redis + BullMQ.
- Crawler: Playwright + Cheerio.
- PDF: extração de texto + OCR quando necessário.
- IA: OpenAI ou Gemini.
- E-mail: Resend, SendGrid ou Amazon SES.
- Pagamento: Mercado Pago, Stripe ou Asaas.
- Hospedagem: VPS, Railway, Render, Fly.io ou AWS simples.

Priorize TypeScript full stack para reduzir atrito.

## Arquitetura Esperada

Fluxo:

```text
Fontes públicas
    ↓
Crawler / Monitor de fontes
    ↓
Download de HTML/PDF
    ↓
Armazenamento bruto
    ↓
Extração de texto
    ↓
Classificação do documento
    ↓
Extração estruturada com IA
    ↓
Validação automática
    ↓
Cálculo de confiança
    ↓
Publicação do concurso
    ↓
Matching com usuários
    ↓
Fila de notificações
    ↓
Alerta para o usuário
```

## Regras Críticas

1. Todo concurso precisa ter fonte.
2. Link oficial sempre deve aparecer.
3. Concurso sem data final de inscrição deve ter baixa confiança.
4. IA não deve inventar dados.
5. Campos ausentes devem aparecer como “não informado”.
6. Baixa confiança não deve publicar automaticamente.
7. Alertas não devem ser duplicados.
8. Usuário deve conseguir pausar alertas.
9. Usuário deve conseguir cancelar conta.
10. O produto deve deixar claro que não é órgão oficial.

## Aviso Obrigatório

Adicionar nos locais relevantes:

> O Radar Concursos BR não é órgão público, não representa prefeituras, bancas ou governos. As informações são organizadas a partir de fontes públicas e podem conter erros. Antes de tomar qualquer decisão, consulte sempre o edital oficial e o site da banca/órgão responsável.

## Entidades Principais

Criar modelo de dados para:

- User.
- UserPreference.
- Source.
- CrawlRun.
- RawDocument.
- ExtractedDocument.
- Contest.
- ContestRole.
- ContestDate.
- ContestSummary.
- SavedContest.
- UserChecklistItem.
- MatchingResult.
- Notification.
- Subscription.
- AuditLog.

## Desenvolvimento por Fases

### Fase 1

- Setup.
- Auth.
- Usuários.
- Preferências.
- Tela Radar mockada.
- Admin base.

### Fase 2

- Fontes.
- Crawler.
- Download de documentos.
- Hash/deduplicação.
- Logs.

### Fase 3

- Extração de texto.
- Classificação.
- IA.
- JSON estruturado.
- Painel de extrações.

### Fase 4

- Validação.
- Confidence score.
- Publicação.
- Concurso real.
- Detalhes.

### Fase 5

- Matching.
- Recomendações.
- Salvar concurso.
- Checklist.

### Fase 6

- Notificações.
- E-mail.
- Histórico.
- Preferências.

### Fase 7

- Planos.
- Paywall.
- Pagamento.

## Critérios de Aceite

O MVP só deve ser considerado pronto quando:

1. Usuário consegue se cadastrar.
2. Usuário consegue definir preferências.
3. Sistema rastreia pelo menos 10 fontes.
4. Sistema detecta novo documento.
5. Sistema baixa HTML/PDF.
6. Sistema extrai texto.
7. Sistema classifica o documento.
8. Sistema extrai dados estruturados.
9. Sistema calcula confiança.
10. Sistema publica concursos de alta confiança.
11. Sistema cruza concurso com perfil.
12. Sistema envia alerta por e-mail.
13. Usuário consegue salvar e acompanhar concurso.
14. Admin consegue ver erros e fontes.
15. Avisos legais aparecem.
16. Opt-out funciona.

## Instruções de Desenvolvimento

- Não implementar funcionalidades fora do MVP.
- Não criar app nativo agora.
- Não criar simulados.
- Não criar banco de questões.
- Não criar comunidade.
- Não publicar dados de baixa confiança automaticamente.
- Não usar IA para inventar informação faltante.
- Criar logs desde o início.
- Criar testes para regras críticas.
- Priorizar clareza e manutenção.
- Preferir arquitetura simples, modular e escalável.

## Tarefa Inicial Recomendada

Primeiro, gere:

1. Estrutura do projeto.
2. Modelo inicial de dados.
3. Rotas principais.
4. Fluxo de autenticação.
5. Tela de onboarding.
6. Admin de fontes.
7. Worker inicial de crawler com uma fonte de exemplo.
8. Testes básicos.

Não avance para scraping nacional.
