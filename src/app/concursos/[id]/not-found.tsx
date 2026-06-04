import { Search } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ContestDetailsNotFound() {
  return (
    <PageShell
      eyebrow="Concurso"
      title="Concurso não encontrado"
      description="O concurso pode não existir, ainda não estar publicado ou ter sido removido da listagem pública."
    >
      <Card className="mx-auto max-w-2xl p-6 text-center">
        <Search className="mx-auto h-9 w-9 text-primary" />
        <h2 className="mt-4 font-display text-xl font-bold">Não encontramos esse concurso publicado.</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Confira se o link está correto ou volte para a lista pública para encontrar outras oportunidades.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild href="/concursos">
            Ver concursos
          </Button>
          <Button asChild href="/cadastro" variant="outline">
            Criar alerta gratuito
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}
