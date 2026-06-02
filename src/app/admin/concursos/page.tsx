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
      <div className="mb-4 flex justify-end">
        <Button asChild href="/admin/concursos/novo">
          Novo concurso
        </Button>
      </div>

      {error ? (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Erro ao carregar concursos: {error.message}</p>
        </Card>
      ) : null}

      <Card className="divide-y divide-border overflow-hidden">
        {contests.map((contest) => (
          <div key={contest.id} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1fr_8rem_8rem_14rem]">
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
              <Button asChild href={`/admin/concursos/${contest.id}/editar`} variant="outline">
                Editar
              </Button>
              <form action={contest.publication_status === "published" ? unpublishContestAction : publishContestAction}>
                <input name="id" type="hidden" value={contest.id} />
                <Button type="submit" variant="ghost">
                  {contest.publication_status === "published" ? "Despublicar" : "Publicar"}
                </Button>
              </form>
            </div>
          </div>
        ))}
        {!contests.length ? <p className="p-5 text-sm text-muted-foreground">Nenhum concurso cadastrado.</p> : null}
      </Card>
    </PageShell>
  );
}
