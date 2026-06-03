import { describe, expect, it } from "vitest";
import { formatDate, formatSalary, isCreatedWithinDays, isWithinNextDays, valueOrNotInformed } from "@/lib/contests/formatters";
import type { ContestRoleRow } from "@/types/contest";

describe("contest formatters", () => {
  it("renders missing values as not informed", () => {
    expect(valueOrNotInformed(null)).toBe("não informado");
    expect(valueOrNotInformed("")).toBe("não informado");
    expect(valueOrNotInformed("GO")).toBe("GO");
  });

  it("formats ISO date strings as pt-BR dates", () => {
    expect(formatDate("2026-07-10")).toBe("10/07/2026");
    expect(formatDate(null)).toBe("não informado");
  });

  it("formats salary using salary_text first", () => {
    const role = {
      salary: 2100,
      salary_text: "R$ 2.100,00",
    } as ContestRoleRow;

    expect(formatSalary(role)).toBe("R$ 2.100,00");
  });

  it("detects relative date windows", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 5);
    const old = new Date();
    old.setDate(old.getDate() - 10);

    expect(isWithinNextDays(soon.toISOString().slice(0, 10), 15)).toBe(true);
    expect(isCreatedWithinDays(old.toISOString(), 7)).toBe(false);
  });
});
