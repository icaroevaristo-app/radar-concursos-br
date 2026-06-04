import Link from "next/link";
import { getCurrentAdminUser, getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const publicNavItems = [{ href: "/concursos", label: "Concursos" }];

const authenticatedNavItems = [
  { href: "/radar", label: "Radar" },
  { href: "/preferencias", label: "Preferências" },
  { href: "/meus-concursos", label: "Meus concursos" },
];

export async function AppHeader() {
  const user = await getCurrentUser();
  const [profile, adminUser] = user ? await Promise.all([getCurrentProfile(), getCurrentAdminUser()]) : [null, null];
  const displayName = profile?.full_name ?? user?.email ?? null;
  const navItems = [
    ...publicNavItems,
    ...(user ? authenticatedNavItems : []),
    ...(adminUser ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/86 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link className="group flex items-center gap-2" href="/">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/35 bg-primary/10 font-display text-sm font-black text-primary transition group-hover:border-primary/60">
            R
          </span>
          <span className="font-display text-lg font-black tracking-tight text-foreground">
            Radar <span className="text-primary">Concursos</span>
          </span>
        </Link>
        <nav className="order-3 flex w-full items-center gap-2 overflow-x-auto text-sm text-muted-foreground md:order-2 md:w-auto md:gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-border hover:bg-muted/60 hover:text-foreground"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="order-2 flex items-center gap-2 md:order-3">
          {user ? (
            <>
              <Badge className="hidden max-w-52 truncate sm:inline-flex" variant="muted">
                {displayName}
              </Badge>
              <form action="/logout" method="post">
                <Button size="sm" type="submit" variant="ghost">
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild href="/login" size="sm" variant="ghost">
                Entrar
              </Button>
              <Button asChild href="/cadastro" size="sm">
                Criar meu Radar
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
