import type { Database } from "@/lib/supabase/types";

export type ContestRow = Database["public"]["Tables"]["contests"]["Row"];
export type ContestRoleRow = Database["public"]["Tables"]["contest_roles"]["Row"];
export type ContestDateRow = Database["public"]["Tables"]["contest_dates"]["Row"];
export type SourceRow = Database["public"]["Tables"]["sources"]["Row"];
export type SavedContestRow = Database["public"]["Tables"]["saved_contests"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type UserPreferenceRow = Database["public"]["Tables"]["user_preferences"]["Row"];

export type ContestWithRelations = ContestRow & {
  roles: ContestRoleRow[];
  dates: ContestDateRow[];
  source: Pick<SourceRow, "id" | "name" | "type" | "base_url"> | null;
};

export type SavedContestWithContest = SavedContestRow & {
  contest: ContestWithRelations;
};

export type ContestMatch = {
  matchLevel: "strong" | "medium" | "weak";
  score: number;
  reasons: string[];
};
