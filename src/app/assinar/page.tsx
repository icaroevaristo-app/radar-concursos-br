import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getTrialDaysRemaining, getUserSubscription, isSubscriptionPremium } from "@/lib/subscriptions/queries";
import { startPremiumTrialAction } from "@/lib/subscriptions/actions";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SubscribePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const benefits = [
  "Alertas por WhatsApp em breve",
  "Preferências por UF, cidade, escolaridade e área",
  "Concursos futuros destacados",
  "Salvar concursos ilimitados",
  "Lembretes de fim de inscrição",
  "Curadoria focada em Goiás e Centro-Oeste",
];

function formatDate(value: string | null) {
  if (!value) return "não informado";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const { error } = await searchParams;
  const user = await getCurrentUser();
  const { subscription } = user ? await getUserSubscription(user.id) : { subscription: null };
  const isPremium = isSubscriptionPremium(subscription);
  const daysRemaining = getTrialDaysRemaining(subscription);
  const checkoutUrl = process.env.NEXT_PUBLIC_PREMIUM_CHECKOUT_URL;

  return (
    <PageShell
      eyebrow="Radar Premium"
      title="Receba alertas de concursos antes do prazo acabar"
      description="7 dias grátis, depois R$ 9,90/mês. Cancele quando quiser. Lançamento inicial focado em Goiás e Centro-Oeste."
    >
      {error ? (
        <Card className="mb-5 border-danger/35 bg-danger/10 p-4 text-sm text-red-100">
          {error}
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <section className="space-y-5">
          <Card className="overflow-hidden p-6 shadow-glow">
            <Badge variant="amber">7 dias grátis</Badge>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-black tracking-tight md:text-5xl">
              Configure seu Radar Premium por R$ 9,90/mês.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Acompanhe oportunidades com curadoria manual, filtros por perfil e recursos premium em evolução. Sem
              promessa de aprovação, vaga ou resultado garantido.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!user ? (
                <Button asChild href="/cadastro" size="lg">
                  Criar conta e começar teste grátis <ArrowRight className="h-4 w-4" />
                </Button>
              ) : subscription?.status === "trialing" ? (
                checkoutUrl ? (
                  <Button asChild href={checkoutUrl} size="lg" target="_blank">
                    Continuar com Premium <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button asChild href="/minha-conta/assinatura" size="lg">
                    Ver minha assinatura
                  </Button>
                )
              ) : isPremium ? (
                <Button asChild href="/minha-conta/assinatura" size="lg" variant="outline">
                  Premium ativo
                </Button>
              ) : subscription?.trial_start ? (
                <Button asChild href="/minha-conta/assinatura" size="lg" variant="outline">
                  Ver assinatura
                </Button>
              ) : (
                <form action={startPremiumTrialAction}>
                  <Button size="lg" type="submit">
                    Começar 7 dias grátis <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              )}
              <Button asChild href="/concursos" size="lg" variant="outline">
                Ver concursos abertos
              </Button>
            </div>

            {user && subscription?.status === "trialing" ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Seu teste grátis está ativo. Restam {daysRemaining} dia(s), até {formatDate(subscription.trial_end)}.
              </p>
            ) : null}
            {user && subscription?.status === "trialing" && !checkoutUrl ? (
              <p className="mt-2 text-sm text-primary">Checkout em configuração. Entre em contato para ativar.</p>
            ) : null}
          </Card>

          <Card className="p-5">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-primary" />
              <p className="text-sm leading-6 text-muted-foreground">
                O Radar Concursos BR não é site oficial do governo. Sempre confira edital, banca ou órgão responsável
                antes de se inscrever.
              </p>
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-xl font-bold">Oferta</h2>
            <p className="mt-2 font-display text-3xl font-black">R$ 9,90/mês</p>
            <p className="mt-2 text-sm text-muted-foreground">7 dias grátis. Cancele quando quiser.</p>
          </Card>

          <Card className="p-5">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Benefícios Premium</h2>
            <div className="mt-4 space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-primary" />
                  {benefit}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Sem pressa</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Você pode começar pelo teste grátis e acompanhar sua assinatura em{" "}
              <Link className="text-primary underline-offset-4 hover:underline" href="/minha-conta/assinatura">
                Minha assinatura
              </Link>
              .
            </p>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
