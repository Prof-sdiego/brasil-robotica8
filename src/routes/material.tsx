import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Cabecalho } from "@/components/Cabecalho";
import {
  bloqueioDoPedido,
  fazerPedidos,
  NOME_STATUS,
  quantosEmUso,
  useMateriais,
  usePedidos,
  type Material,
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

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }
  const lista = pedidos ?? [];

  return (
    <>
      <Cabecalho titulo="Pedir material" icone={<Package className="size-6" />} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5 pb-16">
        {(materiais ?? [])
          .filter((m) => m.ativo)
          .map((m) => (
            <CartaoMaterial
              key={m.id}
              material={m}
              emUso={quantosEmUso(m, lista)}
              bloqueio={bloqueioDoPedido(m, lista)}
              aoPedir={async (cores, quantidade) => {
                const base = {
                  material_id: m.id,
                  material_nome: m.nome,
                  equipe_id: equipe.id,
                  turma: equipe.turma,
                  nome_equipe: equipe.nomeEquipe,
                  pedido_por: integrante?.nome ?? "",
                };
                const linhas = cores.length
                  ? cores.map((cor) => ({ ...base, cor, quantidade: 1 }))
                  : [{ ...base, cor: null, quantidade }];
                const erro = bloqueioDoPedido(m, lista, cores.length || quantidade);
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
  aoPedir,
}: {
  material: Material;
  emUso: number;
  bloqueio: string | null;
  aoPedir: (cores: string[], quantidade: number) => Promise<boolean>;
}) {
  const [cores, setCores] = useState<string[]>([]);
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
