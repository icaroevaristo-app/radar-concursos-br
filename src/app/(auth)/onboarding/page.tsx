import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const areas = ["Administrativo", "Saúde", "Educação", "Fiscal", "Guarda municipal", "Técnico"];

export default function OnboardingPage() {
  return (
    <PageShell
      eyebrow="Preferências"
      title="Onboarding"
      description="Placeholder para salvar preferências do usuário em user_preferences no Supabase."
    >
      <Card className="max-w-3xl p-5">
        <div className="mb-6 flex flex-wrap gap-2">
          {["Local", "Perfil", "Interesses", "Alertas"].map((step, index) => (
            <Badge key={step} variant={index === 0 ? "amber" : "muted"}>
              {index + 1}. {step}
            </Badge>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm md:col-span-2">
            <span className="mb-1.5 block text-muted-foreground">Cidade</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary" placeholder="Ex: Goiânia" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">UF</span>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary" defaultValue="GO">
              {["GO", "SP", "MG", "RJ", "BA", "PR", "RS", "PE", "CE", "DF"].map((uf) => (
                <option key={uf}>{uf}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Raio</span>
            <input className="w-full accent-amber-500" max="500" min="20" step="10" type="range" />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1.5 block text-muted-foreground">Escolaridade</span>
            <select className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary">
              <option>Ensino médio</option>
              <option>Técnico</option>
              <option>Superior</option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm text-muted-foreground">Áreas de interesse</p>
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <Badge key={area} variant="muted">
                {area}
              </Badge>
            ))}
          </div>
        </div>

        <Button asChild className="mt-8" href="/radar">
          Ver meu Radar
        </Button>
      </Card>
    </PageShell>
  );
}
