import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  MapPin,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  getContestById,
  getOptionalCurrentUserPreferences,
  getUserSavedContestIds,
} from "@/lib/contests/queries";
import { calculateContestMatch } from "@/lib/contests/match";
import {
  formatRegistrationEnd,
  formatRoleSummary,
  formatSalary,
  valueOrNotInformed,
} from "@/lib/contests/formatters";
import { createRequestId, logger } from "@/lib/logger";
import { PageShell } from "@/components/layout/page-shell";
import { TrackEventOnMount, TrackedLink } from "@/components/analytics/track-event";
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

function matchVariant(level: "strong" | "medium" | "weak") {
  if (level === "strong") return "success";
  if (level === "medium") return "amber";
  return "muted";
}

function matchLabel(level: "strong" | "medium" | "weak") {
  if (level === "strong") return "Match forte";
  if (level === "medium") return "Match médio";
  return "Match inicial";
}

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
  const primaryRole = contest.roles[0] ?? null;

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

  const facts = [
    {
      icon: Building2,
      label: "Órgão",
      value: contest.organization,
    },
    {
      icon: MapPin,
      label: "Local",
      value: `${valueOrNotInformed(contest.city)}/${contest.state}`,
    },
    {
      icon: CalendarDays,
      label: "Inscrição até",
      value: formatRegistrationEnd(contest.dates),
    },
    {
      icon: GraduationCap,
      label: "Escolaridade",
      value: valueOrNotInformed(primaryRole?.education_level),
    },
    {
      icon: Trophy,
      label: "Salário",
      value: primaryRole ? formatSalary(primaryRole) : "não informado",
    },
    {
      icon: Landmark,
      label: "Banca",
      value: valueOrNotInformed(contest.board),
    },
  ];

  return (
    <PageShell
      eyebrow="Detalhes do concurso"
      title={contest.title}
      description="Dados organizados pelo Radar. Valide tudo no link oficial antes de tomar qualquer decisão."
    >
      <TrackEventOnMount
        event="contest_viewed"
        metadata={{
          contestId: contest.id,
          isDemo: contest.is_demo,
          status: contest.status,
        }}
      />

      <div className="mb-5">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:text-amber-300" href="/concursos">
          <ArrowLeft className="h-4 w-4" />
          Voltar para concursos
        </Link>
      </div>

      <section className="mb-6 overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-br from-primary/15 via-card/95 to-card p-5 shadow-glow md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <ContestStatusBadge status={contest.status} />
              {user ? (
                <Badge variant={matchVariant(match.matchLevel)}>
                  {matchLabel(match.matchLevel)} · {match.score}%
                </Badge>
              ) : (
                <Badge variant="muted">Crie conta para ver match</Badge>
              )}
            </div>
            <p className="mt-4 text-sm font-semibold text-muted-foreground">{contest.organization}</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              {valueOrNotInformed(contest.summary)}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:w-72 lg:flex-col">
            {user ? (
              <SaveContestButton className="h-10 w-full" contestId={contest.id} isSaved={savedContestIds.has(contest.id)} />
            ) : (
              <TrackedLink
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_12px_30px_rgb(245_158_11_/_0.18)] transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                event="click_create_free_alert"
                href="/cadastro"
                metadata={{ location: "contest_details", contestId: contest.id }}
              >
                Criar meu Radar gratuito
              </TrackedLink>
            )}
            <TrackedLink
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-primary/35 bg-primary/10 px-4 text-sm font-bold text-primary transition hover:border-primary/60 hover:bg-primary/15 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              event="official_link_clicked"
              href={contest.official_url}
              metadata={{ contestId: contest.id, isDemo: contest.is_demo, status: contest.status }}
              target="_blank"
            >
              Link oficial <ExternalLink className="h-4 w-4" />
            </TrackedLink>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Resumo</p>
                <h2 className="mt-2 font-display text-xl font-bold">Informações principais</h2>
              </div>
              <Badge variant="muted">{formatRoleSummary(contest.roles)}</Badge>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {facts.map((fact) => (
                <div key={fact.label} className="premium-panel-subtle p-3">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/75">
                    <fact.icon className="h-4 w-4 text-primary" />
                    {fact.label}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold leading-6 text-foreground">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="section-kicker">Cargos</p>
                  <h2 className="mt-1 font-display text-xl font-bold">Vagas, salário e requisitos</h2>
                </div>
              </div>
              <Badge variant="muted">{contest.roles.length} cargo(s)</Badge>
            </div>
            <ContestRoleList roles={contest.roles} />
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <p className="section-kicker">Cronograma</p>
                  <h2 className="mt-1 font-display text-xl font-bold">Datas importantes</h2>
                </div>
              </div>
              <Badge variant="muted">{contest.dates.length} evento(s)</Badge>
            </div>
            <ContestDateList dates={contest.dates} />
          </Card>

          <NonOfficialNotice />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="h-fit p-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Fonte oficial</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Antes de se inscrever, confira edital, prazos, taxas, cargos e requisitos diretamente no site oficial.
            </p>
            <div className="mt-4 space-y-3">
              <TrackedLink
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground shadow-[0_12px_30px_rgb(245_158_11_/_0.18)] transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                event="official_link_clicked"
                href={contest.official_url}
                metadata={{ contestId: contest.id, isDemo: contest.is_demo, status: contest.status, location: "source_card" }}
                target="_blank"
              >
                Abrir fonte oficial <ExternalLink className="h-4 w-4" />
              </TrackedLink>
              {contest.document_url ? (
                <Button asChild className="w-full" href={contest.document_url} target="_blank" variant="outline">
                  Ver documento <FileText className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </Card>

          <Card className="h-fit p-5">
            <h2 className="font-display text-lg font-bold">Seu acompanhamento</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Salve o concurso para acompanhar depois em Meus Concursos e manter suas oportunidades organizadas.
            </p>
            <div className="mt-4 space-y-3">
              {user ? (
                <>
                  <SaveContestButton className="h-10 w-full" contestId={contest.id} isSaved={savedContestIds.has(contest.id)} />
                  <Button asChild className="w-full" href="/meus-concursos" variant="outline">
                    Ver meus concursos
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full" href="/cadastro">
                  Criar meu Radar gratuito
                </Button>
              )}
            </div>
          </Card>

          {user ? (
            <Card className="h-fit p-5">
              <p className="section-kicker">Match</p>
              <h2 className="mt-2 font-display text-lg font-bold">
                {matchLabel(match.matchLevel)} · {match.score}%
              </h2>
              <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                {match.reasons.slice(0, 4).map((reason) => (
                  <p key={reason}>• {reason}</p>
                ))}
              </div>
            </Card>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}
