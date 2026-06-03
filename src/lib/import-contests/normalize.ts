import { contestDateEventTypes, contestSpheres, publicationStatuses } from "@/lib/admin/validation";

export const NOT_INFORMED_INPUT = "não informado";

export function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function optionalStringValue(value: unknown) {
  const normalized = stringValue(value);
  return normalized ? normalized : null;
}

export function normalizeState(value: unknown) {
  return stringValue(value).toUpperCase();
}

export function normalizeLookup(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeDuplicateKey(input: {
  title: string;
  organization: string;
  city: string | null;
  state: string;
}) {
  return [input.title, input.organization, input.city ?? "", input.state].map((value) => normalizeLookup(value)).join("|");
}

export function normalizeUrl(value: string) {
  return value.trim();
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

export function booleanOrFalse(value: unknown) {
  return typeof value === "boolean" ? value : false;
}

export function confidenceToPercent(value: unknown) {
  if (value === null || value === undefined || value === "") return 100;
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return null;
  if (number < 0 || number > 1) return null;
  return Math.round(number * 100);
}

export function normalizePublicationStatus(value: unknown) {
  const raw = stringValue(value) || "ready_to_publish";

  if (raw === "ready_to_publish") {
    return "needs_review";
  }

  return publicationStatuses.includes(raw as (typeof publicationStatuses)[number])
    ? (raw as (typeof publicationStatuses)[number])
    : null;
}

export function normalizeSphere(value: unknown) {
  const raw = stringValue(value);
  return contestSpheres.includes(raw as (typeof contestSpheres)[number])
    ? (raw as (typeof contestSpheres)[number])
    : null;
}

export function normalizeContestDateEventType(value: unknown) {
  const raw = stringValue(value);

  if (raw === "registration") {
    return "registration";
  }

  return contestDateEventTypes.includes(raw as (typeof contestDateEventTypes)[number])
    ? (raw as (typeof contestDateEventTypes)[number])
    : null;
}

export function isValidDateString(value: string | null) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}
