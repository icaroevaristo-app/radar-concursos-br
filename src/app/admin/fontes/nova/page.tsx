import { createSourceAction } from "@/lib/admin/actions";
import { sourceStatuses, sourceTypes } from "@/lib/admin/validation";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type NewSourcePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewSourcePage({ searchParams }: NewSourcePageProps) {
  const { error } = await searchParams;

  return (
    <PageShell eyebrow="Admin" title="Nova fonte" description="Cadastro manual. Campos de crawler ficam preparados para futuro, sem execução nesta Sprint.">
      <SourceForm action={createSourceAction} error={error} />
    </PageShell>
  );
}

function SourceForm({ action, error }: { action: (formData: FormData) => Promise<void>; error?: string }) {
  return (
    <Card className="mx-auto max-w-3xl p-6 shadow-glow">
      {error ? <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{error}</p> : null}
      <form action={action} className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="form-label">Nome</span>
          <input className="form-control" name="name" required />
        </label>
        <label className="block">
          <span className="form-label">Tipo</span>
          <select className="form-control" name="type" required>
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="form-label">URL base</span>
          <input className="form-control" name="base_url" required type="url" />
        </label>
        <label className="block">
          <span className="form-label">Cidade</span>
          <input className="form-control" name="city" />
        </label>
        <label className="block">
          <span className="form-label">UF</span>
          <input className="form-control" maxLength={2} name="state" />
        </label>
        <label className="block">
          <span className="form-label">Confiabilidade</span>
          <input className="form-control" defaultValue={50} max={100} min={0} name="reliability_score" type="number" />
        </label>
        <label className="block">
          <span className="form-label">Status</span>
          <select className="form-control" name="status">
            {sourceStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="form-label">Frequência crawler futura</span>
          <input className="form-control" name="crawl_frequency" placeholder="Não executa crawler agora" />
        </label>
        <label className="block">
          <span className="form-label">Estratégia crawler futura</span>
          <input className="form-control" name="crawler_strategy" placeholder="Preparado para sprint futura" />
        </label>
        <label className="block md:col-span-2">
          <span className="form-label">Notas</span>
          <textarea className="form-control min-h-24" name="notes" />
        </label>
        <div className="md:col-span-2">
          <Button type="submit">Criar fonte</Button>
        </div>
      </form>
    </Card>
  );
}
