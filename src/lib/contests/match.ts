import type { ContestMatch, ContestWithRelations, ProfileRow, UserPreferenceRow } from "@/types/contest";

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function includesNormalized(values: string[] | null | undefined, target: string | null | undefined) {
  const normalizedTarget = normalize(target);
  if (!normalizedTarget) return false;
  return (values ?? []).some((value) => normalize(value) === normalizedTarget);
}

function hasSimpleTextMatch(preferences: string[], target: string | null | undefined) {
  const normalizedTarget = normalize(target);
  if (!normalizedTarget) return false;

  return preferences.some((preference) => {
    const normalizedPreference = normalize(preference);
    return Boolean(
      normalizedPreference &&
        (normalizedTarget.includes(normalizedPreference) || normalizedPreference.includes(normalizedTarget)),
    );
  });
}

export function calculateContestMatch(
  contest: ContestWithRelations,
  preferences: UserPreferenceRow | null,
  profile: ProfileRow | null,
): ContestMatch {
  let score = 0;
  const reasons: string[] = [];

  if (includesNormalized(preferences?.states, contest.state) || normalize(profile?.state) === normalize(contest.state)) {
    score += 25;
    reasons.push("Estado compatível com seu perfil.");
  }

  if (includesNormalized(preferences?.cities, contest.city) || normalize(profile?.city) === normalize(contest.city)) {
    score += 20;
    reasons.push("Cidade compatível com suas preferências.");
  }

  const educationPreferences = preferences?.education_levels?.length
    ? preferences.education_levels
    : [profile?.education_level].filter((value): value is string => Boolean(value));

  if (contest.roles.some((role) => includesNormalized(educationPreferences, role.education_level))) {
    score += 20;
    reasons.push("Escolaridade compatível com ao menos um cargo.");
  }

  const desiredRoles = preferences?.desired_roles ?? [];
  const areas = preferences?.areas ?? [];
  const roleOrAreaMatches = contest.roles.some(
    (role) =>
      desiredRoles.some((desiredRole) => hasSimpleTextMatch([desiredRole], role.role_name)) ||
      desiredRoles.some((desiredRole) => hasSimpleTextMatch([desiredRole], role.area)) ||
      areas.some((area) => hasSimpleTextMatch([area], role.area)) ||
      areas.some((area) => hasSimpleTextMatch([area], role.role_name)),
  );

  if (roleOrAreaMatches) {
    score += 20;
    reasons.push("Cargo ou área alinhado aos seus interesses.");
  }

  if (
    preferences?.min_salary !== null &&
    preferences?.min_salary !== undefined &&
    contest.roles.some((role) => role.salary !== null && role.salary >= Number(preferences.min_salary))
  ) {
    score += 10;
    reasons.push("Salário compatível com o mínimo desejado.");
  }

  if (preferences && !preferences.accepts_reserve_list && contest.roles.some((role) => role.reserve_list)) {
    score -= 20;
    reasons.push("Há cargo com cadastro reserva, que você marcou como não desejado.");
  }

  const normalizedScore = Math.max(0, Math.min(100, score));

  if (!reasons.length) {
    reasons.push("Sem correspondências fortes ainda; confira os detalhes oficiais.");
  }

  return {
    matchLevel: normalizedScore >= 70 ? "strong" : normalizedScore >= 40 ? "medium" : "weak",
    score: normalizedScore,
    reasons,
  };
}
