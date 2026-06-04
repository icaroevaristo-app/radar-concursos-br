import type { Database } from "@/lib/supabase/types";

export type WhatsAppAlertRow = Database["public"]["Tables"]["whatsapp_alerts"]["Row"];
export type WhatsAppAlertStatus = WhatsAppAlertRow["status"];
