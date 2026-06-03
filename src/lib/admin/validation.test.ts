import { describe, expect, it } from "vitest";
import { parseContestForm, parseContestRoleForm, parseSourceForm } from "@/lib/admin/validation";

describe("admin validations", () => {
  it("parses a valid source form", () => {
    const form = new FormData();
    form.set("name", "Fonte");
    form.set("type", "board");
    form.set("base_url", "https://example.com");
    form.set("reliability_score", "80");
    form.set("status", "active");

    expect(parseSourceForm(form)).toMatchObject({
      name: "Fonte",
      reliability_score: 80,
      status: "active",
    });
  });

  it("rejects invalid source urls", () => {
    const form = new FormData();
    form.set("name", "Fonte");
    form.set("type", "board");
    form.set("base_url", "not-a-url");

    expect(() => parseSourceForm(form)).toThrow("URL base precisa ser uma URL válida.");
  });

  it("requires official url when contest is published", () => {
    const form = new FormData();
    form.set("title", "Concurso");
    form.set("organization", "Órgão");
    form.set("state", "GO");
    form.set("publication_status", "published");

    expect(() => parseContestForm(form)).toThrow("Link oficial é obrigatório para publicar.");
  });

  it("rejects negative role salary", () => {
    const form = new FormData();
    form.set("role_name", "Cargo");
    form.set("salary", "-1");

    expect(() => parseContestRoleForm(form)).toThrow("Salário não pode ser negativo.");
  });
});
