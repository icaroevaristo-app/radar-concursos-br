import { BriefcaseBusiness, Clock, GraduationCap, Trophy, Users } from "lucide-react";
import { formatSalary, valueOrNotInformed } from "@/lib/contests/formatters";
import { Badge } from "@/components/ui/badge";
import type { ContestRoleRow } from "@/types/contest";

export function ContestRoleList({ roles }: { roles: ContestRoleRow[] }) {
  if (!roles.length) {
    return (
      <div className="empty-state">
        <p className="font-semibold text-foreground">Cargos não informados</p>
        <p className="mt-2">Consulte a fonte oficial para confirmar cargos, vagas, salários e requisitos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {roles.map((role) => (
        <article key={role.id} className="premium-panel-subtle overflow-hidden">
          <div className="border-b border-border/60 bg-background/35 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-lg font-bold leading-tight">{role.role_name}</h3>
                  {role.reserve_list ? <Badge variant="muted">Cadastro reserva</Badge> : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{valueOrNotInformed(role.area)}</p>
              </div>
              <Badge variant="amber">{formatSalary(role)}</Badge>
            </div>
          </div>

          <dl className="grid gap-3 p-4 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                <GraduationCap className="h-4 w-4 text-primary" />
                Escolaridade
              </dt>
              <dd className="mt-2 text-foreground">{valueOrNotInformed(role.education_level)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                <Users className="h-4 w-4 text-primary" />
                Vagas
              </dt>
              <dd className="mt-2 text-foreground">{valueOrNotInformed(role.vacancies)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                <Clock className="h-4 w-4 text-primary" />
                Carga horária
              </dt>
              <dd className="mt-2 text-foreground">{valueOrNotInformed(role.workload)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                <Trophy className="h-4 w-4 text-primary" />
                Salário
              </dt>
              <dd className="mt-2 text-foreground">{formatSalary(role)}</dd>
            </div>
          </dl>

          {role.requirements ? (
            <div className="border-t border-border/60 px-4 py-3 text-sm leading-6 text-muted-foreground">
              <span className="font-semibold text-foreground">Requisitos: </span>
              {role.requirements}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
