import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin/queries";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function AdminPage() {
  const { metrics, latestContests, latestSources } = await getAdminDashboardData();
  const metricCards = [
    ["Fontes", metrics.sourcesTotal, "Total cadastrado"],
    ["Fontes ativas", metrics.sourcesActive, "Disponíveis para uso futuro"],
    ["Concursos", metrics.contestsTotal, "Total cadastrado"],
    ["Publicados", metrics.contestsPublished, "Visíveis no Radar"],
    ["Rascunho/revisão", metrics.contestsNeedsWork, "Precisam atenção"],
  ];

  return (
    <PageShell
      eyebrow="Admin"
      title="Painel Admin"
      description="Dados reais da fundação. Crawler, IA, pagamentos e notificações reais ainda não estão ativos."
    >
      <div className="grid gap-3 md:grid-cols-5">
        {metricCards.map(([label, value, description]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-3xl font-black">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">Últimos concursos</h2>
            <Link className="text-sm font-bold text-primary" href="/admin/concursos">
              Ver todos
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {latestContests.map((contest) => (
              <Link key={contest.id} className="block rounded-md border border-border bg-background/45 p-3" href={`/admin/concursos/${contest.id}/editar`}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-bold">{contest.title}</p>
                  <Badge variant={contest.publication_status === "published" ? "success" : "muted"}>{contest.publication_status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{contest.organization}</p>
              </Link>
            ))}
            {!latestContests.length ? <p className="text-sm text-muted-foreground">Nenhum concurso cadastrado.</p> : null}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold">Últimas fontes</h2>
            <Link className="text-sm font-bold text-primary" href="/admin/fontes">
              Ver todas
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {latestSources.map((source) => (
              <Link key={source.id} className="block rounded-md border border-border bg-background/45 p-3" href={`/admin/fontes/${source.id}/editar`}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-bold">{source.name}</p>
                  <Badge variant={source.status === "active" ? "success" : "muted"}>{source.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{source.base_url}</p>
              </Link>
            ))}
            {!latestSources.length ? <p className="text-sm text-muted-foreground">Nenhuma fonte cadastrada.</p> : null}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
