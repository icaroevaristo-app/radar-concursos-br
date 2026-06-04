import Link from "next/link";
import { CalendarDays, Filter, Radar, Search, SlidersHorizontal, Sparkles, Target } from "lucide-react";
import { getCurrentUserPreferences, getPublishedContests, getUserSavedContestIds } from "@/lib/contests/queries";
import { calculateContestMatch } from "@/lib/contests/match";
import { getDateValue, getRegistrationEndDate, isCreatedWithinDays, isWithinNextDays } from "@/lib/contests/formatters";
import { PageShell } from "@/components/layout/page-shell";
import { ContestCard } from "@/components/contests/contest-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type RadarPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

const tabs = [
  { href: "/radar", key: "all", label: "Todos", description: "Abertos e futuros" },
  { href: "/radar?tab=strong", key: "strong", label: "Match forte", description: "Mais aderentes" },
  { href: "/radar?tab=new", key: "new", label: "Novos", description: "Últimos 7 dias" },
  { href: "/radar?tab=ending", key: "ending", label: "Encerrando", description: "Próximos 15 dias" },
];

function isActiveTab(currentTab: string, tabKey: string) {
  return currentTab === tabKey || (currentTab === "all" && tabKey === "all");
}

export default async function RadarPage({ searchParams }: RadarPageProps) {
  const { tab = "all" } = await searchParams;
  const [{ contests, error }, { user, profile, preferences }] = await Promise.all([
    getPublishedContests(),
    getCurrentUserPreferences(),
  ]);
  const savedContestIds = await getUserSavedContestIds(user.id);
  const contestsWithMatch = contests
    .filter((contest) => ["open", "upcoming"].includes(contest.status))
    .map((contest) => ({
      contest,
      match: calculateContestMatch(contest, preferences, profile),
    }));

  const filtered = contestsWithMatch.filter(({ contest, match }) => {
    if (tab === "strong") return match.matchLevel === "strong";
    if (tab === "new") return isCreatedWithinDays(contest.created_at, 7) || contest.is_demo;
    if (tab === "ending") {
      const registrationEnd = getRegistrationEndDate(contest.dates);
      return isWithinNextDays(registrationEnd ? getDateValue(registrationEnd) : null, 15);
    }

    return true;
  });

  const strongMatches = contestsWithMatch.filter(({ match }) => match.matchLevel === "strong").length;
  const endingSoon = contestsWithMatch.filter(({ contest }) => {
    const registrationEnd = getRegistrationEndDate(contest.dates);
    return isWithinNextDays(registrationEnd ? getDateValue(registrationEnd) : null, 15);
  }).length;
  const hasDemo = contestsWithMatch.some(({ contest }) => contest.is_demo);
  const locationLabel = [profile?.city, profile?.state].filter(Boolean).join("/");
  const currentTab = tabs.find((item) => item.key === tab) ?? tabs[0];

  return (
    <PageShell
      eyebrow="Radar"
      title="Concursos compatíveis"
      description="Concursos publicados lidos do Supabase, com match simples baseado nas suas preferências."
    >
      <section className="mb-6 overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-br from-primary/15 via-card/90 to-card p-5 shadow-glow md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="amber">Meu Radar</Badge>
              {locationLabel ? <Badge variant="muted">{locationLabel}</Badge> : null}
              {preferences?.education_levels?.length ? <Badge variant="muted">{preferences.education_levels.join(", ")}</Badge> : null}
            </div>
            <h2 className="mt-4 font-display text-2xl font-black tracking-tight md:text-3xl">
              Acompanhe oportunidades com menos ruído.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Use as abas para priorizar matches fortes, concursos novos e inscrições próximas do fim. As informações
              continuam dependendo da fonte oficial antes de qualquer decisão.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Button asChild href="/preferencias" variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              Editar preferências
            </Button>
            <Button asChild href="/meus-concursos" variant="ghost">
              Ver meus concursos
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Radar,
            label: "Publicados ativos",
            value: contestsWithMatch.length,
            helper: "Abertos ou futuros",
            tone: "text-foreground",
          },
          {
            icon: Target,
            label: "Match forte",
            value: strongMatches,
            helper: "Score acima de 70",
            tone: "text-success",
          },
          {
            icon: CalendarDays,
            label: "Inscrições encerrando",
            value: endingSoon,
            helper: "Nos próximos 15 dias",
            tone: "text-primary",
          },
          {
            icon: Filter,
            label: "Filtro atual",
            value: filtered.length,
            helper: currentTab.description,
            tone: "text-foreground",
          },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                <p className={`mt-2 font-display text-3xl font-black ${item.tone}`}>{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
              </div>
              <span className="rounded-md border border-primary/25 bg-primary/10 p-2 text-primary">
                <item.icon className="h-4 w-4" />
              </span>
            </div>
          </Card>
        ))}
      </section>

      {hasDemo ? (
        <div className="mb-5 rounded-lg border border-primary/25 bg-primary/10 p-4 text-sm leading-6 text-amber-50">
          Alguns concursos exibidos vieram do seed demo do Supabase e estão marcados como demonstração. Eles não indicam
          oportunidades reais em aberto.
        </div>
      ) : null}

      <nav aria-label="Filtros do Radar" className="mb-5 overflow-x-auto border-b border-border/60 pb-3">
        <div className="flex min-w-max gap-2">
          {tabs.map((item) => {
            const active = isActiveTab(tab, item.key);

            return (
              <Link
                key={item.key}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg border px-3 py-2 transition ${
                  active
                    ? "border-primary/35 bg-primary/10 text-primary"
                    : "border-border/70 bg-card/60 text-muted-foreground hover:border-primary/45 hover:text-foreground"
                }`}
                href={item.href}
              >
                <span className="block text-sm font-bold">{item.label}</span>
                <span className="mt-0.5 block text-xs opacity-75">{item.description}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {error ? (
        <Card className="mb-5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">Erro ao carregar concursos</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Não foi possível ler os concursos publicados agora. Tente novamente em instantes.
              </p>
            </div>
            <Button asChild href="/radar" variant="outline">
              Recarregar
            </Button>
          </div>
        </Card>
      ) : null}

      {!error && !filtered.length ? (
        <div className="empty-state mb-5">
          <div className="mx-auto max-w-2xl text-center">
            <Search className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-xl font-bold text-foreground">Nenhum concurso encontrado</h2>
            <p className="mt-2 leading-6">
              Não há concursos publicados para este filtro no momento. Ajuste suas preferências ou volte para a aba
              Todos para ampliar a busca.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild href="/radar" variant="outline">
                Ver todos
              </Button>
              <Button asChild href="/preferencias">
                Editar preferências
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          {filtered.map(({ contest, match }) => (
            <ContestCard key={contest.id} contest={contest} isSaved={savedContestIds.has(contest.id)} match={match} />
          ))}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="h-fit p-5">
            <Radar className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Match Sprint 1</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Pontuação simples por estado, cidade, escolaridade, cargo/área, salário e cadastro reserva. Sem IA e sem
              distância real.
            </p>
          </Card>
          <Card className="h-fit p-5">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Aba Encerrando</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Usa datas reais de `contest_dates` com evento `registration_end` nos próximos 15 dias.
            </p>
          </Card>
          <Card className="h-fit p-5">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Próximo ganho</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Filtros persistentes e ajustes de preferências sem sair do Radar.
            </p>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
