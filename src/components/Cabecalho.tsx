import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  titulo: string;
  icone?: ReactNode;
  voltarPara?: string;
  salvando?: boolean;
};

export function Cabecalho({ titulo, icone, voltarPara = "/painel", salvando }: Props) {
  return (
    <header className="faixa-topo sticky top-0 z-20 px-4 py-3 text-primary-foreground shadow-cartao-alto">
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <Link
          to={voltarPara}
          aria-label="Voltar"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-card/25 backdrop-blur-sm active:scale-95"
        >
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="flex flex-1 items-center gap-2 truncate text-xl font-bold sm:text-2xl">
          {icone}
          {titulo}
        </h1>
        <Link
          to="/tutorial"
          className="flex shrink-0 items-center gap-1 rounded-full bg-card/25 px-3 py-2 text-sm font-bold backdrop-blur-sm active:scale-95"
        >
          <HelpCircle className="size-4" />
          <span className="hidden sm:inline">Como funciona</span>
        </Link>
        <span className="flex items-center gap-1 text-sm font-semibold opacity-90">
          {salvando ? (
            <>
              <Loader2 className="size-4 animate-spin" /> salvando
            </>
          ) : (
            <>
              <Check className="size-4" /> salvo
            </>
          )}
        </span>
      </div>
    </header>
  );
}
