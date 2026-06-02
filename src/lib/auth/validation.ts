export type SignupInput = {
  fullName: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type OnboardingInput = {
  city: string;
  state: string;
  radiusKm: number;
  educationLevel: string;
  educationLevels: string[];
  desiredRoles: string[];
  areas: string[];
  minSalary: number | null;
  acceptsTemporary: boolean;
  acceptsReserveList: boolean;
  acceptsRemoteOrOtherCityExam: boolean;
  notificationChannels: string[];
  notificationFrequency: string;
};

const validNotificationFrequencies = new Set(["immediate", "daily", "weekly", "paused"]);

export function stringFromForm(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function stringArrayFromForm(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function parseSignupForm(formData: FormData): SignupInput {
  return {
    fullName: stringFromForm(formData, "full_name"),
    email: stringFromForm(formData, "email").toLowerCase(),
    password: stringFromForm(formData, "password"),
    termsAccepted: formData.get("terms_accepted") === "on",
    privacyAccepted: formData.get("privacy_accepted") === "on",
  };
}

export function validateSignupInput(input: SignupInput) {
  if (!input.fullName) return "Informe seu nome.";
  if (!input.email || !input.email.includes("@")) return "Informe um e-mail válido.";
  if (input.password.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (!input.termsAccepted) return "Você precisa aceitar os termos de uso.";
  if (!input.privacyAccepted) return "Você precisa aceitar a política de privacidade.";
  return null;
}

export function parseLoginForm(formData: FormData): LoginInput {
  return {
    email: stringFromForm(formData, "email").toLowerCase(),
    password: stringFromForm(formData, "password"),
  };
}

export function validateLoginInput(input: LoginInput) {
  if (!input.email || !input.email.includes("@")) return "Informe um e-mail válido.";
  if (!input.password) return "Informe sua senha.";
  return null;
}

export function parseOnboardingForm(formData: FormData): OnboardingInput {
  const minSalaryText = stringFromForm(formData, "min_salary");
  const radiusKm = Number(stringFromForm(formData, "radius_km") || "100");
  const minSalary = minSalaryText ? Number(minSalaryText) : null;
  const educationLevel = stringFromForm(formData, "education_level");
  const educationLevels = stringArrayFromForm(formData, "education_levels");
  const notificationChannels = stringArrayFromForm(formData, "notification_channels");

  return {
    city: stringFromForm(formData, "city"),
    state: stringFromForm(formData, "state").toUpperCase(),
    radiusKm,
    educationLevel,
    educationLevels: educationLevels.length ? educationLevels : [educationLevel].filter(Boolean),
    desiredRoles: stringArrayFromForm(formData, "desired_roles"),
    areas: stringArrayFromForm(formData, "areas"),
    minSalary,
    acceptsTemporary: formData.get("accepts_temporary") === "on",
    acceptsReserveList: formData.get("accepts_reserve_list") === "on",
    acceptsRemoteOrOtherCityExam: formData.get("accepts_remote_or_other_city_exam") === "on",
    notificationChannels: notificationChannels.length ? notificationChannels : ["email"],
    notificationFrequency: stringFromForm(formData, "notification_frequency") || "daily",
  };
}

export function validateOnboardingInput(input: OnboardingInput) {
  if (!input.city) return "Informe sua cidade.";
  if (!input.state) return "Informe seu estado.";
  if (!input.educationLevel) return "Informe sua escolaridade.";
  if (!Number.isFinite(input.radiusKm) || input.radiusKm <= 0) return "Informe um raio válido.";
  if (input.minSalary !== null && (!Number.isFinite(input.minSalary) || input.minSalary < 0)) {
    return "Informe um salário mínimo válido ou deixe o campo em branco.";
  }
  if (!validNotificationFrequencies.has(input.notificationFrequency)) {
    return "Informe uma frequência de alerta válida.";
  }
  return null;
}
