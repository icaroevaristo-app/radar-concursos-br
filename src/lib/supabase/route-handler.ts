import "server-only";

import { type NextRequest, type NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import { getSupabaseEnv } from "@/lib/supabase/server";

type CookieToSet = {
  name: string;
  value: string;
  options: NonNullable<Parameters<NextResponse["cookies"]["set"]>[2]>;
};

export function createRouteHandlerSupabaseClient(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const cookiesToSet: CookieToSet[] = [];

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(nextCookiesToSet) {
        nextCookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          cookiesToSet.push({ name, value, options });
        });
      },
    },
  });

  return {
    supabase,
    applyCookies(response: NextResponse) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      return response;
    },
  };
}
