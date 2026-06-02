import { PageShell } from "@/components/layout/page-shell";
import { DemoContestCard } from "@/components/contests/demo-contest-card";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";
import { demoContests } from "@/lib/demo-data";

export default function MeusConcursosPage() {
  return (
    <PageShell
      eyebrow="Área do usuário"
      title="Meus concursos"
      description="Placeholder para saved_contests e checklist por usuário."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {demoContests.slice(0, 2).map((contest) => (
            <DemoContestCard key={contest.id} contest={contest} compact />
          ))}
        </div>
        <PlaceholderPanel
          title="Status previstos"
          items={["Salvos", "Inscrição pendente", "Boleto pendente", "Prova próxima", "Encerrados"]}
        />
      </div>
    </PageShell>
  );
}
