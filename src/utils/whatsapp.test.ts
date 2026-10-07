import { describe, expect, it } from "vitest";
import { createWhatsAppLink } from "./whatsapp";

describe("createWhatsAppLink", () => {
  it("normaliza um telefone brasileiro e inclui a mensagem da vaga", () => {
    const link = createWhatsAppLink(
      "(11) 99999-8888",
      "Ana",
      "Lançamento",
    );

    expect(link).toContain("https://wa.me/5511999998888");
    expect(decodeURIComponent(link)).toContain(
      "Olá, Ana! Tudo bem? Aqui é da SPCasting.",
    );
    expect(decodeURIComponent(link)).toContain("vaga Lançamento");
  });

  it("não duplica o código do Brasil", () => {
    expect(createWhatsAppLink("+55 11 99999-8888", "Ana", "Evento")).toContain(
      "wa.me/5511999998888",
    );
  });
});
