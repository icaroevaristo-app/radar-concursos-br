import { ArrowRight, Bell, CheckCircle2, Database, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { NonOfficialNotice } from "@/components/shared/non-official-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  ["Perfil primeiro", "Cidade, UF, escolaridade, áreas e cargos guiam o Radar."],
  ["Fonte oficial visível", "Cada oportunidade publicada precisa ter link oficial em destaque."],
  ["Dados mínimos", "Sem CPF, RG, endereço completo ou documentos pessoais."],
];

const steps = [
  {
    title: "Crie sua conta",
    description: "Use Supabase Auth com e-mail e senha. O aceite de termos e privacidade fica registrado no profile.",
  },
  {
    title: "Configure preferências",
    description: "Informe cidade, UF, escolaridade, raio e interesses para o match simples da Sprint 1.",
  },
  {
    title: "Acompanhe o Radar",
    description: "Veja concursos publicados no banco, salve oportunidades e confira os detalhes pelo link oficial.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <AppHeader />

      <section className="surface-grid relative border-b border-border/70">
        <div className="absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:py-24">
          <div className="relative z-10">
            <Badge variant="amber">Micro-SaaS independente para concursos</Badge>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black tracking-tight md:text-6xl">
              Um Radar premium para organizar concursos compatíveis com seu perfil.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Acompanhe oportunidades publicadas, salve concursos e consulte fontes oficiais em uma experiência moderna,
              sem parecer portal público antigo e sem prometer aprovação.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild href="/cadastro" size="lg">
                Criar conta <ArrowRight className="h-4 w-4" />
              </Button>
              <Button asChild href="/login" size="lg" variant="outline">
                Já tenho conta
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {benefits.map(([title, description]) => (
                <Card key={title} className="p-4">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <p className="mt-3 font-display text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="relative z-10 overflow-hidden p-5 shadow-glow">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-primary/10" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="section-kicker">Radar Sprint 1</p>
                  <h2 className="mt-2 font-display text-2xl font-black">Fundação real, visual premium</h2>
                </div>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  [Database, "Supabase como fonte", "Concursos, cargos, datas e salvos vêm do banco."],
                  [MapPin, "Match simples", "Estado, cidade, escolaridade, cargo, área e salário."],
                  [Bell, "Alertas futuros preparados", "Sem envio real de notificações nesta Sprint."],
                  [ShieldCheck, "Não-oficialidade clara", "O edital e a fonte oficial sempre prevalecem."],
                ].map(([Icon, title, description]) => (
                  <div key={String(title)} className="premium-panel-subtle flex gap-3 p-4">
                    <Icon className="mt-0.5 h-5 w-5 flex-none text-primary" />
                    <div>
                      <p className="font-display text-sm font-bold">{String(title)}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{String(description)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 max-w-2xl">
          <p className="section-kicker">Como funciona</p>
          <h2 className="mt-2 font-display text-3xl font-black">Poucas etapas, menos ruído.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A Sprint 1 prioriza autenticação, preferências, dados reais no Supabase e uma base administrativa manual.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>

        <NonOfficialNotice className="mt-12" />
      </section>
    </main>
  );
}
