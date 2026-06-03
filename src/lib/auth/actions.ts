"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createRequestId, createSafeErrorMessage, logger } from "@/lib/logger";
import { createServerSupabaseClient, createServiceRoleSupabaseClient } from "@/lib/supabase/server";
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

function getErrorExtra(error: unknown, key: string) {
  if (typeof error === "object" && error !== null && key in error) {
    return (error as Record<string, unknown>)[key];
  }

  return undefined;
}

function logSignupAuthError(requestId: string, error: unknown) {
  logger({
    level: "error",
    message: "signup_auth_failed",
    requestId,
    action: "signupAction",
    metadata: {
      name: getErrorExtra(error, "name"),
      message: getErrorExtra(error, "message"),
      status: getErrorExtra(error, "status"),
      code: getErrorExtra(error, "code"),
      cause: getErrorExtra(error, "cause"),
    },
    error,
  });
}

function logSignupProfileError(requestId: string, stage: string, userId: string | undefined, error: unknown) {
  logger({
    level: "error",
    message: "signup_profile_persistence_failed",
    requestId,
    userId,
    action: "signupAction",
    metadata: {
      stage,
    },
    error,
  });
}

function createProfileServiceClient(userId: string | undefined, requestId: string) {
  try {
    return createServiceRoleSupabaseClient();
  } catch (error) {
    logSignupProfileError(requestId, "service_role_client.create", userId, error);
    errorRedirect("/cadastro", createSafeErrorMessage("Conta criada, mas não foi possível preparar seu perfil.", requestId));
  }
}

export async function signupAction(formData: FormData) {
  const requestId = createRequestId();
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
    logSignupAuthError(requestId, error);
    errorRedirect("/cadastro", createSafeErrorMessage("Não foi possível criar sua conta.", requestId));
  }

  const userId = data.user?.id;

  if (!userId) {
    logSignupProfileError(requestId, "auth.signUp_missing_user_id", undefined, {
      message: "Supabase Auth did not return data.user.id after signup.",
    });
    errorRedirect("/cadastro", createSafeErrorMessage("Conta criada, mas não foi possível identificar seu usuário.", requestId));
  }

  const now = new Date().toISOString();
  const serviceClient = createProfileServiceClient(userId, requestId);
  const { error: profileUpsertError } = await serviceClient.from("profiles").upsert(
    {
      id: userId,
      full_name: input.fullName,
      email: input.email,
      terms_accepted_at: now,
      privacy_accepted_at: now,
      subscription_status: "free",
    },
    {
      onConflict: "id",
    },
  );

  if (profileUpsertError) {
    logSignupProfileError(requestId, "profiles.upsert_service_role", userId, profileUpsertError);
    errorRedirect("/cadastro", createSafeErrorMessage("Conta criada, mas não foi possível salvar seu perfil.", requestId));
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

  logger({
    level: "info",
    message: "onboarding_completed",
    userId: user.id,
    action: "onboardingAction",
    metadata: {
      state: input.state,
      city: input.city,
      educationLevel: input.educationLevel,
      areasCount: input.areas.length,
      desiredRolesCount: input.desiredRoles.length,
    },
  });

  redirect("/radar");
}

export async function updatePreferencesAction(formData: FormData) {
  const input = parseOnboardingForm(formData);
  const validationError = validateOnboardingInput(input);

  if (validationError) {
    errorRedirect("/preferencias", validationError);
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
    })
    .eq("id", user.id);

  if (profileError) {
    errorRedirect("/preferencias", "Não foi possível atualizar seu perfil.");
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
    errorRedirect("/preferencias", "Não foi possível salvar suas preferências.");
  }

  logger({
    level: "info",
    message: "preferences_updated",
    userId: user.id,
    action: "updatePreferencesAction",
    metadata: {
      state: input.state,
      city: input.city,
      educationLevel: input.educationLevel,
      areasCount: input.areas.length,
      desiredRolesCount: input.desiredRoles.length,
    },
  });

  revalidatePath("/preferencias");
  revalidatePath("/radar");
  redirect("/preferencias?success=Preferências atualizadas com sucesso.");
}
