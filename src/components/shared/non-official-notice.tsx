import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const NON_OFFICIAL_NOTICE =
  "O Radar Concursos BR não é órgão público, não representa prefeituras, bancas ou governos. As informações são organizadas a partir de fontes públicas e podem conter erros. Antes de tomar qualquer decisão, consulte sempre o edital oficial e o site da banca/órgão responsável.";

export function NonOfficialNotice({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "rounded-lg border border-primary/25 bg-gradient-to-br from-primary/12 to-primary/5 p-4 text-sm text-amber-50 shadow-soft",
        className,
      )}
    >
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 flex-none text-primary" />
        <p className="leading-6">{NON_OFFICIAL_NOTICE}</p>
      </div>
    </aside>
  );
}
