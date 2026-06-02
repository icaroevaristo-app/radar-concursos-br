# Radar Concursos BR — PRD do MVP Automático V1.0

## 1. Objetivo do PRD

Definir o escopo funcional do MVP automático do Radar Concursos BR, incluindo jornadas, funcionalidades, regras de negócio, critérios de aceite e limites do produto.

## 2. Objetivo do MVP

Criar um web app capaz de:

1. Receber cadastro e preferências do usuário.
2. Rastrear fontes públicas selecionadas.
3. Detectar novos concursos/editais.
4. Extrair dados principais com apoio de IA.
5. Validar dados críticos.
6. Publicar oportunidades confiáveis.
7. Cruzar concursos com o perfil dos usuários.
8. Enviar alertas personalizados por e-mail.
9. Permitir que usuários salvem concursos e acompanhem prazos.

## 3. Usuário-alvo do MVP

Pessoas físicas interessadas em concursos municipais e estaduais, especialmente:

- Ensino médio.
- Ensino técnico.
- Superior básico.
- Pessoas que buscam cargos administrativos, guarda municipal, saúde, fiscal, técnico, professor, auxiliar e similares.
- Pessoas que querem oportunidades próximas da cidade onde moram.
- Pessoas que costumam perder edital ou prazo.

## 4. Escopo Geográfico Inicial

Recomendação inicial:

- Começar com 1 estado.
- Priorizar bancas e fontes que atuem nesse estado.
- Adicionar prefeituras específicas conforme relevância.

Exemplo possível:

- Estado: Goiás.
- Fontes iniciais: bancas regionais, portais de concursos, Diário Oficial estadual e prefeituras prioritárias.

## 5. Funcionalidades do Usuário

### 5.1. Landing Page

Objetivo:

- Explicar o produto.
- Capturar cadastro.
- Vender a promessa.

Deve conter:

- Promessa principal.
- Como funciona.
- Exemplos de alertas.
- Benefícios.
- Planos.
- FAQ.
- Aviso de não-oficialidade.

Critérios de aceite:

- Usuário entende o produto em até 10 segundos.
- CTA visível para cadastro.
- Aviso de que não é órgão oficial.
- Página responsiva.

### 5.2. Cadastro/Login

Campos:

- Nome.
- E-mail.
- Senha.
- Aceite dos termos.
- Aceite da política de privacidade.

Critérios de aceite:

- Cadastro com e-mail válido.
- Login funcional.
- Recuperação de senha.
- Registro de aceite dos termos.

### 5.3. Onboarding de Preferências

Perguntas:

- Onde você mora?
- Até quantos km aceita concursos?
- Qual sua escolaridade?
- Que cargos te interessam?
- Qual salário mínimo deseja?
- Aceita processo seletivo temporário?
- Aceita cadastro reserva?
- Quer receber alertas por qual canal?

Critérios de aceite:

- Preferências são salvas.
- Preferências podem ser editadas.
- O sistema usa essas preferências no matching.

### 5.4. Tela Radar

Tela principal do usuário.

Blocos:

- Concursos compatíveis.
- Novos concursos.
- Inscrições encerrando.
- Perto de você.
- Salvos.
- Recomendados.

Cada item deve mostrar:

- Órgão.
- Cidade/UF.
- Cargo ou área.
- Escolaridade.
- Salário, se disponível.
- Data final de inscrição.
- Score/motivo do match.
- Status.

Critérios de aceite:

- Lista filtra por preferências.
- Usuário consegue abrir detalhes.
- Usuário consegue salvar concurso.
- Concursos encerrados não aparecem como novos.

### 5.5. Detalhes do Concurso

Informações obrigatórias:

- Título.
- Órgão.
- Cidade/UF.
- Banca.
- Cargos.
- Escolaridade.
- Salários.
- Vagas.
- Taxa.
- Período de inscrição.
- Data da prova, se disponível.
- Resumo.
- Checklist.
- Link oficial.
- Arquivo do edital.
- Aviso de conferência no edital oficial.

Critérios de aceite:

- Link oficial visível.
- Campos ausentes aparecem como “não informado”.
- Usuário consegue salvar.
- Usuário consegue ativar alerta.
- Aviso de não-oficialidade aparece.

### 5.6. Meus Concursos

Listas:

- Salvos.
- Inscrição pendente.
- Boleto pendente.
- Prova próxima.
- Encerrados.

Critérios de aceite:

- Usuário vê apenas seus concursos salvos.
- Status é atualizado conforme datas.
- Checklist persiste por usuário.

### 5.7. Alertas

Configurações:

- Canal.
- Frequência.
- Tipos de alerta.
- Histórico.
- Pausar alertas.

Tipos de alerta:

- Novo concurso compatível.
- Inscrição encerrando.
- Prova próxima.
- Edital retificado.
- Local de prova publicado.
- Resultado publicado.
- Convocação publicada.

Critérios de aceite:

- Usuário pode pausar alertas.
- Usuário pode cancelar alerta.
- Sistema não envia duplicado.
- E-mail contém link oficial.

### 5.8. Assinatura

Planos iniciais sugeridos:

- Grátis:
  - ver lista geral;
  - filtros básicos;
  - poucos alertas.

- Pago:
  - alertas personalizados;
  - raio por cidade;
  - resumo de edital;
  - checklist;
  - salvar concursos;
  - alertas de prazo;
  - retificações.

Preço inicial sugerido:

- R$9,90/mês para plano de entrada.
- R$19,90/mês para plano completo.
- R$97/ano promocional.

## 6. Funcionalidades Admin

### 6.1. Dashboard Admin

Mostrar:

- Fontes ativas.
- Concursos encontrados.
- Documentos processados.
- Erros.
- Alertas enviados.
- Extrações com baixa confiança.

### 6.2. Fontes

Permitir:

- Cadastrar fonte.
- Editar fonte.
- Pausar fonte.
- Rodar crawler manual.
- Ver histórico.
- Ver erros.

### 6.3. Documentos

Mostrar:

- Documentos novos.
- Documentos classificados.
- Documentos com erro.
- Documentos duplicados.
- Documentos processados.
- Documentos pendentes.

### 6.4. Extrações

Mostrar:

- JSON extraído.
- Confiança.
- Campos ausentes.
- Erros de validação.
- Documento original.
- Status.

### 6.5. Concursos

Permitir:

- Visualizar concursos publicados.
- Despublicar.
- Corrigir.
- Mesclar duplicados.
- Marcar encerrado.
- Vincular retificação.

### 6.6. Notificações

Mostrar:

- Enviadas.
- Falhadas.
- Agendadas.
- Abertas.
- Clicadas.
- Canceladas.

## 7. Regras de Negócio

### 7.1. Regras de Fonte

- Toda oportunidade precisa ter fonte.
- Fonte oficial tem prioridade.
- Fonte de portal serve como descoberta, mas deve apontar para edital ou órgão.
- Fonte com muitos erros deve ser pausada.
- Crawler deve registrar histórico.

### 7.2. Regras de Concurso

- Concurso sem link oficial não deve ser publicado como confiável.
- Concurso sem data de inscrição deve receber baixa confiança.
- Concurso encerrado não deve ser recomendado como novo.
- Retificação deve atualizar concurso existente.
- Mesmo concurso não deve aparecer duplicado.

### 7.3. Regras de Usuário

- Usuário deve definir cidade/UF.
- Usuário deve definir escolaridade.
- Usuário pode escolher raio de distância.
- Usuário pode pausar alertas.
- Usuário pode cancelar conta.
- Usuário pode alterar preferências.

### 7.4. Regras de Notificação

- Não enviar alerta duplicado.
- Não enviar concurso incompatível.
- Não enviar alerta de prazo se a data for incerta.
- Sempre incluir link oficial.
- Sempre incluir aviso para conferir edital.

### 7.5. Regras de IA

- IA não publica sozinha se confiança for baixa.
- IA não deve inventar dados.
- Campos ausentes devem ser marcados como “não informado”.
- Saída da IA deve ser validada.
- Dados críticos devem passar por regras automáticas.

## 8. Critérios de Sucesso do MVP

O MVP é considerado funcional quando:

1. Usuário consegue se cadastrar.
2. Usuário consegue definir preferências.
3. Sistema rastreia pelo menos 10 fontes.
4. Sistema detecta novo documento.
5. Sistema baixa HTML/PDF.
6. Sistema extrai texto.
7. Sistema classifica o tipo de documento.
8. Sistema extrai dados estruturados.
9. Sistema calcula confiança.
10. Sistema publica concursos de alta confiança.
11. Sistema cruza concurso com perfil.
12. Sistema envia alerta por e-mail.
13. Usuário consegue salvar e acompanhar concurso.

## 9. Fora do Escopo

Não desenvolver no MVP:

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
