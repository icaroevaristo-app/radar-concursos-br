import { notFound } from "next/navigation";
import {
  createContestDateAction,
  createContestRoleAction,
  deleteContestDateAction,
  deleteContestRoleAction,
  publishContestAction,
  unpublishContestAction,
  updateContestAction,
  updateContestDateAction,
  updateContestRoleAction,
} from "@/lib/admin/actions";
import { getAdminContestById } from "@/lib/admin/queries";
import { contestDateEventTypes, contestSpheres, contestStatuses, publicationStatuses } from "@/lib/admin/validation";
import { PageShell } from "@/components/layout/page-shell";
import { NonOfficialNotice } from "@/components/shared/non-official-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EditContestPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditContestPage({ params, searchParams }: EditContestPageProps) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const { contest, roles, dates, sources } = await getAdminContestById(id);

  if (!contest) notFound();

  return (
    <PageShell eyebrow="Admin" title={`Editar concurso: ${contest.title}`} description="Gerencie dados manuais, cargos e datas. Crawler e IA não estão ativos.">
      <div className="space-y-5">
        <NonOfficialNotice />

        <Card className="p-6 shadow-glow">
          {error ? <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{error}</p> : null}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={contest.publication_status === "published" ? "success" : "muted"}>{contest.publication_status}</Badge>
              {contest.is_demo ? <Badge variant="amber">Demo</Badge> : null}
            </div>
            <form action={contest.publication_status === "published" ? unpublishContestAction : publishContestAction}>
              <input name="id" type="hidden" value={contest.id} />
              <Button type="submit" variant={contest.publication_status === "published" ? "outline" : "primary"}>
                {contest.publication_status === "published" ? "Despublicar" : "Publicar"}
              </Button>
            </form>
          </div>

          <form action={updateContestAction} className="grid gap-4 md:grid-cols-2">
            <input name="id" type="hidden" value={contest.id} />
            <label className="block md:col-span-2">
              <span className="form-label">Título</span>
              <input className="form-control" defaultValue={contest.title} name="title" required />
            </label>
            <label className="block md:col-span-2">
              <span className="form-label">Órgão/organização</span>
              <input className="form-control" defaultValue={contest.organization} name="organization" required />
            </label>
            <label className="block">
              <span className="form-label">Esfera</span>
              <select className="form-control" defaultValue={contest.sphere} name="sphere">
                {contestSpheres.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="form-label">Status</span>
              <select className="form-control" defaultValue={contest.status} name="status">
                {contestStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="form-label">Cidade</span>
              <input className="form-control" defaultValue={contest.city ?? ""} name="city" />
            </label>
            <label className="block">
              <span className="form-label">UF</span>
              <input className="form-control" defaultValue={contest.state} maxLength={2} name="state" required />
            </label>
            <label className="block">
              <span className="form-label">Latitude</span>
              <input className="form-control" defaultValue={contest.latitude ?? ""} name="latitude" step="any" type="number" />
            </label>
            <label className="block">
              <span className="form-label">Longitude</span>
              <input className="form-control" defaultValue={contest.longitude ?? ""} name="longitude" step="any" type="number" />
            </label>
            <label className="block">
              <span className="form-label">Banca</span>
              <input className="form-control" defaultValue={contest.board ?? ""} name="board" />
            </label>
            <label className="block">
              <span className="form-label">Fonte</span>
              <select className="form-control" defaultValue={contest.source_id ?? ""} name="source_id">
                <option value="">não informado</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="form-label">Link oficial</span>
              <input className="form-control" defaultValue={contest.official_url} name="official_url" type="url" />
            </label>
            <label className="block">
              <span className="form-label">Confiança</span>
              <input className="form-control" defaultValue={contest.confidence_score} max={100} min={0} name="confidence_score" type="number" />
            </label>
            <label className="block">
              <span className="form-label">Publicação</span>
              <select className="form-control" defaultValue={contest.publication_status} name="publication_status">
                {publicationStatuses.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="form-label">Resumo</span>
              <textarea className="form-control min-h-24" defaultValue={contest.summary ?? ""} name="summary" />
            </label>
            <label className="block">
              <span className="form-label">URL do documento</span>
              <input className="form-control" defaultValue={contest.document_url ?? ""} name="document_url" type="url" />
            </label>
            <label className="block">
              <span className="form-label">Storage path futuro</span>
              <input className="form-control" defaultValue={contest.document_storage_path ?? ""} name="document_storage_path" />
            </label>
            <label className="flex gap-3 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground md:col-span-2">
              <input className="form-checkbox" defaultChecked={contest.is_demo} name="is_demo" type="checkbox" />
              <span>Marcar como demonstração</span>
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Salvar concurso</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">Cargos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Adicione, edite ou remova cargos vinculados a este concurso.</p>
          <div className="mt-4 space-y-4">
            {roles.map((role) => (
              <form key={role.id} action={updateContestRoleAction} className="grid gap-3 rounded-md border border-border bg-background/45 p-3 md:grid-cols-4">
                <input name="id" type="hidden" value={role.id} />
                <input name="contest_id" type="hidden" value={contest.id} />
                <input className="form-control" defaultValue={role.role_name} name="role_name" placeholder="Cargo" required />
                <input className="form-control" defaultValue={role.area ?? ""} name="area" placeholder="Área" />
                <input className="form-control" defaultValue={role.education_level ?? ""} name="education_level" placeholder="Escolaridade" />
                <input className="form-control" defaultValue={role.salary ?? ""} name="salary" placeholder="Salário" type="number" />
                <input className="form-control" defaultValue={role.salary_text ?? ""} name="salary_text" placeholder="Texto salário" />
                <input className="form-control" defaultValue={role.vacancies ?? ""} name="vacancies" placeholder="Vagas" type="number" />
                <input className="form-control" defaultValue={role.workload ?? ""} name="workload" placeholder="Carga horária" />
                <input className="form-control" defaultValue={role.requirements ?? ""} name="requirements" placeholder="Requisitos" />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input className="accent-amber-500" defaultChecked={role.reserve_list} name="reserve_list" type="checkbox" /> CR
                </label>
                <div className="flex gap-2 md:col-span-3">
                  <Button size="sm" type="submit" variant="outline">
                    Salvar cargo
                  </Button>
                  <Button formAction={deleteContestRoleAction} size="sm" type="submit" variant="danger">
                    Remover
                  </Button>
                </div>
              </form>
            ))}
            <form action={createContestRoleAction} className="grid gap-3 rounded-md border border-primary/25 bg-primary/5 p-3 md:grid-cols-4">
              <input name="contest_id" type="hidden" value={contest.id} />
              <input className="form-control" name="role_name" placeholder="Novo cargo" required />
              <input className="form-control" name="area" placeholder="Área" />
              <input className="form-control" name="education_level" placeholder="Escolaridade" />
              <input className="form-control" name="salary" placeholder="Salário" type="number" />
              <input className="form-control" name="salary_text" placeholder="Texto salário" />
              <input className="form-control" name="vacancies" placeholder="Vagas" type="number" />
              <input className="form-control" name="workload" placeholder="Carga horária" />
              <input className="form-control" name="requirements" placeholder="Requisitos" />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input className="accent-amber-500" name="reserve_list" type="checkbox" /> CR
              </label>
              <Button size="sm" type="submit">
                Adicionar cargo
              </Button>
            </form>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold">Datas</h2>
          <p className="mt-1 text-sm text-muted-foreground">A data registration_end alimenta a aba Encerrando do Radar.</p>
          <div className="mt-4 space-y-4">
            {dates.map((date) => (
              <form key={date.id} action={updateContestDateAction} className="grid gap-3 rounded-md border border-border bg-background/45 p-3 md:grid-cols-4">
                <input name="id" type="hidden" value={date.id} />
                <input name="contest_id" type="hidden" value={contest.id} />
                <select className="form-control" defaultValue={date.event_type} name="event_type">
                  {contestDateEventTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input className="form-control" defaultValue={date.date_start ?? ""} name="date_start" type="date" />
                <input className="form-control" defaultValue={date.date_end ?? ""} name="date_end" type="date" />
                <input className="form-control" defaultValue={date.confidence_score} max={100} min={0} name="confidence_score" type="number" />
                <input className="form-control md:col-span-2" defaultValue={date.description ?? ""} name="description" placeholder="Descrição" />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input className="accent-amber-500" defaultChecked={date.is_estimated} name="is_estimated" type="checkbox" /> Estimada
                </label>
                <div className="flex gap-2">
                  <Button size="sm" type="submit" variant="outline">
                    Salvar data
                  </Button>
                  <Button formAction={deleteContestDateAction} size="sm" type="submit" variant="danger">
                    Remover
                  </Button>
                </div>
              </form>
            ))}
            <form action={createContestDateAction} className="grid gap-3 rounded-md border border-primary/25 bg-primary/5 p-3 md:grid-cols-4">
              <input name="contest_id" type="hidden" value={contest.id} />
              <select className="form-control" name="event_type">
                {contestDateEventTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input className="form-control" name="date_start" type="date" />
              <input className="form-control" name="date_end" type="date" />
              <input className="form-control" defaultValue={100} max={100} min={0} name="confidence_score" type="number" />
              <input className="form-control md:col-span-2" name="description" placeholder="Descrição" />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input className="accent-amber-500" name="is_estimated" type="checkbox" /> Estimada
              </label>
              <Button size="sm" type="submit">
                Adicionar data
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
