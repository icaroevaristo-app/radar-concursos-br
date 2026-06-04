import { type NextRequest, NextResponse } from "next/server";
import { parseLoginForm, validateLoginInput } from "@/lib/auth/validation";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

function errorRedirect(request: NextRequest, message: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url), 303);
}

function safeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const input = parseLoginForm(formData);
  const validationError = validateLoginInput(input);

  if (validationError) {
    return errorRedirect(request, validationError);
  }

  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return applyCookies(errorRedirect(request, "E-mail ou senha inválidos."));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return applyCookies(errorRedirect(request, "Sessão não encontrada. Tente entrar novamente."));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const nextPath = safeNextPath(formData.get("next"));
  const destination = nextPath ?? (profile?.onboarding_completed ? "/radar" : "/onboarding");
  return applyCookies(NextResponse.redirect(new URL(destination, request.url), 303));
}
