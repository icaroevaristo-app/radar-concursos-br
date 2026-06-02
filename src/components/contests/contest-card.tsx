import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
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

export function ContestCard({ contest, match, isSaved, compact = false }: ContestCardProps) {
  const firstRole = contest.roles[0] ?? null;
  const registrationEnd = getRegistrationEndDate(contest.dates);

  return (
    <Card className="p-4 transition hover:border-primary/45">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {contest.is_demo ? <Badge variant="amber">Seed/demo</Badge> : null}
            <ContestStatusBadge status={contest.status} />
            <Badge variant={match.matchLevel === "strong" ? "success" : match.matchLevel === "medium" ? "amber" : "muted"}>
              {match.score}% match
            </Badge>
          </div>
          <h3 className="mt-3 font-display text-lg font-bold">{contest.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{contest.organization}</p>
        </div>
        <SaveContestButton contestId={contest.id} isSaved={isSaved} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {valueOrNotInformed(contest.city)}/{contest.state}
        </span>
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Inscrição até {formatRegistrationEnd(contest.dates)}
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
          <span className="text-foreground">Salário:</span> {firstRole ? formatSalary(firstRole) : "não informado"}
        </p>
      </div>

      {!compact ? (
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          {match.reasons.slice(0, 3).map((reason) => (
            <p key={reason}>- {reason}</p>
          ))}
          {registrationEnd?.is_estimated ? <p className="text-primary">Prazo marcado como estimado/demonstrativo.</p> : null}
        </div>
      ) : null}

      <Link className="mt-4 inline-flex text-sm font-bold text-primary hover:text-amber-300" href={`/concursos/${contest.id}`}>
        Ver detalhes
      </Link>
    </Card>
  );
}
