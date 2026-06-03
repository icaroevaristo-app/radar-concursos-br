import { CalendarDays } from "lucide-react";
import { formatDate, getDateValue, valueOrNotInformed } from "@/lib/contests/formatters";
import { Badge } from "@/components/ui/badge";
import type { ContestDateRow } from "@/types/contest";

const labels: Record<string, string> = {
  appeal_period: "Recurso",
  convocation: "Convocação",
  exam_date: "Prova",
  exam_location: "Local de prova",
  other: "Outro",
  payment_due: "Pagamento",
  registration_end: "Fim das inscrições",
  registration_start: "Início das inscrições",
  result: "Resultado",
};

export function ContestDateList({ dates }: { dates: ContestDateRow[] }) {
  if (!dates.length) {
    return <p className="empty-state">Datas: não informado</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {dates.map((date) => (
        <div key={date.id} className="premium-panel-subtle p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-sm font-bold">{labels[date.event_type] ?? date.event_type}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                {formatDate(getDateValue(date))}
              </p>
            </div>
            {date.is_estimated ? <Badge variant="amber">Estimado</Badge> : null}
          </div>
          {date.description ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{date.description}</p> : null}
          {!getDateValue(date) ? <p className="mt-2 text-xs text-muted-foreground">{valueOrNotInformed(null)}</p> : null}
        </div>
      ))}
    </div>
  );
}
