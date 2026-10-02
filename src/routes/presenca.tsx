import { createFileRoute } from "@tanstack/react-router";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Cabecalho } from "@/components/Cabecalho";
import { marcarPresenca, usePresencas, useRecarregarFila } from "@/lib/banheiro";
import { useAluno } from "@/lib/useAluno";

export const Route = createFileRoute("/presenca")({
  head: () => ({
    meta: [
      { title: "Presença — Oficina de Robótica" },
      { name: "description", content: "O programador marca quem da equipe veio à aula." },
      { property: "og:title", content: "Presença — Oficina de Robótica" },
      { property: "og:description", content: "Marque quem está presente na aula de hoje." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TelaPresenca,
});

function TelaPresenca() {
  const { equipe, integrante, carregando } = useAluno({ area: "presenca" });
  const { data: presencas } = usePresencas();
  const recarregar = useRecarregarFila();

  if (carregando || !equipe) {
    return <p className="p-8 text-center text-lg font-bold">Carregando...</p>;
  }
  const daEquipe = (presencas ?? []).filter((p) => p.equipe_id === equipe.id);

  async function marcar(id: string, nome: string, presente: boolean) {
    try {
      await marcarPresenca({
        equipe_id: equipe!.id,
        turma: equipe!.turma,
        integrante_id: id,
        nome,
        presente,
        marcado_por: integrante?.nome ?? "",
      });
      await recarregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não deu.");
    }
  }

  const marcados = daEquipe.length;
  return (
    <>
      <Cabecalho titulo="Presença de hoje" icone={<UserCheck className="size-6" />} />
      <main className="mx-auto max-w-3xl space-y-3 px-4 py-5 pb-16">
        <p className="font-bold text-muted-foreground">
          Marquem quem veio hoje. {marcados} de {equipe.integrantes.length} marcados.
        </p>
        {equipe.integrantes.map((i) => {
          const p = daEquipe.find((d) => d.integrante_id === i.id);
          return (
            <div key={i.id} className="cartao-toque flex flex-wrap items-center gap-2 p-4">
              <span className="flex-1 text-lg font-extrabold">
                {i.nome} <span className="text-sm text-muted-foreground">· {i.papel}</span>
              </span>
              <button
                onClick={() => void marcar(i.id, i.nome, true)}
                className={`rounded-full px-4 py-2 font-extrabold ${p?.presente === true ? "bg-sucesso text-sucesso-foreground" : "bg-muted"}`}
              >
                Presente
              </button>
              <button
                onClick={() => void marcar(i.id, i.nome, false)}
                className={`rounded-full px-4 py-2 font-extrabold ${p?.presente === false ? "bg-destructive text-destructive-foreground" : "bg-muted"}`}
              >
                Faltou
              </button>
            </div>
          );
        })}
      </main>
    </>
  );
}
