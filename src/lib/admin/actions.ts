"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logAdminAction, toJson } from "@/lib/admin/audit";
import {
  parseContestDateForm,
  parseContestForm,
  parseContestRoleForm,
  parseSourceForm,
} from "@/lib/admin/validation";

function idFromForm(formData: FormData, name: string) {
  const value = formData.get(name);
  if (typeof value !== "string" || !value) throw new Error(`${name} ausente.`);
  return value;
}

function errorRedirect(pathname: string, message: string): never {
  redirect(`${pathname}?error=${encodeURIComponent(message)}`);
}

async function getAdminContext() {
  const { user } = await requireAdmin();
  const supabase = await createServerSupabaseClient();
  return { user, supabase };
}

export async function createSourceAction(formData: FormData) {
  const { user, supabase } = await getAdminContext();
  const input = parseSourceForm(formData);
  const { data, error } = await supabase.from("sources").insert(input).select("*").single();

  if (error) errorRedirect("/admin/fontes/nova", error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "create_source",
    entityType: "source",
    entityId: data.id,
    after: toJson(data),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/fontes");
  redirect(`/admin/fontes/${data.id}/editar`);
}

export async function updateSourceAction(formData: FormData) {
  const id = idFromForm(formData, "id");
  const { user, supabase } = await getAdminContext();
  const input = parseSourceForm(formData);
  const { data: before } = await supabase.from("sources").select("*").eq("id", id).maybeSingle();
  const { data, error } = await supabase.from("sources").update(input).eq("id", id).select("*").single();

  if (error) errorRedirect(`/admin/fontes/${id}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "update_source",
    entityType: "source",
    entityId: id,
    before: toJson(before),
    after: toJson(data),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/fontes");
  redirect("/admin/fontes");
}

export async function changeSourceStatusAction(formData: FormData) {
  const id = idFromForm(formData, "id");
  const status = idFromForm(formData, "status");
  const { user, supabase } = await getAdminContext();
  const { data: before } = await supabase.from("sources").select("*").eq("id", id).maybeSingle();
  const { data, error } = await supabase.from("sources").update({ status }).eq("id", id).select("*").single();

  if (error) errorRedirect("/admin/fontes", error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "change_source_status",
    entityType: "source",
    entityId: id,
    before: toJson(before),
    after: toJson(data),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/fontes");
}

export async function createContestAction(formData: FormData) {
  const { user, supabase } = await getAdminContext();
  const input = parseContestForm(formData);
  const publishedAt = input.publication_status === "published" ? new Date().toISOString() : null;
  const { data, error } = await supabase
    .from("contests")
    .insert({
      ...input,
      created_by: user.id,
      published_at: publishedAt,
    })
    .select("*")
    .single();

  if (error) errorRedirect("/admin/concursos/novo", error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "create_contest",
    entityType: "contest",
    entityId: data.id,
    after: toJson(data),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/concursos");
  revalidatePath("/radar");
  redirect(`/admin/concursos/${data.id}/editar`);
}

export async function updateContestAction(formData: FormData) {
  const id = idFromForm(formData, "id");
  const { user, supabase } = await getAdminContext();
  const input = parseContestForm(formData);
  const { data: before } = await supabase.from("contests").select("*").eq("id", id).maybeSingle();
  const { data, error } = await supabase
    .from("contests")
    .update({
      ...input,
      published_at:
        input.publication_status === "published" && !before?.published_at ? new Date().toISOString() : before?.published_at,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) errorRedirect(`/admin/concursos/${id}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "update_contest",
    entityType: "contest",
    entityId: id,
    before: toJson(before),
    after: toJson(data),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/concursos");
  revalidatePath("/radar");
  revalidatePath(`/concursos/${id}`);
  redirect(`/admin/concursos/${id}/editar`);
}

export async function publishContestAction(formData: FormData) {
  const id = idFromForm(formData, "id");
  const { user, supabase } = await getAdminContext();
  const { data: before } = await supabase.from("contests").select("*").eq("id", id).maybeSingle();

  if (!before?.official_url) {
    errorRedirect(`/admin/concursos/${id}/editar`, "Link oficial é obrigatório para publicar.");
  }

  const { data, error } = await supabase
    .from("contests")
    .update({
      publication_status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) errorRedirect(`/admin/concursos/${id}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "publish_contest",
    entityType: "contest",
    entityId: id,
    before: toJson(before),
    after: toJson(data),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/concursos");
  revalidatePath("/radar");
  revalidatePath(`/concursos/${id}`);
}

export async function unpublishContestAction(formData: FormData) {
  const id = idFromForm(formData, "id");
  const { user, supabase } = await getAdminContext();
  const { data: before } = await supabase.from("contests").select("*").eq("id", id).maybeSingle();
  const { data, error } = await supabase
    .from("contests")
    .update({ publication_status: "unpublished" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) errorRedirect(`/admin/concursos/${id}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "unpublish_contest",
    entityType: "contest",
    entityId: id,
    before: toJson(before),
    after: toJson(data),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/concursos");
  revalidatePath("/radar");
  revalidatePath(`/concursos/${id}`);
}

export async function createContestRoleAction(formData: FormData) {
  const contestId = idFromForm(formData, "contest_id");
  const { user, supabase } = await getAdminContext();
  const input = parseContestRoleForm(formData);
  const { data, error } = await supabase.from("contest_roles").insert({ ...input, contest_id: contestId }).select("*").single();

  if (error) errorRedirect(`/admin/concursos/${contestId}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "create_contest_role",
    entityType: "contest_role",
    entityId: data.id,
    after: toJson(data),
  });

  revalidatePath(`/admin/concursos/${contestId}/editar`);
  revalidatePath(`/concursos/${contestId}`);
  revalidatePath("/radar");
}

export async function updateContestRoleAction(formData: FormData) {
  const id = idFromForm(formData, "id");
  const contestId = idFromForm(formData, "contest_id");
  const { user, supabase } = await getAdminContext();
  const input = parseContestRoleForm(formData);
  const { data: before } = await supabase.from("contest_roles").select("*").eq("id", id).maybeSingle();
  const { data, error } = await supabase.from("contest_roles").update(input).eq("id", id).select("*").single();

  if (error) errorRedirect(`/admin/concursos/${contestId}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "update_contest_role",
    entityType: "contest_role",
    entityId: id,
    before: toJson(before),
    after: toJson(data),
  });

  revalidatePath(`/admin/concursos/${contestId}/editar`);
  revalidatePath(`/concursos/${contestId}`);
  revalidatePath("/radar");
}

export async function deleteContestRoleAction(formData: FormData) {
  const id = idFromForm(formData, "id");
  const contestId = idFromForm(formData, "contest_id");
  const { user, supabase } = await getAdminContext();
  const { data: before } = await supabase.from("contest_roles").select("*").eq("id", id).maybeSingle();
  const { error } = await supabase.from("contest_roles").delete().eq("id", id);

  if (error) errorRedirect(`/admin/concursos/${contestId}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "delete_contest_role",
    entityType: "contest_role",
    entityId: id,
    before: toJson(before),
  });

  revalidatePath(`/admin/concursos/${contestId}/editar`);
  revalidatePath(`/concursos/${contestId}`);
  revalidatePath("/radar");
}

export async function createContestDateAction(formData: FormData) {
  const contestId = idFromForm(formData, "contest_id");
  const { user, supabase } = await getAdminContext();
  const input = parseContestDateForm(formData);
  const { data, error } = await supabase.from("contest_dates").insert({ ...input, contest_id: contestId }).select("*").single();

  if (error) errorRedirect(`/admin/concursos/${contestId}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "create_contest_date",
    entityType: "contest_date",
    entityId: data.id,
    after: toJson(data),
  });

  revalidatePath(`/admin/concursos/${contestId}/editar`);
  revalidatePath(`/concursos/${contestId}`);
  revalidatePath("/radar");
}

export async function updateContestDateAction(formData: FormData) {
  const id = idFromForm(formData, "id");
  const contestId = idFromForm(formData, "contest_id");
  const { user, supabase } = await getAdminContext();
  const input = parseContestDateForm(formData);
  const { data: before } = await supabase.from("contest_dates").select("*").eq("id", id).maybeSingle();
  const { data, error } = await supabase.from("contest_dates").update(input).eq("id", id).select("*").single();

  if (error) errorRedirect(`/admin/concursos/${contestId}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "update_contest_date",
    entityType: "contest_date",
    entityId: id,
    before: toJson(before),
    after: toJson(data),
  });

  revalidatePath(`/admin/concursos/${contestId}/editar`);
  revalidatePath(`/concursos/${contestId}`);
  revalidatePath("/radar");
}

export async function deleteContestDateAction(formData: FormData) {
  const id = idFromForm(formData, "id");
  const contestId = idFromForm(formData, "contest_id");
  const { user, supabase } = await getAdminContext();
  const { data: before } = await supabase.from("contest_dates").select("*").eq("id", id).maybeSingle();
  const { error } = await supabase.from("contest_dates").delete().eq("id", id);

  if (error) errorRedirect(`/admin/concursos/${contestId}/editar`, error.message);

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "delete_contest_date",
    entityType: "contest_date",
    entityId: id,
    before: toJson(before),
  });

  revalidatePath(`/admin/concursos/${contestId}/editar`);
  revalidatePath(`/concursos/${contestId}`);
  revalidatePath("/radar");
}
