import { updateWhatsAppPreferencesAction } from "@/lib/whatsapp/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { UserPreferenceRow } from "@/types/contest";

type WhatsAppPreferencesFormProps = {
  error?: string;
  isPremium: boolean;
  preferences: UserPreferenceRow | null;
  success?: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "não informado";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function WhatsAppPreferencesForm({ error, isPremium, preferences, success }: WhatsAppPreferencesFormProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="amber">Alertas por WhatsApp</Badge>
        <Badge variant={preferences?.whatsapp_opt_in ? "success" : "muted"}>
          {preferences?.whatsapp_opt_in ? "Consentimento ativo" : "Sem opt-in"}
        </Badge>
      </div>

      <h2 className="mt-4 font-display text-xl font-bold">Receba alertas por WhatsApp</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        MVP semi-manual para assinantes Premium. O admin prepara a fila e envia/copía mensagens manualmente, sem WhatsApp
        Cloud API real neste pacote.
      </p>

      {error ? <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">{error}</div> : null}
      {success === "whatsapp_updated" ? (
        <div className="mt-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-green-200">
          Preferências de WhatsApp atualizadas.
        </div>
      ) : null}

      <form action={updateWhatsAppPreferencesAction} className="mt-5 space-y-4">
        <label className="block">
          <span className="form-label">Telefone WhatsApp</span>
          <input
            className="form-control"
            defaultValue={preferences?.whatsapp_phone ?? ""}
            name="whatsapp_phone"
            placeholder="Ex: 62999999999"
            type="tel"
          />
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Use DDD. Se não informar DDI, o Radar considera Brasil (+55).
          </span>
        </label>

        <label className="flex gap-3 rounded-md border border-border bg-background/45 p-3 text-sm leading-6 text-muted-foreground">
          <input className="form-checkbox mt-1" defaultChecked={preferences?.whatsapp_opt_in ?? false} name="whatsapp_opt_in" type="checkbox" />
          <span>
            Aceito receber alertas do Radar Concursos BR por WhatsApp sobre concursos compatíveis com minhas preferências.
          </span>
        </label>

        <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <p>Opt-in em: {formatDate(preferences?.whatsapp_opt_in_at)}</p>
          <p>Opt-out em: {formatDate(preferences?.whatsapp_opt_out_at)}</p>
        </div>

        {!isPremium ? (
          <p className="rounded-md border border-primary/25 bg-primary/10 p-3 text-sm text-amber-50">
            O telefone é opcional para usuários gratuitos. Alertas por WhatsApp entram na fila apenas para Premium ou teste grátis ativo.
          </p>
        ) : null}

        <Button type="submit">Salvar WhatsApp</Button>
      </form>
    </Card>
  );
}
