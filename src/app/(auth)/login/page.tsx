import Link from "next/link";
import { loginAction } from "@/lib/auth/actions";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <PageShell
      eyebrow="Autenticação"
      title="Entrar"
      description="Entre com seu e-mail e senha usando Supabase Auth."
    >
      <Card className="max-w-md p-5">
        {error ? (
          <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form action={loginAction} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">E-mail</span>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Senha</span>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
              name="password"
              required
              type="password"
            />
          </label>
          <Button className="w-full" type="submit">
            Entrar
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link className="font-bold text-primary" href="/cadastro">
            Criar cadastro
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
