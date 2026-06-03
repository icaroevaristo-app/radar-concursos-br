import Link from "next/link";
import { Database, FileText, ShieldCheck } from "lucide-react";
import { getAdminDashboardData } from "@/lib/admin/queries";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="mb-5 rounded-lg border border-primary/25 bg-primary/10 p-4 text-sm text-amber-50">
        Admin manual da Sprint 1. Toda ação importante valida admin server-side e registra audit_logs básicos.
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {metricCards.map(([label, value, description]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-3xl font-black">{value}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Últimos concursos</h2>
            </div>
            <Button asChild href="/admin/concursos" size="sm" variant="outline">
              Ver todos
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {latestContests.map((contest) => (
              <Link
                key={contest.id}
                className="block rounded-md border border-border bg-background/45 p-3 transition hover:border-primary/45 hover:bg-primary/5"
                href={`/admin/concursos/${contest.id}/editar`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-bold">{contest.title}</p>
                  <Badge variant={contest.publication_status === "published" ? "success" : "muted"}>{contest.publication_status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{contest.organization}</p>
              </Link>
            ))}
            {!latestContests.length ? <p className="empty-state">Nenhum concurso cadastrado.</p> : null}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Últimas fontes</h2>
            </div>
            <Button asChild href="/admin/fontes" size="sm" variant="outline">
              Ver todas
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {latestSources.map((source) => (
              <Link
                key={source.id}
                className="block rounded-md border border-border bg-background/45 p-3 transition hover:border-primary/45 hover:bg-primary/5"
                href={`/admin/fontes/${source.id}/editar`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-bold">{source.name}</p>
                  <Badge variant={source.status === "active" ? "success" : "muted"}>{source.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{source.base_url}</p>
              </Link>
            ))}
            {!latestSources.length ? <p className="empty-state">Nenhuma fonte cadastrada.</p> : null}
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-primary" />
          <p className="text-sm leading-6 text-muted-foreground">
            O painel não usa botões de crawler nem automações de IA. Fontes e concursos são gerenciados manualmente por admins.
          </p>
        </div>
      </Card>
    </PageShell>
  );
}
