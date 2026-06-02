import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { demoContests } from "@/lib/demo-data";

export default function AdminConcursosPage() {
  return (
    <PageShell
      eyebrow="Admin"
      title="Concursos"
      description="Placeholder do admin de concursos para revisão, publicação e despublicação com permissões admin."
    >
      <Card className="divide-y divide-border overflow-hidden">
        {demoContests.map((contest) => (
          <div key={contest.id} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1fr_9rem_8rem_7rem]">
            <div>
              <p className="font-display font-bold">{contest.title}</p>
              <p className="mt-1 text-muted-foreground">{contest.organization}</p>
            </div>
            <span className="text-muted-foreground">{contest.city}/{contest.state}</span>
            <Badge variant="amber">Seed/demo</Badge>
            <Link className="font-bold text-primary" href={`/concursos/${contest.id}`}>
              Detalhes
            </Link>
          </div>
        ))}
      </Card>
    </PageShell>
  );
}
