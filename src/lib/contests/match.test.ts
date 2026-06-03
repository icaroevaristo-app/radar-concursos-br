import { describe, expect, it } from "vitest";
import { calculateContestMatch } from "@/lib/contests/match";
import type { ContestWithRelations, ProfileRow, UserPreferenceRow } from "@/types/contest";

const baseContest = {
  id: "contest-1",
  title: "Prefeitura - Administrativo",
  organization: "Prefeitura",
  sphere: "municipal",
  city: "Goiânia",
  state: "GO",
  latitude: null,
  longitude: null,
  board: null,
  status: "open",
  official_url: "https://example.com",
  source_id: null,
  summary: null,
  document_url: null,
  document_storage_path: null,
  confidence_score: 90,
  publication_status: "published",
  is_demo: false,
  published_at: "2026-06-01T00:00:00.000Z",
  created_by: null,
  created_at: "2026-06-01T00:00:00.000Z",
  updated_at: "2026-06-01T00:00:00.000Z",
  dates: [],
  source: null,
  roles: [
    {
      id: "role-1",
      contest_id: "contest-1",
      role_name: "Assistente administrativo",
      area: "Administrativo",
      education_level: "medio",
      salary: 2500,
      salary_text: null,
      vacancies: 3,
      reserve_list: false,
      workload: null,
      requirements: null,
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-01T00:00:00.000Z",
    },
  ],
} satisfies ContestWithRelations;

const profile = {
  city: "Goiânia",
  state: "GO",
  education_level: "medio",
} as ProfileRow;

function makePreferences(overrides: Partial<UserPreferenceRow>): UserPreferenceRow {
  return {
    id: "preference-1",
    user_id: "user-1",
    states: [],
    cities: [],
    radius_km: 100,
    education_levels: [],
    desired_roles: [],
    areas: [],
    min_salary: null,
    accepts_temporary: true,
    accepts_reserve_list: true,
    accepts_remote_or_other_city_exam: true,
    notification_channels: ["email"],
    notification_frequency: "daily",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("calculateContestMatch", () => {
  it("returns strong match when profile and preferences align", () => {
    const preferences = makePreferences({
      states: ["GO"],
      cities: ["Goiânia"],
      education_levels: ["medio"],
      desired_roles: ["administrativo"],
      areas: ["Administrativo"],
      min_salary: 2000,
      accepts_reserve_list: true,
    });

    const result = calculateContestMatch(baseContest, preferences, profile);

    expect(result.score).toBe(95);
    expect(result.matchLevel).toBe("strong");
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("penalizes reserve list when user does not accept it", () => {
    const contest = {
      ...baseContest,
      roles: [{ ...baseContest.roles[0], reserve_list: true }],
    };
    const preferences = makePreferences({
      states: [],
      cities: [],
      education_levels: [],
      desired_roles: [],
      areas: [],
      min_salary: null,
      accepts_reserve_list: false,
    });

    const result = calculateContestMatch(contest, preferences, null);

    expect(result.score).toBe(0);
    expect(result.matchLevel).toBe("weak");
  });
});
