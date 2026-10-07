import { describe, expect, it } from "vitest";
import { instagramUrl, normalizeInstagram } from "./instagram";

describe("Instagram", () => {
  it("aceita usuário com ou sem arroba", () => {
    expect(normalizeInstagram("spcasting")).toBe("@spcasting");
    expect(normalizeInstagram("@spcasting")).toBe("@spcasting");
  });

  it("aceita link e cria URL navegável", () => {
    expect(normalizeInstagram("https://instagram.com/sp.casting/"))
      .toBe("@sp.casting");
    expect(instagramUrl("@sp.casting"))
      .toBe("https://www.instagram.com/sp.casting/");
  });

  it("rejeita usuário inválido", () => {
    expect(() => normalizeInstagram("nome com espaço")).toThrow();
  });
});
