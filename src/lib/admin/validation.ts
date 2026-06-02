export const sourceTypes = [
  "board",
  "city_hall",
  "city_council",
  "official_diary",
  "contest_portal",
  "state_agency",
  "autarchy",
  "other",
] as const;

export const sourceStatuses = ["active", "paused", "inactive"] as const;
export const contestSpheres = ["municipal", "estadual", "federal", "other"] as const;
export const contestStatuses = ["draft", "open", "upcoming", "closed", "suspended", "canceled", "finished", "archived"] as const;
export const publicationStatuses = ["draft", "published", "unpublished", "needs_review", "rejected"] as const;
export const contestDateEventTypes = [
  "registration_start",
  "registration_end",
  "payment_due",
  "exam_date",
  "exam_location",
  "result",
  "appeal_period",
  "convocation",
  "other",
] as const;

function stringFromForm(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function nullableStringFromForm(formData: FormData, name: string) {
  const value = stringFromForm(formData, name);
  return value || null;
}

function numberFromForm(formData: FormData, name: string, fallback: number) {
  const value = Number(stringFromForm(formData, name));
  return Number.isFinite(value) ? value : fallback;
}

function nullableNumberFromForm(formData: FormData, name: string) {
  const raw = stringFromForm(formData, name);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function assertInList<T extends readonly string[]>(value: string, list: T, fallback: T[number]) {
  return list.includes(value) ? (value as T[number]) : fallback;
}

function assertUrl(value: string, field: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    throw new Error(`${field} precisa ser uma URL válida.`);
  }
}

export function parseSourceForm(formData: FormData) {
  const name = stringFromForm(formData, "name");
  const type = assertInList(stringFromForm(formData, "type"), sourceTypes, "other");
  const baseUrl = stringFromForm(formData, "base_url");
  const reliabilityScore = numberFromForm(formData, "reliability_score", 50);
  const status = assertInList(stringFromForm(formData, "status"), sourceStatuses, "active");

  if (!name) throw new Error("Nome da fonte é obrigatório.");
  if (!baseUrl) throw new Error("URL base é obrigatória.");
  assertUrl(baseUrl, "URL base");
  if (reliabilityScore < 0 || reliabilityScore > 100) throw new Error("Confiabilidade precisa ficar entre 0 e 100.");

  return {
    name,
    type,
    base_url: baseUrl,
    city: nullableStringFromForm(formData, "city"),
    state: nullableStringFromForm(formData, "state")?.toUpperCase() ?? null,
    reliability_score: reliabilityScore,
    crawl_frequency: nullableStringFromForm(formData, "crawl_frequency"),
    crawler_strategy: nullableStringFromForm(formData, "crawler_strategy"),
    status,
    notes: nullableStringFromForm(formData, "notes"),
  };
}

export function parseContestForm(formData: FormData) {
  const title = stringFromForm(formData, "title");
  const organization = stringFromForm(formData, "organization");
  const state = stringFromForm(formData, "state").toUpperCase();
  const officialUrl = stringFromForm(formData, "official_url");
  const confidenceScore = numberFromForm(formData, "confidence_score", 100);
  const publicationStatus = assertInList(stringFromForm(formData, "publication_status"), publicationStatuses, "draft");

  if (!title) throw new Error("Título é obrigatório.");
  if (!organization) throw new Error("Órgão/organização é obrigatório.");
  if (!state) throw new Error("UF é obrigatória.");
  if (officialUrl) assertUrl(officialUrl, "Link oficial");
  if (publicationStatus === "published" && !officialUrl) throw new Error("Link oficial é obrigatório para publicar.");
  if (confidenceScore < 0 || confidenceScore > 100) throw new Error("Confiança precisa ficar entre 0 e 100.");

  return {
    title,
    organization,
    sphere: assertInList(stringFromForm(formData, "sphere"), contestSpheres, "municipal"),
    city: nullableStringFromForm(formData, "city"),
    state,
    latitude: nullableNumberFromForm(formData, "latitude"),
    longitude: nullableNumberFromForm(formData, "longitude"),
    board: nullableStringFromForm(formData, "board"),
    status: assertInList(stringFromForm(formData, "status"), contestStatuses, "draft"),
    official_url: officialUrl,
    source_id: nullableStringFromForm(formData, "source_id"),
    summary: nullableStringFromForm(formData, "summary"),
    document_url: nullableStringFromForm(formData, "document_url"),
    document_storage_path: nullableStringFromForm(formData, "document_storage_path"),
    confidence_score: confidenceScore,
    publication_status: publicationStatus,
    is_demo: formData.get("is_demo") === "on",
  };
}

export function parseContestRoleForm(formData: FormData) {
  const roleName = stringFromForm(formData, "role_name");
  const salary = nullableNumberFromForm(formData, "salary");
  const vacancies = nullableNumberFromForm(formData, "vacancies");

  if (!roleName) throw new Error("Nome do cargo é obrigatório.");
  if (salary !== null && salary < 0) throw new Error("Salário não pode ser negativo.");
  if (vacancies !== null && vacancies < 0) throw new Error("Vagas não pode ser negativo.");

  return {
    role_name: roleName,
    area: nullableStringFromForm(formData, "area"),
    education_level: nullableStringFromForm(formData, "education_level"),
    salary,
    salary_text: nullableStringFromForm(formData, "salary_text"),
    vacancies,
    reserve_list: formData.get("reserve_list") === "on",
    workload: nullableStringFromForm(formData, "workload"),
    requirements: nullableStringFromForm(formData, "requirements"),
  };
}

export function parseContestDateForm(formData: FormData) {
  const eventType = assertInList(stringFromForm(formData, "event_type"), contestDateEventTypes, "other");
  const confidenceScore = numberFromForm(formData, "confidence_score", 100);

  if (!eventType) throw new Error("Tipo de data é obrigatório.");
  if (confidenceScore < 0 || confidenceScore > 100) throw new Error("Confiança precisa ficar entre 0 e 100.");

  return {
    event_type: eventType,
    date_start: nullableStringFromForm(formData, "date_start"),
    date_end: nullableStringFromForm(formData, "date_end"),
    description: nullableStringFromForm(formData, "description"),
    is_estimated: formData.get("is_estimated") === "on",
    confidence_score: confidenceScore,
  };
}
