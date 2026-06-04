import { updatePreferencesAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TrackEventOnMount } from "@/components/analytics/track-event";
import { PageShell } from "@/components/layout/page-shell";
import { PreferencesForm } from "@/components/preferences/preferences-form";

type PreferencesPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function PreferencesPage({ searchParams }: PreferencesPageProps) {
  const user = await requireUser();
  const { error, success } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle();

  return (
    <PageShell
      eyebrow="Meu Radar"
      title="Editar preferências"
      description="Ajuste cidade, UF, escolaridade, áreas e cargos para recalcular seu Radar com dados salvos no Supabase."
    >
      <TrackEventOnMount event="preferences_viewed" metadata={{ source: "preferences_page" }} />
      {success ? <TrackEventOnMount event="preferences_updated" metadata={{ source: "preferences_redirect" }} /> : null}
      <PreferencesForm
        action={updatePreferencesAction}
        error={error}
        footnote="As alterações atualizam seu perfil e suas preferências. Nenhuma notificação real é enviada nesta versão."
        profile={profile}
        preferences={preferences}
        submitLabel="Salvar alterações"
        success={success}
      />
    </PageShell>
  );
}
