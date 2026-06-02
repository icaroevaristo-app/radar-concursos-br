import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "amber" | "success" | "danger" | "muted";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variant === "default" && "border-border bg-muted text-muted-foreground",
        variant === "amber" && "border-primary/30 bg-primary/10 text-primary",
        variant === "success" && "border-success/30 bg-success/10 text-success",
        variant === "danger" && "border-danger/30 bg-danger/10 text-danger",
        variant === "muted" && "border-border/70 bg-card text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
