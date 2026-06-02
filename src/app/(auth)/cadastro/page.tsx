import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CadastroPage() {
  return (
    <PageShell
      eyebrow="Conta"
      title="Criar cadastro"
      description="Fluxo visual inicial para nome, e-mail, senha e consentimentos. Não coleta CPF, RG ou endereço completo."
    >
      <Card className="max-w-lg p-5">
        <form className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Nome</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">E-mail</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary" type="email" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Senha</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary" type="password" />
          </label>
          <label className="flex gap-2 text-sm text-muted-foreground">
            <input className="mt-1 accent-amber-500" type="checkbox" />
            Aceito os termos de uso e a política de privacidade.
          </label>
          <Button asChild className="w-full" href="/onboarding">
            Continuar para preferências
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
