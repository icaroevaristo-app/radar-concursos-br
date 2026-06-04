import { ArrowLeft } from "lucide-react";
import { updateSubscriptionStatusAction } from "@/lib/admin/subscription-actions";
import { getAdminSubscriptions } from "@/lib/admin/queries";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function formatDate(value: string | null) {
  if (!value) return "não informado";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

function statusVariant(status: string) {
  if (status === "active" || status === "trialing") return "success";
  if (status === "past_due") return "amber";
  if (status === "canceled" || status === "expired") return "danger";
  return "muted";
}

export default async function AdminSubscriptionsPage() {
  const { subscriptions, error } = await getAdminSubscriptions();

  return (
    <PageShell
      eyebrow="Admin"
      title="Assinaturas"
      description="Acompanhe assinaturas do Radar Premium e ajuste status quando necessário."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{subscriptions.length} assinatura(s) cadastrada(s).</p>
        <Button asChild href="/admin" variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          Painel admin
        </Button>
      </div>

      {error ? (
        <Card className="mb-4 p-5">
          <p className="text-sm text-muted-foreground">Erro ao carregar assinaturas: {error.message}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="hidden border-b border-border/70 px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground lg:grid lg:grid-cols-[1fr_8rem_8rem_8rem_8rem_16rem]">
          <span>Usuário</span>
          <span>Status</span>
          <span>Plano</span>
          <span>Trial até</span>
          <span>Período até</span>
          <span>Ações</span>
        </div>
        <div className="divide-y divide-border/70">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="grid gap-3 px-4 py-4 text-sm transition hover:bg-primary/5 lg:grid-cols-[1fr_8rem_8rem_8rem_8rem_16rem]"
            >
              <div>
                <p className="font-display font-bold">{subscription.profile?.full_name ?? subscription.profile?.email ?? subscription.user_id}</p>
                <p className="mt-1 text-xs text-muted-foreground">{subscription.profile?.email ?? subscription.user_id}</p>
              </div>
              <Badge variant={statusVariant(subscription.status)}>{subscription.status}</Badge>
              <span className="text-muted-foreground">{subscription.plan}</span>
              <span className="text-muted-foreground">{formatDate(subscription.trial_end)}</span>
              <span className="text-muted-foreground">{formatDate(subscription.current_period_end)}</span>
              <div className="flex flex-wrap gap-2">
                {["active", "canceled", "expired"].map((status) => (
                  <form key={status} action={updateSubscriptionStatusAction}>
                    <input name="id" type="hidden" value={subscription.id} />
                    <input name="status" type="hidden" value={status} />
                    <Button size="sm" type="submit" variant={status === "active" ? "outline" : "ghost"}>
                      {status}
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          ))}
          {!subscriptions.length ? <p className="empty-state m-4">Nenhuma assinatura cadastrada ainda.</p> : null}
        </div>
      </Card>
    </PageShell>
  );
}
