import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import {
  getDateValue,
  getRegistrationEndDate,
} from "@/lib/contests/formatters";
import type {
  ContestDateRow,
  ContestRoleRow,
  ContestWithRelations,
  SavedContestWithContest,
  SourceRow,
  UserPreferenceRow,
} from "@/types/contest";

function groupByContestId<T extends { contest_id: string }>(rows: T[]) {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    acc[row.contest_id] = [...(acc[row.contest_id] ?? []), row];
    return acc;
  }, {});
}

function sortContests(contests: ContestWithRelations[]) {
  const statusRank = new Map([
    ["open", 0],
    ["upcoming", 1],
  ]);

  return contests.sort((a, b) => {
    const rankA = statusRank.get(a.status) ?? 2;
    const rankB = statusRank.get(b.status) ?? 2;
    if (rankA !== rankB) return rankA - rankB;

    const registrationA = getRegistrationEndDate(a.dates);
    const registrationB = getRegistrationEndDate(b.dates);
    const timeA = registrationA ? new Date(`${getDateValue(registrationA)}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = registrationB ? new Date(`${getDateValue(registrationB)}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
    if (timeA !== timeB) return timeA - timeB;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

async function hydrateContests(contests: ContestWithRelations["id"] extends string ? ContestWithRelations[] : never) {
  if (!contests.length) return [];

  const supabase = await createServerSupabaseClient();
  const contestIds = contests.map((contest) => contest.id);
  const sourceIds = contests.map((contest) => contest.source_id).filter((value): value is string => Boolean(value));

  const [{ data: roles }, { data: dates }, { data: sources }] = await Promise.all([
    supabase.from("contest_roles").select("*").in("contest_id", contestIds),
    supabase.from("contest_dates").select("*").in("contest_id", contestIds),
    sourceIds.length
      ? supabase.from("sources").select("id, name, type, base_url").in("id", sourceIds)
      : Promise.resolve({ data: [] as Pick<SourceRow, "id" | "name" | "type" | "base_url">[] }),
  ]);

  const rolesByContestId = groupByContestId((roles ?? []) as ContestRoleRow[]);
  const datesByContestId = groupByContestId((dates ?? []) as ContestDateRow[]);
  const sourcesById = new Map((sources ?? []).map((source) => [source.id, source]));

  return contests.map((contest) => ({
    ...contest,
    roles: rolesByContestId[contest.id] ?? [],
    dates: datesByContestId[contest.id] ?? [],
    source: contest.source_id ? (sourcesById.get(contest.source_id) ?? null) : null,
  }));
}

export async function getPublishedContests() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("contests").select("*").eq("publication_status", "published");

  if (error) {
    return { contests: [] as ContestWithRelations[], error };
  }

  const baseContests = (data ?? []).map((contest) => ({
    ...contest,
    roles: [],
    dates: [],
    source: null,
  }));

  return {
    contests: sortContests(await hydrateContests(baseContests)),
    error: null,
  };
}

export async function getContestById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contests")
    .select("*")
    .eq("id", id)
    .eq("publication_status", "published")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const [contest] = await hydrateContests([
    {
      ...data,
      roles: [],
      dates: [],
      source: null,
    },
  ]);

  return contest ?? null;
}

export async function getCurrentUserPreferences() {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();
  const [{ data: preferences }, profile] = await Promise.all([
    supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    getCurrentProfile(),
  ]);

  return {
    user,
    profile,
    preferences: preferences as UserPreferenceRow | null,
  };
}

export async function getUserSavedContestIds(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("saved_contests").select("contest_id").eq("user_id", userId);
  return new Set((data ?? []).map((row) => row.contest_id));
}

export async function getSavedContestsForUser(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: savedRows, error } = await supabase
    .from("saved_contests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !savedRows?.length) {
    return { savedContests: [] as SavedContestWithContest[], error: error ?? null };
  }

  const contestIds = savedRows.map((row) => row.contest_id);
  const { data: contests } = await supabase
    .from("contests")
    .select("*")
    .eq("publication_status", "published")
    .in("id", contestIds);

  const hydrated = await hydrateContests(
    (contests ?? []).map((contest) => ({
      ...contest,
      roles: [],
      dates: [],
      source: null,
    })),
  );
  const contestsById = new Map(hydrated.map((contest) => [contest.id, contest]));
  const savedContests = savedRows
    .map((saved) => {
      const contest = contestsById.get(saved.contest_id);
      return contest ? { ...saved, contest } : null;
    })
    .filter((saved): saved is SavedContestWithContest => Boolean(saved));

  return { savedContests, error: null };
}
