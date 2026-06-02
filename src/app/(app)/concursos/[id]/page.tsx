import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoContests } from "@/lib/demo-data";

type ContestDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ContestDetailsPage({ params }: ContestDetailsPageProps) {
  const { id } = await params;
  const contest = demoContests.find((item) => item.id === id) ?? demoContests[0];

  return (
    <PageShell
      eyebrow="Detalhes do concurso"
      title={contest.title}
      description="Detalhe placeholder com campos obrigatórios da Sprint 1. Informações demo devem ser conferidas no edital oficial."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Card className="p-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="amber">Seed/demo</Badge>
            <Badge variant="success">{contest.matchScore}% match</Badge>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Órgão", contest.organization],
              ["Cidade/UF", `${contest.city}/${contest.state}`],
              ["Banca", "não informado"],
              ["Escolaridade", contest.educationLevel],
              ["Salário", contest.salaryText],
              ["Vagas", "não informado"],
              ["Taxa", "não informado"],
              ["Inscrição", contest.registrationEndLabel],
              ["Data da prova", "não informado"],
              ["Motivo do match", contest.matchReason],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-border bg-background/45 p-3">
                <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="h-fit p-5">
          <h2 className="font-display text-lg font-bold">Ações</h2>
          <div className="mt-4 space-y-3">
            <Button className="w-full" type="button">
              Salvar concurso
            </Button>
            <Button asChild className="w-full" href={contest.officialUrl} variant="outline">
              Link oficial <ExternalLink className="h-4 w-4" />
            </Button>
            <Link className="block text-center text-sm font-bold text-primary" href="/meus-concursos">
              Ver meus concursos
            </Link>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
