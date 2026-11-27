import { describe, expect, it } from "vitest";
import { calcularNotas, mediaGeral, type DadosFinal } from "./avaliacaoFinal";

const base: DadosFinal = { desenvolvimento: {}, acabamento: {}, engenharia: {}, equipe: null };

describe("avaliação final", () => {
  it("cada item de desenvolvimento vale 2 e motores vale 1 extra", () => {
    const n = calcularNotas({ ...base, desenvolvimento: { medidas: true, pintado: true, apoio: true, microbit: true, palitos: true, motores: true } });
    expect(n.desenvolvimento).toBe(11);
    expect(calcularNotas({ ...base, desenvolvimento: { medidas: true } }).desenvolvimento).toBe(2);
  });
  it("engenharia: plenamente 10, parcialmente 5, não atende 0", () => {
    const n = calcularNotas({ ...base, engenharia: { design: 10, protecao: 5, estabilizacao: 0, suporte: 5 } });
    expect(n.engenharia).toBe(5);
  });
  it("média geral é a média dos 4 critérios, limitada a 10", () => {
    expect(mediaGeral({ desenvolvimento: 8, acabamento: 6, engenharia: 5, equipe: 9 })).toBe(7);
    expect(mediaGeral({ desenvolvimento: 11, acabamento: 10, engenharia: 10, equipe: 10 })).toBe(10);
  });
});
