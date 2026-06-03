import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, FileText, MapPin } from "lucide-react";
import {
  getContestById,
  getOptionalCurrentUserPreferences,
  getUserSavedContestIds,
} from "@/lib/contests/queries";
import { calculateContestMatch } from "@/lib/contests/match";
import { formatRegistrationEnd, valueOrNotInformed } from "@/lib/contests/formatters";
import { createRequestId, logger } from "@/lib/logger";
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
  const requestId = createRequestId();
  const contest = await getContestById(id);

  if (!contest) {
    notFound();
  }

  const { user, profile, preferences } = await getOptionalCurrentUserPreferences();
  const savedContestIds = user ? await getUserSavedContestIds(user.id) : new Set<string>();
  const match = calculateContestMatch(contest, preferences, profile);

  logger({
    level: "info",
    message: "contest_viewed",
    requestId,
    userId: user?.id,
    route: "/concursos/[id]",
    metadata: {
      contestId: contest.id,
      status: contest.status,
      isDemo: contest.is_demo,
    },
  });

  return (
    <PageShell
      eyebrow="Detalhes do concurso"
      title={contest.title}
      description="Dados organizados pelo Radar. Valide tudo no link oficial antes de tomar qualquer decisão."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-card p-5">
              <div className="flex flex-wrap gap-2">
                {contest.is_demo ? <Badge variant="amber">Seed/demo</Badge> : null}
                <ContestStatusBadge status={contest.status} />
                {user ? (
                  <Badge variant={match.matchLevel === "strong" ? "success" : match.matchLevel === "medium" ? "amber" : "muted"}>
                    {match.score}% match
                  </Badge>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{contest.organization}</p>
            </div>

            <dl className="grid gap-3 p-5 sm:grid-cols-2">
              {[
                ["Órgão", contest.organization],
                ["Cidade/UF", `${valueOrNotInformed(contest.city)}/${contest.state}`],
                ["Banca", valueOrNotInformed(contest.board)],
                ["Fonte", contest.source?.name ?? "não informado"],
                ["Situação", contest.status],
                ["Inscrição", formatRegistrationEnd(contest.dates)],
                ["Resumo", valueOrNotInformed(contest.summary)],
                [
                  "Motivos do match",
                  user ? match.reasons.join(" ") || "não informado" : "Crie um alerta gratuito para ver compatibilidade com seu perfil.",
                ],
              ].map(([label, value]) => (
                <div key={label} className="premium-panel-subtle p-3">
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground/75">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Cargos</h2>
            </div>
            <ContestRoleList roles={contest.roles} />
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Datas</h2>
            </div>
            <ContestDateList dates={contest.dates} />
          </Card>

          <NonOfficialNotice />
        </div>

        <aside className="space-y-4">
          <Card className="h-fit p-5 shadow-glow">
            <h2 className="font-display text-lg font-bold">Ações</h2>
            <div className="mt-4 space-y-3">
              {user ? (
                <>
                  <SaveContestButton className="w-full" contestId={contest.id} isSaved={savedContestIds.has(contest.id)} />
                  <Link className="block text-center text-sm font-bold text-primary hover:text-amber-300" href="/meus-concursos">
                    Ver meus concursos
                  </Link>
                </>
              ) : (
                <Button asChild className="w-full" href="/cadastro">
                  Criar alerta gratuito
                </Button>
              )}
              <Button asChild className="w-full" href={contest.official_url} target="_blank" variant="outline">
                Link oficial <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          <Card className="h-fit p-5">
            <p className="section-kicker">Fonte prevalece</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              O Radar organiza informações, mas edital, banca e órgão responsável são sempre a referência final.
            </p>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
