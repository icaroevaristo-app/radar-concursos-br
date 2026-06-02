import type { ContestDateRow, ContestRoleRow } from "@/types/contest";

export const NOT_INFORMED = "não informado";

export function valueOrNotInformed(value: string | number | null | undefined) {
  if (value === null || value === undefined) return NOT_INFORMED;
  if (typeof value === "string" && !value.trim()) return NOT_INFORMED;
  return String(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return NOT_INFORMED;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return NOT_INFORMED;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getDateValue(date: ContestDateRow) {
  return date.date_end ?? date.date_start;
}

export function getRegistrationEndDate(dates: ContestDateRow[]) {
  return dates.find((date) => date.event_type === "registration_end") ?? null;
}

export function formatRegistrationEnd(dates: ContestDateRow[]) {
  const registrationEnd = getRegistrationEndDate(dates);
  return formatDate(registrationEnd ? getDateValue(registrationEnd) : null);
}

export function formatSalary(role: ContestRoleRow) {
  if (role.salary_text) return role.salary_text;

  if (role.salary !== null) {
    return new Intl.NumberFormat("pt-BR", {
      currency: "BRL",
      style: "currency",
    }).format(role.salary);
  }

  return NOT_INFORMED;
}

export function formatRoleSummary(roles: ContestRoleRow[]) {
  if (!roles.length) return NOT_INFORMED;
  return roles.map((role) => role.role_name).join(", ");
}

export function isWithinNextDays(value: string | null | undefined, days: number) {
  if (!value) return false;

  const date = new Date(`${value}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(end.getDate() + days);

  return date >= now && date <= end;
}

export function isCreatedWithinDays(createdAt: string, days: number) {
  const created = new Date(createdAt);
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - days);

  return created >= start && created <= now;
}
