import { NextRequest, NextResponse } from "next/server";
import { createHealthPayload } from "@/lib/health";
import { createRequestId, logger } from "@/lib/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  const startedAt = performance.now();
  let databaseOk = false;
  let databaseError: unknown;

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("contests").select("id", { count: "exact", head: true }).limit(1);

    databaseOk = !error;
    databaseError = error ?? undefined;
  } catch (error) {
    databaseError = error;
  }

  const durationMs = Math.round(performance.now() - startedAt);
  const payload = createHealthPayload(databaseOk);

  logger({
    level: databaseOk ? "info" : "error",
    message: "health_check_completed",
    requestId,
    route: "/api/health",
    durationMs,
    metadata: {
      app: payload.services.app,
      database: payload.services.database,
    },
    error: databaseError,
  });

  return NextResponse.json(payload, {
    status: databaseOk ? 200 : 503,
    headers: {
      "x-request-id": requestId,
    },
  });
}
