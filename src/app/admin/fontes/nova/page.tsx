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
    <PageShell eyebrow="Admin" title="Nova fonte" description="Cadastro manual. Campos de crawler ficam preparados para futuro.">
      <SourceForm action={createSourceAction} error={error} />
    </PageShell>
  );
}

function SourceForm({ action, error }: { action: (formData: FormData) => Promise<void>; error?: string }) {
  return (
    <Card className="max-w-3xl p-5">
      {error ? <p className="mb-4 rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-red-200">{error}</p> : null}
      <form action={action} className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">Nome</span>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="name" required />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">Tipo</span>
          <select className="w-full rounded-md border border-border bg-background px-3 py-2" name="type" required>
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1.5 block text-muted-foreground">URL base</span>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="base_url" required type="url" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">Cidade</span>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="city" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">UF</span>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" maxLength={2} name="state" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">Confiabilidade</span>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" defaultValue={50} max={100} min={0} name="reliability_score" type="number" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">Status</span>
          <select className="w-full rounded-md border border-border bg-background px-3 py-2" name="status">
            {sourceStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">Frequência crawler futura</span>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="crawl_frequency" placeholder="Não executa crawler agora" />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-muted-foreground">Estratégia crawler futura</span>
          <input className="w-full rounded-md border border-border bg-background px-3 py-2" name="crawler_strategy" placeholder="Preparado para sprint futura" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="mb-1.5 block text-muted-foreground">Notas</span>
          <textarea className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2" name="notes" />
        </label>
        <div className="md:col-span-2">
          <Button type="submit">Criar fonte</Button>
        </div>
      </form>
    </Card>
  );
}
