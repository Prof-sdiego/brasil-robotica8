import { createFileRoute } from "@tanstack/react-router";
import { Package, Trash2 } from "lucide-react";
import { useState } from "react";

import { useEquipes } from "@/lib/equipes";
import { toast } from "sonner";

import {
  apagarMaterial,
  mudarPedido,
  NOME_STATUS,
  salvarMaterial,
  useMateriais,
  usePedidos,
  useRecarregarMateriais,
  type Pedido,
  type StatusPedido,
} from "@/lib/materiais";

export const Route = createFileRoute("/professor/materiais")({
  head: () => ({
    meta: [
      { title: "Materiais — Área do professor" },
      { name: "description", content: "Cadastre materiais e atenda os pedidos das equipes." },
      { property: "og:title", content: "Materiais — Área do professor" },
      { property: "og:description", content: "Pedidos de material das equipes da oficina de robótica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Materiais,
});

function Materiais() {
  const { data: materiais } = useMateriais();
  const { data: pedidos } = usePedidos();
  const recarregar = useRecarregarMateriais();
  const [filtro, setFiltro] = useState<"abertos" | "todos">("abertos");

  const [nome, setNome] = useState("");
  const [qtd, setQtd] = useState(1);
  const [limite, setLimite] = useState("");
  const [umaVez, setUmaVez] = useState(false);
  const [devolver, setDevolver] = useState(false);
  const [cores, setCores] = useState("");

  const { data: equipes } = useEquipes();
  async function acao(p: Pedido, status: StatusPedido) {
    try {
      await mudarPedido(p.id, { status, visto: true });
      if (status === "entregue" && p.devolve_pedido_id) await mudarPedido(p.devolve_pedido_id, { status: "devolvido" });
      await recarregar();
    } catch {
      toast.error("Não deu para mudar o pedido.");
    }
  }

  async function criar() {
    try {
      await salvarMaterial({
        nome: nome.trim(),
        quantidade_padrao: qtd,
        limite_ativo: limite ? Number(limite) : null,
        uma_vez: umaVez,
        precisa_devolver: devolver,
        cores: cores.split(",").map((c) => c.trim()).filter(Boolean),
      });
      setNome(""); setQtd(1); setLimite(""); setUmaVez(false); setDevolver(false); setCores("");
      await recarregar();
      toast.success("Material cadastrado.");
    } catch {
      toast.error("Não deu para cadastrar.");
    }
  }

  const lista = (pedidos ?? []).filter((p) => (filtro === "todos" ? p.status !== "entregue" : p.status === "pendente"));
  const entregues = (pedidos ?? []).filter((p) => p.status === "entregue");
  const porEquipe = new Map<string, Pedido[]>();
  for (const p of entregues) porEquipe.set(p.equipe_id, [...(porEquipe.get(p.equipe_id) ?? []), p]);
  const grupos = Array.from(porEquipe.entries())
    .map(([id, ps]) => {
      const eq = equipes?.find((e) => e.id === id);
      const prog = eq?.integrantes.filter((i) => i.papel === "Programador").map((i) => i.nome).join(", ");
      return { id, ps, turma: ps[0]!.turma, nome: ps[0]!.nome_equipe, prog: prog || "sem programador" };
    })
    .sort((a, b) => (a.turma + a.nome).localeCompare(b.turma + b.nome));
  const campo = "rounded-xl border-2 border-input bg-background px-3 py-2 font-bold";

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 pb-16">
      <section className="cartao-toque p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex flex-1 items-center gap-2 text-2xl">
            <Package className="size-6 text-secondary" /> Pedidos de material
          </h2>
          {(["abertos", "todos"] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)} className={`rounded-full px-4 py-2 font-bold ${filtro === f ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}>
              {f === "abertos" ? "Pendentes" : "Histórico"}
            </button>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {lista.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
              <span className="flex-1">
                <b>{p.turma} · {p.nome_equipe}</b> — {p.quantidade > 1 ? `${p.quantidade} × ` : ""}{p.material_nome}
                {p.cor && ` · ${p.cor}`}
                {p.devolve_cor && p.status === "pendente" && (
                  <span className="mt-1 block rounded-lg bg-alerta px-2 py-1 text-sm font-extrabold text-alerta-foreground">
                    Entrega mediante devolução de {p.devolve_cor}
                  </span>
                )}
                <span className="block text-xs text-muted-foreground">
                  {p.pedido_por && `${p.pedido_por} · `}
                  {new Date(p.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })} · {NOME_STATUS[p.status]}
                </span>
              </span>
              {p.status === "pendente" && (
                <>
                  <button onClick={() => void acao(p, "entregue")} className="rounded-full bg-sucesso px-3 py-2 text-sm font-bold text-sucesso-foreground">Entregar</button>
                  <button onClick={() => void acao(p, "recusado")} className="rounded-full bg-muted px-3 py-2 text-sm font-bold">Recusar</button>
                </>
              )}
              {p.status === "entregue" && (
                <button onClick={() => void acao(p, "devolvido")} className="rounded-full bg-info px-3 py-2 text-sm font-bold text-info-foreground">Devolveram</button>
              )}
            </li>
          ))}
          {lista.length === 0 && <li className="font-bold text-muted-foreground">Nenhum pedido aqui.</li>}
        </ul>
      </section>

      <section className="cartao-toque p-5">
        <h2 className="text-2xl">Com as equipes (já entregue)</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {grupos.map((g) => (
            <div key={g.id} className="rounded-2xl bg-muted/50 p-3">
              <h3 className="text-lg">{g.turma} · {g.nome}</h3>
              <p className="text-sm font-bold text-muted-foreground">Programador: {g.prog}</p>
              <ul className="mt-2 space-y-1">
                {g.ps.map((p) => {
                  const devolve = materiais?.find((m) => m.id === p.material_id)?.precisa_devolver;
                  return (
                    <li key={p.id} className="flex items-center gap-2 text-sm">
                      <span className="flex-1 font-bold">
                        {p.quantidade > 1 ? `${p.quantidade} × ` : ""}{p.material_nome}{p.cor && ` · ${p.cor}`}
                      </span>
                      {devolve && (
                        <button onClick={() => void acao(p, "devolvido")} className="rounded-full bg-info px-3 py-1 text-xs font-bold text-info-foreground">Devolveram</button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {grupos.length === 0 && <p className="font-bold text-muted-foreground">Nada entregue ainda.</p>}
        </div>
      </section>

      <section className="cartao-toque space-y-3 p-5">
        <h2 className="text-xl">Materiais cadastrados</h2>
        <ul className="space-y-2">
          {(materiais ?? []).map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
              <span className="flex-1">
                <b>{m.quantidade_padrao > 1 ? `${m.quantidade_padrao} ` : ""}{m.nome}</b>
                <span className="block text-xs text-muted-foreground">
                  {[
                    m.uma_vez && "só uma vez por equipe",
                    m.limite_ativo !== null && `até ${m.limite_ativo} por vez`,
                    m.precisa_devolver && "precisa devolver",
                    m.cores.length > 0 && `cores: ${m.cores.join(", ")}`,
                  ].filter(Boolean).join(" · ") || "sem limite"}
                </span>
              </span>
              <button
                onClick={async () => { await salvarMaterial({ id: m.id, nome: m.nome, ativo: !m.ativo }); await recarregar(); }}
                className={`rounded-full px-3 py-2 text-sm font-bold ${m.ativo ? "bg-sucesso text-sucesso-foreground" : "bg-muted"}`}
              >
                {m.ativo ? "Disponível" : "Escondido"}
              </button>
              <button
                aria-label={`Apagar ${m.nome}`}
                onClick={async () => { if (confirm(`Apagar ${m.nome} e seus pedidos?`)) { await apagarMaterial(m.id); await recarregar(); } }}
                className="text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <h3 className="pt-2 text-lg">Cadastrar material</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome (ex.: Palitos)" className={campo} />
          <label className="flex items-center gap-2 font-bold">Quantidade por pedido
            <input type="number" min={1} value={qtd} onChange={(e) => setQtd(Math.max(1, Number(e.target.value)))} className={`${campo} w-20`} />
          </label>
          <label className="flex items-center gap-2 font-bold">Máximo por vez (vazio = sem limite)
            <input type="number" min={1} value={limite} onChange={(e) => setLimite(e.target.value)} className={`${campo} w-20`} />
          </label>
          <input value={cores} onChange={(e) => setCores(e.target.value)} placeholder="Cores, separadas por vírgula (opcional)" className={campo} />
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={umaVez} onChange={(e) => setUmaVez(e.target.checked)} /> Só pode pedir uma vez</label>
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={devolver} onChange={(e) => setDevolver(e.target.checked)} /> Precisa devolver para pedir mais</label>
        </div>
        <button disabled={!nome.trim()} onClick={() => void criar()} className="w-full rounded-2xl bg-secondary px-4 py-3 font-extrabold text-secondary-foreground disabled:opacity-50">
          Cadastrar
        </button>
      </section>
    </main>
  );
}
