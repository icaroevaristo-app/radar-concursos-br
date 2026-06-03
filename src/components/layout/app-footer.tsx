import Link from "next/link";

const footerLinks = [
  { href: "/concursos", label: "Concursos" },
  { href: "/termos", label: "Termos de Uso" },
  { href: "/privacidade", label: "Privacidade" },
];

export function AppFooter() {
  return (
    <footer className="border-t border-border/70 bg-background/75">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display font-bold text-foreground">
            Radar <span className="text-primary">Concursos</span> BR
          </p>
          <p className="mt-1 max-w-2xl leading-6">
            Plataforma informativa independente. Não somos site oficial do governo; confirme sempre as informações na
            fonte oficial antes da inscrição.
          </p>
        </div>
        <nav className="flex flex-wrap gap-3">
          {footerLinks.map((link) => (
            <Link key={link.href} className="font-semibold transition hover:text-primary" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
