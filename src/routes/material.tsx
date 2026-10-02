import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Cabecalho } from "@/components/Cabecalho";
import {
  bloqueioDoPedido,
  coresParaDevolver,
  fazerPedidos,
  NOME_STATUS,
  quantosEmUso,
  useMateriais,
  usePedidosBloqueados,
  usePedidos,
  type Material,
  type Pedido,
} from "@/lib/materiais";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/material")({
  head: () => ({
    meta: [
      { title: "Pedir material — Oficina de Robótica" },
      { name: "description", content: "A equipe pede ao professor os materiais para montar o robô." },
      { property: "og:title", content: "Pedir material — Oficina de Robótica" },
      { property: "og:description", content: "Tinta, pincéis, papelão, motores e rodas: peçam ao professor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TelaMaterial,
});

function TelaMaterial() {
  const { equipe, integrante, carregando } = useAluno({ area: "material" });
  const { data: materiais } = useMateriais();
  const { data: pedidos } = usePedidos(equipe?.id);
  const { data: bloqueado } = usePedidosBloqueados();

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }
  const lista = pedidos ?? [];

  return (
    <>
      <Cabecalho titulo="Pedir material" icone={<Package className="size-6" />} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5 pb-16">
        {bloqueado && (
          <p className="rounded-2xl bg-alerta px-4 py-3 text-lg font-extrabold text-alerta-foreground">
            O professor pausou os pedidos. Esperem ele liberar.
          </p>
        )}
        {!bloqueado && (materiais ?? [])
          .filter((m) => m.ativo)
          .map((m) => (
            <CartaoMaterial
              key={m.id}
              material={m}
              emUso={quantosEmUso(m, lista)}
              bloqueio={bloqueioDoPedido(m, lista)}
              paraDevolver={coresParaDevolver(m, lista)}
              aoPedir={async (cores, quantidade, devolve) => {
                const base = {
                  material_id: m.id,
                  material_nome: m.nome,
                  equipe_id: equipe.id,
                  turma: equipe.turma,
                  nome_equipe: equipe.nomeEquipe,
                  pedido_por: integrante?.nome ?? "",
                };
                const linhas = devolve
                  ? [{ ...base, cor: cores[0] ?? null, quantidade: 1, devolve_pedido_id: devolve.id, devolve_cor: devolve.cor }]
                  : cores.length
                    ? cores.map((cor) => ({ ...base, cor, quantidade: 1 }))
                    : [{ ...base, cor: null, quantidade }];
                const erro = devolve ? null : bloqueioDoPedido(m, lista, cores.length || quantidade);
                if (erro) {
                  toast.error(erro);
                  return false;
                }
                try {
                  await fazerPedidos(linhas);
                  toast.success("Pedido enviado ao professor!");
                  return true;
                } catch {
                  toast.error("Não deu para enviar. Tentem de novo.");
                  return false;
                }
              }}
            />
          ))}

        <section className="cartao-toque p-5">
          <h2 className="text-xl">Pedidos da equipe</h2>
          <ul className="mt-3 space-y-2">
            {lista.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                <span className="flex-1 font-bold">
                  {p.quantidade > 1 ? `${p.quantidade} × ` : ""}
                  {p.material_nome}
                  {p.cor && ` · ${p.cor}`}
                  {p.devolve_cor && <span className="block text-xs text-muted-foreground">troca: devolver {p.devolve_cor}</span>}
                </span>
                <span className="rounded-full bg-card px-3 py-1 text-xs font-extrabold">{NOME_STATUS[p.status]}</span>
              </li>
            ))}
            {lista.length === 0 && <li className="font-bold text-muted-foreground">Nenhum pedido ainda.</li>}
          </ul>
        </section>
      </main>
    </>
  );
}

function CartaoMaterial({
  material,
  emUso,
  bloqueio,
  paraDevolver,
  aoPedir,
}: {
  material: Material;
  emUso: number;
  bloqueio: string | null;
  paraDevolver: Pedido[];
  aoPedir: (cores: string[], quantidade: number, devolve?: Pedido) => Promise<boolean>;
}) {
  const [cores, setCores] = useState<string[]>([]);
  const [devolve, setDevolve] = useState<Pedido | null>(null);
  const temCoresTroca = material.cores.length > 0 && !!bloqueio && !material.uma_vez && paraDevolver.length > 0;
  if (temCoresTroca) {
    return (
      <TrocaDeCor
        material={material}
        emUso={emUso}
        paraDevolver={paraDevolver}
        cor={cores[0] ?? null}
        devolve={devolve}
        setCor={(c) => setCores(c ? [c] : [])}
        setDevolve={setDevolve}
        aoPedir={async () => {
          if (!devolve || !cores[0]) return;
          if (await aoPedir(cores, 1, devolve)) { setCores([]); setDevolve(null); }
        }}
      />
    );
  }
  const [enviando, setEnviando] = useState(false);
  const temCores = material.cores.length > 0;
  const sobra = material.limite_ativo === null ? 99 : material.limite_ativo - emUso;

  function alternar(cor: string) {
    if (cores.includes(cor)) setCores(cores.filter((c) => c !== cor));
    else if (cores.length < sobra) setCores([...cores, cor]);
    else toast.error(`Só cabem mais ${Math.max(0, sobra)} cor(es). Devolvam as que já têm para pedir outras.`);
  }

  async function pedir() {
    setEnviando(true);
    if (await aoPedir(cores, material.quantidade_padrao)) setCores([]);
    setEnviando(false);
  }

  return (
    <section className="cartao-toque p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex-1 text-2xl">
          {material.quantidade_padrao > 1 ? `${material.quantidade_padrao} ` : ""}
          {material.nome}
        </h2>
        {material.limite_ativo !== null && (
          <span className="rounded-full bg-info px-3 py-1 text-xs font-extrabold text-info-foreground">
            {emUso} de {material.limite_ativo} com a equipe
          </span>
        )}
        {material.uma_vez && (
          <span className="rounded-full bg-alerta px-3 py-1 text-xs font-extrabold text-alerta-foreground">
            só uma vez
          </span>
        )}
      </div>
      {temCores && (
        <div className="mt-3 flex flex-wrap gap-2">
          {material.cores.map((cor) => (
            <button
              key={cor}
              onClick={() => alternar(cor)}
              disabled={!!bloqueio}
              className={`rounded-full px-4 py-2 font-bold disabled:opacity-50 ${
                cores.includes(cor) ? "bg-secondary text-secondary-foreground" : "bg-muted"
              }`}
            >
              {cor}
            </button>
          ))}
        </div>
      )}
      {bloqueio ? (
        <p className="mt-3 rounded-xl bg-muted px-3 py-2 font-bold text-muted-foreground">{bloqueio}</p>
      ) : (
        <button
          disabled={enviando || (temCores && cores.length === 0)}
          onClick={() => void pedir()}
          className="mt-3 w-full rounded-2xl bg-primary px-4 py-3 text-lg font-extrabold text-primary-foreground disabled:opacity-50"
        >
          {temCores ? (cores.length ? `Pedir ${cores.length} cor(es)` : "Escolham as cores") : "Pedir"}
        </button>
      )}
    </section>
  );
}

function TrocaDeCor({
  material, emUso, paraDevolver, cor, devolve, setCor, setDevolve, aoPedir,
}: {
  material: Material;
  emUso: number;
  paraDevolver: Pedido[];
  cor: string | null;
  devolve: Pedido | null;
  setCor: (c: string | null) => void;
  setDevolve: (p: Pedido | null) => void;
  aoPedir: () => Promise<void>;
}) {
  const [enviando, setEnviando] = useState(false);
  return (
    <section className="cartao-toque p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex-1 text-2xl">{material.nome}</h2>
        <span className="rounded-full bg-info px-3 py-1 text-xs font-extrabold text-info-foreground">
          {emUso} de {material.limite_ativo} com a equipe
        </span>
      </div>
      <p className="mt-2 font-bold">Vocês já têm o máximo. Para pegar outra cor, escolham qual vão devolver.</p>
      <h3 className="mt-3 text-lg">1. Qual cor vocês vão devolver?</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {paraDevolver.map((p) => (
          <button key={p.id} onClick={() => setDevolve(devolve?.id === p.id ? null : p)}
            className={`rounded-full px-4 py-2 font-bold ${devolve?.id === p.id ? "bg-alerta text-alerta-foreground" : "bg-muted"}`}>
            {p.cor}
          </button>
        ))}
      </div>
      <h3 className="mt-3 text-lg">2. Qual cor nova vocês querem?</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {material.cores.map((c) => (
          <button key={c} onClick={() => setCor(cor === c ? null : c)}
            className={`rounded-full px-4 py-2 font-bold ${cor === c ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}>
            {c}
          </button>
        ))}
      </div>
      <button
        disabled={enviando || !cor || !devolve}
        onClick={async () => { setEnviando(true); await aoPedir(); setEnviando(false); }}
        className="mt-3 w-full rounded-2xl bg-primary px-4 py-3 text-lg font-extrabold text-primary-foreground disabled:opacity-50"
      >
        {cor && devolve ? `Trocar ${devolve.cor} por ${cor}` : "Escolham as duas cores"}
      </button>
    </section>
  );
}
