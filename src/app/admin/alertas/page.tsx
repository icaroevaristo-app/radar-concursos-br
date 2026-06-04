import { ArrowLeft, MessageCircle } from "lucide-react";
import { generateWhatsAppAlertsAction, updateWhatsAppAlertStatusAction } from "@/lib/whatsapp/actions";
import { getAdminWhatsAppAlerts, getWhatsAppContestOptions, getWhatsAppEligiblePreview } from "@/lib/whatsapp/queries";
import { CopyMessageButton } from "@/components/whatsapp/copy-message-button";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AdminWhatsAppAlertsPageProps = {
  searchParams: Promise<{
    contest_id?: string;
    error?: string;
    success?: string;
  }>;
};

function statusVariant(status: string) {
  if (status === "pending") return "amber";
  if (status === "sent") return "success";
  if (status === "failed" || status === "canceled") return "danger";
  return "muted";
}

function formatDate(value: string | null) {
  if (!value) return "não informado";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default async function AdminWhatsAppAlertsPage({ searchParams }: AdminWhatsAppAlertsPageProps) {
  const { contest_id: contestId, error, success } = await searchParams;
  const [{ contests }, { alerts }, preview] = await Promise.all([
    getWhatsAppContestOptions(),
    getAdminWhatsAppAlerts(),
    getWhatsAppEligiblePreview(contestId ?? null),
  ]);

  return (
    <PageShell
      eyebrow="Admin"
      title="Alertas WhatsApp"
      description="Gerencie avisos por WhatsApp para assinantes Premium com consentimento ativo."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{alerts.length} alerta(s) recentes na fila.</p>
        <Button asChild href="/admin" variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          Painel admin
        </Button>
      </div>

      {error ? <Card className="mb-4 border-danger/35 bg-danger/10 p-4 text-sm text-red-100">{error}</Card> : null}
      {success ? <Card className="mb-4 border-success/35 bg-success/10 p-4 text-sm text-green-100">{success}</Card> : null}

      <Card className="mb-5 p-5">
        <div className="flex items-start gap-3">
          <MessageCircle className="mt-1 h-5 w-5 flex-none text-primary" />
          <div className="w-full">
            <h2 className="font-display text-lg font-bold">Gerar alertas a partir de concurso publicado</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              O matching inicial considera Premium/trial ativo, opt-in de WhatsApp, telefone válido e aderência básica por UF.
            </p>

            <form className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]" method="get">
              <label>
                <span className="form-label">Concurso</span>
                <select className="form-control" defaultValue={contestId ?? ""} name="contest_id">
                  <option value="">Selecione um concurso</option>
                  {contests.map((contest) => (
                    <option key={contest.id} value={contest.id}>
                      {contest.title} - {contest.city ?? "não informado"}/{contest.state}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-end">
                <Button type="submit" variant="outline">
                  Ver prévia
                </Button>
              </div>
            </form>

            {preview.contest ? (
              <div className="mt-5 rounded-md border border-border bg-background/45 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="amber">Prévia</Badge>
                  <Badge variant="muted">{preview.eligibleUsers.length} elegível(is)</Badge>
                  <Badge variant="muted">{preview.existingCount} duplicado(s) ignorados</Badge>
                </div>
                <p className="mt-3 font-display font-bold">{preview.contest.title}</p>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  {preview.eligibleUsers.slice(0, 8).map((eligible) => (
                    <div key={eligible.userId} className="premium-panel-subtle p-3">
                      <p className="font-semibold text-foreground">{eligible.name}</p>
                      <p>{eligible.email ?? "sem e-mail"}</p>
                      <p>{eligible.phone}</p>
                    </div>
                  ))}
                  {!preview.eligibleUsers.length ? <p className="empty-state md:col-span-2">Nenhum usuário elegível novo para este concurso.</p> : null}
                </div>
                <form action={generateWhatsAppAlertsAction} className="mt-4">
                  <input name="contest_id" type="hidden" value={preview.contest.id} />
                  <Button disabled={!preview.eligibleUsers.length} type="submit">
                    Gerar alertas
                  </Button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="hidden border-b border-border/70 px-4 py-3 text-xs uppercase tracking-[0.16em] text-muted-foreground xl:grid xl:grid-cols-[10rem_1fr_11rem_9rem_18rem]">
          <span>Status</span>
          <span>Mensagem</span>
          <span>Telefone</span>
          <span>Criado em</span>
          <span>Ações</span>
        </div>
        <div className="divide-y divide-border/70">
          {alerts.map((alert) => (
            <div key={alert.id} className="grid gap-3 px-4 py-4 text-sm xl:grid-cols-[10rem_1fr_11rem_9rem_18rem]">
              <div>
                <Badge variant={statusVariant(alert.status)}>{alert.status}</Badge>
                <p className="mt-2 text-xs text-muted-foreground">{alert.profile?.full_name ?? alert.profile?.email ?? alert.user_id}</p>
              </div>
              <div>
                <p className="font-display font-bold">{alert.contest?.title ?? alert.contest_id}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{alert.message}</p>
                {alert.error_message ? <p className="mt-2 text-xs text-red-200">Erro: {alert.error_message}</p> : null}
              </div>
              <span className="text-muted-foreground">{alert.phone}</span>
              <span className="text-muted-foreground">{formatDate(alert.created_at)}</span>
              <div className="flex flex-wrap gap-2">
                <CopyMessageButton message={alert.message} />
                {alert.whatsappUrl ? (
                  <Button asChild href={alert.whatsappUrl} size="sm" target="_blank" variant="outline">
                    Abrir WhatsApp
                  </Button>
                ) : null}
                {[
                  ["copied", "Copiada"],
                  ["sent", "Enviado"],
                  ["failed", "Falhou"],
                  ["canceled", "Cancelar"],
                ].map(([status, label]) => (
                  <form key={status} action={updateWhatsAppAlertStatusAction}>
                    <input name="id" type="hidden" value={alert.id} />
                    <input name="status" type="hidden" value={status} />
                    <Button size="sm" type="submit" variant="ghost">
                      {label}
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          ))}
          {!alerts.length ? <p className="empty-state m-4">Nenhum alerta na fila ainda.</p> : null}
        </div>
      </Card>
    </PageShell>
  );
}
