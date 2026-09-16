import { PAPEIS_OBRIGATORIOS } from "./catalogo";
import type { Integrante, Papel } from "./tipos";

/** Papéis obrigatórios que ainda não têm ninguém cadastrado. */
export function papeisFaltantes(integrantes: Integrante[]): Papel[] {
  return PAPEIS_OBRIGATORIOS.filter((papel) => !integrantes.some((i) => i.papel === papel));
}

export function equipeCompleta(integrantes: Integrante[]): boolean {
  return papeisFaltantes(integrantes).length === 0;
}

export function temProgramador(integrantes: Integrante[]): boolean {
  return integrantes.some((i) => i.papel === "Programador");
}

export function ajudantes(integrantes: Integrante[]): Integrante[] {
  return integrantes.filter((i) => i.papel === "Ajudante");
}

/** Pelo menos um ajudante precisa ficar com a chave do programa ligada. */
export function ajudantesComChave(integrantes: Integrante[]): Integrante[] {
  return ajudantes(integrantes).filter((i) => i.podeEditar);
}

export const AVISO_ULTIMA_CHAVE =
  "Deixe pelo menos um ajudante com acesso. Se você faltar no dia, alguém precisa conseguir mexer no programa.";

/** "Piloto e Engenheiro" / "Piloto, Copiloto e Engenheiro" */
export function listarFaltantes(faltantes: Papel[]): string {
  if (faltantes.length === 0) return "";
  if (faltantes.length === 1) return String(faltantes[0]);
  const ultimo = String(faltantes[faltantes.length - 1]);
  return `${faltantes.slice(0, -1).join(", ")} e ${ultimo}`;
}
