import { describe, expect, it } from "vitest";
import { createHealthPayload } from "@/lib/health";

describe("createHealthPayload", () => {
  it("returns ok status when database is healthy", () => {
    expect(createHealthPayload(true, "2026-06-03T00:00:00.000Z")).toEqual({
      status: "ok",
      timestamp: "2026-06-03T00:00:00.000Z",
      services: {
        app: "ok",
        database: "ok",
      },
    });
  });

  it("returns error status when database is unhealthy", () => {
    expect(createHealthPayload(false, "2026-06-03T00:00:00.000Z")).toEqual({
      status: "error",
      timestamp: "2026-06-03T00:00:00.000Z",
      services: {
        app: "ok",
        database: "error",
      },
    });
  });
});
