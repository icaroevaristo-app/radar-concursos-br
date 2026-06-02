import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContestDateRow, ContestRoleRow, ContestRow, SourceRow } from "@/types/contest";

export async function getAdminDashboardData() {
  const supabase = await createServerSupabaseClient();
  const [
    sourcesTotal,
    sourcesActive,
    contestsTotal,
    contestsPublished,
    contestsNeedsWork,
    latestContests,
    latestSources,
  ] = await Promise.all([
    supabase.from("sources").select("id", { count: "exact", head: true }),
    supabase.from("sources").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("contests").select("id", { count: "exact", head: true }),
    supabase.from("contests").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
    supabase.from("contests").select("id", { count: "exact", head: true }).in("publication_status", ["draft", "needs_review"]),
    supabase.from("contests").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("sources").select("*").order("created_at", { ascending: false }).limit(5),
  ]);

  return {
    metrics: {
      sourcesTotal: sourcesTotal.count ?? 0,
      sourcesActive: sourcesActive.count ?? 0,
      contestsTotal: contestsTotal.count ?? 0,
      contestsPublished: contestsPublished.count ?? 0,
      contestsNeedsWork: contestsNeedsWork.count ?? 0,
    },
    latestContests: (latestContests.data ?? []) as ContestRow[],
    latestSources: (latestSources.data ?? []) as SourceRow[],
  };
}

export async function getAdminSources() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("sources").select("*").order("created_at", { ascending: false });
  return { sources: (data ?? []) as SourceRow[], error };
}

export async function getAdminSourceById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("sources").select("*").eq("id", id).maybeSingle();
  return data as SourceRow | null;
}

export async function getAdminContests() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("contests").select("*").order("created_at", { ascending: false });
  return { contests: (data ?? []) as ContestRow[], error };
}

export async function getAdminContestById(id: string) {
  const supabase = await createServerSupabaseClient();
  const [{ data: contest }, { data: roles }, { data: dates }, { data: sources }] = await Promise.all([
    supabase.from("contests").select("*").eq("id", id).maybeSingle(),
    supabase.from("contest_roles").select("*").eq("contest_id", id).order("created_at", { ascending: true }),
    supabase.from("contest_dates").select("*").eq("contest_id", id).order("created_at", { ascending: true }),
    supabase.from("sources").select("*").order("name", { ascending: true }),
  ]);

  return {
    contest: contest as ContestRow | null,
    roles: (roles ?? []) as ContestRoleRow[],
    dates: (dates ?? []) as ContestDateRow[],
    sources: (sources ?? []) as SourceRow[],
  };
}

export async function getSourceOptions() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("sources").select("*").order("name", { ascending: true });
  return (data ?? []) as SourceRow[];
}
