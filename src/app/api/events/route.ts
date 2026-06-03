import { type NextRequest, NextResponse } from "next/server";
import { createRequestId, logger } from "@/lib/logger";
import { isFunnelEventName, sanitizeFunnelMetadata } from "@/lib/funnel/events";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  const startedAt = performance.now();

  try {
    const body = (await request.json()) as { event?: unknown; metadata?: unknown };

    if (!isFunnelEventName(body.event)) {
      logger({
        level: "warn",
        message: "funnel_event_rejected",
        requestId,
        route: "/api/events",
        durationMs: Math.round(performance.now() - startedAt),
        metadata: {
          reason: "event_not_allowed",
        },
      });

      return NextResponse.json({ ok: false, requestId }, { status: 400 });
    }

    let userId: string | undefined;

    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    } catch {
      userId = undefined;
    }

    logger({
      level: "info",
      message: body.event,
      requestId,
      userId,
      route: "/api/events",
      durationMs: Math.round(performance.now() - startedAt),
      metadata: sanitizeFunnelMetadata(body.metadata),
    });

    return NextResponse.json({ ok: true, requestId });
  } catch (error) {
    logger({
      level: "error",
      message: "funnel_event_failed",
      requestId,
      route: "/api/events",
      durationMs: Math.round(performance.now() - startedAt),
      error,
    });

    return NextResponse.json({ ok: false, requestId }, { status: 400 });
  }
}
