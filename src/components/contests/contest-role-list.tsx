import { formatSalary, valueOrNotInformed } from "@/lib/contests/formatters";
import { Badge } from "@/components/ui/badge";
import type { ContestRoleRow } from "@/types/contest";

export function ContestRoleList({ roles }: { roles: ContestRoleRow[] }) {
  if (!roles.length) {
    return <p className="text-sm text-muted-foreground">Cargos: não informado</p>;
  }

  return (
    <div className="space-y-3">
      {roles.map((role) => (
        <div key={role.id} className="rounded-md border border-border bg-background/45 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-sm font-bold">{role.role_name}</p>
            {role.reserve_list ? <Badge variant="muted">Cadastro reserva</Badge> : null}
          </div>
          <dl className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em]">Área</dt>
              <dd>{valueOrNotInformed(role.area)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em]">Escolaridade</dt>
              <dd>{valueOrNotInformed(role.education_level)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em]">Salário</dt>
              <dd>{formatSalary(role)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em]">Vagas</dt>
              <dd>{valueOrNotInformed(role.vacancies)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em]">Carga horária</dt>
              <dd>{valueOrNotInformed(role.workload)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em]">Requisitos</dt>
              <dd>{valueOrNotInformed(role.requirements)}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
