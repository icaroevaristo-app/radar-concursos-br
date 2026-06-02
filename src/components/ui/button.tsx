import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  asChild?: false;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  formAction?: string | ((formData: FormData) => void | Promise<void>);
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline" | "ghost";
};

type ButtonLinkProps = {
  asChild: true;
  children: React.ReactNode;
  className?: string;
  href: string;
  target?: string;
  variant?: "primary" | "outline" | "ghost";
};

export function Button(props: ButtonProps | ButtonLinkProps) {
  const variant = props.variant ?? "primary";
  const className = cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" && "bg-primary text-primary-foreground hover:bg-amber-400",
    variant === "outline" && "border border-border bg-card/30 text-foreground hover:border-primary/50 hover:text-primary",
    variant === "ghost" && "text-muted-foreground hover:bg-muted hover:text-foreground",
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
