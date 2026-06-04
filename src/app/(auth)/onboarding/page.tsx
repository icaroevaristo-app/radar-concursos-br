import { onboardingAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TrackEventOnMount } from "@/components/analytics/track-event";
import { PageShell } from "@/components/layout/page-shell";
import { PreferencesForm } from "@/components/preferences/preferences-form";

type OnboardingPageProps = {
  searchParams: Promise<{
    error?: string;
    signup?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await requireUser();
  const { error, signup } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle();

  return (
    <PageShell
      eyebrow="Preferências"
      title="Configure seu Radar"
      description="Essas preferências ajudam o Radar a encontrar concursos mais compatíveis com seu perfil. Você pode ajustar os dados depois."
    >
      {signup === "completed" ? <TrackEventOnMount event="signup_completed" metadata={{ source: "signup_redirect" }} /> : null}
      <PreferencesForm
        action={onboardingAction}
        error={error}
        profile={profile}
        preferences={preferences}
        submitLabel="Salvar preferências e ver Radar"
      />
    </PageShell>
  );
}
