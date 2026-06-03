import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import {
  formatRegistrationEnd,
  formatRoleSummary,
  formatSalary,
  getRegistrationEndDate,
  valueOrNotInformed,
} from "@/lib/contests/formatters";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContestStatusBadge } from "@/components/contests/contest-status-badge";
import { SaveContestButton } from "@/components/contests/save-contest-button";
import type { ContestMatch, ContestWithRelations } from "@/types/contest";

type ContestCardProps = {
  contest: ContestWithRelations;
  match: ContestMatch;
  isSaved: boolean;
  compact?: boolean;
};

function matchVariant(level: ContestMatch["matchLevel"]) {
  if (level === "strong") return "success";
  if (level === "medium") return "amber";
  return "muted";
}

export function ContestCard({ contest, match, isSaved, compact = false }: ContestCardProps) {
  const firstRole = contest.roles[0] ?? null;
  const registrationEnd = getRegistrationEndDate(contest.dates);

  return (
    <Card className="group overflow-hidden p-0 transition hover:border-primary/50 hover:shadow-glow">
      <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {contest.is_demo ? <Badge variant="amber">Seed/demo</Badge> : null}
              <ContestStatusBadge status={contest.status} />
              <Badge variant={matchVariant(match.matchLevel)}>{match.score}% match</Badge>
            </div>
            <h3 className="mt-3 font-display text-xl font-black tracking-tight">{contest.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{contest.organization}</p>
          </div>
          <SaveContestButton contestId={contest.id} isSaved={isSaved} />
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <span className="premium-panel-subtle flex items-center gap-2 p-3">
            <MapPin className="h-4 w-4 text-primary" />
            {valueOrNotInformed(contest.city)}/{contest.state}
          </span>
          <span className="premium-panel-subtle flex items-center gap-2 p-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            Inscrição até {formatRegistrationEnd(contest.dates)}
          </span>
          <span className="premium-panel-subtle flex items-center gap-2 p-3">
            <Trophy className="h-4 w-4 text-primary" />
            {firstRole ? formatSalary(firstRole) : "não informado"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <p>
            <span className="text-foreground">Banca:</span> {valueOrNotInformed(contest.board)}
          </p>
          <p>
            <span className="text-foreground">Cargos:</span> {formatRoleSummary(contest.roles)}
          </p>
          <p>
            <span className="text-foreground">Fonte:</span> {contest.source?.name ?? "não informado"}
          </p>
        </div>

        {!compact ? (
          <div className="mt-4 rounded-md border border-border/70 bg-background/45 p-3 text-xs text-muted-foreground">
            <p className="mb-2 font-bold text-foreground">Por que apareceu no seu Radar</p>
            <div className="space-y-1">
              {match.reasons.slice(0, 3).map((reason) => (
                <p key={reason}>• {reason}</p>
              ))}
              {registrationEnd?.is_estimated ? <p className="text-primary">Prazo marcado como estimado/demonstrativo.</p> : null}
            </div>
          </div>
        ) : null}

        <Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-amber-300" href={`/concursos/${contest.id}`}>
          Ver detalhes <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Card>
  );
}
