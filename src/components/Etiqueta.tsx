import type { ReactNode } from "react";

import type { Intensidade } from "@/lib/catalogo";

const CORES: Record<Intensidade, string> = {
  muito: "bg-sucesso text-sucesso-foreground",
  medio: "bg-info text-info-foreground",
  pouco: "bg-alerta text-alerta-foreground",
  nada: "bg-muted text-muted-foreground",
};

export function EtiquetaIntensidade({
  rotulo,
  nivel,
}: {
  rotulo: string;
  nivel: Intensidade;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${CORES[nivel]}`}
    >
      {rotulo}: {nivel}
    </span>
  );
}

export function Etiqueta({
  children,
  tom = "info",
}: {
  children: ReactNode;
  tom?: "info" | "primaria" | "alerta" | "sucesso" | "neutra";
}) {
  const tons = {
    info: "bg-info text-info-foreground",
    primaria: "bg-primary text-primary-foreground",
    alerta: "bg-alerta text-alerta-foreground",
    sucesso: "bg-sucesso text-sucesso-foreground",
    neutra: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${tons[tom]}`}
    >
      {children}
    </span>
  );
}
