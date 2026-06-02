import { formatDate, getDateValue, valueOrNotInformed } from "@/lib/contests/formatters";
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
    return <p className="text-sm text-muted-foreground">Datas: não informado</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {dates.map((date) => (
        <div key={date.id} className="rounded-md border border-border bg-background/45 p-3">
          <p className="font-display text-sm font-bold">{labels[date.event_type] ?? date.event_type}</p>
          <p className="mt-1 text-sm text-muted-foreground">{formatDate(getDateValue(date))}</p>
          {date.description ? <p className="mt-2 text-xs text-muted-foreground">{date.description}</p> : null}
          {date.is_estimated ? <p className="mt-2 text-xs text-primary">Data estimada ou demonstrativa.</p> : null}
          {!getDateValue(date) ? <p className="mt-2 text-xs text-muted-foreground">{valueOrNotInformed(null)}</p> : null}
        </div>
      ))}
    </div>
  );
}
