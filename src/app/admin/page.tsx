import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const metrics = [
  ["Fontes", "0", "Cadastro preparado"],
  ["Concursos", "0", "Aguardando Supabase"],
  ["Usuários admin", "0", "Permissão via admin_users"],
  ["Storage", "2", "Buckets planejados"],
];

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="Admin"
      title="Painel Admin base"
      description="Fundação do painel administrativo. Sem crawler, IA, pagamentos ou notificações reais nesta entrega."
    >
      <div className="grid gap-3 md:grid-cols-4">
        {metrics.map(([label, value, description]) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-3xl font-black">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-bold">Módulos Sprint 1</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["/admin/fontes", "Admin de Fontes", "source registry e status"],
              ["/admin/concursos", "Admin de Concursos", "publicação e revisão"],
            ].map(([href, title, description]) => (
              <Link key={href} className="rounded-lg border border-border bg-background/45 p-4 hover:border-primary/45" href={href}>
                <Badge variant="amber">Base</Badge>
                <p className="mt-3 font-display font-bold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </Card>
        <PlaceholderPanel
          title="Permissões admin"
          items={[
            "Admins serão definidos em admin_users.",
            "Rotas admin devem validar sessão e perfil antes de ações reais.",
            "Ações críticas devem gerar audit log em sprint posterior.",
          ]}
        />
      </div>
    </PageShell>
  );
}
