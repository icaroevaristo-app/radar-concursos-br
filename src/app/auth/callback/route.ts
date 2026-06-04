import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      return applyCookies(
        NextResponse.redirect(new URL(next ?? (profile?.onboarding_completed ? "/radar" : "/onboarding"), requestUrl.origin), 303),
      );
    }
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin), 303);
}
