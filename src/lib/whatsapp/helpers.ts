import { getRegistrationEndDate, valueOrNotInformed } from "@/lib/contests/formatters";
import type { ContestWithRelations, ProfileRow, UserPreferenceRow } from "@/types/contest";

export function normalizeWhatsAppPhone(input: string | null | undefined) {
  const digits = (input ?? "").replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("55")) return digits;

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

export function isLikelyValidWhatsAppPhone(input: string | null | undefined) {
  const digits = normalizeWhatsAppPhone(input);
  return digits.length >= 12 && digits.length <= 13 && digits.startsWith("55");
}

export function createWhatsAppLink(phone: string, message: string) {
  const digits = normalizeWhatsAppPhone(phone);
  if (!digits) return null;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function includesNormalized(values: string[] | null | undefined, target: string | null | undefined) {
  if (!target) return false;
  const normalizedTarget = target.trim().toLowerCase();
  return (values ?? []).some((value) => value.trim().toLowerCase() === normalizedTarget);
}

export function hasBasicWhatsAppMatch(contest: ContestWithRelations, profile: ProfileRow | null, preferences: UserPreferenceRow | null) {
  if (!preferences?.whatsapp_opt_in || !preferences.whatsapp_phone) return false;

  const stateMatches = includesNormalized(preferences.states, contest.state) || profile?.state?.toLowerCase() === contest.state.toLowerCase();
  if (!stateMatches) return false;

  const cityPreferenceExists = Boolean(preferences.cities?.length || profile?.city);
  const cityMatches = includesNormalized(preferences.cities, contest.city) || Boolean(contest.city && profile?.city?.toLowerCase() === contest.city.toLowerCase());

  if (cityPreferenceExists && cityMatches) return true;

  const educationMatches = contest.roles.some((role) => includesNormalized(preferences.education_levels, role.education_level));
  const areaMatches = contest.roles.some((role) => includesNormalized(preferences.areas, role.area));

  return !cityPreferenceExists || educationMatches || areaMatches || stateMatches;
}

export function buildWhatsAppAlertMessage(input: {
  appUrl: string;
  contest: ContestWithRelations;
  profile: ProfileRow | null;
}) {
  const registrationEnd = getRegistrationEndDate(input.contest.dates);
  const period = registrationEnd ? valueOrNotInformed(registrationEnd.date_end ?? registrationEnd.date_start) : "não informado";
  const name = input.profile?.full_name?.split(" ")[0] || "tudo bem";
  const appUrl = input.appUrl.replace(/\/$/, "");

  return `Olá, ${name}! Encontramos um concurso que pode combinar com seu Radar: ${input.contest.title} em ${valueOrNotInformed(
    input.contest.city,
  )}/${input.contest.state}. Inscrições: ${period}. Veja detalhes: ${appUrl}/concursos/${
    input.contest.id
  }. Confira sempre a fonte oficial antes de se inscrever.`;
}
