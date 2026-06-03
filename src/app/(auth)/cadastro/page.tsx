import Link from "next/link";
import { UserPlus } from "lucide-react";
import { signupAction } from "@/lib/auth/actions";
import { TrackEventOnMount } from "@/components/analytics/track-event";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CadastroPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function CadastroPage({ searchParams }: CadastroPageProps) {
  const { error } = await searchParams;

  return (
    <PageShell
      eyebrow="Conta"
      title="Crie sua conta"
      description="Use dados mínimos para começar. Não coletamos CPF, RG, endereço completo ou documentos pessoais."
    >
      <TrackEventOnMount event="signup_started" metadata={{ source: "cadastro_page" }} />
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6 shadow-glow">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Cadastro</h2>
              <p className="text-sm text-muted-foreground">Depois você configura suas preferências.</p>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <form action={signupAction} className="space-y-4">
            <label className="block">
              <span className="form-label">Nome completo</span>
              <input className="form-control" name="full_name" required />
            </label>
            <label className="block">
              <span className="form-label">E-mail</span>
              <input className="form-control" name="email" required type="email" />
            </label>
            <label className="block">
              <span className="form-label">Senha</span>
              <input className="form-control" minLength={8} name="password" required type="password" />
            </label>
            <label className="flex gap-3 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground">
              <input className="form-checkbox" name="terms_accepted" required type="checkbox" />
              <span>
                Declaro que li e aceito os{" "}
                <Link className="font-bold text-primary hover:text-amber-300" href="/termos" target="_blank">
                  Termos de Uso
                </Link>
                .
              </span>
            </label>
            <label className="flex gap-3 rounded-md border border-border bg-background/45 p-3 text-sm text-muted-foreground">
              <input className="form-checkbox" name="privacy_accepted" required type="checkbox" />
              <span>
                Declaro que li e aceito a{" "}
                <Link className="font-bold text-primary hover:text-amber-300" href="/privacidade" target="_blank">
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>
            <Button className="w-full" type="submit">
              Criar conta
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link className="font-bold text-primary hover:text-amber-300" href="/login">
              Entrar
            </Link>
          </p>
        </Card>

        <Card className="p-6">
          <Badge variant="amber">Sprint 1</Badge>
          <h2 className="mt-4 font-display text-2xl font-black">Cadastro sem excesso de dados</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A conta cria um usuário real no Supabase Auth e persiste o profile no servidor. A senha nunca é armazenada
            manualmente pela aplicação.
          </p>
          <div className="mt-6 grid gap-3 text-sm">
            {["Auth real", "Aceites salvos no profile", "Onboarding obrigatório", "Admin separado por tabela"].map((item) => (
              <div key={item} className="premium-panel-subtle px-3 py-2 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
