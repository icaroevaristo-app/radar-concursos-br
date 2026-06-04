import { describe, expect, it } from "vitest";
import { createWhatsAppLink, isLikelyValidWhatsAppPhone, normalizeWhatsAppPhone } from "@/lib/whatsapp/helpers";

describe("whatsapp helpers", () => {
  it("normalizes Brazilian phone without country code", () => {
    expect(normalizeWhatsAppPhone("(62) 99999-9999")).toBe("5562999999999");
  });

  it("keeps Brazilian phone with country code", () => {
    expect(normalizeWhatsAppPhone("+55 62 99999-9999")).toBe("5562999999999");
  });

  it("validates likely Brazilian WhatsApp phone", () => {
    expect(isLikelyValidWhatsAppPhone("62999999999")).toBe(true);
    expect(isLikelyValidWhatsAppPhone("123")).toBe(false);
  });

  it("creates wa.me link with encoded message", () => {
    const link = createWhatsAppLink("62999999999", "Olá, teste!");

    expect(link).toBe("https://wa.me/5562999999999?text=Ol%C3%A1%2C%20teste!");
  });
});
