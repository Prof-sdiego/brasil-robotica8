// Quem vê o quê. Cada papel entra com o seu código pessoal e abre só a sua parte.

import type { Especialidade, Integrante, Papel } from "./tipos";

export type Area =
  | "equipe"
  | "pilotar"
  | "programa"
  | "codigo"
  | "checklist"
  | "engenharia"
  | "design"
  | "ajustes"
  | "avaliacao";

const TODAS: Area[] = [
  "equipe",
  "pilotar",
  "programa",
  "codigo",
  "checklist",
  "engenharia",
  "design",
  "ajustes",
  "avaliacao",
];

export const ESPECIALIDADES: { id: Especialidade; nome: string; icone: string; descricao: string }[] =
  [
    {
      id: "programacao",
      nome: "Ajudante de Programação",
      icone: "💻",
      descricao: "Mexe nas melhorias, nas coreografias e no código, como o programador.",
    },
    {
      id: "engenharia",
      nome: "Ajudante de Engenharia",
      icone: "🔧",
      descricao: "Vê o checklist e o Manual de Engenharia.",
    },
    {
      id: "design",
      nome: "Ajudante de Design",
      icone: "🎨",
      descricao: "Vê o checklist e o Manual de Design.",
    },
  ];

export function especialidadeDe(integrante: Integrante): Especialidade {
  return integrante.especialidade ?? "programacao";
}

export function nomeEspecialidade(especialidade: Especialidade): string {
  return ESPECIALIDADES.find((e) => e.id === especialidade)?.nome ?? "Ajudante";
}

/** "Marina — Ajudante de Engenharia" (ou só o papel, para os outros). */
export function papelCompleto(integrante: Integrante): string {
  if (integrante.papel !== "Ajudante") return integrante.papel;
  return nomeEspecialidade(especialidadeDe(integrante));
}

export function nomeComPapel(integrante: Integrante): string {
  return `${integrante.nome} — ${papelCompleto(integrante)}`;
}

/** Áreas liberadas para este integrante. */
export function areasDoIntegrante(integrante: Integrante | null): Area[] {
  if (!integrante) return TODAS; // programador provisório, antes de se cadastrar
  switch (integrante.papel) {
    case "Programador":
      return TODAS;
    case "Piloto":
    case "Copiloto":
      return ["pilotar"];
    case "Engenheiro":
      return ["checklist", "engenharia"];
    case "Designer":
      return ["checklist", "design"];
    case "Ajudante": {
      const especialidade = especialidadeDe(integrante);
      if (especialidade === "engenharia") return ["checklist", "engenharia"];
      if (especialidade === "design") return ["checklist", "design"];
      // Programação: tudo o que o programador vê, menos a tela Equipe.
      return TODAS.filter((area) => area !== "equipe");
    }
    default:
      return [];
  }
}

export function podeVer(integrante: Integrante | null, area: Area): boolean {
  return areasDoIntegrante(integrante).includes(area);
}

/** Só o programador mexe nos ajustes avançados. */
export function podeAjustesAvancados(integrante: Integrante | null): boolean {
  return !integrante || integrante.papel === "Programador";
}

/** Tela em que cada papel cai ao entrar. */
export function telaInicial(integrante: Integrante | null): "/painel" | "/pilotar" {
  if (integrante && (integrante.papel === "Piloto" || integrante.papel === "Copiloto")) {
    return "/pilotar";
  }
  return "/painel";
}

export const DESCRICAO_ACESSO: Record<Papel, string> = {
  Programador: "Vê e edita tudo do site.",
  Piloto: "Entra direto no painel de pilotagem.",
  Copiloto: "Entra direto no painel de pilotagem.",
  Engenheiro: "Vê o checklist e o Manual de Engenharia.",
  Designer: "Vê o checklist e o Manual de Design.",
  Ajudante: "Depende da especialidade escolhida.",
};

/** Frase de acesso já considerando a especialidade do ajudante. */
export function descricaoAcesso(integrante: Integrante): string {
  if (integrante.papel !== "Ajudante") return DESCRICAO_ACESSO[integrante.papel];
  return (
    ESPECIALIDADES.find((e) => e.id === especialidadeDe(integrante))?.descricao ??
    DESCRICAO_ACESSO.Ajudante
  );
}
