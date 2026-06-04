import Link from "next/link";
import {
  Activity,
  ClipboardList,
  CreditCard,
  Database,
  FileJson,
  FilePlus2,
  FileText,
  HeartPulse,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { getAdminDashboardData } from "@/lib/admin/queries";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const shortcutCards = [
  {
    href: "/admin/concursos",
    label: "Concursos",
    description: "Listar, revisar, editar e publicar oportunidades.",
    icon: FileText,
  },
  {
    href: "/admin/concursos/novo",
    label: "Novo concurso",
    description: "Cadastrar manualmente uma nova oportunidade.",
    icon: FilePlus2,
  },
  {
    href: "/admin/concursos/importar",
    label: "Importar JSON",
    description: "Importação manual revisada de concursos, cargos e datas.",
    icon: FileJson,
  },
  {
    href: "/admin/fontes",
    label: "Fontes",
    description: "Gerenciar bancas, portais e fontes oficiais.",
    icon: Database,
  },
  {
    href: "/admin/fontes/nova",
    label: "Nova fonte",
    description: "Cadastrar fonte para uso manual e futuro.",
    icon: Plus,
  },
  {
    href: "/api/health",
    label: "Health check",
    description: "Verificar app e conexão básica com banco.",
    icon: HeartPulse,
    external: true,
  },
  {
    href: "/admin/assinaturas",
    label: "Assinaturas",
    description: "Gerenciar status manual do Radar Premium.",
    icon: CreditCard,
  },
];

const comingSoonCards = [
  { label: "Logs e auditoria", description: "Consulta visual de audit_logs.", icon: Activity },
  { label: "Usuários", description: "Gestão operacional de contas.", icon: Users },
  { label: "Checkout/webhooks", description: "Preparado para Mercado Pago futuro.", icon: Sparkles },
];

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
      description="Operação manual do Radar Concursos BR. Crawler, IA, pagamentos e notificações reais ainda não estão ativos."
    >
      <div className="mb-5 rounded-lg border border-primary/25 bg-primary/10 p-4 text-sm leading-6 text-amber-50">
        Use este painel para cadastrar fontes, importar JSON revisado e publicar concursos. Toda ação sensível valida admin server-side e registra
        audit_logs básicos.
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

      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Atalhos operacionais</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shortcutCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                className="group rounded-lg border border-border bg-card p-4 transition hover:border-primary/50 hover:bg-primary/5"
                href={item.href}
                target={item.external ? "_blank" : undefined}
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-md border border-primary/25 bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-display font-bold text-foreground group-hover:text-primary">{item.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.description}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {comingSoonCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="p-4 opacity-80">
                <div className="flex items-start gap-3">
                  <span className="rounded-md border border-border bg-muted/30 p-2 text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold">{item.label}</p>
                      <Badge variant="muted">em breve</Badge>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

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
