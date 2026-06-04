import { contactEmail, contactMailto } from "@/lib/contact";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";

const sections = [
  {
    title: "1. Natureza da plataforma",
    paragraphs: [
      "O Radar Concursos BR é uma plataforma informativa independente para organização e acompanhamento de concursos públicos.",
      "O Radar Concursos BR não é site oficial do governo, não representa prefeituras, câmaras, órgãos públicos, bancas organizadoras ou qualquer entidade oficial.",
    ],
  },
  {
    title: "2. Fontes e responsabilidade de conferência",
    paragraphs: [
      "As informações exibidas são organizadas a partir de fontes públicas, bancas, órgãos, editais e páginas oficiais indicadas sempre que possível.",
      "Antes de se inscrever, pagar taxa, comparecer a uma prova ou tomar qualquer decisão, o usuário deve conferir prazos, requisitos, cargos, taxas, regras e documentos diretamente na fonte oficial.",
    ],
  },
  {
    title: "3. Limitações do serviço",
    paragraphs: [
      "O Radar não garante aprovação, nomeação, inscrição, convocação, disponibilidade de vaga ou qualquer resultado em concurso público.",
      "Apesar dos esforços de curadoria, o serviço pode conter erros, atrasos, informações incompletas, divergências de datas ou dados desatualizados.",
    ],
  },
  {
    title: "4. Uso da plataforma",
    paragraphs: [
      "Ao usar a plataforma, o usuário declara estar ciente destas limitações e aceita estes Termos de Uso.",
      "O usuário é responsável por usar as informações com cautela e por consultar o edital oficial e o site da banca ou órgão responsável.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Termos"
      title="Termos de Uso"
      description="Texto simples sobre o uso do Radar Concursos BR, suas limitações e a importância de conferir sempre a fonte oficial."
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
            <h2 className="font-display text-xl font-bold">5. Contato</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
              <p>Para dúvidas, correções ou solicitações relacionadas ao Radar Concursos BR, entre em contato pelo e-mail abaixo.</p>
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
