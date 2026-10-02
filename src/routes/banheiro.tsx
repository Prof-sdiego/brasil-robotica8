import { createFileRoute } from "@tanstack/react-router";
import { DoorOpen } from "lucide-react";
import { toast } from "sonner";

import { Cabecalho } from "@/components/Cabecalho";
import { eCoordenador } from "@/lib/acessos";
import {
  entrarNaFila,
  marcarVoltou,
  ordemDaFila,
  quemEstaFora,
  tirarDaFila,
  useBanheiroBloqueado,
  useFila,
  usePresencas,
  useRecarregarFila,
} from "@/lib/banheiro";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/banheiro")({
  head: () => ({
    meta: [
      { title: "Fila do banheiro — Oficina de Robótica" },
      { name: "description", content: "Coloque um colega da equipe na fila do banheiro, uma pessoa por vez." },
      { property: "og:title", content: "Fila do banheiro — Oficina de Robótica" },
      { property: "og:description", content: "Fila do banheiro da turma, intercalando os grupos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TelaBanheiro,
});

function TelaBanheiro() {
  const { equipe, integrante, carregando } = useAluno({ area: "banheiro" });
  const { data: fila } = useFila();
  const { data: presencas } = usePresencas();
  const { data: bloqueado } = useBanheiroBloqueado();
  const recarregar = useRecarregarFila();

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }
  const itens = fila ?? [];
  const ordem = ordemDaFila(itens, equipe.turma);
  const fora = quemEstaFora(itens, equipe.turma);
  const daEquipe = itens.filter((i) => i.equipe_id === equipe.id && i.status !== "cancelado");
  const presencaDaEquipe = (presencas ?? []).filter((p) => p.equipe_id === equipe.id);
  const coordena = eCoordenador(integrante);

  async function adicionar(id: string, nome: string) {
    try {
      await entrarNaFila({
        equipe_id: equipe!.id,
        turma: equipe!.turma,
        nome_equipe: equipe!.nomeEquipe,
        integrante_id: id,
        nome,
      });
      await recarregar();
      toast.success(`${nome} entrou na fila.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não deu.");
    }
  }

  return (
    <>
      <Cabecalho titulo="Banheiro" icone={<DoorOpen className="size-6" />} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5 pb-16">
        {bloqueado && (
          <p className="rounded-2xl bg-alerta px-4 py-3 text-lg font-extrabold text-alerta-foreground">
            O professor pausou as idas ao banheiro. A fila atual continua visível.
          </p>
        )}
        <section className="cartao-toque p-5">
          <h2 className="text-xl">Quem está fora agora · {equipe.turma}</h2>
          {fora ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl bg-alerta px-4 py-3 text-alerta-foreground">
              <span className="flex-1 text-lg font-extrabold">
                {fora.nome} <span className="text-sm">({fora.nome_equipe})</span>
              </span>
              {coordena && fora.equipe_id === equipe.id && (
                <button
                  onClick={async () => {
                    await marcarVoltou(fora);
                    await recarregar();
                  }}
                  className="rounded-full bg-card px-4 py-2 font-extrabold text-foreground"
                >
                  Voltou
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2 font-bold text-muted-foreground">Ninguém está fora.</p>
          )}
          <p className="mt-3 text-sm font-semibold text-muted-foreground">
            Uma pessoa por vez, intercalando os grupos. Cada um vai só uma vez por aula.
          </p>
        </section>

        <section className="cartao-toque p-5">
          <h2 className="text-xl">Quem da equipe vai?</h2>
          <ul className="mt-3 space-y-2">
            {equipe.integrantes.map((i) => {
              const registro = daEquipe.find((d) => d.integrante_id === i.id);
              const faltou = presencaDaEquipe.find((p) => p.integrante_id === i.id)?.presente === false;
              const posicao = ordem.findIndex((o) => o.integrante_id === i.id && o.equipe_id === equipe.id);
              return (
                <li key={i.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                  <span className="flex-1 font-bold">{i.nome}</span>
                  {faltou ? (
                    <span className="text-sm font-bold text-muted-foreground">faltou hoje</span>
                  ) : !registro ? (
                    <button
                      onClick={() => void adicionar(i.id, i.nome)}
                      disabled={bloqueado}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground"
                    >
                      {bloqueado ? "Pausado" : "Colocar na fila"}
                    </button>
                  ) : registro.status === "fila" ? (
                    <>
                      <span className="rounded-full bg-info px-3 py-1 text-sm font-bold text-info-foreground">
                        {posicao + 1}º na fila
                      </span>
                      <button
                        onClick={async () => {
                          await tirarDaFila(registro);
                          await recarregar();
                        }}
                        className="text-sm font-bold underline"
                      >
                        tirar
                      </button>
                    </>
                  ) : registro.status === "fora" ? (
                    <span className="rounded-full bg-alerta px-3 py-1 text-sm font-bold text-alerta-foreground">está fora</span>
                  ) : (
                    <span className="text-sm font-bold text-muted-foreground">já foi hoje</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="cartao-toque p-5">
          <h2 className="text-xl">Fila da turma</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-6 font-bold">
            {ordem.map((o) => (
              <li key={o.id}>
                {o.nome} <span className="text-sm text-muted-foreground">({o.nome_equipe})</span>
              </li>
            ))}
            {ordem.length === 0 && <li className="list-none text-muted-foreground">Ninguém esperando.</li>}
          </ol>
        </section>
      </main>
    </>
  );
}
