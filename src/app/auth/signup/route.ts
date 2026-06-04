import { type NextRequest, NextResponse } from "next/server";
import { createRequestId, createSafeErrorMessage, logger } from "@/lib/logger";
import { parseSignupForm, validateSignupInput } from "@/lib/auth/validation";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

function errorRedirect(request: NextRequest, message: string) {
  return NextResponse.redirect(new URL(`/cadastro?error=${encodeURIComponent(message)}`, request.url), 303);
}

function loginRedirect(request: NextRequest, message: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url), 303);
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const formData = await request.formData();
  const input = parseSignupForm(formData);
  const validationError = validateSignupInput(input);

  if (validationError) {
    return errorRedirect(request, validationError);
  }

  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    logger({
      level: "error",
      message: "signup_auth_failed",
      requestId,
      action: "signupRoute",
      metadata: {
        name: error.name,
        message: error.message,
        status: "status" in error ? error.status : undefined,
        code: "code" in error ? error.code : undefined,
      },
      error,
    });

    return applyCookies(errorRedirect(request, createSafeErrorMessage("Não foi possível criar sua conta.", requestId)));
  }

  const userId = data.user?.id;

  if (!userId) {
    logger({
      level: "error",
      message: "signup_profile_persistence_failed",
      requestId,
      action: "signupRoute",
      metadata: {
        stage: "auth.signUp_missing_user_id",
      },
    });

    return applyCookies(errorRedirect(request, createSafeErrorMessage("Conta criada, mas não foi possível identificar seu usuário.", requestId)));
  }

  const now = new Date().toISOString();

  try {
    const serviceClient = createServiceRoleSupabaseClient();
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
      logger({
        level: "error",
        message: "signup_profile_persistence_failed",
        requestId,
        userId,
        action: "signupRoute",
        metadata: {
          stage: "profiles.upsert_service_role",
        },
        error: profileUpsertError,
      });

      return applyCookies(errorRedirect(request, createSafeErrorMessage("Conta criada, mas não foi possível salvar seu perfil.", requestId)));
    }
  } catch (profileError) {
    logger({
      level: "error",
      message: "signup_profile_persistence_failed",
      requestId,
      userId,
      action: "signupRoute",
      metadata: {
        stage: "service_role_client.create",
      },
      error: profileError,
    });

    return applyCookies(errorRedirect(request, createSafeErrorMessage("Conta criada, mas não foi possível preparar seu perfil.", requestId)));
  }

  logger({
    level: "info",
    message: "signup_completed",
    requestId,
    userId,
    action: "signupRoute",
  });

  if (!data.session) {
    return applyCookies(loginRedirect(request, "Cadastro criado. Confirme seu e-mail antes de entrar, se a confirmação estiver ativa."));
  }

  return applyCookies(NextResponse.redirect(new URL("/onboarding?signup=completed", request.url), 303));
}
