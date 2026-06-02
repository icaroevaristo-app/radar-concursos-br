import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ContestPreview } from "@/types/domain";

type DemoContestCardProps = {
  contest: ContestPreview;
  compact?: boolean;
};

export function DemoContestCard({ contest, compact = false }: DemoContestCardProps) {
  return (
    <Card className="p-4 transition hover:border-primary/45">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="amber">Seed/demo</Badge>
            <Badge variant={contest.status === "open" ? "success" : "muted"}>
              {contest.status === "open" ? "Inscrições abertas" : "Acompanhar"}
            </Badge>
          </div>
          <h3 className="mt-3 font-display text-lg font-bold">{contest.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{contest.organization}</p>
        </div>
        <p className="rounded-md border border-success/30 bg-success/10 px-2 py-1 text-xs font-bold text-success">
          {contest.matchScore}% match
        </p>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {contest.city}/{contest.state}
        </span>
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Inscrição até {contest.registrationEndLabel}
        </span>
      </div>

      {!compact ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {contest.roles.map((role) => (
            <Badge key={role} variant="muted">
              {role}
            </Badge>
          ))}
        </div>
      ) : null}

      <Link
        className="mt-4 inline-flex text-sm font-bold text-primary hover:text-amber-300"
        href={`/concursos/${contest.id}`}
      >
        Ver detalhes
      </Link>
    </Card>
  );
}
