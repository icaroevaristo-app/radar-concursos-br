import { describe, expect, it } from "vitest";
import { parseOnboardingForm, parseSignupForm, validateOnboardingInput, validateSignupInput } from "@/lib/auth/validation";

describe("auth validations", () => {
  it("requires terms and privacy for signup", () => {
    const form = new FormData();
    form.set("full_name", "Usuário");
    form.set("email", "user@example.com");
    form.set("password", "12345678");

    const input = parseSignupForm(form);

    expect(validateSignupInput(input)).toBe("Você precisa aceitar os termos de uso.");
  });

  it("validates onboarding required city", () => {
    const form = new FormData();
    form.set("state", "GO");
    form.set("radius_km", "100");
    form.set("education_level", "medio");

    const input = parseOnboardingForm(form);

    expect(validateOnboardingInput(input)).toBe("Informe sua cidade.");
  });

  it("accepts valid onboarding data", () => {
    const form = new FormData();
    form.set("city", "Goiânia");
    form.set("state", "GO");
    form.set("radius_km", "100");
    form.set("education_level", "medio");
    form.set("notification_frequency", "daily");

    const input = parseOnboardingForm(form);

    expect(validateOnboardingInput(input)).toBeNull();
  });
});
