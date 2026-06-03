import { BriefcaseBusiness } from "lucide-react";
import { formatSalary, valueOrNotInformed } from "@/lib/contests/formatters";
import { Badge } from "@/components/ui/badge";
import type { ContestRoleRow } from "@/types/contest";

export function ContestRoleList({ roles }: { roles: ContestRoleRow[] }) {
  if (!roles.length) {
    return <p className="empty-state">Cargos: não informado</p>;
  }

  return (
    <div className="space-y-3">
      {roles.map((role) => (
        <div key={role.id} className="premium-panel-subtle p-4">
          <div className="flex flex-wrap items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-primary" />
            <p className="font-display text-base font-bold">{role.role_name}</p>
            {role.reserve_list ? <Badge variant="muted">Cadastro reserva</Badge> : null}
          </div>
          <dl className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground/70">Área</dt>
              <dd className="mt-1 text-foreground">{valueOrNotInformed(role.area)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground/70">Escolaridade</dt>
              <dd className="mt-1 text-foreground">{valueOrNotInformed(role.education_level)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground/70">Salário</dt>
              <dd className="mt-1 text-foreground">{formatSalary(role)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground/70">Vagas</dt>
              <dd className="mt-1 text-foreground">{valueOrNotInformed(role.vacancies)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground/70">Carga horária</dt>
              <dd className="mt-1 text-foreground">{valueOrNotInformed(role.workload)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground/70">Requisitos</dt>
              <dd className="mt-1 text-foreground">{valueOrNotInformed(role.requirements)}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
