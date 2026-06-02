import { ArrowRight, Bell, Database, MapPin, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { NonOfficialNotice } from "@/components/shared/non-official-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DemoContestCard } from "@/components/contests/demo-contest-card";
import { demoContests } from "@/lib/demo-data";

const steps = [
  {
    title: "Defina seu perfil",
    description: "Cidade, UF, escolaridade, raio, áreas e cargos de interesse.",
  },
  {
    title: "Veja oportunidades compatíveis",
    description: "A lista do Radar será alimentada pelo Supabase na Sprint 1.",
  },
  {
    title: "Confira a fonte oficial",
    description: "O edital e o site da banca ou órgão sempre prevalecem.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <AppHeader />

      <section className="surface-grid border-b border-border/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
          <div>
            <Badge>Fundação Sprint 1</Badge>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black tracking-tight md:text-6xl">
              Radar independente para acompanhar concursos compatíveis com seu perfil.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Organize oportunidades municipais e estaduais, acompanhe prazos e salve concursos sem depender de grupos soltos ou buscas manuais.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild href="/cadastro">
                Criar conta <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild href="/radar" variant="outline">
                Ver Radar demo
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["Dados mínimos", "Sem CPF, RG ou endereço completo."],
                ["Fonte visível", "Link oficial sempre em destaque."],
                ["Base real", "Supabase preparado para substituir demos."],
              ].map(([title, description]) => (
                <Card key={title} className="p-4">
                  <p className="font-display text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="h-fit p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Preview</p>
                <h2 className="font-display text-xl font-bold">Concursos em destaque</h2>
              </div>
              <Badge variant="amber">Seed/demo</Badge>
            </div>
            <div className="space-y-3">
              {demoContests.slice(0, 2).map((contest) => (
                <DemoContestCard key={contest.id} contest={contest} compact />
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            [MapPin, "Preferências", "Cidade, UF, raio e escolaridade."],
            [Database, "Supabase", "Auth, PostgreSQL e Storage preparados."],
            [Bell, "Alertas futuros", "Estrutura pronta, sem notificação real agora."],
            [ShieldCheck, "Compliance", "Aviso legal e fonte oficial desde a primeira tela."],
          ].map(([Icon, title, description]) => (
            <Card key={String(title)} className="p-5">
              <Icon className="h-5 w-5 text-primary" />
              <p className="mt-4 font-display font-bold">{String(title)}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(description)}</p>
            </Card>
          ))}
        </div>

        <NonOfficialNotice className="mt-12" />
      </section>
    </main>
  );
}
