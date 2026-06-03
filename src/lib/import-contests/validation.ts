import type {
  ExistingContestForImport,
  ImportContestDateInput,
  ImportContestInput,
  ImportContestRoleInput,
  ImportContestsPayload,
  ImportPreviewItem,
  ImportValidationResult,
  NormalizedImportContest,
  NormalizedImportDate,
  NormalizedImportRole,
} from "@/lib/import-contests/types";
import {
  booleanOrFalse,
  confidenceToPercent,
  isHttpUrl,
  isValidDateString,
  normalizeContestDateEventType,
  normalizeDuplicateKey,
  normalizeLookup,
  normalizePublicationStatus,
  normalizeSphere,
  normalizeState,
  normalizeUrl,
  numberOrNull,
  optionalStringValue,
  stringValue,
} from "@/lib/import-contests/normalize";

const allowedImportStatuses = ["open", "upcoming"] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePayload(rawJson: string): { payload: ImportContestsPayload | null; errors: string[] } {
  try {
    const parsed = JSON.parse(rawJson) as unknown;

    if (!isObject(parsed)) {
      return { payload: null, errors: ["JSON precisa ser um objeto."] };
    }

    return { payload: parsed as ImportContestsPayload, errors: [] };
  } catch (error) {
    return {
      payload: null,
      errors: [`JSON inválido: ${error instanceof Error ? error.message : "erro desconhecido"}`],
    };
  }
}

function validatePayloadArrays(payload: ImportContestsPayload) {
  const errors: string[] = [];

  if (!Array.isArray(payload.contests)) {
    errors.push("contests precisa ser um array.");
  } else if (!payload.contests.length) {
    errors.push("JSON precisa ter pelo menos 1 concurso.");
  }

  if (payload.contest_roles !== undefined && !Array.isArray(payload.contest_roles)) {
    errors.push("contest_roles precisa ser um array quando informado.");
  }

  if (payload.contest_dates !== undefined && !Array.isArray(payload.contest_dates)) {
    errors.push("contest_dates precisa ser um array quando informado.");
  }

  return errors;
}

function contestErrorPrefix(index: number) {
  return `contests[${index}]`;
}

function roleErrorPrefix(index: number) {
  return `contest_roles[${index}]`;
}

function dateErrorPrefix(index: number) {
  return `contest_dates[${index}]`;
}

function validateContest(input: ImportContestInput, index: number) {
  const errors: string[] = [];
  const title = stringValue(input.title);
  const organization = stringValue(input.organization);
  const sphere = normalizeSphere(input.sphere);
  const city = optionalStringValue(input.city);
  const state = normalizeState(input.state);
  const status = stringValue(input.status);
  const officialUrl = normalizeUrl(stringValue(input.official_url));
  const summary = optionalStringValue(input.summary);
  const confidenceScore = confidenceToPercent(input.confidence_score);
  const publicationStatus = normalizePublicationStatus(input.publication_status);

  if (!title) errors.push(`${contestErrorPrefix(index)}.title é obrigatório.`);
  if (!organization) errors.push(`${contestErrorPrefix(index)}.organization é obrigatório.`);
  if (!sphere) errors.push(`${contestErrorPrefix(index)}.sphere inválido.`);
  if (!state) errors.push(`${contestErrorPrefix(index)}.state é obrigatório.`);
  if (!allowedImportStatuses.includes(status as (typeof allowedImportStatuses)[number])) {
    errors.push(`${contestErrorPrefix(index)}.status deve ser open ou upcoming.`);
  }
  if (!officialUrl) {
    errors.push(`${contestErrorPrefix(index)}.official_url é obrigatório.`);
  } else if (!isHttpUrl(officialUrl)) {
    errors.push(`${contestErrorPrefix(index)}.official_url precisa ser uma URL http/https válida.`);
  }
  if (confidenceScore === null) {
    errors.push(`${contestErrorPrefix(index)}.confidence_score deve estar entre 0 e 1.`);
  }
  if (!publicationStatus) {
    errors.push(`${contestErrorPrefix(index)}.publication_status não é compatível com o banco.`);
  }

  const normalized: NormalizedImportContest = {
    import_index: index,
    import_title: title,
    title,
    organization,
    sphere: sphere ?? "municipal",
    city,
    state,
    board: optionalStringValue(input.board),
    status: allowedImportStatuses.includes(status as (typeof allowedImportStatuses)[number]) ? status : "upcoming",
    official_url: officialUrl,
    summary,
    document_url: optionalStringValue(input.document_url),
    confidence_score: confidenceScore ?? 100,
    publication_status: publicationStatus ?? "needs_review",
    is_demo: false,
  };

  return { errors, normalized };
}

function validateRole(input: ImportContestRoleInput, index: number, contestTitles: Set<string>) {
  const errors: string[] = [];
  const contestTitle = stringValue(input.contest_title);
  const roleName = stringValue(input.role_name);
  const salary = numberOrNull(input.salary);
  const vacancies = numberOrNull(input.vacancies);

  if (!contestTitle) {
    errors.push(`${roleErrorPrefix(index)}.contest_title é obrigatório.`);
  } else if (!contestTitles.has(normalizeLookup(contestTitle))) {
    errors.push(`${roleErrorPrefix(index)}.contest_title não corresponde a nenhum concurso.`);
  }

  if (!roleName) errors.push(`${roleErrorPrefix(index)}.role_name é obrigatório.`);
  if (input.salary !== null && input.salary !== undefined && input.salary !== "" && salary === null) {
    errors.push(`${roleErrorPrefix(index)}.salary deve ser number ou null.`);
  } else if (salary !== null && salary < 0) {
    errors.push(`${roleErrorPrefix(index)}.salary não pode ser negativo.`);
  }
  if (input.vacancies !== null && input.vacancies !== undefined && input.vacancies !== "" && vacancies === null) {
    errors.push(`${roleErrorPrefix(index)}.vacancies deve ser number ou null.`);
  } else if (vacancies !== null && vacancies < 0) {
    errors.push(`${roleErrorPrefix(index)}.vacancies não pode ser negativo.`);
  }
  if (input.reserve_list !== null && input.reserve_list !== undefined && typeof input.reserve_list !== "boolean") {
    errors.push(`${roleErrorPrefix(index)}.reserve_list deve ser boolean ou null.`);
  }

  const normalized: NormalizedImportRole = {
    import_index: index,
    contest_title: contestTitle,
    role_name: roleName,
    area: optionalStringValue(input.area),
    education_level: optionalStringValue(input.education_level),
    salary,
    salary_text: optionalStringValue(input.salary_text),
    vacancies,
    reserve_list: booleanOrFalse(input.reserve_list),
    workload: optionalStringValue(input.workload),
    requirements: optionalStringValue(input.requirements),
  };

  return { errors, normalized };
}

function validateDate(input: ImportContestDateInput, index: number, contestTitles: Set<string>) {
  const errors: string[] = [];
  const normalizedDates: NormalizedImportDate[] = [];
  const contestTitle = stringValue(input.contest_title);
  const eventType = normalizeContestDateEventType(input.event_type);
  const dateStart = optionalStringValue(input.date_start);
  const dateEnd = optionalStringValue(input.date_end);
  const isEstimated = booleanOrFalse(input.is_estimated);
  const confidenceScore = confidenceToPercent(input.confidence_score);
  const description = optionalStringValue(input.description);

  if (!contestTitle) {
    errors.push(`${dateErrorPrefix(index)}.contest_title é obrigatório.`);
  } else if (!contestTitles.has(normalizeLookup(contestTitle))) {
    errors.push(`${dateErrorPrefix(index)}.contest_title não corresponde a nenhum concurso.`);
  }

  if (!eventType) errors.push(`${dateErrorPrefix(index)}.event_type inválido.`);
  if (!isValidDateString(dateStart)) errors.push(`${dateErrorPrefix(index)}.date_start inválido.`);
  if (!isValidDateString(dateEnd)) errors.push(`${dateErrorPrefix(index)}.date_end inválido.`);
  if (!dateStart && !dateEnd && !isEstimated) {
    errors.push(`${dateErrorPrefix(index)}.date_start é obrigatório quando a data é conhecida.`);
  }
  if (input.is_estimated !== null && input.is_estimated !== undefined && typeof input.is_estimated !== "boolean") {
    errors.push(`${dateErrorPrefix(index)}.is_estimated deve ser boolean.`);
  }
  if (confidenceScore === null) {
    errors.push(`${dateErrorPrefix(index)}.confidence_score deve estar entre 0 e 1.`);
  }

  const base = {
    import_index: index,
    contest_title: contestTitle,
    description,
    is_estimated: isEstimated,
    confidence_score: confidenceScore ?? 100,
  };

  if (eventType === "registration") {
    if (dateStart) {
      normalizedDates.push({
        ...base,
        event_type: "registration_start",
        date_start: dateStart,
        date_end: null,
      });
    }

    if (dateEnd) {
      normalizedDates.push({
        ...base,
        event_type: "registration_end",
        date_start: null,
        date_end: dateEnd,
      });
    }
  } else if (eventType) {
    normalizedDates.push({
      ...base,
      event_type: eventType,
      date_start: dateStart,
      date_end: dateEnd,
    });
  }

  return { errors, normalizedDates };
}

function findDuplicateReasons(
  contest: NormalizedImportContest,
  existingContests: ExistingContestForImport[],
  seenOfficialUrls: Set<string>,
  seenCompositeKeys: Set<string>,
) {
  const reasons: string[] = [];
  const officialUrlKey = contest.official_url;
  const compositeKey = normalizeDuplicateKey({ ...contest, city: contest.city ?? null });

  if (seenOfficialUrls.has(officialUrlKey)) {
    reasons.push("official_url duplicado no próprio JSON.");
  }

  if (seenCompositeKeys.has(compositeKey)) {
    reasons.push("combinação title + organization + city + state duplicada no próprio JSON.");
  }

  const duplicatedByUrl = existingContests.some((existing) => existing.official_url === officialUrlKey);
  const duplicatedByComposite = existingContests.some((existing) => normalizeDuplicateKey(existing) === compositeKey);

  if (duplicatedByUrl) {
    reasons.push("official_url já existe no banco.");
  } else if (duplicatedByComposite) {
    reasons.push("title + organization + city + state já existe no banco.");
  }

  return reasons;
}

export function validateImportContestsJson(
  rawJson: string,
  existingContests: ExistingContestForImport[] = [],
): ImportValidationResult {
  const parsed = parsePayload(rawJson);

  if (!parsed.payload) {
    return {
      isValid: false,
      errors: parsed.errors,
      previewItems: [],
      totals: {
        contests: 0,
        roles: 0,
        dates: 0,
        readyContests: 0,
        duplicateContests: 0,
        invalidContests: 0,
      },
      normalized: { contests: [], roles: [], dates: [] },
    };
  }

  const arrayErrors = validatePayloadArrays(parsed.payload);
  const contests = Array.isArray(parsed.payload.contests) ? parsed.payload.contests : [];
  const roles = Array.isArray(parsed.payload.contest_roles) ? parsed.payload.contest_roles : [];
  const dates = Array.isArray(parsed.payload.contest_dates) ? parsed.payload.contest_dates : [];
  const errors = [...arrayErrors];
  const normalizedContests: NormalizedImportContest[] = [];
  const previewItems: ImportPreviewItem[] = [];
  const contestErrorsByIndex = new Map<number, string[]>();
  const contestTitles = new Set<string>();
  const titleCounts = new Map<string, number>();

  contests.forEach((contest, index) => {
    const result = validateContest(contest, index);
    normalizedContests.push(result.normalized);
    contestErrorsByIndex.set(index, result.errors);
    result.errors.forEach((error) => errors.push(error));

    const titleKey = normalizeLookup(result.normalized.import_title);
    if (titleKey) {
      titleCounts.set(titleKey, (titleCounts.get(titleKey) ?? 0) + 1);
      contestTitles.add(titleKey);
    }
  });

  normalizedContests.forEach((contest) => {
    const titleKey = normalizeLookup(contest.import_title);
    if (titleKey && (titleCounts.get(titleKey) ?? 0) > 1) {
      const message = `${contestErrorPrefix(contest.import_index)}.title duplicado no JSON; contest_title ficaria ambíguo.`;
      contestErrorsByIndex.get(contest.import_index)?.push(message);
      errors.push(message);
    }
  });

  const normalizedRoles: NormalizedImportRole[] = [];
  roles.forEach((role, index) => {
    const result = validateRole(role, index, contestTitles);
    normalizedRoles.push(result.normalized);
    result.errors.forEach((error) => errors.push(error));
  });

  const normalizedDates: NormalizedImportDate[] = [];
  dates.forEach((date, index) => {
    const result = validateDate(date, index, contestTitles);
    normalizedDates.push(...result.normalizedDates);
    result.errors.forEach((error) => errors.push(error));
  });

  const seenOfficialUrls = new Set<string>();
  const seenCompositeKeys = new Set<string>();

  normalizedContests.forEach((contest) => {
    const contestErrors = contestErrorsByIndex.get(contest.import_index) ?? [];
    const duplicateReasons = contestErrors.length
      ? []
      : findDuplicateReasons(contest, existingContests, seenOfficialUrls, seenCompositeKeys);
    const isDuplicate = duplicateReasons.length > 0;
    contest.duplicate = isDuplicate;

    if (!contestErrors.length) {
      seenOfficialUrls.add(contest.official_url);
      seenCompositeKeys.add(normalizeDuplicateKey({ ...contest, city: contest.city ?? null }));
    }

    previewItems.push({
      index: contest.import_index,
      title: contest.title || "não informado",
      organization: contest.organization || "não informado",
      city: contest.city || "não informado",
      state: contest.state || "não informado",
      officialUrl: contest.official_url || "não informado",
      status: contestErrors.length ? "invalid" : isDuplicate ? "duplicate" : "ready",
      statusLabel: contestErrors.length ? "inválido" : isDuplicate ? "duplicado" : "pronto para importar",
      reasons: contestErrors.length ? contestErrors : duplicateReasons,
    });
  });

  const readyContests = previewItems.filter((item) => item.status === "ready").length;
  const duplicateContests = previewItems.filter((item) => item.status === "duplicate").length;
  const invalidContests = previewItems.filter((item) => item.status === "invalid").length;

  return {
    isValid: errors.length === 0,
    errors,
    previewItems,
    totals: {
      contests: normalizedContests.length,
      roles: normalizedRoles.length,
      dates: normalizedDates.length,
      readyContests,
      duplicateContests,
      invalidContests,
    },
    normalized: {
      contests: normalizedContests,
      roles: normalizedRoles,
      dates: normalizedDates,
    },
  };
}
