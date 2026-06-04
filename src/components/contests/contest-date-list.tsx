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

const eventOrder = new Map([
  ["registration_start", 0],
  ["registration_end", 1],
  ["payment_due", 2],
  ["exam_location", 3],
  ["exam_date", 4],
  ["result", 5],
  ["appeal_period", 6],
  ["convocation", 7],
  ["other", 8],
]);

function formatDateRange(date: ContestDateRow) {
  if (date.date_start && date.date_end && date.date_start !== date.date_end) {
    return `${formatDate(date.date_start)} a ${formatDate(date.date_end)}`;
  }

  return formatDate(getDateValue(date));
}

export function ContestDateList({ dates }: { dates: ContestDateRow[] }) {
  if (!dates.length) {
    return (
      <div className="empty-state">
        <p className="font-semibold text-foreground">Datas não informadas</p>
        <p className="mt-2">Consulte a fonte oficial para confirmar cronograma, inscrições e prova.</p>
      </div>
    );
  }

  const orderedDates = [...dates].sort((a, b) => {
    const orderA = eventOrder.get(a.event_type) ?? 99;
    const orderB = eventOrder.get(b.event_type) ?? 99;
    if (orderA !== orderB) return orderA - orderB;

    const timeA = getDateValue(a) ? new Date(`${getDateValue(a)}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = getDateValue(b) ? new Date(`${getDateValue(b)}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
    return timeA - timeB;
  });

  return (
    <div className="relative space-y-3">
      {orderedDates.map((date) => (
        <article key={date.id} className="premium-panel-subtle p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-primary/25 bg-primary/10 p-2 text-primary">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold">{labels[date.event_type] ?? date.event_type}</h3>
                  <p className="mt-1 text-sm font-semibold text-foreground">{formatDateRange(date)}</p>
                </div>
              </div>
            </div>
            {date.is_estimated ? <Badge variant="amber">Estimado</Badge> : null}
          </div>

          {date.description ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{date.description}</p> : null}
          {!getDateValue(date) ? <p className="mt-3 text-sm text-muted-foreground">{valueOrNotInformed(null)}</p> : null}
        </article>
      ))}
    </div>
  );
}
