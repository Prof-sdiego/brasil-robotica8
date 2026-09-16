import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { areasDoIntegrante, podeAjustesAvancados, telaInicial, type Area } from "./acessos";
import { equipeCompleta, temProgramador } from "./equipeStatus";
import { useEquipe, useSalvarEquipe } from "./equipes";
import { useCodigoGuardado } from "./sessao";
import type { Integrante } from "./tipos";

type Opcoes = {
  /** Rotas travadas até a equipe ter os cinco papéis obrigatórios. */
  exigirEquipeCompleta?: boolean;
  /** A tela do programador e o tutorial não devem se redirecionar para si mesmos. */
  pularConferencias?: boolean;
  /** Parte do site que esta tela representa. Papel sem acesso é mandado para a sua tela. */
  area?: Area;
};

/** Estado da equipe e de quem entrou. Manda para a entrada se não houver código guardado. */
export function useAluno(opcoes: Opcoes = {}) {
  const navigate = useNavigate();
  const { pronto, codigo, integranteId } = useCodigoGuardado();
  const { data: equipe, isLoading, isError } = useEquipe(codigo);
  const { salvar, salvando } = useSalvarEquipe(codigo);

  const integrante: Integrante | null =
    equipe && integranteId
      ? (equipe.integrantes.find((i) => i.id === integranteId) ?? null)
      : null;
  const areas = areasDoIntegrante(integrante);

  useEffect(() => {
    if (pronto && !codigo) navigate({ to: "/" });
  }, [pronto, codigo, navigate]);

  useEffect(() => {
    if (!equipe || !pronto) return;
    const semProgramador = !temProgramador(equipe.integrantes);

    // Sem código pessoal: só entra assim quem vai se cadastrar como programador.
    if (!integrante) {
      if (!semProgramador) {
        navigate({ to: "/" });
        return;
      }
      if (!opcoes.pularConferencias) {
        navigate({ to: "/programador" });
        return;
      }
      return;
    }

    if (opcoes.pularConferencias) return;

    if (opcoes.area && !areas.includes(opcoes.area)) {
      navigate({ to: telaInicial(integrante) });
      return;
    }

    if (opcoes.exigirEquipeCompleta && !equipeCompleta(equipe.integrantes)) {
      navigate({ to: integrante.papel === "Programador" ? "/equipe" : "/painel" });
    }
  }, [
    equipe,
    integrante,
    areas,
    navigate,
    pronto,
    opcoes.area,
    opcoes.exigirEquipeCompleta,
    opcoes.pularConferencias,
  ]);

  return {
    equipe: equipe ?? null,
    integrante,
    areas,
    podeAvancado: podeAjustesAvancados(integrante),
    carregando: !pronto || isLoading,
    erro: isError,
    salvar,
    salvando,
    codigo,
  };
}
