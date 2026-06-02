import Link from "next/link";
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

  return (
    <PageShell
      eyebrow="Radar"
      title="Concursos compatíveis"
      description="Concursos publicados lidos do Supabase, com match simples baseado nas suas preferências."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Link key={item.key} href={item.href}>
            <Badge variant={tab === item.key || (tab === "all" && item.key === "all") ? "amber" : "muted"}>{item.label}</Badge>
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
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Nenhum concurso encontrado</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ainda não há concursos publicados para este filtro. Se você aplicou o seed, confirme se ele foi executado no Supabase.
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          {filtered.map(({ contest, match }) => (
            <ContestCard key={contest.id} contest={contest} isSaved={savedContestIds.has(contest.id)} match={match} />
          ))}
        </div>
        <Card className="h-fit p-5">
          <h2 className="font-display text-lg font-bold">Match Sprint 1</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Pontuação simples por estado, cidade, escolaridade, cargo/área, salário e cadastro reserva. Sem IA e sem distância real.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
