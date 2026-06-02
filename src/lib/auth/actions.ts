"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  parseLoginForm,
  parseOnboardingForm,
  parseSignupForm,
  validateLoginInput,
  validateOnboardingInput,
  validateSignupInput,
} from "@/lib/auth/validation";

function errorRedirect(pathname: string, message: string): never {
  redirect(`${pathname}?error=${encodeURIComponent(message)}`);
}

async function waitForProfile(supabase: SupabaseClient<Database>, userId: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
    if (data) return true;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  return false;
}

function getProfileWriteClient(fallbackClient: SupabaseClient<Database>) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallbackClient;
  }

  return createServiceRoleSupabaseClient();
}

export async function signupAction(formData: FormData) {
  const input = parseSignupForm(formData);
  const validationError = validateSignupInput(input);

  if (validationError) {
    errorRedirect("/cadastro", validationError);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    errorRedirect("/cadastro", "Não foi possível criar sua conta. Verifique os dados e tente novamente.");
  }

  const userId = data.user?.id;

  if (userId) {
    const now = new Date().toISOString();
    const profileSupabase = getProfileWriteClient(supabase);
    const profileExists = await waitForProfile(profileSupabase, userId);

    if (profileExists) {
      const { error: profileUpdateError } = await profileSupabase
        .from("profiles")
        .update({
          full_name: input.fullName,
          email: input.email,
          terms_accepted_at: now,
          privacy_accepted_at: now,
        })
        .eq("id", userId);

      if (profileUpdateError) {
        errorRedirect("/cadastro", "Conta criada, mas não foi possível salvar os aceites. Verifique a service role no servidor.");
      }
    } else {
      const { error: profileInsertError } = await profileSupabase.from("profiles").insert({
        id: userId,
        full_name: input.fullName,
        email: input.email,
        terms_accepted_at: now,
        privacy_accepted_at: now,
        subscription_status: "free",
      });

      if (profileInsertError) {
        errorRedirect("/cadastro", "Conta criada, mas não foi possível criar o profile. Verifique a service role no servidor.");
      }
    }
  }

  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  const input = parseLoginForm(formData);
  const validationError = validateLoginInput(input);

  if (validationError) {
    errorRedirect("/login", validationError);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    errorRedirect("/login", "E-mail ou senha inválidos.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    errorRedirect("/login", "Sessão não encontrada. Tente entrar novamente.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  redirect(profile?.onboarding_completed ? "/radar" : "/onboarding");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function onboardingAction(formData: FormData) {
  const input = parseOnboardingForm(formData);
  const validationError = validateOnboardingInput(input);

  if (validationError) {
    errorRedirect("/onboarding", validationError);
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      city: input.city,
      state: input.state,
      education_level: input.educationLevel,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (profileError) {
    errorRedirect("/onboarding", "Não foi possível atualizar seu perfil.");
  }

  const { error: preferencesError } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      states: [input.state],
      cities: [input.city],
      radius_km: input.radiusKm,
      education_levels: input.educationLevels,
      desired_roles: input.desiredRoles,
      areas: input.areas,
      min_salary: input.minSalary,
      accepts_temporary: input.acceptsTemporary,
      accepts_reserve_list: input.acceptsReserveList,
      accepts_remote_or_other_city_exam: input.acceptsRemoteOrOtherCityExam,
      notification_channels: input.notificationChannels,
      notification_frequency: input.notificationFrequency,
    },
    {
      onConflict: "user_id",
    },
  );

  if (preferencesError) {
    errorRedirect("/onboarding", "Não foi possível salvar suas preferências.");
  }

  redirect("/radar");
}
