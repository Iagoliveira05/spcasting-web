import { describe, expect, it } from "vitest";
import { friendlyError } from "./errors";

describe("friendlyError", () => {
  it("traduz erros conhecidos de autenticação", () => {
    expect(
      friendlyError(
        { code: "auth/invalid-credential" },
        "Não foi possível entrar.",
      ),
    ).toBe("E-mail ou senha incorretos. Confira os dados e tente novamente.");
  });

  it("preserva mensagens de validação criadas pela aplicação", () => {
    expect(
      friendlyError(
        new Error("O arquivo deve ter no máximo 10 MB."),
        "Não foi possível enviar o arquivo.",
      ),
    ).toBe("O arquivo deve ter no máximo 10 MB.");
  });

  it("não expõe mensagens técnicas desconhecidas", () => {
    expect(
      friendlyError(
        new Error("INTERNAL ASSERTION FAILED: unexpected state"),
        "Não foi possível concluir a operação.",
      ),
    ).toBe("Não foi possível concluir a operação.");
  });
});
