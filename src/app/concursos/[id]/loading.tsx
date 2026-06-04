import { AppHeader } from "@/components/layout/app-header";
import { Card } from "@/components/ui/card";

export default function ContestDetailsLoading() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="surface-grid border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
          <div className="h-3 w-36 animate-pulse rounded-full bg-primary/25" />
          <div className="mt-4 h-10 max-w-3xl animate-pulse rounded-md bg-muted" />
          <div className="mt-3 h-5 max-w-2xl animate-pulse rounded-md bg-muted/70" />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-8">
        <Card className="mb-6 h-52 animate-pulse shadow-glow" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <Card className="h-64 animate-pulse" />
            <Card className="h-80 animate-pulse" />
            <Card className="h-72 animate-pulse" />
          </div>
          <div className="hidden space-y-4 lg:block">
            <Card className="h-48 animate-pulse" />
            <Card className="h-44 animate-pulse" />
            <Card className="h-48 animate-pulse" />
          </div>
        </div>
      </section>
    </main>
  );
}
