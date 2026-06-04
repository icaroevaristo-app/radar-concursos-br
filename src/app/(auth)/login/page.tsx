import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;

  return (
    <PageShell
      eyebrow="Autenticação"
      title="Entre no seu Radar"
      description="Acesse com e-mail e senha pelo Supabase Auth. Usuários sem onboarding completo serão enviados para preferências."
    >
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <Badge variant="amber">Acesso seguro</Badge>
          <h2 className="mt-4 font-display text-2xl font-black">Sessão protegida</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            O app usa sessão Supabase com cookies no App Router. Rotas como Radar, Meus Concursos e Admin continuam protegidas.
          </p>
          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-amber-50">
            O Radar é independente e sempre orienta a conferência na fonte oficial.
          </div>
        </Card>

        <Card className="p-6 shadow-glow">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Login</h2>
              <p className="text-sm text-muted-foreground">Informe suas credenciais.</p>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <form action="/auth/login" className="space-y-4" method="post">
            {next ? <input name="next" type="hidden" value={next} /> : null}
            <label className="block">
              <span className="form-label">E-mail</span>
              <input className="form-control" name="email" required type="email" />
            </label>
            <label className="block">
              <span className="form-label">Senha</span>
              <input className="form-control" name="password" required type="password" />
            </label>
            <Button className="w-full" type="submit">
              Entrar
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link className="font-bold text-primary hover:text-amber-300" href="/cadastro">
              Criar cadastro
            </Link>
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
