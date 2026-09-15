import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useEquipe, useSalvarEquipe } from "./equipes";
import { useCodigoGuardado } from "./sessao";

/** Estado da equipe logada. Manda para a entrada se não houver código guardado. */
export function useAluno() {
  const navigate = useNavigate();
  const { pronto, codigo } = useCodigoGuardado();
  const { data: equipe, isLoading, isError } = useEquipe(codigo);
  const { salvar, salvando } = useSalvarEquipe(codigo);

  useEffect(() => {
    if (pronto && !codigo) navigate({ to: "/" });
  }, [pronto, codigo, navigate]);

  return {
    equipe: equipe ?? null,
    carregando: !pronto || isLoading,
    erro: isError,
    salvar,
    salvando,
  };
}
