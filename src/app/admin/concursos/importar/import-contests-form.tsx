"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  importContestsJsonAction,
  validateImportContestsJsonAction,
} from "@/app/admin/concursos/importar/actions";
import type { ImportResult, ImportValidationResult } from "@/lib/import-contests/types";

const exampleJson = `{
  "contests": [
    {
      "title": "Concurso Público Prefeitura de Minaçu/GO 2026",
      "organization": "Prefeitura Municipal de Minaçu",
      "sphere": "municipal",
      "city": "Minaçu",
      "state": "GO",
      "board": "Instituto Verbena/UFG",
      "status": "upcoming",
      "official_url": "https://example.com/minacu-2026",
      "summary": "Resumo curto",
      "document_url": "https://example.com/minacu-2026-edital.pdf",
      "confidence_score": 0.95,
      "publication_status": "ready_to_publish"
    }
  ],
  "contest_roles": [
    {
      "contest_title": "Concurso Público Prefeitura de Minaçu/GO 2026",
      "role_name": "Professor",
      "area": "educação",
      "education_level": "superior",
      "salary": 4000,
      "salary_text": "R$ 4.000,00",
      "vacancies": 10,
      "reserve_list": true,
      "workload": "40h",
      "requirements": "Licenciatura conforme cargo"
    }
  ],
  "contest_dates": [
    {
      "contest_title": "Concurso Público Prefeitura de Minaçu/GO 2026",
      "event_type": "registration",
      "date_start": "2026-07-06",
      "date_end": "2026-07-27",
      "description": "Período de inscrições",
      "is_estimated": false,
      "confidence_score": 0.95
    }
  ]
}`;

function statusVariant(status: string) {
  if (status === "ready") return "success";
  if (status === "duplicate") return "amber";
  return "danger";
}

export function ImportContestsForm() {
  const [rawJson, setRawJson] = useState("");
  const [validation, setValidation] = useState<ImportValidationResult | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingLabel, setPendingLabel] = useState<"validating" | "importing" | null>(null);
  const [isPending, startTransition] = useTransition();

  const isBusy = isPending || pendingLabel !== null;

  function validateJson() {
    setLocalError(null);
    setResult(null);

    if (!rawJson.trim()) {
      setValidation(null);
      setLocalError("Cole um JSON antes de validar.");
      return;
    }

    setPendingLabel("validating");
    startTransition(async () => {
      try {
        const nextValidation = await validateImportContestsJsonAction(rawJson);
        setValidation(nextValidation);
      } catch {
        setLocalError("Não foi possível validar o JSON. Confirme sua sessão admin e tente novamente.");
      } finally {
        setPendingLabel(null);
      }
    });
  }

  function importJson() {
    setLocalError(null);
    setResult(null);

    if (!rawJson.trim()) {
      setLocalError("Cole um JSON antes de importar.");
      return;
    }

    setPendingLabel("importing");
    startTransition(async () => {
      try {
        const importResult = await importContestsJsonAction(rawJson);
        setResult(importResult);

        if (importResult.success) {
          const nextValidation = await validateImportContestsJsonAction(rawJson);
          setValidation(nextValidation);
        }
      } catch {
        setLocalError("Não foi possível importar. Confirme sua sessão admin e tente novamente.");
      } finally {
        setPendingLabel(null);
      }
    });
  }

  function clearForm() {
    setRawJson("");
    setValidation(null);
    setResult(null);
    setLocalError(null);
    setPendingLabel(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <Card className="p-5">
        <label className="block">
          <span className="form-label">JSON revisado</span>
          <textarea
            className="form-control min-h-[28rem] font-mono text-xs leading-5"
            onChange={(event) => setRawJson(event.target.value)}
            placeholder={exampleJson}
            spellCheck={false}
            value={rawJson}
          />
        </label>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button disabled={isBusy} onClick={validateJson} type="button" variant="outline">
            {pendingLabel === "validating" ? "Validando..." : "Validar JSON"}
          </Button>
          <Button disabled={isBusy || !validation?.isValid} onClick={importJson} type="button">
            {pendingLabel === "importing" ? "Importando..." : "Importar concursos"}
          </Button>
          <Button disabled={isBusy} onClick={clearForm} type="button" variant="ghost">
            Limpar
          </Button>
        </div>

        {localError ? (
          <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{localError}</div>
        ) : null}

        {result ? (
          <div
            className={
              result.success
                ? "mt-4 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-emerald-100"
                : "mt-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200"
            }
          >
            <p className="font-bold">{result.message}</p>
            {result.summary ? (
              <ul className="mt-2 space-y-1">
                <li>{result.summary.contestsCreated} concursos importados</li>
                <li>{result.summary.rolesCreated} cargos importados</li>
                <li>{result.summary.datesCreated} datas importadas</li>
                <li>{result.summary.duplicatesSkipped} duplicados ignorados</li>
              </ul>
            ) : null}
            {result.errors?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}
            {result.success ? (
              <Link className="mt-3 inline-flex font-bold text-primary hover:text-amber-300" href="/admin/concursos">
                Voltar para concursos
              </Link>
            ) : null}
          </div>
        ) : null}
      </Card>

      <aside className="space-y-4">
        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Pré-visualização</h2>
          {!validation ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Cole o JSON e clique em Validar JSON para conferir duplicidade e erros antes de importar.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="premium-panel-subtle p-3">
                  <p className="font-display text-2xl font-black">{validation.totals.contests}</p>
                  <p className="text-xs text-muted-foreground">concursos</p>
                </div>
                <div className="premium-panel-subtle p-3">
                  <p className="font-display text-2xl font-black">{validation.totals.roles}</p>
                  <p className="text-xs text-muted-foreground">cargos</p>
                </div>
                <div className="premium-panel-subtle p-3">
                  <p className="font-display text-2xl font-black">{validation.totals.dates}</p>
                  <p className="text-xs text-muted-foreground">datas</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <Badge className="justify-center" variant="success">
                  {validation.totals.readyContests} prontos
                </Badge>
                <Badge className="justify-center" variant="amber">
                  {validation.totals.duplicateContests} duplicados
                </Badge>
                <Badge className="justify-center" variant="danger">
                  {validation.totals.invalidContests} inválidos
                </Badge>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Datas com `event_type: &quot;registration&quot;` são convertidas em `registration_start` e `registration_end` quando houver início e fim.
              </p>
            </div>
          )}
        </Card>

        {validation?.errors.length ? (
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold text-red-200">Erros de validação</h2>
            <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-red-100">
              {validation.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </Card>
        ) : null}

        {validation?.previewItems.length ? (
          <Card className="p-5">
            <h2 className="font-display text-lg font-bold">Concursos encontrados</h2>
            <div className="mt-4 space-y-3">
              {validation.previewItems.map((item) => (
                <div key={`${item.index}-${item.title}`} className="premium-panel-subtle p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(item.status)}>{item.statusLabel}</Badge>
                    <span className="text-xs text-muted-foreground">#{item.index + 1}</span>
                  </div>
                  <p className="mt-2 font-display text-sm font-bold">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.organization} · {item.city}/{item.state}
                  </p>
                  {item.reasons.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                      {item.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}
