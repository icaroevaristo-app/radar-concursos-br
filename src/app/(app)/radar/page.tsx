import Link from "next/link";
import { CalendarDays, Radar, Sparkles } from "lucide-react";
import { getCurrentUserPreferences, getPublishedContests, getUserSavedContestIds } from "@/lib/contests/queries";
import { calculateContestMatch } from "@/lib/contests/match";
import { getDateValue, getRegistrationEndDate, isCreatedWithinDays, isWithinNextDays } from "@/lib/contests/formatters";
import { PageShell } from "@/components/layout/page-shell";
import { ContestCard } from "@/components/contests/contest-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type RadarPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

const tabs = [
  { href: "/radar", key: "all", label: "Todos" },
  { href: "/radar?tab=strong", key: "strong", label: "Match forte" },
  { href: "/radar?tab=new", key: "new", label: "Novos" },
  { href: "/radar?tab=ending", key: "ending", label: "Encerrando" },
];

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

  return (
    <PageShell
      eyebrow="Radar"
      title="Concursos compatíveis"
      description="Concursos publicados lidos do Supabase, com match simples baseado nas suas preferências."
    >
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Publicados ativos</p>
          <p className="mt-1 font-display text-3xl font-black">{contestsWithMatch.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Match forte</p>
          <p className="mt-1 font-display text-3xl font-black text-success">{strongMatches}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Inscrições encerrando</p>
          <p className="mt-1 font-display text-3xl font-black text-primary">{endingSoon}</p>
        </Card>
      </div>

      {hasDemo ? (
        <div className="mb-5 rounded-lg border border-primary/25 bg-primary/10 p-4 text-sm text-amber-50">
          Alguns concursos exibidos vieram do seed demo do Supabase e estão marcados como demonstração. Eles não indicam
          oportunidades reais em aberto.
        </div>
      ) : null}

      <div className="mb-5 flex gap-2 overflow-x-auto border-b border-border/60 pb-3">
        {tabs.map((item) => (
          <Link key={item.key} href={item.href}>
            <Badge
              className="whitespace-nowrap px-3 py-2"
              variant={tab === item.key || (tab === "all" && item.key === "all") ? "amber" : "muted"}
            >
              {item.label}
            </Badge>
          </Link>
        ))}
      </div>

      {error ? (
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Erro ao carregar concursos</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p>
        </Card>
      ) : null}

      {!error && !filtered.length ? (
        <div className="empty-state">
          <h2 className="font-display text-lg font-bold text-foreground">Nenhum concurso encontrado</h2>
          <p className="mt-2">
            Ainda não há concursos publicados para este filtro. Se você aplicou o seed, confirme se ele foi executado no Supabase.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_19rem]">
        <div className="space-y-4">
          {filtered.map(({ contest, match }) => (
            <ContestCard key={contest.id} contest={contest} isSaved={savedContestIds.has(contest.id)} match={match} />
          ))}
        </div>
        <aside className="space-y-4">
          <Card className="h-fit p-5">
            <Radar className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Match Sprint 1</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Pontuação simples por estado, cidade, escolaridade, cargo/área, salário e cadastro reserva. Sem IA e sem distância real.
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
