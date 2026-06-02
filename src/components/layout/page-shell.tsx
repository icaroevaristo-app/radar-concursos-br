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
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          {eyebrow ? (
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="font-display text-3xl font-black md:text-4xl">{title}</h1>
          {description ? <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p> : null}
        </div>
        {children}
        <NonOfficialNotice className="mt-10" />
      </section>
    </main>
  );
}
