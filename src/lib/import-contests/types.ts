import type { Inserts } from "@/lib/supabase/types";

export type ImportContestInput = {
  title?: unknown;
  organization?: unknown;
  sphere?: unknown;
  city?: unknown;
  state?: unknown;
  board?: unknown;
  status?: unknown;
  official_url?: unknown;
  summary?: unknown;
  document_url?: unknown;
  confidence_score?: unknown;
  publication_status?: unknown;
};

export type ImportContestRoleInput = {
  contest_title?: unknown;
  role_name?: unknown;
  area?: unknown;
  education_level?: unknown;
  salary?: unknown;
  salary_text?: unknown;
  vacancies?: unknown;
  reserve_list?: unknown;
  workload?: unknown;
  requirements?: unknown;
};

export type ImportContestDateInput = {
  contest_title?: unknown;
  event_type?: unknown;
  date_start?: unknown;
  date_end?: unknown;
  description?: unknown;
  is_estimated?: unknown;
  confidence_score?: unknown;
};

export type ImportContestsPayload = {
  contests?: ImportContestInput[];
  contest_roles?: ImportContestRoleInput[];
  contest_dates?: ImportContestDateInput[];
};

export type ImportPreviewStatus = "ready" | "duplicate" | "invalid";

export type ImportPreviewItem = {
  index: number;
  title: string;
  organization: string;
  city: string;
  state: string;
  officialUrl: string;
  status: ImportPreviewStatus;
  statusLabel: "pronto para importar" | "duplicado" | "inválido";
  reasons: string[];
};

export type NormalizedImportContest = Inserts<"contests"> & {
  import_index: number;
  import_title: string;
  duplicate?: boolean;
};

export type NormalizedImportRole = Omit<Inserts<"contest_roles">, "contest_id"> & {
  import_index: number;
  contest_title: string;
};

export type NormalizedImportDate = Omit<Inserts<"contest_dates">, "contest_id"> & {
  import_index: number;
  contest_title: string;
};

export type NormalizedImportPayload = {
  contests: NormalizedImportContest[];
  roles: NormalizedImportRole[];
  dates: NormalizedImportDate[];
};

export type ImportValidationResult = {
  isValid: boolean;
  errors: string[];
  previewItems: ImportPreviewItem[];
  totals: {
    contests: number;
    roles: number;
    dates: number;
    readyContests: number;
    duplicateContests: number;
    invalidContests: number;
  };
  normalized: NormalizedImportPayload;
};

export type ImportResult = {
  success: boolean;
  message: string;
  errors?: string[];
  summary?: {
    contestsCreated: number;
    rolesCreated: number;
    datesCreated: number;
    duplicatesSkipped: number;
  };
};

export type ExistingContestForImport = {
  id: string;
  title: string;
  organization: string;
  city: string | null;
  state: string;
  official_url: string;
};
