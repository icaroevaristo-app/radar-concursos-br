"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isUserPremium } from "@/lib/subscriptions/queries";

const FREE_SAVED_CONTEST_LIMIT = 3;

function contestIdFromForm(formData: FormData) {
  const contestId = formData.get("contest_id");

  if (typeof contestId !== "string" || !contestId) {
    throw new Error("Missing contest_id.");
  }

  return contestId;
}

function revalidateContestPaths(contestId: string) {
  revalidatePath("/radar");
  revalidatePath("/meus-concursos");
  revalidatePath(`/concursos/${contestId}`);
}

export async function saveContest(contestId: string) {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { data: contest } = await supabase
    .from("contests")
    .select("id")
    .eq("id", contestId)
    .eq("publication_status", "published")
    .maybeSingle();

  if (!contest) {
    throw new Error("Contest not found or not published.");
  }

  const { data: existing } = await supabase
    .from("saved_contests")
    .select("id")
    .eq("user_id", user.id)
    .eq("contest_id", contestId)
    .maybeSingle();

  if (!existing && !(await isUserPremium(user.id))) {
    const { count } = await supabase
      .from("saved_contests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= FREE_SAVED_CONTEST_LIMIT) {
      redirect(
        `/assinar?error=${encodeURIComponent(
          "Usuários gratuitos podem salvar até 3 concursos. Assine o Radar Premium para salvar concursos ilimitados.",
        )}`,
      );
    }
  }

  await supabase.from("saved_contests").upsert(
    {
      user_id: user.id,
      contest_id: contestId,
      status: "saved",
    },
    {
      onConflict: "user_id,contest_id",
    },
  );

  revalidateContestPaths(contestId);
}

export async function unsaveContest(contestId: string) {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  await supabase.from("saved_contests").delete().eq("user_id", user.id).eq("contest_id", contestId);
  revalidateContestPaths(contestId);
}

export async function toggleSaveContest(contestId: string) {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const { data: existing } = await supabase
    .from("saved_contests")
    .select("id")
    .eq("user_id", user.id)
    .eq("contest_id", contestId)
    .maybeSingle();

  if (existing) {
    await unsaveContest(contestId);
  } else {
    await saveContest(contestId);
  }
}

export async function saveContestAction(formData: FormData) {
  await saveContest(contestIdFromForm(formData));
}

export async function unsaveContestAction(formData: FormData) {
  await unsaveContest(contestIdFromForm(formData));
}

export async function toggleSaveContestAction(formData: FormData) {
  await toggleSaveContest(contestIdFromForm(formData));
}
