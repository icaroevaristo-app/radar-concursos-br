"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createRequestId, logger } from "@/lib/logger";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function startPremiumTrialAction() {
  const requestId = createRequestId();
  const user = await requireUser();
  const supabase = createServiceRoleSupabaseClient();

  logger({
    level: "info",
    message: "premium_trial_start_requested",
    requestId,
    userId: user.id,
    action: "startPremiumTrialAction",
  });

  const { data: existing, error: existingError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    logger({
      level: "error",
      message: "premium_trial_lookup_failed",
      requestId,
      userId: user.id,
      action: "startPremiumTrialAction",
      error: existingError,
    });
    redirect(`/assinar?error=${encodeURIComponent(`Não foi possível verificar sua assinatura. Código de rastreio: ${requestId}.`)}`);
  }

  if (existing?.status === "active") {
    redirect("/minha-conta/assinatura");
  }

  if (existing?.trial_start) {
    redirect(`/assinar?error=${encodeURIComponent("Você já usou o teste grátis do Radar Premium.")}`);
  }

  const now = new Date();
  const trialEnd = addDays(now, 7);
  const payload = {
    user_id: user.id,
    provider: "manual",
    status: "trialing" as const,
    plan: "radar_premium" as const,
    trial_start: now.toISOString(),
    trial_end: trialEnd.toISOString(),
  };

  const { error } = await supabase.from("subscriptions").upsert(payload, { onConflict: "user_id" });

  if (error) {
    logger({
      level: "error",
      message: "premium_trial_start_failed",
      requestId,
      userId: user.id,
      action: "startPremiumTrialAction",
      error,
    });
    redirect(`/assinar?error=${encodeURIComponent(`Não foi possível iniciar o teste grátis. Código de rastreio: ${requestId}.`)}`);
  }

  logger({
    level: "info",
    message: "premium_trial_started",
    requestId,
    userId: user.id,
    action: "startPremiumTrialAction",
    metadata: {
      trialEnd: trialEnd.toISOString(),
      plan: "radar_premium",
    },
  });

  revalidatePath("/assinar");
  revalidatePath("/minha-conta/assinatura");
  revalidatePath("/radar");
  redirect("/minha-conta/assinatura?success=trial_started");
}
