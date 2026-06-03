import { onboardingAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import { PreferencesForm } from "@/components/preferences/preferences-form";

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

  return (
    <PageShell
      eyebrow="Preferências"
      title="Configure seu Radar"
      description="Essas preferências alimentam o match simples da Sprint 1. Você pode ajustar os dados depois."
    >
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
