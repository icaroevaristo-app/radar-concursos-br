# Radar Concursos BR — QA e Critérios de Aceite V1.0

## 1. Objetivo

Definir como testar o Radar Concursos BR para evitar erros críticos, principalmente em datas, links oficiais, matching e notificações.

## 2. Princípio de QA

O sistema lida com prazos reais. Erro de data, cargo ou inscrição pode prejudicar o usuário.

Regra central:

> Se o sistema tiver dúvida sobre uma informação crítica, deve reduzir confiança ou bloquear publicação automática.

## 3. Áreas de Teste

## 3.1. Cadastro e Login

### Testar

- Cadastro com e-mail válido.
- Cadastro com e-mail inválido.
- Senha fraca.
- Login correto.
- Login incorreto.
- Recuperação de senha.
- Registro de aceite de termos.

### Critérios de aceite

- Usuário consegue criar conta.
- Preferências ficam associadas ao usuário correto.
- Sistema registra aceite dos termos.
- Usuário consegue sair e entrar novamente.

## 3.2. Onboarding

### Testar

- Cidade vazia.
- UF vazia.
- Escolaridade vazia.
- Raio inválido.
- Salário mínimo inválido.
- Alteração posterior de preferências.

### Critérios de aceite

- Preferências são salvas.
- Preferências são editáveis.
- Dados inválidos são bloqueados.
- Matching usa preferências atualizadas.

## 3.3. Crawler

### Testar

- Fonte ativa.
- Fonte pausada.
- Fonte inexistente.
- URL com erro.
- Página sem PDF.
- Página com múltiplos PDFs.
- PDF duplicado.
- HTML alterado.
- Timeout.
- Bloqueio 403.
- Erro 500.

### Critérios de aceite

- Crawler roda em fonte cadastrada.
- Encontra links novos.
- Baixa documentos.
- Salva conteúdo bruto.
- Evita duplicidade por hash.
- Registra erro com clareza.
- Não derruba o sistema em caso de falha.

## 3.4. Extração de Texto

### Testar

- PDF textual.
- PDF escaneado.
- PDF com tabelas.
- PDF grande.
- PDF corrompido.
- HTML simples.
- HTML com conteúdo irrelevante.

### Critérios de aceite

- Texto é extraído quando possível.
- PDF ilegível fica marcado com erro.
- Sistema não inventa texto.
- Documento com erro não segue para publicação automática.

## 3.5. Classificação de Documento

### Tipos a testar

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

### Critérios de aceite

- Edital de abertura é identificado corretamente.
- Resultado não vira concurso novo.
- Retificação tenta se vincular ao concurso original.
- Documento irrelevante não é publicado.

## 3.6. IA e Extração JSON

### Testar

- Edital com todos os campos.
- Edital sem salário.
- Edital sem prova definida.
- Edital com múltiplos cargos.
- Edital com cadastro reserva.
- Edital com salário por tabela.
- Edital com inscrição em anexo.
- Edital com retificação.

### Critérios de aceite

- JSON é válido.
- Campos ausentes aparecem como “não informado”.
- IA não inventa salário.
- IA não inventa data.
- IA retorna confiança.
- JSON inválido não segue.

## 3.7. Validação

### Testar

- Data de inscrição no passado.
- Data de inscrição ausente.
- Cidade ausente.
- UF inválida.
- Link oficial ausente.
- Salário em texto.
- Cargo ausente.
- Documento duplicado.
- Retificação sem edital original.

### Critérios de aceite

- Sistema bloqueia dados críticos ausentes.
- Sistema reduz confiança quando há conflito.
- Sistema não publica baixa confiança.
- Sistema registra motivos da reprovação.

## 3.8. Confidence Score

### Testar

- Fonte confiável com dados completos.
- Fonte desconhecida com dados incompletos.
- Edital com conflito de datas.
- Documento sem link oficial.
- Documento duplicado.

### Critérios de aceite

- Alta confiança publica.
- Média confiança exige aviso ou revisão.
- Baixa confiança não publica.
- Score é auditável.

## 3.9. Matching

### Testar

- Usuário dentro do raio.
- Usuário fora do raio.
- Escolaridade compatível.
- Escolaridade incompatível.
- Cargo compatível.
- Salário abaixo do mínimo.
- Processo temporário recusado.
- Cadastro reserva recusado.

### Critérios de aceite

- Match forte aparece no Radar.
- Match incompatível não gera alerta.
- Sistema mostra motivo da recomendação.
- Distância é calculada corretamente.

## 3.10. Notificações

### Testar

- Novo concurso compatível.
- Concurso incompatível.
- Inscrição encerrando.
- E-mail falhando.
- Usuário pausou alertas.
- Usuário cancelou conta.
- Alerta duplicado.
- Link oficial quebrado.

### Critérios de aceite

- E-mail é enviado.
- Alerta não duplica.
- Preferências são respeitadas.
- Opt-out funciona.
- Histórico registra envio.
- Alerta inclui aviso de fonte oficial.

## 3.11. Admin

### Testar

- Ver fontes.
- Pausar fonte.
- Rodar crawler.
- Ver documento.
- Ver extração.
- Ver erros.
- Despublicar concurso.
- Mesclar duplicados.

### Critérios de aceite

- Admin consegue supervisionar automação.
- Admin não precisa cadastrar tudo manualmente.
- Erros são visíveis.
- Ações importantes geram log.

## 4. Testes Críticos Antes do Beta

Antes de abrir para usuários reais:

1. Testar pelo menos 10 fontes.
2. Processar pelo menos 50 documentos.
3. Validar manualmente uma amostra dos dados extraídos.
4. Confirmar precisão de datas de inscrição.
5. Confirmar links oficiais.
6. Testar envio de e-mails.
7. Testar opt-out.
8. Testar usuário grátis e pago.
9. Testar publicação automática.
10. Testar bloqueio de baixa confiança.

## 5. Métricas de Qualidade

Acompanhar:

- Taxa de erro de crawler.
- Taxa de documentos duplicados.
- Taxa de extração com sucesso.
- Taxa de baixa confiança.
- Erros de data.
- Links quebrados.
- Notificações falhadas.
- Reclamações de usuários.
- Concursos despublicados.
- Fontes quebradas.

## 6. Erros Inaceitáveis

- Enviar alerta com data final errada.
- Publicar concurso sem fonte.
- Dizer que usuário é elegível sem base.
- Ocultar link oficial.
- Enviar alerta após usuário cancelar.
- Publicar documento irrelevante como concurso.
- Duplicar o mesmo concurso várias vezes.
- Parecer órgão oficial.

## 7. Checklist Final de Pronto

O MVP está pronto para beta quando:

- Cadastro funciona.
- Preferências funcionam.
- Crawler processa fontes reais.
- IA extrai JSON válido.
- Validação bloqueia casos ruins.
- Matching recomenda corretamente.
- Notificação funciona.
- Admin monitora erros.
- LGPD básica está implementada.
- Avisos obrigatórios aparecem.
