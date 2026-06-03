import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "amber" | "success" | "danger" | "muted" | "info";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
        variant === "default" && "border-border bg-muted text-muted-foreground",
        variant === "amber" && "border-primary/30 bg-primary/10 text-primary",
        variant === "success" && "border-success/30 bg-success/10 text-success",
        variant === "danger" && "border-danger/30 bg-danger/10 text-danger",
        variant === "muted" && "border-border/70 bg-card/80 text-muted-foreground",
        variant === "info" && "border-sky-400/30 bg-sky-400/10 text-sky-200",
        className,
      )}
      {...props}
    />
  );
}
