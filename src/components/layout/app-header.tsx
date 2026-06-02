import Link from "next/link";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/radar", label: "Radar" },
  { href: "/meus-concursos", label: "Meus concursos" },
  { href: "/admin", label: "Admin" },
];

export async function AppHeader() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const displayName = profile?.full_name ?? user?.email ?? null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link className="font-display text-lg font-black tracking-tight text-primary" href="/">
          RADAR
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link key={item.href} className="hover:text-foreground" href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden max-w-48 truncate text-xs text-muted-foreground sm:block">{displayName}</span>
              <Button asChild href="/logout" variant="ghost">
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button asChild href="/login" variant="ghost">
                Entrar
              </Button>
              <Button asChild href="/cadastro">
                Cadastro
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
