import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const columns = ["Nome", "Tipo", "URL base", "Status"];

export default function AdminFontesPage() {
  return (
    <PageShell
      eyebrow="Admin"
      title="Fontes"
      description="Placeholder do cadastro de fontes. Nenhum crawler foi implementado nesta Sprint 1."
    >
      <Card className="overflow-hidden">
        <div className="grid grid-cols-4 gap-3 border-b border-border px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {columns.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3 px-4 py-4 text-sm">
          <span>Fonte demo</span>
          <span>Portal</span>
          <span>https://example.com</span>
          <Badge variant="muted">Seed/demo</Badge>
        </div>
      </Card>
    </PageShell>
  );
}
