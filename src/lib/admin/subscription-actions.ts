"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction, toJson } from "@/lib/admin/audit";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SubscriptionStatus } from "@/lib/subscriptions/types";

const editableStatuses = new Set<SubscriptionStatus>(["active", "canceled", "expired"]);

function idFromForm(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("id ausente.");
  return id;
}

function statusFromForm(formData: FormData) {
  const status = formData.get("status");
  if (typeof status !== "string" || !editableStatuses.has(status as SubscriptionStatus)) {
    throw new Error("status inválido.");
  }
  return status as SubscriptionStatus;
}

export async function updateSubscriptionStatusAction(formData: FormData) {
  const id = idFromForm(formData);
  const status = statusFromForm(formData);
  const { user } = await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const { data: before } = await supabase.from("subscriptions").select("*").eq("id", id).maybeSingle();

  const input =
    status === "active"
      ? {
          status,
          current_period_start: before?.current_period_start ?? now,
          current_period_end: before?.current_period_end ?? null,
          canceled_at: null,
          cancel_at: null,
        }
      : {
          status,
          canceled_at: status === "canceled" ? now : before?.canceled_at ?? null,
        };

  const { data, error } = await supabase.from("subscriptions").update(input).eq("id", id).select("*").single();

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "update_subscription_status",
    entityType: "subscription",
    entityId: id,
    before: toJson(before),
    after: toJson(data),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/assinaturas");
}
