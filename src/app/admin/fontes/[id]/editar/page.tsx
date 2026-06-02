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
      <Card className="max-w-3xl p-5">
        {error ? <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{error}</p> : null}
        <form action={updateSourceAction} className="grid gap-4 md:grid-cols-2">
          <input name="id" type="hidden" value={source.id} />
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Nome</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.name} name="name" required />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Tipo</span>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.type} name="type" required>
              {sourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1.5 block text-muted-foreground">URL base</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.base_url} name="base_url" required type="url" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Cidade</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.city ?? ""} name="city" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">UF</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.state ?? ""} maxLength={2} name="state" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Confiabilidade</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.reliability_score} max={100} min={0} name="reliability_score" type="number" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Status</span>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.status} name="status">
              {sourceStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Frequência crawler futura</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.crawl_frequency ?? ""} name="crawl_frequency" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Estratégia crawler futura</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.crawler_strategy ?? ""} name="crawler_strategy" />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1.5 block text-muted-foreground">Notas</span>
            <textarea className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={source.notes ?? ""} name="notes" />
          </label>
          <div className="md:col-span-2">
            <Button type="submit">Salvar fonte</Button>
          </div>
        </form>
      </Card>
    </PageShell>
  );
}
