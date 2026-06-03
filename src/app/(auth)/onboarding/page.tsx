import { onboardingAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const areas = ["Administrativo", "Saúde", "Educação", "Fiscal", "Guarda municipal", "Técnico"];
const roles = ["Assistente administrativo", "Fiscal", "Professor", "Agente de saúde", "Guarda municipal", "Técnico"];
const educationLevels = [
  ["fundamental", "Ensino fundamental"],
  ["medio", "Ensino médio"],
  ["tecnico", "Técnico"],
  ["superior", "Superior"],
];

type OnboardingPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await requireUser();
  const { error } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle();
  const selectedEducation = profile?.education_level ?? preferences?.education_levels?.[0] ?? "medio";
  const selectedAreas = new Set(preferences?.areas ?? []);
  const selectedRoles = new Set(preferences?.desired_roles ?? []);
  const selectedEducationLevels = new Set(preferences?.education_levels?.length ? preferences.education_levels : [selectedEducation]);
  const selectedChannels = new Set(preferences?.notification_channels?.length ? preferences.notification_channels : ["email"]);

  return (
    <PageShell
      eyebrow="Preferências"
      title="Configure seu Radar"
      description="Essas preferências alimentam o match simples da Sprint 1. Você pode ajustar os dados depois."
    >
      <Card className="mx-auto max-w-5xl p-6 shadow-glow">
        {error ? (
          <div className="mb-5 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          {["Local", "Perfil", "Interesses", "Alertas"].map((step, index) => (
            <Badge key={step} variant={index === 0 ? "amber" : "muted"}>
              {index + 1}. {step}
            </Badge>
          ))}
        </div>

        <form action={onboardingAction} className="space-y-6">
          <section className="premium-panel-subtle p-4">
            <h2 className="font-display text-lg font-bold">Localização base</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sem endereço completo. Apenas cidade, UF e raio aproximado.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block md:col-span-2">
                <span className="form-label">Cidade</span>
                <input
                  className="form-control"
                  defaultValue={profile?.city ?? preferences?.cities?.[0] ?? ""}
                  name="city"
                  placeholder="Ex: Goiânia"
                  required
                />
              </label>
              <label className="block">
                <span className="form-label">UF</span>
                <select className="form-control" defaultValue={profile?.state ?? preferences?.states?.[0] ?? "GO"} name="state" required>
                  {["GO", "SP", "MG", "RJ", "BA", "PR", "RS", "PE", "CE", "DF"].map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="form-label">Raio em km</span>
                <input className="form-control" defaultValue={preferences?.radius_km ?? 100} min={1} name="radius_km" required type="number" />
              </label>
            </div>
          </section>

          <section className="premium-panel-subtle p-4">
            <h2 className="font-display text-lg font-bold">Perfil profissional</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="form-label">Escolaridade principal</span>
                <select className="form-control" defaultValue={selectedEducation} name="education_level" required>
                  {educationLevels.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="form-label">Salário mínimo desejado</span>
                <input className="form-control" defaultValue={preferences?.min_salary ?? ""} min={0} name="min_salary" placeholder="Opcional" type="number" />
              </label>
            </div>
            <fieldset className="mt-4">
              <legend className="form-label">Escolaridades aceitas</legend>
              <div className="flex flex-wrap gap-2">
                {educationLevels.map(([value, label]) => (
                  <label key={value} className="rounded-full border border-border bg-background/45 px-3 py-2 text-sm text-muted-foreground">
                    <input className="mr-2 accent-amber-500" defaultChecked={selectedEducationLevels.has(value)} name="education_levels" type="checkbox" value={value} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          <section className="premium-panel-subtle p-4">
            <h2 className="font-display text-lg font-bold">Interesses</h2>
            <fieldset className="mt-4">
              <legend className="form-label">Áreas de interesse</legend>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <label key={area} className="rounded-full border border-border bg-background/45 px-3 py-2 text-sm text-muted-foreground">
                    <input className="mr-2 accent-amber-500" defaultChecked={selectedAreas.has(area)} name="areas" type="checkbox" value={area} />
                    {area}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className="form-label">Cargos de interesse</legend>
              <div className="flex flex-wrap gap-2">
                {roles.map((role) => (
                  <label key={role} className="rounded-full border border-border bg-background/45 px-3 py-2 text-sm text-muted-foreground">
                    <input className="mr-2 accent-amber-500" defaultChecked={selectedRoles.has(role)} name="desired_roles" type="checkbox" value={role} />
                    {role}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="flex gap-3 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground">
                <input className="form-checkbox" defaultChecked={preferences?.accepts_temporary ?? true} name="accepts_temporary" type="checkbox" />
                <span>Aceito processo seletivo temporário</span>
              </label>
              <label className="flex gap-3 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground">
                <input className="form-checkbox" defaultChecked={preferences?.accepts_reserve_list ?? true} name="accepts_reserve_list" type="checkbox" />
                <span>Aceito cadastro reserva</span>
              </label>
              <label className="flex gap-3 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground">
                <input
                  className="form-checkbox"
                  defaultChecked={preferences?.accepts_remote_or_other_city_exam ?? true}
                  name="accepts_remote_or_other_city_exam"
                  type="checkbox"
                />
                <span>Aceito prova em outra cidade</span>
              </label>
            </div>
          </section>

          <section className="premium-panel-subtle p-4">
            <h2 className="font-display text-lg font-bold">Alertas preparados</h2>
            <p className="mt-1 text-sm text-muted-foreground">Nenhuma notificação real é enviada nesta Sprint 1.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <fieldset>
                <legend className="form-label">Canais</legend>
                <label className="flex gap-3 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground">
                  <input className="form-checkbox" defaultChecked={selectedChannels.has("email")} name="notification_channels" type="checkbox" value="email" />
                  <span>E-mail</span>
                </label>
              </fieldset>
              <label className="block">
                <span className="form-label">Frequência</span>
                <select className="form-control" defaultValue={preferences?.notification_frequency ?? "daily"} name="notification_frequency">
                  <option value="immediate">Imediata</option>
                  <option value="daily">Diária</option>
                  <option value="weekly">Semanal</option>
                  <option value="paused">Pausada</option>
                </select>
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">O match é simples, sem IA e sem cálculo real de distância.</p>
            <Button type="submit">Salvar preferências e ver Radar</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
