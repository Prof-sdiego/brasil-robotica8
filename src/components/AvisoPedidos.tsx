import { Link, useLocation } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useRef } from "react";

import { marcarTodosVistos, tocarCampainha, usePedidos, useRecarregarMateriais } from "@/lib/materiais";

/** Avisa o professor dos pedidos novos: toca a campainha e abre a janela (menos na aba Materiais). */
export function AvisoPedidos() {
  const { data: pedidos } = usePedidos();
  const recarregar = useRecarregarMateriais();
  const local = useLocation();
  const naAbaMateriais = local.pathname.startsWith("/professor/materiais");
  const novos = (pedidos ?? []).filter((p) => !p.visto && p.status === "pendente");

  // Campainha quando chega um pedido que ainda não tínhamos visto nesta tela.
  const conhecidos = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!pedidos) return;
    const pendentes = pedidos.filter((p) => p.status === "pendente").map((p) => p.id);
    if (conhecidos.current === null) {
      conhecidos.current = new Set(pendentes);
      if (novos.length > 0) tocarCampainha();
      return;
    }
    const chegou = pendentes.some((id) => !conhecidos.current!.has(id));
    pendentes.forEach((id) => conhecidos.current!.add(id));
    if (chegou) tocarCampainha();
  }, [pedidos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Na aba Materiais o pedido já aparece na lista: marca como visto sem janela.
  useEffect(() => {
    if (naAbaMateriais && novos.length > 0) {
      void marcarTodosVistos().then(() => recarregar());
    }
  }, [naAbaMateriais, novos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (novos.length === 0 || naAbaMateriais) return null;

  async function fechar() {
    await marcarTodosVistos();
    await recarregar();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4">
      <div className="cartao-toque w-full max-w-md p-6">
        <h2 className="flex items-center gap-2 text-2xl">
          <Bell className="size-6 text-primary" /> {novos.length} pedido(s) de material
        </h2>
        <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
          {novos.map((p) => (
            <li key={p.id} className="rounded-xl bg-muted/50 px-3 py-2 text-sm">
              <b>{p.turma} · {p.nome_equipe}</b> — {p.quantidade > 1 ? `${p.quantidade} × ` : ""}
              {p.material_nome}
              {p.cor && ` · ${p.cor}`}
              {p.devolve_cor && (
                <span className="mt-1 block font-extrabold text-alerta-foreground">
                  Troca: entregar mediante devolução de {p.devolve_cor}
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-2">
          <Link
            to="/professor/materiais"
            onClick={() => void fechar()}
            className="flex-1 rounded-2xl bg-secondary px-4 py-3 text-center font-extrabold text-secondary-foreground"
          >
            Ver pedidos
          </Link>
          <button onClick={() => void fechar()} className="rounded-2xl bg-muted px-4 py-3 font-bold">
            Depois
          </button>
        </div>
      </div>
    </div>
  );
}
