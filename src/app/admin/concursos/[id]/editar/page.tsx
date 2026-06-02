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
      <div className="space-y-4">
        <Card className="p-5">
          <NonOfficialNotice />
        </Card>

        <Card className="p-5">
          {error ? <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{error}</p> : null}
          <div className="mb-4 flex flex-wrap gap-2">
            <form action={contest.publication_status === "published" ? unpublishContestAction : publishContestAction}>
              <input name="id" type="hidden" value={contest.id} />
              <Button type="submit" variant={contest.publication_status === "published" ? "outline" : "primary"}>
                {contest.publication_status === "published" ? "Despublicar" : "Publicar"}
              </Button>
            </form>
          </div>
          <form action={updateContestAction} className="grid gap-4 md:grid-cols-2">
            <input name="id" type="hidden" value={contest.id} />
            <label className="block text-sm md:col-span-2">
              <span className="mb-1.5 block text-muted-foreground">Título</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.title} name="title" required />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1.5 block text-muted-foreground">Órgão/organização</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.organization} name="organization" required />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Esfera</span>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.sphere} name="sphere">
                {contestSpheres.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Status</span>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.status} name="status">
                {contestStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Cidade</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.city ?? ""} name="city" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">UF</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.state} maxLength={2} name="state" required />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Latitude</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.latitude ?? ""} name="latitude" step="any" type="number" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Longitude</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.longitude ?? ""} name="longitude" step="any" type="number" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Banca</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.board ?? ""} name="board" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Fonte</span>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.source_id ?? ""} name="source_id">
                <option value="">não informado</option>
                {sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
              </select>
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1.5 block text-muted-foreground">Link oficial</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.official_url} name="official_url" type="url" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Confiança</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.confidence_score} max={100} min={0} name="confidence_score" type="number" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Publicação</span>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.publication_status} name="publication_status">
                {publicationStatuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1.5 block text-muted-foreground">Resumo</span>
              <textarea className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.summary ?? ""} name="summary" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">URL do documento</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.document_url ?? ""} name="document_url" type="url" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Storage path futuro</span>
              <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={contest.document_storage_path ?? ""} name="document_storage_path" />
            </label>
            <label className="flex gap-2 text-sm text-muted-foreground md:col-span-2">
              <input className="mt-1 accent-amber-500" defaultChecked={contest.is_demo} name="is_demo" type="checkbox" />
              Marcar como demonstração
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Salvar concurso</Button>
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Cargos</h2>
          <div className="mt-4 space-y-4">
            {roles.map((role) => (
              <form key={role.id} action={updateContestRoleAction} className="grid gap-3 rounded-md border border-border bg-background/45 p-3 md:grid-cols-4">
                <input name="id" type="hidden" value={role.id} />
                <input name="contest_id" type="hidden" value={contest.id} />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={role.role_name} name="role_name" placeholder="Cargo" required />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={role.area ?? ""} name="area" placeholder="Área" />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={role.education_level ?? ""} name="education_level" placeholder="Escolaridade" />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={role.salary ?? ""} name="salary" placeholder="Salário" type="number" />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={role.salary_text ?? ""} name="salary_text" placeholder="Texto salário" />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={role.vacancies ?? ""} name="vacancies" placeholder="Vagas" type="number" />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={role.workload ?? ""} name="workload" placeholder="Carga horária" />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={role.requirements ?? ""} name="requirements" placeholder="Requisitos" />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input defaultChecked={role.reserve_list} name="reserve_list" type="checkbox" /> CR
                </label>
                <div className="flex gap-2 md:col-span-3">
                  <Button type="submit" variant="outline">Salvar cargo</Button>
                  <Button formAction={deleteContestRoleAction} type="submit" variant="ghost">Remover</Button>
                </div>
              </form>
            ))}
            <form action={createContestRoleAction} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-4">
              <input name="contest_id" type="hidden" value={contest.id} />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="role_name" placeholder="Novo cargo" required />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="area" placeholder="Área" />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="education_level" placeholder="Escolaridade" />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="salary" placeholder="Salário" type="number" />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="salary_text" placeholder="Texto salário" />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="vacancies" placeholder="Vagas" type="number" />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="workload" placeholder="Carga horária" />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="requirements" placeholder="Requisitos" />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input name="reserve_list" type="checkbox" /> CR
              </label>
              <Button type="submit">Adicionar cargo</Button>
            </form>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-bold">Datas</h2>
          <div className="mt-4 space-y-4">
            {dates.map((date) => (
              <form key={date.id} action={updateContestDateAction} className="grid gap-3 rounded-md border border-border bg-background/45 p-3 md:grid-cols-4">
                <input name="id" type="hidden" value={date.id} />
                <input name="contest_id" type="hidden" value={contest.id} />
                <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={date.event_type} name="event_type">
                  {contestDateEventTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={date.date_start ?? ""} name="date_start" type="date" />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={date.date_end ?? ""} name="date_end" type="date" />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={date.confidence_score} max={100} min={0} name="confidence_score" type="number" />
                <input className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2" defaultValue={date.description ?? ""} name="description" placeholder="Descrição" />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input defaultChecked={date.is_estimated} name="is_estimated" type="checkbox" /> Estimada
                </label>
                <div className="flex gap-2">
                  <Button type="submit" variant="outline">Salvar data</Button>
                  <Button formAction={deleteContestDateAction} type="submit" variant="ghost">Remover</Button>
                </div>
              </form>
            ))}
            <form action={createContestDateAction} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-4">
              <input name="contest_id" type="hidden" value={contest.id} />
              <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="event_type">
                {contestDateEventTypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="date_start" type="date" />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" name="date_end" type="date" />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm" defaultValue={100} max={100} min={0} name="confidence_score" type="number" />
              <input className="rounded-md border border-border bg-background px-3 py-2 text-sm md:col-span-2" name="description" placeholder="Descrição" />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input name="is_estimated" type="checkbox" /> Estimada
              </label>
              <Button type="submit">Adicionar data</Button>
            </form>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
