"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { logAdminAction, toJson } from "@/lib/admin/audit";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeLookup } from "@/lib/import-contests/normalize";
import { validateImportContestsJson } from "@/lib/import-contests/validation";
import type { ExistingContestForImport, ImportResult, ImportValidationResult } from "@/lib/import-contests/types";
import type { Inserts } from "@/lib/supabase/types";

async function getExistingContestsForImport(): Promise<ExistingContestForImport[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contests")
    .select("id,title,organization,city,state,official_url")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Não foi possível verificar duplicidade: ${error.message}`);
  }

  return data ?? [];
}

export async function validateImportContestsJsonAction(rawJson: string): Promise<ImportValidationResult> {
  await requireAdmin();
  const existingContests = await getExistingContestsForImport();
  return validateImportContestsJson(rawJson, existingContests);
}

async function rollbackCreatedContests(contestIds: string[]) {
  if (!contestIds.length) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("contests").delete().in("id", contestIds);
}

export async function importContestsJsonAction(rawJson: string): Promise<ImportResult> {
  const { user } = await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const existingContests = await getExistingContestsForImport();
  const validation = validateImportContestsJson(rawJson, existingContests);

  if (!validation.isValid) {
    return {
      success: false,
      message: "Importação bloqueada por erros de validação.",
      errors: validation.errors,
    };
  }

  const contestsToCreate = validation.normalized.contests.filter((contest) => !contest.duplicate);
  const duplicatesSkipped = validation.normalized.contests.length - contestsToCreate.length;

  if (!contestsToCreate.length) {
    await logAdminAction(supabase, {
      actorId: user.id,
      action: "import_contests_json",
      entityType: "contest_import",
      after: toJson({
        contests_created: 0,
        roles_created: 0,
        dates_created: 0,
        duplicates_skipped: duplicatesSkipped,
        message: "Nenhum concurso novo para importar.",
      }),
    });

    return {
      success: true,
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

  const { data: createdContests, error: contestsError } = await supabase
    .from("contests")
    .insert(contestRows)
    .select("id,title");

  if (contestsError || !createdContests) {
    return {
      success: false,
      message: "Não foi possível importar concursos.",
      errors: [contestsError?.message ?? "Supabase não retornou os concursos criados."],
    };
  }

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
    const { error } = await supabase.from("contest_roles").insert(roleRows);

    if (error) {
      await rollbackCreatedContests(createdContestIds);
      return {
        success: false,
        message: "Concursos criados foram revertidos porque a importação de cargos falhou.",
        errors: [error.message],
      };
    }
  }

  if (dateRows.length) {
    const { error } = await supabase.from("contest_dates").insert(dateRows);

    if (error) {
      await rollbackCreatedContests(createdContestIds);
      return {
        success: false,
        message: "Concursos criados foram revertidos porque a importação de datas falhou.",
        errors: [error.message],
      };
    }
  }

  await logAdminAction(supabase, {
    actorId: user.id,
    action: "import_contests_json",
    entityType: "contest_import",
    after: toJson({
      contests_created: createdContests.length,
      roles_created: roleRows.length,
      dates_created: dateRows.length,
      duplicates_skipped: duplicatesSkipped,
      contest_titles: contestsToCreate.map((contest) => contest.title),
    }),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/concursos");
  revalidatePath("/radar");

  return {
    success: true,
    message: "Importação concluída com sucesso.",
    summary: {
      contestsCreated: createdContests.length,
      rolesCreated: roleRows.length,
      datesCreated: dateRows.length,
      duplicatesSkipped,
    },
  };
}
