import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequestId, createSafeErrorMessage, logger, sanitizeLogMetadata } from "@/lib/logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates unique request ids", () => {
    const first = createRequestId();
    const second = createRequestId();

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toBe(second);
  });

  it("redacts sensitive metadata", () => {
    const metadata = sanitizeLogMetadata({
      token: "secret-token",
      nested: {
        serviceRoleKey: "secret-service-key",
        safe: "ok",
      },
    });

    expect(metadata).toEqual({
      token: "[redacted]",
      nested: {
        serviceRoleKey: "[redacted]",
        safe: "ok",
      },
    });
  });

  it("writes structured JSON logs", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    const entry = logger({
      level: "info",
      message: "test_event",
      requestId: "req-test",
      userId: "user-test",
      action: "unit_test",
      metadata: {
        ok: true,
      },
    });

    expect(entry).toMatchObject({
      level: "info",
      message: "test_event",
      requestId: "req-test",
      userId: "user-test",
      action: "unit_test",
      metadata: {
        ok: true,
      },
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(() => JSON.parse(String(spy.mock.calls[0][0]))).not.toThrow();
  });

  it("creates safe error messages with request id", () => {
    expect(createSafeErrorMessage("Não foi possível concluir a importação.", "req-123")).toBe(
      "Não foi possível concluir a importação. Código de rastreio: req-123.",
    );
  });
});
