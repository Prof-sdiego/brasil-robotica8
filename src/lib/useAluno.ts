import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { equipeCompleta, temProgramador } from "./equipeStatus";
import { useEquipe, useSalvarEquipe } from "./equipes";
import { useCodigoGuardado } from "./sessao";

type Opcoes = {
  /** Rotas travadas até a equipe ter os quatro papéis obrigatórios. */
  exigirEquipeCompleta?: boolean;
  /** A tela do programador e o tutorial não devem se redirecionar para si mesmos. */
  pularConferencias?: boolean;
};

/** Estado da equipe logada. Manda para a entrada se não houver código guardado. */
export function useAluno(opcoes: Opcoes = {}) {
  const navigate = useNavigate();
  const { pronto, codigo } = useCodigoGuardado();
  const { data: equipe, isLoading, isError } = useEquipe(codigo);
  const { salvar, salvando } = useSalvarEquipe(codigo);

  useEffect(() => {
    if (pronto && !codigo) navigate({ to: "/" });
  }, [pronto, codigo, navigate]);

  useEffect(() => {
    if (!equipe || opcoes.pularConferencias) return;
    if (!temProgramador(equipe.integrantes)) {
      navigate({ to: "/programador" });
      return;
    }
    if (opcoes.exigirEquipeCompleta && !equipeCompleta(equipe.integrantes)) {
      navigate({ to: "/equipe" });
    }
  }, [equipe, navigate, opcoes.exigirEquipeCompleta, opcoes.pularConferencias]);

  return {
    equipe: equipe ?? null,
    carregando: !pronto || isLoading,
    erro: isError,
    salvar,
    salvando,
    codigo,
  };
}
