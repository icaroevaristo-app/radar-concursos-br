import { ArrowRight, Bell, CheckCircle2, Clock, Filter, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { getPublishedContests } from "@/lib/contests/queries";
import { TrackEventOnMount, TrackedLink } from "@/components/analytics/track-event";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { PublicContestCard } from "@/components/contests/public-contest-card";
import { NonOfficialNotice } from "@/components/shared/non-official-notice";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const primaryCtaClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-bold text-primary-foreground shadow-[0_12px_30px_rgb(245_158_11_/_0.18)] transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-primary/50";

const secondaryCtaClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-card/50 px-5 text-base font-bold text-foreground transition hover:border-primary/55 hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50";

const steps = [
  {
    title: "Crie seu Radar gratuito",
    description: "Cadastre e-mail, senha e aceite os termos. Não pedimos CPF, RG nem endereço completo.",
  },
  {
    title: "Defina suas preferências",
    description: "Escolha UF, cidade, escolaridade, áreas de interesse, cargos e salário mínimo desejado.",
  },
  {
    title: "Acompanhe seu Radar",
    description: "Veja concursos publicados, salve oportunidades e confira a fonte oficial antes da inscrição.",
  },
];

const benefits = [
  ["Prazos em destaque", "Veja fim de inscrições e datas importantes sem garimpar planilhas e portais antigos."],
  ["Filtros por perfil", "Cidade, UF, escolaridade, cargo e área ajudam a reduzir ruído no seu acompanhamento."],
  ["Fonte oficial visível", "Sempre que possível, mostramos edital, banca ou órgão responsável em destaque."],
  ["Produto independente", "O Radar organiza informação pública, mas não representa governo, banca ou prefeitura."],
];

const premiumBenefits = [
  "Acompanhamento personalizado por cidade, UF, escolaridade e área",
  "Salvar concursos ilimitados",
  "Filtros avançados",
  "Lembretes de fim de inscrição",
  "Concursos futuros destacados",
];

export default async function Home() {
  const { contests } = await getPublishedContests();
  const examples = contests.slice(0, 3);

  return (
    <main className="min-h-screen overflow-hidden">
      <TrackEventOnMount event="landing_view" metadata={{ source: "home" }} />
      <AppHeader />

      <section className="surface-grid relative border-b border-border/70">
        <div className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:py-24">
          <div className="relative z-10">
            <Badge variant="amber">Radar independente para concursos</Badge>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-black tracking-tight md:text-6xl">
              Não perca mais prazo de concurso público.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Acompanhe concursos abertos e futuros em Goiás e no Centro-Oeste, com filtros por cidade, cargo,
              escolaridade e prazo.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                className={primaryCtaClass}
                event="click_create_free_alert"
                href="/cadastro"
                metadata={{ location: "hero" }}
              >
                Criar meu Radar gratuito <ArrowRight className="h-4 w-4" />
              </TrackedLink>
              <TrackedLink
                className={secondaryCtaClass}
                event="click_view_contests"
                href="/concursos"
                metadata={{ location: "hero" }}
              >
                Ver concursos abertos
              </TrackedLink>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                [Clock, "Prazos organizados"],
                [MapPin, "Foco regional"],
                [ShieldCheck, "Fonte oficial primeiro"],
              ].map(([Icon, label]) => (
                <Card key={String(label)} className="flex items-center gap-3 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="text-sm font-bold">{String(label)}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="relative z-10 overflow-hidden p-5 shadow-glow">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-primary/10" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="section-kicker">Meu Radar</p>
                  <h2 className="mt-2 font-display text-2xl font-black">Do edital ao prazo final, com menos ruído.</h2>
                </div>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  [Filter, "Filtros por cidade, UF, escolaridade e área"],
                  [Bell, "Preferências salvas para acompanhamento futuro"],
                  [CheckCircle2, "Concursos salvos para acompanhar depois"],
                  [ShieldCheck, "Aviso claro de não-oficialidade"],
                ].map(([Icon, description]) => (
                  <div key={String(description)} className="premium-panel-subtle flex gap-3 p-4">
                    <Icon className="mt-0.5 h-5 w-5 flex-none text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">{String(description)}</p>
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
          <h2 className="mt-2 font-display text-3xl font-black">Um funil simples para montar seu Radar.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            O cadastro gratuito leva direto para preferências. Depois disso, você acompanha concursos filtrados no Radar.
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
      </section>

      <section className="border-y border-border/70 bg-card/35">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Concursos no Radar</p>
              <h2 className="mt-2 font-display text-3xl font-black">Oportunidades publicadas no banco</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Estes cards são carregados de concursos reais publicados no Supabase. Registros internos de teste ficam ocultos na área
                pública.
              </p>
            </div>
            <TrackedLink
              className={secondaryCtaClass}
              event="click_view_contests"
              href="/concursos"
              metadata={{ location: "examples" }}
            >
              Ver todos
            </TrackedLink>
          </div>

          {examples.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {examples.map((contest) => (
                <PublicContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              Nenhum concurso publicado no momento. Quando o admin publicar concursos reais, eles aparecerão aqui.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <Badge variant="success">Plano gratuito</Badge>
            <h2 className="mt-4 font-display text-2xl font-black">Comece sem pagar.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Crie sua conta, defina preferências, veja concursos publicados, salve oportunidades e acesse detalhes com
              link oficial. Sem checkout nesta versão.
            </p>
            <TrackedLink
              className={`${primaryCtaClass} mt-6 w-full`}
              event="click_create_free_alert"
              href="/cadastro"
              metadata={{ location: "free_plan" }}
            >
              Criar meu Radar gratuito
            </TrackedLink>
          </Card>

          <Card className="p-6 shadow-glow">
            <Badge variant="amber">Radar Premium</Badge>
            <h2 className="mt-4 font-display text-2xl font-black">Mais controle para quem acompanha muitos editais.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              O Premium começa com teste grátis e gestão manual. Cobrança automática, webhook e WhatsApp real ainda não
              estão ativos.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {premiumBenefits.map((benefit) => (
                <div key={benefit} className="premium-panel-subtle flex gap-3 p-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  {benefit}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {benefits.map(([title, description]) => (
            <Card key={title} className="p-5">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </Card>
          ))}
        </div>

        <NonOfficialNotice className="mt-12" />
      </section>
      <AppFooter />
    </main>
  );
}
