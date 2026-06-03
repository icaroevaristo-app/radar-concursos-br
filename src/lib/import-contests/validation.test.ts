import { describe, expect, it } from "vitest";
import { validateImportContestsJson } from "@/lib/import-contests/validation";

const contestTitle = "Concurso Público Prefeitura de Minaçu/GO 2026";

const validPayload = {
  contests: [
    {
      title: contestTitle,
      organization: "Prefeitura Municipal de Minaçu",
      sphere: "municipal",
      city: "Minaçu",
      state: "GO",
      board: "Instituto Verbena/UFG",
      status: "upcoming",
      official_url: "https://example.com/minacu-2026",
      summary: "Resumo curto",
      document_url: "https://example.com/minacu-2026-edital.pdf",
      confidence_score: 0.95,
      publication_status: "ready_to_publish",
    },
  ],
  contest_roles: [
    {
      contest_title: contestTitle,
      role_name: "Professor",
      area: "educação",
      education_level: "superior",
      salary: 4000,
      salary_text: "R$ 4.000,00",
      vacancies: 10,
      reserve_list: true,
      workload: "40h",
      requirements: "Licenciatura conforme cargo",
    },
  ],
  contest_dates: [
    {
      contest_title: contestTitle,
      event_type: "registration",
      date_start: "2026-07-06",
      date_end: "2026-07-27",
      description: "Período de inscrições",
      is_estimated: false,
      confidence_score: 0.95,
    },
  ],
};

describe("validateImportContestsJson", () => {
  it("normalizes valid import payload for database constraints", () => {
    const result = validateImportContestsJson(JSON.stringify(validPayload));

    expect(result.isValid).toBe(true);
    expect(result.totals.contests).toBe(1);
    expect(result.totals.roles).toBe(1);
    expect(result.totals.dates).toBe(2);
    expect(result.normalized.contests[0].publication_status).toBe("needs_review");
    expect(result.normalized.contests[0].confidence_score).toBe(95);
    expect(result.normalized.dates.map((date) => date.event_type)).toEqual([
      "registration_start",
      "registration_end",
    ]);
  });

  it("accepts event_type exam and maps it to the database exam_date value", () => {
    const result = validateImportContestsJson(
      JSON.stringify({
        ...validPayload,
        contest_dates: [
          {
            contest_title: contestTitle,
            event_type: "exam",
            date_start: "2026-09-13",
            date_end: null,
            description: "Data de prova",
            is_estimated: false,
            confidence_score: 0.9,
          },
        ],
      }),
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.normalized.dates).toHaveLength(1);
    expect(result.normalized.dates[0]).toMatchObject({
      event_type: "exam_date",
      date_start: "2026-09-13",
      date_end: null,
      confidence_score: 90,
    });
  });

  it("requires date_start for known exam dates", () => {
    const result = validateImportContestsJson(
      JSON.stringify({
        ...validPayload,
        contest_dates: [
          {
            contest_title: contestTitle,
            event_type: "exam",
            date_start: null,
            date_end: "2026-09-13",
            description: "Data de prova",
            is_estimated: false,
            confidence_score: 0.9,
          },
        ],
      }),
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("contest_dates[0].date_start é obrigatório para data de prova.");
  });

  it("keeps registration generating registration_start and registration_end", () => {
    const result = validateImportContestsJson(JSON.stringify(validPayload));

    expect(result.isValid).toBe(true);
    expect(result.normalized.dates).toHaveLength(2);
    expect(result.normalized.dates.map((date) => date.event_type)).toEqual([
      "registration_start",
      "registration_end",
    ]);
  });

  it("reports orphan roles by contest_title", () => {
    const result = validateImportContestsJson(
      JSON.stringify({
        ...validPayload,
        contest_roles: [{ contest_title: "Outro concurso", role_name: "Professor" }],
      }),
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("contest_roles[0].contest_title não corresponde a nenhum concurso.");
  });

  it("marks existing contests as duplicate", () => {
    const result = validateImportContestsJson(JSON.stringify(validPayload), [
      {
        id: "existing-id",
        title: contestTitle,
        organization: "Prefeitura Municipal de Minaçu",
        city: "Minaçu",
        state: "GO",
        official_url: "https://example.com/minacu-2026",
      },
    ]);

    expect(result.isValid).toBe(true);
    expect(result.previewItems[0].status).toBe("duplicate");
    expect(result.totals.duplicateContests).toBe(1);
  });
});
