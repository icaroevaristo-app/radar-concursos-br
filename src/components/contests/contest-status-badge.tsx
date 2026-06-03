import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  archived: "Arquivado",
  canceled: "Cancelado",
  closed: "Encerrado",
  draft: "Rascunho",
  finished: "Finalizado",
  open: "Inscrições abertas",
  suspended: "Suspenso",
  upcoming: "Previsto",
};

export function ContestStatusBadge({ status }: { status: string }) {
  const variant = status === "open" ? "success" : status === "upcoming" ? "amber" : status === "canceled" ? "danger" : "muted";

  return <Badge variant={variant}>{labels[status] ?? status}</Badge>;
}
