# Radar Concursos BR — LGPD, Riscos e Compliance V1.0

## 1. Objetivo

Definir cuidados jurídicos, de privacidade e de responsabilidade para o Radar Concursos BR.

## 2. Posicionamento Legal

O Radar Concursos BR deve deixar claro que:

- Não é órgão público.
- Não representa prefeituras.
- Não representa câmaras municipais.
- Não representa bancas.
- Não representa governos.
- Organiza informações públicas.
- Pode conter erros.
- O edital oficial sempre prevalece.

## 3. Aviso Obrigatório

Texto recomendado:

> O Radar Concursos BR não é órgão público, não representa prefeituras, bancas ou governos. As informações são organizadas a partir de fontes públicas e podem conter erros. Antes de tomar qualquer decisão, consulte sempre o edital oficial e o site da banca/órgão responsável.

Esse aviso deve aparecer:

- Na landing page.
- Nos detalhes do concurso.
- Nos e-mails.
- Nos termos de uso.
- Na área de assinatura.

## 4. LGPD — Dados Coletados

### Dados necessários

- Nome.
- E-mail.
- Cidade.
- UF.
- Escolaridade.
- Preferências de concurso.
- Preferências de alerta.
- Status de assinatura.

### Dados opcionais

- Telefone.
- Raio de distância.
- Salário mínimo desejado.
- Cargos de interesse.

### Dados que devem ser evitados no MVP

- CPF.
- RG.
- Endereço completo.
- Documentos pessoais.
- Dados de saúde.
- Dados financeiros além do necessário para pagamento.
- Informações sensíveis desnecessárias.

## 5. Finalidade dos Dados

Os dados devem ser usados para:

- Criar conta.
- Personalizar concursos.
- Calcular compatibilidade.
- Enviar alertas.
- Gerenciar assinatura.
- Melhorar o produto.

Não usar para:

- Vender dados.
- Compartilhar com terceiros sem necessidade.
- Enviar spam.
- Fazer perfilamento abusivo.
- Tomar decisões sensíveis automatizadas.

## 6. Consentimento e Transparência

O usuário deve aceitar:

- Termos de uso.
- Política de privacidade.
- Recebimento de alertas.

O usuário deve poder:

- Pausar alertas.
- Cancelar alertas.
- Alterar preferências.
- Excluir conta.
- Solicitar exclusão de dados.

## 7. Riscos Jurídicos

### Risco: parecer órgão oficial

Mitigação:

- Usar marca própria.
- Evitar brasões.
- Evitar linguagem oficial enganosa.
- Inserir aviso de não-oficialidade.
- Não usar domínios que pareçam governo.

### Risco: informação errada

Mitigação:

- Link oficial sempre visível.
- Aviso de conferência.
- Confidence score.
- Bloqueio de baixa confiança.
- Logs de fonte.
- Campos ausentes como “não informado”.

### Risco: scraping indevido

Mitigação:

- Respeitar limites.
- Priorizar fontes públicas.
- Evitar copiar conteúdo integral desnecessário.
- Armazenar metadados e links.
- Verificar termos de uso de fontes importantes.
- Usar fonte oficial como referência.

### Risco: envio de mensagens sem consentimento

Mitigação:

- Opt-in.
- Opt-out.
- Histórico de consentimento.
- Link de descadastro.
- Preferências de canal.

### Risco: cobrança e cancelamento

Mitigação:

- Política clara.
- Cancelamento fácil.
- Página de assinatura.
- Registro de transações.
- Suporte básico.

## 8. Riscos Técnicos

- Fontes instáveis.
- Sites bloqueando crawler.
- PDFs ruins.
- OCR caro.
- IA errando dados.
- Duplicidade.
- Retificações difíceis.
- Escala de fontes.

## 9. Riscos Comerciais

- Usuário não pagar.
- Usuário preferir grupos grátis.
- Ticket baixo.
- Retenção sazonal.
- Alto custo de aquisição.
- Concorrência de portais grandes.

## 10. Riscos Operacionais

- Fontes quebrando.
- Suporte alto.
- Usuários pedindo interpretação individual.
- Necessidade de monitoramento constante.
- Alertas falhando.
- Dificuldade de acompanhar retificações.

## 11. Regras de Comunicação

Evitar frases como:

- “Garantimos que você não perderá nenhum concurso.”
- “Você será aprovado.”
- “O sistema sabe se você pode fazer.”
- “Informação 100% oficial.”
- “Substitui o edital.”

Usar frases como:

- “Acompanhe oportunidades compatíveis.”
- “Receba alertas com base no seu perfil.”
- “Consulte sempre o edital oficial.”
- “Organizamos informações públicas para facilitar sua busca.”
- “Use como apoio para não perder prazos.”

## 12. Política de Responsabilidade

O produto deve informar que:

- O usuário é responsável por conferir o edital oficial.
- Datas e requisitos podem mudar.
- Retificações podem alterar informações.
- O Radar é ferramenta de organização e alerta.
- O Radar não faz inscrição.
- O Radar não garante elegibilidade.
- O Radar não garante aprovação.

## 13. Segurança

Recomendações:

- Senhas com hash seguro.
- HTTPS.
- Controle de acesso admin.
- Logs sem dados sensíveis.
- Backup.
- Proteção contra abuso.
- Rate limiting.
- Segredos em variáveis de ambiente.
- Chaves fora do repositório.

## 14. Checklist de Compliance para MVP

Antes do beta:

- Termos de uso.
- Política de privacidade.
- Aviso de não-oficialidade.
- Opt-in de alertas.
- Opt-out de alertas.
- Exclusão de conta.
- Controle de dados mínimos.
- Link oficial em cada concurso.
- Logs de fonte.
- Bloqueio de baixa confiança.
