export type LogLevel = "info" | "warn" | "error" | "debug";

type LogMetadata = Record<string, unknown>;

type LoggerInput = {
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  route?: string;
  action?: string;
  durationMs?: number;
  metadata?: LogMetadata;
  error?: unknown;
};

const sensitiveKeyPattern = /token|password|secret|service.?role|cookie|authorization|apikey|api.?key|session/i;
const maxStringLength = 500;
const maxArrayLength = 20;

export function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function truncateString(value: string) {
  return value.length > maxStringLength ? `${value.slice(0, maxStringLength)}...` : value;
}

export function sanitizeLogMetadata(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") return truncateString(value);
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.slice(0, maxArrayLength).map((item) => sanitizeLogMetadata(item));
  }

  const sanitized: LogMetadata = {};

  Object.entries(value as LogMetadata).forEach(([key, entryValue]) => {
    if (sensitiveKeyPattern.test(key)) {
      sanitized[key] = "[redacted]";
      return;
    }

    sanitized[key] = sanitizeLogMetadata(entryValue);
  });

  return sanitized;
}

export function getErrorFields(error: unknown) {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      stack: typeof window === "undefined" ? error.stack : undefined,
    };
  }

  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;

    return {
      errorName: typeof record.name === "string" ? record.name : undefined,
      errorMessage: typeof record.message === "string" ? record.message : JSON.stringify(sanitizeLogMetadata(record)),
      stack: typeof window === "undefined" && typeof record.stack === "string" ? record.stack : undefined,
    };
  }

  return {
    errorName: undefined,
    errorMessage: typeof error === "string" ? error : "Unknown error",
    stack: undefined,
  };
}

export function createSafeErrorMessage(message: string, requestId: string) {
  return `${message} Código de rastreio: ${requestId}.`;
}

export function logger(input: LoggerInput) {
  const errorFields = input.error ? getErrorFields(input.error) : {};
  const entry = {
    level: input.level,
    message: input.message,
    requestId: input.requestId,
    userId: input.userId,
    route: input.route,
    action: input.action,
    durationMs: input.durationMs,
    metadata: input.metadata ? sanitizeLogMetadata(input.metadata) : undefined,
    ...errorFields,
    createdAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify(entry);

  if (input.level === "error") {
    console.error(serialized);
    return entry;
  }

  if (input.level === "warn") {
    console.warn(serialized);
    return entry;
  }

  console.log(serialized);
  return entry;
}

export async function withQueryTiming<T>(
  input: Omit<LoggerInput, "level" | "message" | "durationMs" | "error"> & {
    operation: string;
    table: string;
  },
  query: () => Promise<T>,
) {
  const startedAt = performance.now();

  try {
    const result = await query();
    const durationMs = Math.round(performance.now() - startedAt);

    logger({
      level: "info",
      message: "database_query_completed",
      requestId: input.requestId,
      userId: input.userId,
      route: input.route,
      action: input.action,
      durationMs,
      metadata: {
        operation: input.operation,
        table: input.table,
        success: true,
      },
    });

    return result;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);

    logger({
      level: "error",
      message: "database_query_failed",
      requestId: input.requestId,
      userId: input.userId,
      route: input.route,
      action: input.action,
      durationMs,
      metadata: {
        operation: input.operation,
        table: input.table,
        success: false,
      },
      error,
    });

    throw error;
  }
}
