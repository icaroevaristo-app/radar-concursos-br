import { type NextRequest, NextResponse } from "next/server";
import { createRouteHandlerSupabaseClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createRouteHandlerSupabaseClient(request);
  await supabase.auth.signOut();
  return applyCookies(NextResponse.redirect(new URL("/login", request.url), 303));
}
