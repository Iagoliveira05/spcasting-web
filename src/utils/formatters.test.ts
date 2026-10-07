import { afterEach, describe, expect, it, vi } from "vitest";
import {
  calculateAge,
  formatCurrency,
  formatDate,
  localDateString,
} from "./formatters";

describe("formatters", () => {
  afterEach(() => vi.useRealTimers());

  it("formata datas brasileiras sem deslocar o dia", () => {
    expect(formatDate("2026-10-06")).toBe("06 de outubro de 2026");
  });

  it("formata valores em reais", () => {
    expect(formatCurrency(1250.5)).toContain("1.250,50");
  });

  it("calcula a idade considerando se o aniversário já ocorreu", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 6, 12));
    expect(calculateAge("2000-10-06")).toBe(26);
    expect(calculateAge("2000-10-07")).toBe(25);
  });

  it("gera a data local no formato esperado", () => {
    expect(localDateString(new Date(2026, 9, 6, 12))).toBe("2026-10-06");
  });
});
