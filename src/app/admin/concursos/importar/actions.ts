"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction, toJson } from "@/lib/admin/audit";
import { createRequestId, createSafeErrorMessage, logger } from "@/lib/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeLookup } from "@/lib/import-contests/normalize";
import { validateImportContestsJson } from "@/lib/import-contests/validation";
import type { ExistingContestForImport, ImportResult, ImportValidationResult } from "@/lib/import-contests/types";
import type { Database, Inserts } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

const importRoute = "/admin/concursos/importar";
const importAction = "import_contests_json";

async function timedSupabaseQuery<T>(
  input: {
    requestId: string;
    userId?: string;
    operation: string;
    table: string;
  },
  query: () => Promise<SupabaseResult<T>>,
) {
  const startedAt = performance.now();
  const result = await query();
  const durationMs = Math.round(performance.now() - startedAt);

  logger({
    level: result.error ? "error" : "info",
    message: result.error ? "database_query_failed" : "database_query_completed",
    requestId: input.requestId,
    userId: input.userId,
    route: importRoute,
    action: importAction,
    durationMs,
    metadata: {
      operation: input.operation,
      table: input.table,
      success: !result.error,
    },
    error: result.error ?? undefined,
  });

  return result;
}

async function getExistingContestsForImport(
  supabase: SupabaseClient<Database>,
  requestId: string,
  userId?: string,
): Promise<ExistingContestForImport[]> {
  const { data, error } = await timedSupabaseQuery<ExistingContestForImport[]>(
    {
      requestId,
      userId,
      operation: "select_duplicates",
      table: "contests",
    },
    async () =>
      await supabase
        .from("contests")
        .select("id,title,organization,city,state,official_url")
        .order("created_at", { ascending: false }),
  );

  if (error) {
    throw new Error(`Não foi possível verificar duplicidade: ${error.message}`);
  }

  return data ?? [];
}

export async function validateImportContestsJsonAction(rawJson: string): Promise<ImportValidationResult> {
  const requestId = createRequestId();
  const startedAt = performance.now();
  const { user } = await requireAdmin();
  const supabase = await createServerSupabaseClient();

  logger({
    level: "info",
    message: "import_validation_started",
    requestId,
    userId: user.id,
    route: importRoute,
    action: "validate_import_contests_json",
    metadata: {
      payloadSize: rawJson.length,
    },
  });

  try {
    const existingContests = await getExistingContestsForImport(supabase, requestId, user.id);
    const validation = validateImportContestsJson(rawJson, existingContests);
    const durationMs = Math.round(performance.now() - startedAt);

    logger({
      level: validation.isValid ? "info" : "warn",
      message: validation.isValid ? "import_validation_completed" : "import_validation_failed",
      requestId,
      userId: user.id,
      route: importRoute,
      action: "validate_import_contests_json",
      durationMs,
      metadata: {
        contests: validation.totals.contests,
        roles: validation.totals.roles,
        dates: validation.totals.dates,
        readyContests: validation.totals.readyContests,
        duplicateContests: validation.totals.duplicateContests,
        invalidContests: validation.totals.invalidContests,
        errorCount: validation.errors.length,
      },
    });

    return { ...validation, requestId };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);

    logger({
      level: "error",
      message: "import_validation_unhandled_error",
      requestId,
      userId: user.id,
      route: importRoute,
      action: "validate_import_contests_json",
      durationMs,
      error,
    });

    return {
      ...validateImportContestsJson(""),
      requestId,
      isValid: false,
      errors: [createSafeErrorMessage("Não foi possível validar o JSON.", requestId)],
    };
  }
}

async function rollbackCreatedContests(
  supabase: SupabaseClient<Database>,
  contestIds: string[],
  requestId: string,
  userId: string,
) {
  if (!contestIds.length) return;

  const { error } = await timedSupabaseQuery<null>(
    {
      requestId,
      userId,
      operation: "rollback_delete_created_contests",
      table: "contests",
    },
    async () => await supabase.from("contests").delete().in("id", contestIds),
  );

  logger({
    level: error ? "error" : "warn",
    message: "import_manual_rollback_executed",
    requestId,
    userId,
    route: importRoute,
    action: importAction,
    metadata: {
      contestIdsCount: contestIds.length,
      success: !error,
    },
    error: error ?? undefined,
  });
}

export async function importContestsJsonAction(rawJson: string): Promise<ImportResult> {
  const requestId = createRequestId();
  const startedAt = performance.now();
  const { user } = await requireAdmin();
  const supabase = await createServerSupabaseClient();

  logger({
    level: "info",
    message: "import_started",
    requestId,
    userId: user.id,
    route: importRoute,
    action: importAction,
    metadata: {
      payloadSize: rawJson.length,
    },
  });

  try {
    const existingContests = await getExistingContestsForImport(supabase, requestId, user.id);
    const validation = validateImportContestsJson(rawJson, existingContests);

    logger({
      level: "info",
      message: "import_contests_detected",
      requestId,
      userId: user.id,
      route: importRoute,
      action: importAction,
      metadata: validation.totals,
    });

    if (!validation.isValid) {
      logger({
        level: "warn",
        message: "import_blocked_by_validation",
        requestId,
        userId: user.id,
        route: importRoute,
        action: importAction,
        metadata: {
          errorCount: validation.errors.length,
          errors: validation.errors,
        },
      });

      return {
        success: false,
        requestId,
        message: createSafeErrorMessage("Não foi possível concluir a importação.", requestId),
        errors: validation.errors,
      };
    }

    const contestsToCreate = validation.normalized.contests.filter((contest) => !contest.duplicate);
    const duplicatesSkipped = validation.normalized.contests.length - contestsToCreate.length;

    logger({
      level: duplicatesSkipped ? "warn" : "info",
      message: "import_duplicates_evaluated",
      requestId,
      userId: user.id,
      route: importRoute,
      action: importAction,
      metadata: {
        duplicatesSkipped,
        contestsToCreate: contestsToCreate.length,
      },
    });

    if (!contestsToCreate.length) {
      const auditStartedAt = performance.now();
      const { error: auditError } = await logAdminAction(supabase, {
        actorId: user.id,
        action: importAction,
        entityType: "contest_import",
        after: toJson({
          requestId,
          timestamp: new Date().toISOString(),
          contests_created: 0,
          roles_created: 0,
          dates_created: 0,
          duplicates_skipped: duplicatesSkipped,
          message: "Nenhum concurso novo para importar.",
        }),
      });
      const auditDurationMs = Math.round(performance.now() - auditStartedAt);

      logger({
        level: auditError ? "error" : "info",
        message: auditError ? "database_query_failed" : "database_query_completed",
        requestId,
        userId: user.id,
        route: importRoute,
        action: importAction,
        durationMs: auditDurationMs,
        metadata: {
          operation: "insert_audit_log",
          table: "audit_logs",
          success: !auditError,
        },
        error: auditError ?? undefined,
      });

      return {
        success: true,
        requestId,
        message: "Nenhum concurso novo para importar. Duplicados foram ignorados.",
        summary: {
          contestsCreated: 0,
          rolesCreated: 0,
          datesCreated: 0,
          duplicatesSkipped,
        },
      };
    }

    const contestRows: Inserts<"contests">[] = contestsToCreate.map((contest) => ({
      title: contest.title,
      organization: contest.organization,
      sphere: contest.sphere,
      city: contest.city,
      state: contest.state,
      board: contest.board,
      status: contest.status,
      official_url: contest.official_url,
      summary: contest.summary,
      document_url: contest.document_url,
      document_storage_path: contest.document_storage_path,
      confidence_score: contest.confidence_score,
      publication_status: contest.publication_status,
      is_demo: false,
      created_by: user.id,
    }));

    const { data: createdContests, error: contestsError } = await timedSupabaseQuery<
      { id: string; title: string }[]
    >(
      {
        requestId,
        userId: user.id,
        operation: "insert_contests",
        table: "contests",
      },
      async () => await supabase.from("contests").insert(contestRows).select("id,title"),
    );

    if (contestsError || !createdContests) {
      return {
        success: false,
        requestId,
        message: createSafeErrorMessage("Não foi possível concluir a importação.", requestId),
        errors: ["Não foi possível importar concursos."],
      };
    }

    logger({
      level: "info",
      message: "import_contests_created",
      requestId,
      userId: user.id,
      route: importRoute,
      action: importAction,
      metadata: {
        contestsCreated: createdContests.length,
      },
    });

    const createdContestIds = createdContests.map((contest) => contest.id);
    const contestIdByTitle = new Map<string, string>();

    createdContests.forEach((contest) => {
      contestIdByTitle.set(normalizeLookup(contest.title), contest.id);
    });

    const roleRows: Inserts<"contest_roles">[] = [];

    validation.normalized.roles.forEach((role) => {
      const contestId = contestIdByTitle.get(normalizeLookup(role.contest_title));
      if (!contestId) return;

      roleRows.push({
        contest_id: contestId,
        role_name: role.role_name,
        area: role.area ?? null,
        education_level: role.education_level ?? null,
        salary: role.salary ?? null,
        salary_text: role.salary_text ?? null,
        vacancies: role.vacancies ?? null,
        reserve_list: role.reserve_list ?? false,
        workload: role.workload ?? null,
        requirements: role.requirements ?? null,
      });
    });

    const dateRows: Inserts<"contest_dates">[] = [];

    validation.normalized.dates.forEach((date) => {
      const contestId = contestIdByTitle.get(normalizeLookup(date.contest_title));
      if (!contestId) return;

      dateRows.push({
        contest_id: contestId,
        event_type: date.event_type,
        date_start: date.date_start ?? null,
        date_end: date.date_end ?? null,
        description: date.description ?? null,
        is_estimated: date.is_estimated ?? false,
        confidence_score: date.confidence_score ?? 100,
      });
    });

    if (roleRows.length) {
      const { error } = await timedSupabaseQuery<null>(
        {
          requestId,
          userId: user.id,
          operation: "insert_contest_roles",
          table: "contest_roles",
        },
        async () => await supabase.from("contest_roles").insert(roleRows),
      );

      if (error) {
        await rollbackCreatedContests(supabase, createdContestIds, requestId, user.id);
        return {
          success: false,
          requestId,
          message: createSafeErrorMessage("Não foi possível concluir a importação.", requestId),
          errors: ["Concursos criados foram revertidos porque a importação de cargos falhou."],
        };
      }
    }

    logger({
      level: "info",
      message: "import_roles_created",
      requestId,
      userId: user.id,
      route: importRoute,
      action: importAction,
      metadata: {
        rolesCreated: roleRows.length,
      },
    });

    if (dateRows.length) {
      const { error } = await timedSupabaseQuery<null>(
        {
          requestId,
          userId: user.id,
          operation: "insert_contest_dates",
          table: "contest_dates",
        },
        async () => await supabase.from("contest_dates").insert(dateRows),
      );

      if (error) {
        await rollbackCreatedContests(supabase, createdContestIds, requestId, user.id);
        return {
          success: false,
          requestId,
          message: createSafeErrorMessage("Não foi possível concluir a importação.", requestId),
          errors: ["Concursos criados foram revertidos porque a importação de datas falhou."],
        };
      }
    }

    logger({
      level: "info",
      message: "import_dates_created",
      requestId,
      userId: user.id,
      route: importRoute,
      action: importAction,
      metadata: {
        datesCreated: dateRows.length,
      },
    });

    const auditStartedAt = performance.now();
    const { error: auditError } = await logAdminAction(supabase, {
      actorId: user.id,
      action: importAction,
      entityType: "contest_import",
      after: toJson({
        requestId,
        timestamp: new Date().toISOString(),
        contests_created: createdContests.length,
        roles_created: roleRows.length,
        dates_created: dateRows.length,
        duplicates_skipped: duplicatesSkipped,
        contest_titles: contestsToCreate.map((contest) => contest.title),
      }),
    });
    const auditDurationMs = Math.round(performance.now() - auditStartedAt);

    logger({
      level: auditError ? "error" : "info",
      message: auditError ? "database_query_failed" : "database_query_completed",
      requestId,
      userId: user.id,
      route: importRoute,
      action: importAction,
      durationMs: auditDurationMs,
      metadata: {
        operation: "insert_audit_log",
        table: "audit_logs",
        success: !auditError,
      },
      error: auditError ?? undefined,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/concursos");
    revalidatePath("/radar");

    const durationMs = Math.round(performance.now() - startedAt);

    logger({
      level: "info",
      message: "import_completed",
      requestId,
      userId: user.id,
      route: importRoute,
      action: importAction,
      durationMs,
      metadata: {
        contestsCreated: createdContests.length,
        rolesCreated: roleRows.length,
        datesCreated: dateRows.length,
        duplicatesSkipped,
      },
    });

    return {
      success: true,
      requestId,
      message: "Importação concluída com sucesso.",
      summary: {
        contestsCreated: createdContests.length,
        rolesCreated: roleRows.length,
        datesCreated: dateRows.length,
        duplicatesSkipped,
      },
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);

    logger({
      level: "error",
      message: "import_unhandled_error",
      requestId,
      userId: user.id,
      route: importRoute,
      action: importAction,
      durationMs,
      error,
    });

    return {
      success: false,
      requestId,
      message: createSafeErrorMessage("Não foi possível concluir a importação.", requestId),
      errors: ["Erro interno durante a importação."],
    };
  }
}
