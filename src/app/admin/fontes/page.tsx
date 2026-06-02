import { changeSourceStatusAction } from "@/lib/admin/actions";
import { getAdminSources } from "@/lib/admin/queries";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function AdminFontesPage() {
  const { sources, error } = await getAdminSources();

  return (
    <PageShell eyebrow="Admin" title="Fontes" description="Cadastro manual de fontes. Nenhum crawler é executado nesta Sprint 1.">
      <div className="mb-4 flex justify-end">
        <Button asChild href="/admin/fontes/nova">
          Nova fonte
        </Button>
      </div>

      {error ? (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Erro ao carregar fontes: {error.message}</p>
        </Card>
      ) : null}

      <Card className="divide-y divide-border overflow-hidden">
        {sources.map((source) => (
          <div key={source.id} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1fr_8rem_8rem_10rem]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display font-bold">{source.name}</p>
                <Badge variant={source.status === "active" ? "success" : "muted"}>{source.status}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{source.base_url}</p>
            </div>
            <span className="text-muted-foreground">{source.type}</span>
            <span className="text-muted-foreground">{source.state ?? "não informado"}</span>
            <div className="flex flex-wrap gap-2">
              <Button asChild href={`/admin/fontes/${source.id}/editar`} variant="outline">
                Editar
              </Button>
              <form action={changeSourceStatusAction}>
                <input name="id" type="hidden" value={source.id} />
                <input name="status" type="hidden" value={source.status === "active" ? "paused" : "active"} />
                <Button type="submit" variant="ghost">
                  {source.status === "active" ? "Pausar" : "Ativar"}
                </Button>
              </form>
            </div>
          </div>
        ))}
        {!sources.length ? <p className="p-5 text-sm text-muted-foreground">Nenhuma fonte cadastrada.</p> : null}
      </Card>
    </PageShell>
  );
}
