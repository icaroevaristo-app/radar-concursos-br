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
      <Card className="mb-4 p-5">
        <NonOfficialNotice />
      </Card>
      <Card className="p-5">
        {error ? <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{error}</p> : null}
        <form action={createContestAction} className="grid gap-4 md:grid-cols-2">
          <ContestFields sources={sources} />
          <div className="md:col-span-2">
            <Button type="submit">Criar concurso</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}

function ContestFields({ sources }: { sources: Awaited<ReturnType<typeof getSourceOptions>> }) {
  return (
    <>
      <label className="block text-sm md:col-span-2">
        <span className="mb-1.5 block text-muted-foreground">Título</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="title" required />
      </label>
      <label className="block text-sm md:col-span-2">
        <span className="mb-1.5 block text-muted-foreground">Órgão/organização</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="organization" required />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Esfera</span>
        <select className="w-full rounded-md border border-border bg-background px-3 py-2" name="sphere">
          {contestSpheres.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Status</span>
        <select className="w-full rounded-md border border-border bg-background px-3 py-2" name="status">
          {contestStatuses.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Cidade</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="city" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">UF</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" maxLength={2} name="state" required />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Latitude</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="latitude" type="number" step="any" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Longitude</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="longitude" type="number" step="any" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Banca</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="board" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Fonte</span>
        <select className="w-full rounded-md border border-border bg-background px-3 py-2" name="source_id">
          <option value="">não informado</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>{source.name}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm md:col-span-2">
        <span className="mb-1.5 block text-muted-foreground">Link oficial</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="official_url" type="url" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Confiança</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={100} max={100} min={0} name="confidence_score" type="number" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Publicação</span>
        <select className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue="draft" name="publication_status">
          {publicationStatuses.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm md:col-span-2">
        <span className="mb-1.5 block text-muted-foreground">Resumo</span>
        <textarea className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2" name="summary" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">URL do documento</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="document_url" type="url" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-muted-foreground">Storage path futuro</span>
        <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="document_storage_path" />
      </label>
      <label className="flex gap-2 text-sm text-muted-foreground md:col-span-2">
        <input className="mt-1 accent-amber-500" name="is_demo" type="checkbox" />
        Marcar como demonstração
      </label>
    </>
  );
}
