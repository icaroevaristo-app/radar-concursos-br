import { ArrowRight, Bell, Filter, ShieldCheck } from "lucide-react";
import { getPublishedContests } from "@/lib/contests/queries";
import { TrackEventOnMount, TrackedLink } from "@/components/analytics/track-event";
import { PublicContestCard } from "@/components/contests/public-contest-card";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function PublicContestsPage() {
  const { contests, error } = await getPublishedContests();
  const publicContests = contests.filter((contest) => ["open", "upcoming"].includes(contest.status));

  return (
    <PageShell
      eyebrow="Concursos abertos"
      title="Veja concursos publicados no Radar"
      description="Veja concursos públicos abertos ou com inscrições futuras confirmadas. Configure seu Radar gratuito para acompanhar oportunidades por perfil, cidade, escolaridade e área."
    >
      <TrackEventOnMount event="contest_list_viewed" metadata={{ contestsCount: publicContests.length }} />
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <Card className="p-5">
          <h2 className="font-display text-xl font-black">Não perca mais prazo de concurso público.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Acompanhe concursos abertos e futuros em Goiás e no Centro-Oeste. Antes de se inscrever, confira sempre a
            fonte oficial.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_12px_30px_rgb(245_158_11_/_0.18)] transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              event="click_create_free_alert"
              href="/cadastro"
              metadata={{ location: "public_contests" }}
            >
              Criar meu Radar gratuito <ArrowRight className="h-4 w-4" />
            </TrackedLink>
            <Button asChild href="/login" variant="outline">
              Já tenho conta
            </Button>
          </div>
        </Card>
        <Card className="p-5">
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <Filter className="mt-0.5 h-5 w-5 flex-none text-primary" />
              <p>Filtros personalizados ficam disponíveis após configurar seu Radar gratuito.</p>
            </div>
            <div className="flex gap-3">
              <Bell className="mt-0.5 h-5 w-5 flex-none text-primary" />
              <p>Receba alertas por WhatsApp sobre oportunidades compatíveis com seu perfil no Premium.</p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-primary" />
              <p>Veja edital, banca ou órgão responsável antes de tomar qualquer decisão.</p>
            </div>
          </div>
        </Card>
      </div>

      {error ? (
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Erro ao carregar concursos</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p>
        </Card>
      ) : null}

      {!error && !publicContests.length ? (
        <div className="empty-state">
          <h2 className="font-display text-lg font-bold text-foreground">Nenhum concurso publicado agora</h2>
          <p className="mt-2">Novas oportunidades aparecerão aqui assim que forem revisadas e publicadas.</p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {publicContests.map((contest) => (
          <PublicContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </PageShell>
  );
}
