import { ArrowRight, Bell, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { getCurrentUserPreferences } from "@/lib/contests/queries";
import { TrackEventOnMount } from "@/components/analytics/track-event";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function listSummary(values: string[] | null | undefined) {
  if (!values?.length) return "não informado";
  return values.join(", ");
}

export default async function RadarWelcomePage() {
  const { profile, preferences } = await getCurrentUserPreferences();

  const summary = [
    ["UF", listSummary(preferences?.states ?? (profile?.state ? [profile.state] : []))],
    ["Cidade", listSummary(preferences?.cities ?? (profile?.city ? [profile.city] : []))],
    ["Escolaridade", listSummary(preferences?.education_levels ?? (profile?.education_level ? [profile.education_level] : []))],
    ["Áreas", listSummary(preferences?.areas)],
    ["Cargos", listSummary(preferences?.desired_roles)],
    ["Raio", preferences?.radius_km ? `${preferences.radius_km} km` : "não informado"],
  ];

  return (
    <PageShell
      eyebrow="Boas-vindas"
      title="Seu Radar foi configurado."
      description="Agora você pode acompanhar concursos compatíveis com seu perfil. Os alertas reais ainda não estão ativos nesta versão."
    >
      <TrackEventOnMount event="onboarding_completed" metadata={{ source: "welcome_page" }} />
      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        <Card className="p-6 shadow-glow">
          <Badge variant="success">Configuração concluída</Badge>
          <h2 className="mt-4 font-display text-2xl font-black">Resumo das suas preferências</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Use esse resumo como ponto de partida. Você pode ajustar tudo depois em preferências.
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {summary.map(([label, value]) => (
              <div key={label} className="premium-panel-subtle p-3">
                <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground/75">{label}</dt>
                <dd className="mt-1 text-sm font-semibold leading-6">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild href="/radar">
              Ver concursos compatíveis <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild href="/preferencias" variant="outline">
              Editar preferências
            </Button>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Pronto para usar</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              O Radar usa suas preferências para calcular um match simples com concursos publicados no Supabase.
            </p>
          </Card>
          <Card className="p-5">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Premium em breve</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Alertas premium serão disponibilizados futuramente. Ainda não há cobrança, assinatura ou envio real de alerta.
            </p>
          </Card>
          <Card className="p-5">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="mt-3 font-display text-lg font-bold">Ajuste quando quiser</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Cidade, UF, escolaridade, áreas e cargos podem ser alterados em preferências.
            </p>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
