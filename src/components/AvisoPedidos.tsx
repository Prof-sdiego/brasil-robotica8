import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { marcarTodosVistos, usePedidos, useRecarregarMateriais } from "@/lib/materiais";

/** Janela que avisa o professor dos pedidos de material ainda não vistos (inclusive os feitos enquanto estava fora). */
export function AvisoPedidos() {
  const { data: pedidos } = usePedidos();
  const recarregar = useRecarregarMateriais();
  const novos = (pedidos ?? []).filter((p) => !p.visto && p.status === "pendente");
  if (novos.length === 0) return null;

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
