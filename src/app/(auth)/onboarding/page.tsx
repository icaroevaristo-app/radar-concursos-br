import { onboardingAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      title="Onboarding"
      description="Salve seu perfil para preparar o Radar. Você pode ajustar essas preferências depois."
    >
      <Card className="max-w-4xl p-5">
        {error ? (
          <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">
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

        <form action={onboardingAction} className="space-y-7">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm md:col-span-2">
              <span className="mb-1.5 block text-muted-foreground">Cidade</span>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                defaultValue={profile?.city ?? preferences?.cities?.[0] ?? ""}
                name="city"
                placeholder="Ex: Goiânia"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">UF</span>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                defaultValue={profile?.state ?? preferences?.states?.[0] ?? "GO"}
                name="state"
                required
              >
                {["GO", "SP", "MG", "RJ", "BA", "PR", "RS", "PE", "CE", "DF"].map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Raio de distância em km</span>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                defaultValue={preferences?.radius_km ?? 100}
                min={1}
                name="radius_km"
                required
                type="number"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1.5 block text-muted-foreground">Escolaridade principal</span>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                defaultValue={selectedEducation}
                name="education_level"
                required
              >
                {educationLevels.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Salário mínimo desejado</span>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                defaultValue={preferences?.min_salary ?? ""}
                min={0}
                name="min_salary"
                placeholder="Opcional"
                type="number"
              />
            </label>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm text-muted-foreground">Escolaridades aceitas</legend>
            <div className="flex flex-wrap gap-2">
              {educationLevels.map(([value, label]) => (
                <label key={value} className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  <input
                    className="mr-2 accent-amber-500"
                    defaultChecked={selectedEducationLevels.has(value)}
                    name="education_levels"
                    type="checkbox"
                    value={value}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm text-muted-foreground">Áreas de interesse</legend>
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <label key={area} className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  <input
                    className="mr-2 accent-amber-500"
                    defaultChecked={selectedAreas.has(area)}
                    name="areas"
                    type="checkbox"
                    value={area}
                  />
                  {area}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm text-muted-foreground">Cargos de interesse</legend>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <label key={role} className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  <input
                    className="mr-2 accent-amber-500"
                    defaultChecked={selectedRoles.has(role)}
                    name="desired_roles"
                    type="checkbox"
                    value={role}
                  />
                  {role}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex gap-2 text-sm text-muted-foreground">
              <input
                className="mt-1 accent-amber-500"
                defaultChecked={preferences?.accepts_temporary ?? true}
                name="accepts_temporary"
                type="checkbox"
              />
              Aceito processo seletivo temporário
            </label>
            <label className="flex gap-2 text-sm text-muted-foreground">
              <input
                className="mt-1 accent-amber-500"
                defaultChecked={preferences?.accepts_reserve_list ?? true}
                name="accepts_reserve_list"
                type="checkbox"
              />
              Aceito cadastro reserva
            </label>
            <label className="flex gap-2 text-sm text-muted-foreground">
              <input
                className="mt-1 accent-amber-500"
                defaultChecked={preferences?.accepts_remote_or_other_city_exam ?? true}
                name="accepts_remote_or_other_city_exam"
                type="checkbox"
              />
              Aceito prova em outra cidade
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <fieldset>
              <legend className="mb-3 text-sm text-muted-foreground">Canais de alerta preparados</legend>
              <label className="flex gap-2 text-sm text-muted-foreground">
                <input
                  className="mt-1 accent-amber-500"
                  defaultChecked={selectedChannels.has("email")}
                  name="notification_channels"
                  type="checkbox"
                  value="email"
                />
                E-mail
              </label>
            </fieldset>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Frequência</span>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
                defaultValue={preferences?.notification_frequency ?? "daily"}
                name="notification_frequency"
              >
                <option value="immediate">Imediata</option>
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="paused">Pausada</option>
              </select>
            </label>
          </div>

          <Button className="mt-2" type="submit">
            Salvar preferências e ver Radar
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
