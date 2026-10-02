import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { AVISO_DUAS_DE_BOTAO } from "@/lib/botoes";

/** Erro mostrado quando a equipe escolheu mais de uma melhoria de botão. */
export function ErroBotoes() {
  return (
    <div className="rounded-2xl bg-destructive px-4 py-4 text-destructive-foreground">
      <p className="flex items-start gap-2 text-lg font-extrabold">
        <AlertTriangle className="mt-1 size-6 shrink-0" /> {AVISO_DUAS_DE_BOTAO}
      </p>
      <Link
        to="/melhorias"
        className="mt-3 inline-block rounded-full bg-card px-4 py-2 font-extrabold text-foreground"
      >
        Corrigir as melhorias
      </Link>
    </div>
  );
}
