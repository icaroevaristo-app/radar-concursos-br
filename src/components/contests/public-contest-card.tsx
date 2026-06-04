import { ArrowRight, CalendarDays, GraduationCap, MapPin, Trophy } from "lucide-react";
import { formatRegistrationEnd, formatSalary, valueOrNotInformed } from "@/lib/contests/formatters";
import { TrackedLink } from "@/components/analytics/track-event";
import { Card } from "@/components/ui/card";
import { ContestStatusBadge } from "@/components/contests/contest-status-badge";
import type { ContestWithRelations } from "@/types/contest";

type PublicContestCardProps = {
  contest: ContestWithRelations;
};

export function PublicContestCard({ contest }: PublicContestCardProps) {
  const firstRole = contest.roles[0] ?? null;

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition hover:border-primary/50 hover:shadow-glow">
      <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <ContestStatusBadge status={contest.status} />
        </div>
        <h3 className="mt-3 font-display text-xl font-black tracking-tight">{contest.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{contest.organization}</p>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <span className="premium-panel-subtle flex items-center gap-2 p-3">
            <MapPin className="h-4 w-4 text-primary" />
            {valueOrNotInformed(contest.city)}/{contest.state}
          </span>
          <span className="premium-panel-subtle flex items-center gap-2 p-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            Fim das inscrições: {formatRegistrationEnd(contest.dates)}
          </span>
          <span className="premium-panel-subtle flex items-center gap-2 p-3">
            <GraduationCap className="h-4 w-4 text-primary" />
            Escolaridade: {valueOrNotInformed(firstRole?.education_level)}
          </span>
          <span className="premium-panel-subtle flex items-center gap-2 p-3">
            <Trophy className="h-4 w-4 text-primary" />
            Salário: {firstRole ? formatSalary(firstRole) : "não informado"}
          </span>
        </div>

        <div className="mt-4 flex flex-1 flex-col justify-end">
          <TrackedLink
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card/50 px-4 text-sm font-bold text-foreground transition hover:border-primary/55 hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            event="contest_card_clicked"
            href={`/concursos/${contest.id}`}
            metadata={{
              contestId: contest.id,
              isDemo: contest.is_demo,
              status: contest.status,
            }}
          >
            Ver detalhes <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </TrackedLink>
        </div>
      </div>
    </Card>
  );
}
