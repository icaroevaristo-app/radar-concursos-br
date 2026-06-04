import { AppHeader } from "@/components/layout/app-header";
import { Card } from "@/components/ui/card";

export default function RadarLoading() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="surface-grid border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <div className="h-3 w-24 animate-pulse rounded-full bg-primary/25" />
          <div className="mt-4 h-10 max-w-xl animate-pulse rounded-md bg-muted" />
          <div className="mt-3 h-5 max-w-2xl animate-pulse rounded-md bg-muted/70" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="h-28 animate-pulse p-4">
              <div className="h-3 w-28 rounded-full bg-muted" />
              <div className="mt-4 h-8 w-16 rounded-md bg-muted/80" />
              <div className="mt-3 h-3 w-24 rounded-full bg-muted/60" />
            </Card>
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="h-72 animate-pulse" />
            ))}
          </div>
          <div className="hidden space-y-4 lg:block">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="h-40 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
