import { createContestAction } from "@/lib/admin/actions";
import { getSourceOptions } from "@/lib/admin/queries";
import { contestSpheres, contestStatuses, publicationStatuses } from "@/lib/admin/validation";
import { PageShell } from "@/components/layout/page-shell";
import { NonOfficialNotice } from "@/components/shared/non-official-notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type NewContestPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewContestPage({ searchParams }: NewContestPageProps) {
  const [{ error }, sources] = await Promise.all([searchParams, getSourceOptions()]);

  return (
    <PageShell eyebrow="Admin" title="Novo concurso" description="Cadastro manual. Dados publicados ficam visíveis para usuários no Radar.">
      <div className="mx-auto max-w-4xl space-y-4">
        <NonOfficialNotice />
        <Card className="p-6 shadow-glow">
          {error ? <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{error}</p> : null}
          <form action={createContestAction} className="grid gap-4 md:grid-cols-2">
            <ContestFields sources={sources} />
            <div className="md:col-span-2">
              <Button type="submit">Criar concurso</Button>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}

function ContestFields({ sources }: { sources: Awaited<ReturnType<typeof getSourceOptions>> }) {
  return (
    <>
      <label className="block md:col-span-2">
        <span className="form-label">Título</span>
        <input className="form-control" name="title" required />
      </label>
      <label className="block md:col-span-2">
        <span className="form-label">Órgão/organização</span>
        <input className="form-control" name="organization" required />
      </label>
      <label className="block">
        <span className="form-label">Esfera</span>
        <select className="form-control" name="sphere">
          {contestSpheres.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="form-label">Status</span>
        <select className="form-control" name="status">
          {contestStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="form-label">Cidade</span>
        <input className="form-control" name="city" />
      </label>
      <label className="block">
        <span className="form-label">UF</span>
        <input className="form-control" maxLength={2} name="state" required />
      </label>
      <label className="block">
        <span className="form-label">Latitude</span>
        <input className="form-control" name="latitude" step="any" type="number" />
      </label>
      <label className="block">
        <span className="form-label">Longitude</span>
        <input className="form-control" name="longitude" step="any" type="number" />
      </label>
      <label className="block">
        <span className="form-label">Banca</span>
        <input className="form-control" name="board" />
      </label>
      <label className="block">
        <span className="form-label">Fonte</span>
        <select className="form-control" name="source_id">
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
        <input className="form-control" name="official_url" type="url" />
      </label>
      <label className="block">
        <span className="form-label">Confiança</span>
        <input className="form-control" defaultValue={100} max={100} min={0} name="confidence_score" type="number" />
      </label>
      <label className="block">
        <span className="form-label">Publicação</span>
        <select className="form-control" defaultValue="draft" name="publication_status">
          {publicationStatuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="block md:col-span-2">
        <span className="form-label">Resumo</span>
        <textarea className="form-control min-h-24" name="summary" />
      </label>
      <label className="block">
        <span className="form-label">URL do documento</span>
        <input className="form-control" name="document_url" type="url" />
      </label>
      <label className="block">
        <span className="form-label">Storage path futuro</span>
        <input className="form-control" name="document_storage_path" />
      </label>
      <label className="flex gap-3 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground md:col-span-2">
        <input className="form-checkbox" name="is_demo" type="checkbox" />
        <span>Marcar como demonstração</span>
      </label>
    </>
  );
}
