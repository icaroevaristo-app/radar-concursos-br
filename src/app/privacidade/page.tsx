import { contactEmail, contactMailto } from "@/lib/contact";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";

const sections = [
  {
    title: "1. Dados que podemos coletar",
    paragraphs: [
      "Podemos coletar nome, e-mail, telefone WhatsApp quando informado, preferências de concursos, UF, cidade, escolaridade, áreas de interesse, cargos ou palavras-chave de interesse.",
      "Também podemos registrar interações básicas com concursos, como visualização de páginas, concursos salvos, eventos de uso do funil, consentimento de WhatsApp e logs técnicos necessários para segurança, diagnóstico e melhoria do produto.",
    ],
  },
  {
    title: "2. Como usamos esses dados",
    paragraphs: [
      "Usamos os dados para autenticação, personalização do Radar, exibição de concursos mais relevantes, melhoria do produto, segurança da plataforma e comunicação futura sobre novidades do Radar.",
      "Quando o usuário informar telefone e der consentimento explícito, podemos usar esse número para enviar alertas de concursos por WhatsApp sobre oportunidades compatíveis com suas preferências.",
      "Os alertas por WhatsApp dependem das preferências cadastradas, da disponibilidade do serviço e da revisão das oportunidades antes do envio.",
    ],
  },
  {
    title: "3. Consentimento para WhatsApp",
    paragraphs: [
      "O usuário pode ativar ou remover o consentimento para WhatsApp em sua área de assinatura/preferências.",
      "Ao remover o consentimento, o Radar registra o opt-out e deixa de considerar o usuário para novas filas manuais de alertas por WhatsApp.",
      "Não compartilhamos o telefone com terceiros para venda de dados. O uso por provedores técnicos poderá ocorrer futuramente apenas quando necessário para viabilizar o envio e deverá respeitar esta política.",
    ],
  },
  {
    title: "4. Dados sensíveis",
    paragraphs: [
      "O Radar Concursos BR não deve solicitar CPF, RG, documentos pessoais, endereço completo, dados bancários ou outras informações sensíveis para uso básico da plataforma.",
      "Se algum formulário parecer pedir dados além do necessário, o usuário deve interromper o preenchimento e entrar em contato pelo canal oficial.",
    ],
  },
  {
    title: "5. Cookies e tecnologias semelhantes",
    paragraphs: [
      "Podemos usar cookies e tecnologias semelhantes para manter sessão de login, segurança e preferências básicas da aplicação.",
      "Logs técnicos e eventos simples podem ser registrados para entender falhas, proteger o serviço e melhorar a experiência.",
    ],
  },
  {
    title: "6. Correção e exclusão",
    paragraphs: [
      "O usuário pode solicitar correção ou exclusão de dados pessoais pelo canal de contato oficial.",
      "Alguns registros técnicos ou administrativos podem precisar ser mantidos por segurança, prevenção de abuso ou cumprimento de obrigações aplicáveis.",
    ],
  },
  {
    title: "7. Atualizações futuras",
    paragraphs: [
      "Esta política pode ser atualizada quando novos recursos, meios de pagamento, ferramentas de comunicação ou serviços de análise forem adicionados ao produto.",
      "Quando houver mudanças relevantes no tratamento de dados, buscaremos manter esta página clara e atualizada.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacidade"
      title="Política de Privacidade"
      description="Resumo claro dos dados usados pelo Radar Concursos BR e das finalidades básicas do produto."
    >
      <Card className="mx-auto max-w-4xl p-6">
        <div className="space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-bold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="font-display text-xl font-bold">8. Contato</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
              <p>Para solicitar correção, exclusão ou esclarecimentos sobre dados pessoais, use o e-mail abaixo.</p>
              <p>
                <a className="text-primary underline-offset-4 hover:underline" href={contactMailto}>
                  {contactEmail}
                </a>
              </p>
            </div>
          </section>
        </div>
      </Card>
    </PageShell>
  );
}
