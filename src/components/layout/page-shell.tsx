import { AppHeader } from "@/components/layout/app-header";
import { NonOfficialNotice } from "@/components/shared/non-official-notice";

type PageShellProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
};

export function PageShell({ title, eyebrow, description, children }: PageShellProps) {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="surface-grid border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          {eyebrow ? (
            <p className="section-kicker mb-2">{eyebrow}</p>
          ) : null}
          <h1 className="max-w-4xl font-display text-3xl font-black tracking-tight md:text-5xl">{title}</h1>
          {description ? <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">{description}</p> : null}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        {children}
        <NonOfficialNotice className="mt-10" />
      </section>
    </main>
  );
}
