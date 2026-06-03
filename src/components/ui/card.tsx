import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-card/90 shadow-soft backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
