import { changeSourceStatusAction } from "@/lib/admin/actions";
import { getAdminSources } from "@/lib/admin/queries";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function AdminFontesPage() {
  const { sources, error } = await getAdminSources();

  return (
    <PageShell eyebrow="Admin" title="Fontes" description="Cadastre e organize fontes oficiais, bancas e portais de concursos.">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{sources.length} fontes cadastradas.</p>
        <Button asChild href="/admin/fontes/nova">
          Nova fonte
        </Button>
      </div>

      {error ? (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Erro ao carregar fontes: {error.message}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="hidden border-b border-border/70 px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground md:grid md:grid-cols-[1fr_8rem_8rem_10rem]">
          <span>Fonte</span>
          <span>Tipo</span>
          <span>UF</span>
          <span>Ações</span>
        </div>
        <div className="divide-y divide-border/70">
          {sources.map((source) => (
            <div key={source.id} className="grid gap-3 px-4 py-4 text-sm transition hover:bg-primary/5 md:grid-cols-[1fr_8rem_8rem_10rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-bold">{source.name}</p>
                  <Badge variant={source.status === "active" ? "success" : source.status === "paused" ? "amber" : "muted"}>
                    {source.status}
                  </Badge>
                </div>
                <p className="mt-1 break-all text-muted-foreground">{source.base_url}</p>
              </div>
              <span className="text-muted-foreground">{source.type}</span>
              <span className="text-muted-foreground">{source.state ?? "não informado"}</span>
              <div className="flex flex-wrap gap-2">
                <Button asChild href={`/admin/fontes/${source.id}/editar`} size="sm" variant="outline">
                  Editar
                </Button>
                <form action={changeSourceStatusAction}>
                  <input name="id" type="hidden" value={source.id} />
                  <input name="status" type="hidden" value={source.status === "active" ? "paused" : "active"} />
                  <Button size="sm" type="submit" variant="ghost">
                    {source.status === "active" ? "Pausar" : "Ativar"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
          {!sources.length ? <p className="empty-state m-4">Nenhuma fonte cadastrada.</p> : null}
        </div>
      </Card>
    </PageShell>
  );
}
