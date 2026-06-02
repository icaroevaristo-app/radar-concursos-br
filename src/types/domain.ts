export type EducationLevel =
  | "fundamental"
  | "medio"
  | "tecnico"
  | "superior"
  | "pos_graduacao"
  | "nao_informado";

export type SourceType =
  | "board"
  | "city_hall"
  | "city_council"
  | "official_diary"
  | "contest_portal"
  | "state_agency"
  | "autarchy"
  | "other";

export type ContestStatus = "draft" | "open" | "upcoming" | "closed" | "suspended" | "canceled" | "finished";

export type ContestPreview = {
  id: string;
  title: string;
  organization: string;
  city: string;
  state: string;
  status: ContestStatus;
  roles: string[];
  educationLevel: EducationLevel;
  salaryText: string;
  registrationEndLabel: string;
  officialUrl: string;
  matchScore: number;
  matchReason: string;
};

export type UserPreferenceDraft = {
  city: string;
  state: string;
  radiusKm: number;
  educationLevels: EducationLevel[];
  desiredRoles: string[];
  areas: string[];
  minSalary?: number;
  acceptsTemporary: boolean;
  acceptsReserveList: boolean;
};
