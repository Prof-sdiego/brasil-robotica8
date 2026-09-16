// Quem vê o quê. Cada papel entra com o seu código pessoal e abre só a sua parte.

import type { Integrante, Papel } from "./tipos";

export type Area =
  | "equipe"
  | "pilotar"
  | "programa"
  | "codigo"
  | "checklist"
  | "engenharia"
  | "design"
  | "ajustes";

const TODAS: Area[] = [
  "equipe",
  "pilotar",
  "programa",
  "codigo",
  "checklist",
  "engenharia",
  "design",
  "ajustes",
];

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
    case "Ajudante":
      return integrante.podeEditar
        ? ["programa", "codigo", "checklist", "ajustes", "pilotar"]
        : ["checklist", "codigo"];
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
  Ajudante: "Ajuda o programador, se estiver com a chave ligada.",
};
