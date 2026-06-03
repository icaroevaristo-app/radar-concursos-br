import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  asChild?: false;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline" | "ghost" | "danger";
};

type ButtonLinkProps = {
  asChild: true;
  children: React.ReactNode;
  className?: string;
  href: string;
  size?: "sm" | "md" | "lg";
  target?: string;
  variant?: "primary" | "outline" | "ghost" | "danger";
};

export function Button(props: ButtonProps | ButtonLinkProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const className = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-bold transition focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:pointer-events-none disabled:opacity-50",
    size === "sm" && "h-8 px-3 text-xs",
    size === "md" && "h-10 px-4 text-sm",
    size === "lg" && "h-12 px-5 text-base",
    variant === "primary" && "bg-primary text-primary-foreground shadow-[0_12px_30px_rgb(245_158_11_/_0.18)] hover:bg-amber-400",
    variant === "outline" && "border border-border bg-card/50 text-foreground hover:border-primary/55 hover:bg-primary/5 hover:text-primary",
    variant === "ghost" && "text-muted-foreground hover:bg-muted hover:text-foreground",
    variant === "danger" && "border border-danger/35 bg-danger/10 text-red-200 hover:bg-danger/20",
    props.className,
  );

  if (props.asChild) {
    return (
      <Link className={className} href={props.href} target={props.target}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      className={className}
      disabled={props.disabled}
      formAction={props.formAction}
      onClick={props.onClick}
      type={props.type}
    >
      {props.children}
    </button>
  );
}
