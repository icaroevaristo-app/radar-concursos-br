export type HealthStatus = "ok" | "error";

export type HealthPayload = {
  status: HealthStatus;
  timestamp: string;
  services: {
    app: HealthStatus;
    database: HealthStatus;
  };
};

export function createHealthPayload(databaseOk: boolean, timestamp = new Date().toISOString()): HealthPayload {
  return {
    status: databaseOk ? "ok" : "error",
    timestamp,
    services: {
      app: "ok",
      database: databaseOk ? "ok" : "error",
    },
  };
}
