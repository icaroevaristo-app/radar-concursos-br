import Link from "next/link";
import { signupAction } from "@/lib/auth/actions";
import { PageShell } from "@/components/layout/page-shell";
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
      title="Criar cadastro"
      description="Crie sua conta com dados mínimos. Não coletamos CPF, RG, endereço completo ou documentos pessoais."
    >
      <Card className="max-w-lg p-5">
        {error ? (
          <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form action={signupAction} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Nome completo</span>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary"
              name="full_name"
              required
            />
          </label>
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
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          <label className="flex gap-2 text-sm text-muted-foreground">
            <input className="mt-1 accent-amber-500" name="terms_accepted" required type="checkbox" />
            Aceito os termos de uso.
          </label>
          <label className="flex gap-2 text-sm text-muted-foreground">
            <input className="mt-1 accent-amber-500" name="privacy_accepted" required type="checkbox" />
            Aceito a política de privacidade.
          </label>
          <Button className="w-full" type="submit">
            Criar conta
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link className="font-bold text-primary" href="/login">
            Entrar
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
