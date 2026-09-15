import { RotateCcw } from "lucide-react";

import type { CampoAjuste } from "@/lib/ajustes";

/** Um ajuste: controle deslizante (ou sim/não), valor em destaque e volta ao padrão. */
export function Deslizante({
  campo,
  valor,
  aoMudar,
}: {
  campo: CampoAjuste;
  valor: number | boolean;
  aoMudar: (novo: number | boolean) => void;
}) {
  const noPadrao = valor === campo.padrao;

  if (campo.tipo === "sim_nao") {
    const ligado = valor === true;
    return (
      <div className="rounded-2xl border-2 border-input bg-background p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-bold">{campo.nome}</span>
          <button
            type="button"
            onClick={() => aoMudar(!ligado)}
            aria-pressed={ligado}
            className={`rounded-full px-5 py-3 text-lg font-extrabold ${
              ligado
                ? "bg-sucesso text-sucesso-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {ligado ? "Sim" : "Não"}
          </button>
        </div>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">{campo.ajuda}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-input bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={`ajuste-${campo.id}`} className="text-lg font-bold">
          {campo.nome}
        </label>
        <span className="shrink-0 rounded-xl bg-primary px-3 py-1 font-mono text-2xl font-extrabold text-primary-foreground">
          {typeof valor === "number" ? valor : campo.padrao}
          {campo.unidade ? <span className="text-sm"> {campo.unidade}</span> : null}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-muted-foreground">{campo.ajuda}</p>
      <input
        id={`ajuste-${campo.id}`}
        type="range"
        min={campo.min}
        max={campo.max}
        step={campo.passo ?? 1}
        value={typeof valor === "number" ? valor : campo.padrao}
        onChange={(e) => aoMudar(Number(e.target.value))}
        className="mt-3 h-6 w-full accent-primary"
      />
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span>{campo.min}</span>
        <button
          type="button"
          onClick={() => aoMudar(campo.padrao)}
          disabled={noPadrao}
          className="flex items-center gap-1 rounded-full bg-muted px-3 py-2 text-xs font-bold text-foreground disabled:opacity-40"
        >
          <RotateCcw className="size-4" /> Voltar ao padrão ({campo.padrao})
        </button>
        <span>{campo.max}</span>
      </div>
    </div>
  );
}
