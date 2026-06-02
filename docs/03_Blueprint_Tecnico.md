# Radar Concursos BR — Blueprint Técnico V1.0

## 1. Objetivo

Definir a arquitetura técnica de alto nível para o MVP automático do Radar Concursos BR.

## 2. Arquitetura Geral

Fluxo principal:

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

## 3. Stack Recomendada

### Recomendação principal

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

### Alternativa robusta

- Backend em Spring Boot.
- Scraper em Python.
- PostgreSQL.
- Redis.
- Workers separados.
- Spring AI ou integração direta com APIs de IA.

### Recomendação final

Começar com **Next.js + Node/TypeScript + PostgreSQL + Redis + Workers**.

Motivos:

- Desenvolvimento mais rápido.
- Menos atrito.
- Bom para usar IA/Codex.
- Frontend e backend na mesma linguagem.
- Suficiente para MVP automático.

## 4. Módulos Técnicos

### 4.1. Web App

Responsável por:

- Landing page.
- Cadastro/login.
- Onboarding.
- Tela Radar.
- Detalhes do concurso.
- Meus concursos.
- Alertas.
- Assinatura.
- Painel admin.

### 4.2. API Backend

Responsável por:

- Autenticação.
- Usuários.
- Preferências.
- Concursos.
- Fontes.
- Documentos.
- Matching.
- Notificações.
- Assinaturas.
- Permissões admin.

### 4.3. Source Registry

Cadastro das fontes monitoradas.

Campos conceituais:

- Nome.
- Tipo.
- URL base.
- Estado.
- Cidade.
- Frequência de varredura.
- Confiabilidade.
- Status.
- Último rastreamento.
- Estratégia de crawler.

Tipos de fonte:

- Banca.
- Prefeitura.
- Câmara municipal.
- Diário oficial.
- Portal de concursos.
- Secretaria estadual.
- Autarquia.

### 4.4. Crawler Engine

Responsável por acessar fontes e detectar novos documentos.

Tipos de crawler:

- HTML simples.
- Navegador com Playwright.
- PDF.
- Diário oficial.
- Portal estruturado.
- Banca específica.

Funções:

- Buscar links novos.
- Identificar PDFs.
- Detectar mudanças.
- Evitar duplicidade.
- Salvar conteúdo bruto.
- Registrar erros.
- Respeitar limites de acesso.

### 4.5. Raw Document Storage

Armazena material bruto:

- HTML.
- PDF.
- Texto extraído.
- Link original.
- Hash.
- Fonte.
- Data de descoberta.
- Status.

### 4.6. Document Classifier

Classifica o documento antes da extração.

Tipos:

- Edital de abertura.
- Retificação.
- Resultado.
- Convocação.
- Homologação.
- Local de prova.
- Processo seletivo.
- Notícia.
- Documento irrelevante.
- Desconhecido.

### 4.7. AI Extraction Engine

Usa IA para extrair dados estruturados.

Entrada:

- Texto do edital.
- Metadados da fonte.
- URL.
- Nome do arquivo.

Saída esperada:

- JSON estruturado.
- Tipo do documento.
- Campos principais.
- Confiança estimada.
- Campos ausentes.

Campos principais:

- Título.
- Órgão.
- Cidade.
- UF.
- Banca.
- Cargo.
- Escolaridade.
- Salário.
- Vagas.
- Carga horária.
- Requisitos.
- Data de inscrição.
- Data da prova.
- Taxa.
- Link oficial.
- Conteúdo programático.
- Etapas.
- Observações importantes.

### 4.8. Validation Engine

Valida dados extraídos.

Regras principais:

- Data final de inscrição não pode estar vazia para concurso aberto.
- Data final não pode ser anterior à data atual, exceto concursos encerrados.
- Cidade e UF devem existir.
- Link oficial deve existir.
- Cargo deve existir.
- Escolaridade deve existir ou ficar como “não informado”.
- Salário deve ser número ou “não informado”.
- Documento duplicado deve ser bloqueado.
- Retificação deve tentar se vincular ao edital original.

### 4.9. Confidence Engine

Calcula nível de confiança.

Exemplo de pontuação:

```text
+20 se fonte for confiável
+20 se data de inscrição foi encontrada
+15 se cidade/UF foram encontradas
+15 se cargos foram encontrados
+10 se edital oficial foi encontrado
+10 se salário ou requisito foi encontrado
+10 se não houver conflito de dados
```

Classificação:

- 80 a 100: alta confiança.
- 60 a 79: média confiança.
- Abaixo de 60: baixa confiança.

Regra de publicação:

- Alta confiança: pode publicar automaticamente.
- Média confiança: pode publicar com aviso ou ir para revisão.
- Baixa confiança: não publica.

### 4.10. Matching Engine

Cruza concursos com preferências dos usuários.

Critérios:

- Estado.
- Cidade.
- Raio de distância.
- Escolaridade.
- Área.
- Cargo.
- Salário mínimo.
- Tipo de concurso.
- Aceita cadastro reserva.
- Aceita temporário.
- Aceita prova em outra cidade.

Resultado:

- Match forte.
- Match médio.
- Match fraco.
- Não recomendado.

### 4.11. Notification Engine

Envia alertas.

Tipos:

- Novo concurso compatível.
- Inscrição encerrando.
- Prova próxima.
- Edital retificado.
- Local de prova publicado.
- Resultado publicado.
- Convocação publicada.

Canais MVP:

- E-mail.

Canais futuros:

- Push.
- WhatsApp.
- Telegram.

## 5. Estratégia de Crawlers

### Prioridade inicial

1. Bancas organizadoras.
2. Portais de concursos.
3. Diário Oficial Estadual.
4. Sites de prefeituras prioritárias.

### Não fazer inicialmente

- Crawler universal para todas as prefeituras.
- Scraping nacional.
- Crawlers sem logs.
- Crawlers sem deduplicação.
- Crawlers que publicam direto sem validação.

## 6. Geolocalização e Proximidade

No cadastro:

- Usuário informa cidade/UF.
- Sistema salva latitude/longitude da cidade.
- Concurso tem cidade/UF.
- Sistema salva latitude/longitude do município.
- Calcula distância aproximada.
- Compara com raio escolhido.

Exemplo:

- Usuário: Goiânia.
- Raio: 150 km.
- Concurso: Anápolis.
- Distância: 55 km.
- Escolaridade: ensino médio.
- Cargo: administrativo.
- Match: forte.

## 7. Observabilidade

O sistema deve registrar:

- Execuções de crawler.
- Erros de acesso.
- Documentos encontrados.
- Documentos duplicados.
- Extrações de IA.
- Scores de confiança.
- Publicações.
- Matches.
- Notificações enviadas.
- Notificações falhadas.

## 8. Segurança

- Variáveis sensíveis em `.env`.
- Nunca commitar chaves.
- Controle de acesso admin.
- Logs sem dados sensíveis desnecessários.
- Proteção contra abuso em endpoints.
- Backup do banco.
- Política de retenção de documentos.

## 9. Deploy Conceitual

Ambientes:

- Local.
- Staging.
- Produção.

Serviços:

- Web.
- API.
- Worker de crawler.
- Worker de IA.
- Worker de notificações.
- Banco PostgreSQL.
- Redis.
- Storage de documentos.

## 10. Decisão Técnica Recomendada

Construir primeiro:

1. API + banco.
2. Cadastro/preferências.
3. Admin de fontes.
4. Crawler inicial.
5. Armazenamento bruto.
6. Extração IA.
7. Validação/confiança.
8. Publicação.
9. Matching.
10. Notificação por e-mail.
