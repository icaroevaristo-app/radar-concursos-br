import { PageShell } from "@/components/layout/page-shell";
import { DemoContestCard } from "@/components/contests/demo-contest-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { demoContests } from "@/lib/demo-data";

export default function RadarPage() {
  return (
    <PageShell
      eyebrow="Radar"
      title="Concursos compatíveis"
      description="Lista visual da Sprint 1 usando seed/demo. A busca hardcoded do protótipo deve ser substituída por consultas no Supabase."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {["Compatíveis", "Novos", "Inscrições encerrando", "Perto de você", "Salvos"].map((filter, index) => (
          <Badge key={filter} variant={index === 0 ? "amber" : "muted"}>
            {filter}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          {demoContests.map((contest) => (
            <DemoContestCard key={contest.id} contest={contest} />
          ))}
        </div>
        <Card className="h-fit p-5">
          <h2 className="font-display text-lg font-bold">Base de dados</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Próxima implementação: ler contests, contest_roles, contest_dates e saved_contests no Supabase com filtros por preferência.
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
