import { Link, useLocation } from "@tanstack/react-router";
import { DoorOpen } from "lucide-react";
import { useEffect, useState } from "react";

import { eCoordenador } from "@/lib/acessos";
import { marcarVoltou, useFila, useRecarregarFila, type ItemFila } from "@/lib/banheiro";
import { useEquipe } from "@/lib/equipes";
import { useCodigoGuardado } from "@/lib/sessao";

const CHAVE = "oficina-robotica-banheiro-visto";

/** Professor: janelinha fixa com quem está fora e a fila. */
export function AvisoBanheiroProfessor() {
  const { data: fila } = useFila();
  const recarregar = useRecarregarFila();
  const [aberto, setAberto] = useState(true);
  const fora = (fila ?? []).filter((i) => i.status === "fora");
  const esperando = (fila ?? []).filter((i) => i.status === "fila").length;
  const ultimo = fora.map((f) => f.id).join(",");
  useEffect(() => setAberto(true), [ultimo]);
  if (fora.length === 0 && esperando === 0) return null;

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-alerta px-4 py-3 font-extrabold text-alerta-foreground shadow-cartao">
        <DoorOpen className="size-5" /> {fora.length} fora · {esperando} na fila
      </button>
    );
  }
  return (
    <div className="fixed right-4 bottom-4 z-40 w-80 rounded-2xl bg-card p-4 shadow-cartao">
      <div className="flex items-center gap-2">
        <DoorOpen className="size-5 text-primary" />
        <p className="flex-1 font-extrabold">Banheiro</p>
        <button onClick={() => setAberto(false)} className="text-sm font-bold underline">minimizar</button>
      </div>
      {fora.length === 0 && <p className="mt-2 text-sm font-bold">Ninguém fora agora.</p>}
      {fora.map((f) => (
        <div key={f.id} className="mt-2 flex items-center gap-2 rounded-xl bg-alerta px-3 py-2 text-alerta-foreground">
          <span className="flex-1 text-sm font-extrabold">{f.turma} · {f.nome} ({f.nome_equipe})</span>
          <button onClick={async () => { await marcarVoltou(f); await recarregar(); }} className="rounded-full bg-card px-3 py-1 text-sm font-extrabold text-foreground">Voltou</button>
        </div>
      ))}
      <Link to="/professor/banheiro" className="mt-2 block text-sm font-bold text-secondary underline">
        {esperando} esperando · ver e editar a fila
      </Link>
    </div>
  );
}

/** Programador/ajudantes: aviso quando é a vez de alguém da equipe. */
export function AvisoBanheiroEquipe() {
  const local = useLocation();
  const { codigo, integranteId } = useCodigoGuardado();
  const { data: equipe } = useEquipe(codigo);
  const { data: fila } = useFila();
  const recarregar = useRecarregarFila();
  const [vistos, setVistos] = useState<string[]>([]);
  useEffect(() => {
    setVistos(JSON.parse(localStorage.getItem(CHAVE) ?? "[]") as string[]);
  }, []);

  if (!equipe || local.pathname.startsWith("/professor")) return null;
  const integrante = equipe.integrantes.find((i) => i.id === integranteId) ?? null;
  if (!eCoordenador(integrante)) return null;
  const vez: ItemFila | undefined = (fila ?? []).find((i) => i.equipe_id === equipe.id && i.status === "fora");
  if (!vez) return null;
  const novo = !vistos.includes(vez.id);

  function fechar() {
    const lista = [...vistos, vez!.id].slice(-50);
    localStorage.setItem(CHAVE, JSON.stringify(lista));
    setVistos(lista);
  }

  if (!novo) {
    return (
      <div className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-alerta px-4 py-2 font-extrabold text-alerta-foreground shadow-cartao">
        <DoorOpen className="size-5" /> {vez.nome} está no banheiro
        <button onClick={async () => { await marcarVoltou(vez); await recarregar(); }} className="rounded-full bg-card px-3 py-1 text-sm text-foreground">Voltou</button>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4">
      <div className="cartao-toque w-full max-w-sm p-6 text-center">
        <DoorOpen className="mx-auto size-12 text-primary" />
        <p className="mt-3 text-2xl font-extrabold">É a vez de {vez.nome} ir ao banheiro!</p>
        <p className="mt-2 font-semibold text-muted-foreground">Quando voltar, toquem em "Voltou".</p>
        <button onClick={fechar} className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-lg font-extrabold text-primary-foreground">Entendi</button>
      </div>
    </div>
  );
}
