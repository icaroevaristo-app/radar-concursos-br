import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { ImportContestsForm } from "@/app/admin/concursos/importar/import-contests-form";

export default function ImportContestsPage() {
  return (
    <PageShell
      eyebrow="Admin"
      title="Importar concursos via JSON"
      description="Importação manual baseada em dados revisados. Não há crawler, IA, scraping ou automação nesta tela."
    >
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Segurança</p>
          <p className="mt-2 text-sm leading-6">Acesso e execução exigem admin validado no servidor.</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Duplicidade</p>
          <p className="mt-2 text-sm leading-6">Duplicados por link oficial ou chave normalizada são ignorados.</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Publicação</p>
          <p className="mt-2 text-sm leading-6">`ready_to_publish` vira `needs_review` para revisão manual no admin.</p>
        </Card>
      </div>

      <ImportContestsForm />
    </PageShell>
  );
}
