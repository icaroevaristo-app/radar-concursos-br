import { CreditCard, Mail, Sparkles } from "lucide-react";
import { contactEmail, contactMailto } from "@/lib/contact";
import { requireUser } from "@/lib/auth";
import { getTrialDaysRemaining, getUserSubscription, isSubscriptionPremium } from "@/lib/subscriptions/queries";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SubscriptionAccountPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) return "não informado";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

function statusLabel(status: string | undefined) {
  const labels: Record<string, string> = {
    inactive: "Inativa",
    trialing: "Teste grátis",
    active: "Premium ativo",
    past_due: "Pagamento pendente",
    canceled: "Cancelada",
    expired: "Expirada",
  };

  return labels[status ?? "inactive"] ?? status ?? "Inativa";
}

export default async function SubscriptionAccountPage({ searchParams }: SubscriptionAccountPageProps) {
  const { success } = await searchParams;
  const user = await requireUser();
  const { subscription } = await getUserSubscription(user.id);
  const isPremium = isSubscriptionPremium(subscription);
  const daysRemaining = getTrialDaysRemaining(subscription);

  return (
    <PageShell
      eyebrow="Minha conta"
      title="Assinatura"
      description="Acompanhe seu status do Radar Premium, teste grátis e próximos passos."
    >
      {success === "trial_started" ? (
        <Card className="mb-5 border-success/35 bg-success/10 p-4 text-sm text-green-100">
          Teste grátis iniciado. Seu Radar Premium está ativo por 7 dias.
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={isPremium ? "success" : "muted"}>{statusLabel(subscription?.status)}</Badge>
            <Badge variant="amber">Radar Premium</Badge>
          </div>
          <h2 className="mt-4 font-display text-2xl font-black">
            {isPremium ? "Seu Premium está disponível." : "Seu Premium não está ativo."}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            O Premium libera salvar concursos ilimitados e prepara sua conta para recursos futuros, como WhatsApp e
            lembretes de fim de inscrição.
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="premium-panel-subtle p-3">
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground/75">Status</dt>
              <dd className="mt-1 font-semibold">{statusLabel(subscription?.status)}</dd>
            </div>
            <div className="premium-panel-subtle p-3">
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground/75">Teste grátis até</dt>
              <dd className="mt-1 font-semibold">{formatDate(subscription?.trial_end ?? null)}</dd>
            </div>
            <div className="premium-panel-subtle p-3">
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground/75">Dias restantes</dt>
              <dd className="mt-1 font-semibold">{subscription?.status === "trialing" ? `${daysRemaining} dia(s)` : "não informado"}</dd>
            </div>
            <div className="premium-panel-subtle p-3">
              <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground/75">Período atual até</dt>
              <dd className="mt-1 font-semibold">{formatDate(subscription?.current_period_end ?? null)}</dd>
            </div>
          </dl>

          {!isPremium ? (
            <Button asChild className="mt-6" href="/assinar">
              Ver oferta Premium
            </Button>
          ) : null}
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Checkout externo</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              O checkout real ainda depende de configuração externa. Webhooks de pagamento não foram implementados neste pacote.
            </p>
          </Card>
          <Card className="p-5">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Premium em evolução</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              WhatsApp aparece como recurso Premium futuro, sem integração real ativa agora.
            </p>
          </Card>
          <Card className="p-5">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Suporte</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Precisa de ajuda? Escreva para{" "}
              <a className="text-primary underline-offset-4 hover:underline" href={contactMailto}>
                {contactEmail}
              </a>
              .
            </p>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
