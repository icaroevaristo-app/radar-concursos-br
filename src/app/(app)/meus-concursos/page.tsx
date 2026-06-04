import { BookmarkCheck } from "lucide-react";
import { getCurrentUserPreferences, getSavedContestsForUser } from "@/lib/contests/queries";
import { calculateContestMatch } from "@/lib/contests/match";
import { PageShell } from "@/components/layout/page-shell";
import { ContestCard } from "@/components/contests/contest-card";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function MeusConcursosPage() {
  const { user, profile, preferences } = await getCurrentUserPreferences();
  const { savedContests, error } = await getSavedContestsForUser(user.id);

  return (
    <PageShell
      eyebrow="Área do usuário"
      title="Meus concursos"
      description="Acompanhe em um só lugar os concursos que você salvou para consultar depois."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          {error ? (
            <Card className="p-5">
              <h2 className="font-display text-lg font-bold">Erro ao carregar salvos</h2>
              <p className="mt-2 text-sm text-muted-foreground">Tente novamente em instantes.</p>
            </Card>
          ) : null}

          {!error && !savedContests.length ? (
            <div className="empty-state">
              <BookmarkCheck className="h-6 w-6 text-primary" />
              <h2 className="mt-3 font-display text-lg font-bold text-foreground">Nenhum concurso salvo</h2>
              <p className="mt-2">Use o botão Salvar nos cards do Radar ou na tela de detalhes para montar sua lista.</p>
              <Button asChild className="mt-4" href="/radar">
                Ir para o Radar
              </Button>
            </div>
          ) : null}

          {savedContests.map((saved) => (
            <ContestCard
              key={saved.id}
              compact
              contest={saved.contest}
              isSaved
              match={calculateContestMatch(saved.contest, preferences, profile)}
            />
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
