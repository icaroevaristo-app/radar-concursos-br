import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

const protectedPrefixes = ["/radar", "/onboarding", "/meus-concursos", "/conta"];
const authPages = ["/login", "/cadastro"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({
    request,
  });
  const supabase = createMiddlewareSupabaseClient(request, response);

  if (!supabase) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = startsWithAny(pathname, protectedPrefixes);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAuthPage = authPages.includes(pathname);

  if (!user && (isProtectedRoute || isAdminRoute)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!user) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const onboardingCompleted = Boolean(profile?.onboarding_completed);

  if (!onboardingCompleted && pathname !== "/onboarding" && (isProtectedRoute || isAdminRoute || isAuthPage)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (onboardingCompleted && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/radar";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminRoute) {
    const { data: adminUser } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();

    if (!adminUser) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/radar";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
