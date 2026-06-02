import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getCurrentUserPreferences, getContestById, getUserSavedContestIds } from "@/lib/contests/queries";
import { calculateContestMatch } from "@/lib/contests/match";
import { formatRegistrationEnd, valueOrNotInformed } from "@/lib/contests/formatters";
import { PageShell } from "@/components/layout/page-shell";
import { NonOfficialNotice } from "@/components/shared/non-official-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContestRoleList } from "@/components/contests/contest-role-list";
import { ContestDateList } from "@/components/contests/contest-date-list";
import { ContestStatusBadge } from "@/components/contests/contest-status-badge";
import { SaveContestButton } from "@/components/contests/save-contest-button";

type ContestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ContestDetailsPage({ params }: ContestDetailsPageProps) {
  const { id } = await params;
  const contest = await getContestById(id);

  if (!contest) {
    notFound();
  }

  const { user, profile, preferences } = await getCurrentUserPreferences();
  const savedContestIds = await getUserSavedContestIds(user.id);
  const match = calculateContestMatch(contest, preferences, profile);

  return (
    <PageShell
      eyebrow="Detalhes do concurso"
      title={contest.title}
      description="Confira os dados organizados e valide tudo no link oficial antes de tomar qualquer decisão."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap gap-2">
              {contest.is_demo ? <Badge variant="amber">Seed/demo</Badge> : null}
              <ContestStatusBadge status={contest.status} />
              <Badge variant={match.matchLevel === "strong" ? "success" : match.matchLevel === "medium" ? "amber" : "muted"}>
                {match.score}% match
              </Badge>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Órgão", contest.organization],
                ["Cidade/UF", `${valueOrNotInformed(contest.city)}/${contest.state}`],
                ["Banca", valueOrNotInformed(contest.board)],
                ["Fonte", contest.source?.name ?? "não informado"],
                ["Situação", contest.status],
                ["Inscrição", formatRegistrationEnd(contest.dates)],
                ["Resumo", valueOrNotInformed(contest.summary)],
                ["Motivos do match", match.reasons.join(" ")],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-border bg-background/45 p-3">
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold">Cargos</h2>
            <ContestRoleList roles={contest.roles} />
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-bold">Datas</h2>
            <ContestDateList dates={contest.dates} />
          </Card>

          <NonOfficialNotice />
        </div>

        <Card className="h-fit p-5">
          <h2 className="font-display text-lg font-bold">Ações</h2>
          <div className="mt-4 space-y-3">
            <SaveContestButton className="w-full" contestId={contest.id} isSaved={savedContestIds.has(contest.id)} />
            <Button asChild className="w-full" href={contest.official_url} target="_blank" variant="outline">
              Link oficial <ExternalLink className="h-4 w-4" />
            </Button>
            <Link className="block text-center text-sm font-bold text-primary" href="/meus-concursos">
              Ver meus concursos
            </Link>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
