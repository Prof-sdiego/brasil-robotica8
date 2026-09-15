import { useEffect, useState } from "react";

const CHAVE_ALUNO = "oficina-robotica-codigo";
const CHAVE_PROFESSOR = "oficina-robotica-professor";

export function guardarCodigo(codigo: string) {
  if (typeof window !== "undefined") localStorage.setItem(CHAVE_ALUNO, codigo.toUpperCase());
}

export function sairDaEquipe() {
  if (typeof window !== "undefined") localStorage.removeItem(CHAVE_ALUNO);
}

export function entrarComoProfessor() {
  if (typeof window !== "undefined") localStorage.setItem(CHAVE_PROFESSOR, "1");
}

export function sairDoProfessor() {
  if (typeof window !== "undefined") localStorage.removeItem(CHAVE_PROFESSOR);
}

/** Lê o código guardado só depois da hidratação, para não quebrar o servidor. */
export function useCodigoGuardado() {
  const [estado, setEstado] = useState<{ pronto: boolean; codigo: string | null }>({
    pronto: false,
    codigo: null,
  });
  useEffect(() => {
    setEstado({ pronto: true, codigo: localStorage.getItem(CHAVE_ALUNO) });
  }, []);
  return estado;
}

export function useProfessorLogado() {
  const [estado, setEstado] = useState<{ pronto: boolean; logado: boolean }>({
    pronto: false,
    logado: false,
  });
  useEffect(() => {
    setEstado({ pronto: true, logado: localStorage.getItem(CHAVE_PROFESSOR) === "1" });
  }, []);
  return { ...estado, marcarLogado: () => setEstado({ pronto: true, logado: true }) };
}
