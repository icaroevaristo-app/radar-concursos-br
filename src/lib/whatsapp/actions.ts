"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth";
import { logAdminAction, toJson } from "@/lib/admin/audit";
import { hydrateContestsByIds } from "@/lib/contests/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSubscriptionPremium } from "@/lib/subscriptions/status";
import { buildWhatsAppAlertMessage, hasBasicWhatsAppMatch, isLikelyValidWhatsAppPhone, normalizeWhatsAppPhone } from "@/lib/whatsapp/helpers";
import type { SubscriptionRow } from "@/lib/subscriptions/types";
import type { ProfileRow, UserPreferenceRow } from "@/types/contest";
import type { WhatsAppAlertStatus } from "@/lib/whatsapp/types";

const adminEditableAlertStatuses = new Set<WhatsAppAlertStatus>(["copied", "sent", "failed", "canceled"]);

function stringFromForm(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function errorRedirect(pathname: string, message: string): never {
  redirect(`${pathname}?error=${encodeURIComponent(message)}`);
}

export async function updateWhatsAppPreferencesAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const rawPhone = stringFromForm(formData, "whatsapp_phone").trim();
  const optIn = formData.get("whatsapp_opt_in") === "on";
  const now = new Date().toISOString();

  if (optIn && !isLikelyValidWhatsAppPhone(rawPhone)) {
    errorRedirect("/minha-conta/assinatura", "Informe um WhatsApp brasileiro válido para ativar os alertas.");
  }

  const { data: existing } = await supabase
    .from("user_preferences")
    .select("whatsapp_opt_in, whatsapp_opt_in_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      whatsapp_phone: rawPhone ? normalizeWhatsAppPhone(rawPhone) : null,
      whatsapp_opt_in: optIn,
      whatsapp_opt_in_at: optIn ? existing?.whatsapp_opt_in_at ?? now : existing?.whatsapp_opt_in_at ?? null,
      whatsapp_opt_out_at: optIn ? null : now,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    errorRedirect("/minha-conta/assinatura", "Não foi possível salvar suas preferências de WhatsApp.");
  }

  revalidatePath("/minha-conta/assinatura");
  revalidatePath("/preferencias");
  redirect("/minha-conta/assinatura?success=whatsapp_updated");
}

export async function generateWhatsAppAlertsAction(formData: FormData) {
  const contestId = stringFromForm(formData, "contest_id");
  if (!contestId) throw new Error("contest_id ausente.");

  const { user } = await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const { data: contestData } = await supabase
    .from("contests")
    .select("*")
    .eq("id", contestId)
    .eq("publication_status", "published")
    .in("status", ["open", "upcoming"])
    .maybeSingle();

  if (!contestData) {
    errorRedirect("/admin/alertas", "Concurso publicado não encontrado.");
  }

  const [contest] = await hydrateContestsByIds([contestId]);
  if (!contest) {
    errorRedirect("/admin/alertas", "Não foi possível carregar cargos e datas do concurso.");
  }

  const [{ data: subscriptions }, { data: existingAlerts }] = await Promise.all([
    supabase.from("subscriptions").select("*").in("status", ["trialing", "active"]),
    supabase.from("whatsapp_alerts").select("user_id").eq("contest_id", contestId),
  ]);

  const premiumSubscriptions = ((subscriptions ?? []) as SubscriptionRow[]).filter((subscription) => isSubscriptionPremium(subscription));
  const userIds = premiumSubscriptions.map((subscription) => subscription.user_id);
  const existingUserIds = new Set((existingAlerts ?? []).map((alert) => alert.user_id));

  if (!userIds.length) {
    redirect(`/admin/alertas?contest_id=${contestId}&success=${encodeURIComponent("Nenhum assinante Premium elegível encontrado.")}`);
  }

  const [{ data: profiles }, { data: preferences }] = await Promise.all([
    supabase.from("profiles").select("*").in("id", userIds),
    supabase.from("user_preferences").select("*").in("user_id", userIds).eq("whatsapp_opt_in", true),
  ]);

  const profilesById = new Map(((profiles ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]));
  const preferencesRows = (preferences ?? []) as UserPreferenceRow[];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const alerts = preferencesRows
    .filter((preference) => !existingUserIds.has(preference.user_id))
    .filter((preference) => isLikelyValidWhatsAppPhone(preference.whatsapp_phone))
    .filter((preference) => hasBasicWhatsAppMatch(contest, profilesById.get(preference.user_id) ?? null, preference))
    .map((preference) => {
      const profile = profilesById.get(preference.user_id) ?? null;

      return {
        user_id: preference.user_id,
        contest_id: contest.id,
        phone: normalizeWhatsAppPhone(preference.whatsapp_phone),
        message: buildWhatsAppAlertMessage({ appUrl, contest, profile }),
        status: "pending" as const,
        created_by: user.id,
      };
    });

  if (!alerts.length) {
    redirect(`/admin/alertas?contest_id=${contestId}&success=${encodeURIComponent("Nenhum novo alerta elegível para gerar.")}`);
  }

  const { data, error } = await supabase.from("whatsapp_alerts").insert(alerts).select("*");

  if (error) {
    errorRedirect("/admin/alertas", error.message);
  }

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "generate_whatsapp_alerts",
    entityType: "contest",
    entityId: contest.id,
    after: toJson({
      contestId: contest.id,
      generated: data?.length ?? alerts.length,
      skippedDuplicates: existingUserIds.size,
    }),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/alertas");
  redirect(`/admin/alertas?contest_id=${contestId}&success=${encodeURIComponent(`${data?.length ?? alerts.length} alerta(s) gerado(s).`)}`);
}

export async function updateWhatsAppAlertStatusAction(formData: FormData) {
  const id = stringFromForm(formData, "id");
  const status = stringFromForm(formData, "status") as WhatsAppAlertStatus;
  if (!id || !adminEditableAlertStatuses.has(status)) throw new Error("Dados inválidos.");

  const { user } = await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const { data: before } = await supabase.from("whatsapp_alerts").select("*").eq("id", id).maybeSingle();
  const update =
    status === "sent"
      ? { status, sent_at: now, error_message: null }
      : status === "copied"
        ? { status, copied_at: now }
        : status === "canceled"
          ? { status, canceled_at: now }
          : { status, error_message: stringFromForm(formData, "error_message") || "Falha manual registrada pelo admin." };

  const { data, error } = await supabase.from("whatsapp_alerts").update(update).eq("id", id).select("*").single();

  if (error) {
    errorRedirect("/admin/alertas", error.message);
  }

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "update_whatsapp_alert_status",
    entityType: "whatsapp_alert",
    entityId: id,
    before: toJson(before),
    after: toJson(data),
  });

  revalidatePath("/admin/alertas");
}
