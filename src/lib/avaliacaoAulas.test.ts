import { describe, expect, it } from "vitest";
import { mediaEixo, mediaPergunta, type RespostaAulas } from "./avaliacaoAulas";

const r = (notas: Record<string, number>): RespostaAulas => ({ equipe_id: "x", turma: "8A", nome_equipe: "E", notas, textos: {}, created_at: "" });

describe("avaliação das aulas", () => {
  it("média de uma pergunta entre os grupos", () => {
    expect(mediaPergunta([r({ c1: 5 }), r({ c1: 3 })], "c1")).toBe(4);
  });
  it("média do eixo usa a média de cada pergunta", () => {
    expect(mediaEixo([r({ r1: 4, r2: 2 }), r({ r1: 4, r2: 4 })], ["r1", "r2"])).toBe(3.5);
  });
});
