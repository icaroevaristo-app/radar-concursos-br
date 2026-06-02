import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <PageShell
      eyebrow="Autenticação"
      title="Entrar"
      description="Placeholder do fluxo de login. A integração real usará Supabase Auth."
    >
      <Card className="max-w-md p-5">
        <form className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">E-mail</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary" type="email" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Senha</span>
            <input className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:border-primary" type="password" />
          </label>
          <Button className="w-full" type="button">
            Entrar com Supabase Auth
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
