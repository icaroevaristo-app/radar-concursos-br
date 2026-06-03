import { publishContestAction, unpublishContestAction } from "@/lib/admin/actions";
import { getAdminContests } from "@/lib/admin/queries";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function AdminConcursosPage() {
  const { contests, error } = await getAdminContests();

  return (
    <PageShell
      eyebrow="Admin"
      title="Concursos"
      description="Cadastro manual de concursos. Publicados aparecem no Radar; despublicados ficam ocultos para usuários comuns."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{contests.length} concursos cadastrados no Supabase.</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild href="/admin/concursos/importar" variant="outline">
            Importar JSON
          </Button>
          <Button asChild href="/admin/concursos/novo">
            Novo concurso
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Erro ao carregar concursos: {error.message}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="hidden border-b border-border/70 px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground md:grid md:grid-cols-[1fr_8rem_8rem_14rem]">
          <span>Concurso</span>
          <span>UF</span>
          <span>Publicação</span>
          <span>Ações</span>
        </div>
        <div className="divide-y divide-border/70">
          {contests.map((contest) => (
            <div key={contest.id} className="grid gap-3 px-4 py-4 text-sm transition hover:bg-primary/5 md:grid-cols-[1fr_8rem_8rem_14rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-bold">{contest.title}</p>
                  {contest.is_demo ? <Badge variant="amber">Demo</Badge> : null}
                </div>
                <p className="mt-1 text-muted-foreground">{contest.organization}</p>
              </div>
              <span className="text-muted-foreground">{contest.state}</span>
              <Badge variant={contest.publication_status === "published" ? "success" : "muted"}>{contest.publication_status}</Badge>
              <div className="flex flex-wrap gap-2">
                <Button asChild href={`/admin/concursos/${contest.id}/editar`} size="sm" variant="outline">
                  Editar
                </Button>
                <form action={contest.publication_status === "published" ? unpublishContestAction : publishContestAction}>
                  <input name="id" type="hidden" value={contest.id} />
                  <Button size="sm" type="submit" variant="ghost">
                    {contest.publication_status === "published" ? "Despublicar" : "Publicar"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
          {!contests.length ? <p className="empty-state m-4">Nenhum concurso cadastrado.</p> : null}
        </div>
      </Card>
    </PageShell>
  );
}
