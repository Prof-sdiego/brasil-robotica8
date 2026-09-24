import { useEffect, useState } from "react";

const CHAVE_ALUNO = "oficina-robotica-codigo";
const CHAVE_PROFESSOR = "oficina-robotica-professor";
const CHAVE_INTEGRANTE = "oficina-robotica-integrante";

export function guardarCodigo(codigo: string) {
  if (typeof window !== "undefined") localStorage.setItem(CHAVE_ALUNO, codigo.toUpperCase());
}

/** Guarda quem entrou (o integrante), depois do código pessoal. */
export function guardarIntegrante(id: string) {
  if (typeof window !== "undefined") localStorage.setItem(CHAVE_INTEGRANTE, id);
}

export function sairDaEquipe() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CHAVE_ALUNO);
    localStorage.removeItem(CHAVE_INTEGRANTE);
  }
}

export function entrarComoProfessor(senha: string) {
  if (typeof window !== "undefined") localStorage.setItem(CHAVE_PROFESSOR, senha.trim());
}

/** Senha guardada do professor, enviada ao servidor para ler dados pessoais. */
export function senhaProfessorGuardada(): string | null {
  if (typeof window === "undefined") return null;
  const valor = localStorage.getItem(CHAVE_PROFESSOR);
  return valor && valor !== "1" ? valor : null;
}

export function sairDoProfessor() {
  if (typeof window !== "undefined") localStorage.removeItem(CHAVE_PROFESSOR);
}

/** Lê o código guardado só depois da hidratação, para não quebrar o servidor. */
export function useCodigoGuardado() {
  const [estado, setEstado] = useState<{
    pronto: boolean;
    codigo: string | null;
    integranteId: string | null;
  }>({ pronto: false, codigo: null, integranteId: null });
  useEffect(() => {
    setEstado({
      pronto: true,
      codigo: localStorage.getItem(CHAVE_ALUNO),
      integranteId: localStorage.getItem(CHAVE_INTEGRANTE),
    });
  }, []);
  return estado;
}

const CHAVE_TUTORIAL = "oficina-robotica-tutorial";

export function marcarTutorialVisto(codigo: string) {
  if (typeof window !== "undefined") localStorage.setItem(`${CHAVE_TUTORIAL}-${codigo}`, "1");
}

/** Diz se o tutorial já foi visto por esta equipe (só depois da hidratação). */
export function useTutorialVisto(codigo: string | null) {
  const [estado, setEstado] = useState<{ pronto: boolean; visto: boolean }>({
    pronto: false,
    visto: true,
  });
  useEffect(() => {
    if (!codigo) return;
    setEstado({
      pronto: true,
      visto: localStorage.getItem(`${CHAVE_TUTORIAL}-${codigo}`) === "1",
    });
  }, [codigo]);
  return estado;
}

export function useProfessorLogado() {
  const [estado, setEstado] = useState<{ pronto: boolean; logado: boolean }>({
    pronto: false,
    logado: false,
  });
  useEffect(() => {
    setEstado({ pronto: true, logado: senhaProfessorGuardada() !== null });
  }, []);
  return { ...estado, marcarLogado: () => setEstado({ pronto: true, logado: true }) };
}
