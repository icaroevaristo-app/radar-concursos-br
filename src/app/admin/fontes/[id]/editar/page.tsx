import { notFound } from "next/navigation";
import { updateSourceAction } from "@/lib/admin/actions";
import { getAdminSourceById } from "@/lib/admin/queries";
import { sourceStatuses, sourceTypes } from "@/lib/admin/validation";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EditSourcePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditSourcePage({ params, searchParams }: EditSourcePageProps) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const source = await getAdminSourceById(id);

  if (!source) notFound();

  return (
    <PageShell eyebrow="Admin" title={`Editar fonte: ${source.name}`} description="Crawler e IA permanecem fora do escopo desta Sprint 1.">
      <Card className="mx-auto max-w-3xl p-6 shadow-glow">
        {error ? <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{error}</p> : null}
        <form action={updateSourceAction} className="grid gap-4 md:grid-cols-2">
          <input name="id" type="hidden" value={source.id} />
          <label className="block">
            <span className="form-label">Nome</span>
            <input className="form-control" defaultValue={source.name} name="name" required />
          </label>
          <label className="block">
            <span className="form-label">Tipo</span>
            <select className="form-control" defaultValue={source.type} name="type" required>
              {sourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="form-label">URL base</span>
            <input className="form-control" defaultValue={source.base_url} name="base_url" required type="url" />
          </label>
          <label className="block">
            <span className="form-label">Cidade</span>
            <input className="form-control" defaultValue={source.city ?? ""} name="city" />
          </label>
          <label className="block">
            <span className="form-label">UF</span>
            <input className="form-control" defaultValue={source.state ?? ""} maxLength={2} name="state" />
          </label>
          <label className="block">
            <span className="form-label">Confiabilidade</span>
            <input className="form-control" defaultValue={source.reliability_score} max={100} min={0} name="reliability_score" type="number" />
          </label>
          <label className="block">
            <span className="form-label">Status</span>
            <select className="form-control" defaultValue={source.status} name="status">
              {sourceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="form-label">Frequência crawler futura</span>
            <input className="form-control" defaultValue={source.crawl_frequency ?? ""} name="crawl_frequency" />
          </label>
          <label className="block">
            <span className="form-label">Estratégia crawler futura</span>
            <input className="form-control" defaultValue={source.crawler_strategy ?? ""} name="crawler_strategy" />
          </label>
          <label className="block md:col-span-2">
            <span className="form-label">Notas</span>
            <textarea className="form-control min-h-24" defaultValue={source.notes ?? ""} name="notes" />
          </label>
          <div className="md:col-span-2">
            <Button type="submit">Salvar fonte</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
