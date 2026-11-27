import { createFileRoute } from "@tanstack/react-router";
import { Award, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  DADOS_VAZIOS, ITEM_EQUIPE, MEDIDAS, ITENS_ACABAMENTO, ITENS_DESENVOLVIMENTO, ITENS_ENGENHARIA, NIVEIS_ENGENHARIA,
  calcularNotas, completo, formatar, mediaGeral, salvarFinal, useAvaliacoesFinais, useRecarregarFinais,
  type DadosFinal,
} from "@/lib/avaliacaoFinal";
import { useEquipes } from "@/lib/equipes";
import { ordenarTurmas } from "@/lib/registros";
import { senhaProfessorGuardada } from "@/lib/sessao";
import type { Equipe } from "@/lib/tipos";

export const Route = createFileRoute("/professor/final")({
  head: () => ({
    meta: [
      { title: "Avaliação final — Oficina de Robótica" },
      { name: "description", content: "Avaliação final dos robôs: desenvolvimento, acabamento, engenharia e equipe." },
      { property: "og:title", content: "Avaliação final — Oficina de Robótica" },
      { property: "og:description", content: "Notas finais por critério e média de cada grupo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AvaliacaoFinal,
});

function AvaliacaoFinal() {
  const senha = senhaProfessorGuardada();
  const { data: equipes } = useEquipes();
  const { data: finais } = useAvaliacoesFinais(senha);
  const turmas = useMemo(() => ordenarTurmas([...new Set((equipes ?? []).map((e) => e.turma))]), [equipes]);
  const [turma, setTurma] = useState("");
  const [aberta, setAberta] = useState<string | null>(null);
  useEffect(() => { if (!turma && turmas[0]) setTurma(turmas[0]); }, [turma, turmas]);
  const daTurma = (equipes ?? []).filter((e) => e.turma === turma);

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-5 pb-16">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex flex-1 items-center gap-2 text-2xl"><Award className="size-6 text-primary" /> Avaliação final</h1>
        {turmas.map((t) => (
          <button key={t} onClick={() => setTurma(t)} className={`rounded-full px-4 py-2 font-extrabold ${t === turma ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t}</button>
        ))}
      </div>

      <section className="cartao-toque overflow-x-auto p-4">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr className="text-muted-foreground">
            <th className="py-2">Grupo</th><th>Desenv.</th><th>Acabam.</th><th>Engenh.</th><th>Equipe</th><th>Média</th><th>Situação</th><th />
          </tr></thead>
          <tbody>
            {daTurma.map((e) => {
              const f = finais?.find((x) => x.equipe_id === e.id);
              const n = f ? calcularNotas(f.dados) : null;
              return (
                <tr key={e.id} className="border-t font-bold">
                  <td className="py-2">
                    <div className="font-extrabold">{e.nomeEquipe}</div>
                    {e.integrantes.length > 0 && (
                      <div className="mt-0.5 max-w-72 text-xs font-semibold text-muted-foreground">
                        {e.integrantes.map((i) => i.nome).join(" · ")}
                      </div>
                    )}
                  </td>
                  <td>{formatar(n?.desenvolvimento)}</td><td>{formatar(n?.acabamento)}</td>
                  <td>{formatar(n?.engenharia)}</td><td>{formatar(n?.equipe)}</td>
                  <td className="text-lg font-extrabold">{formatar(f?.media)}</td>
                  <td>{f?.finalizada ? <span className="text-sucesso">Finalizada</span> : f ? "Rascunho" : "Não avaliada"}</td>
                  <td><button onClick={() => setAberta(aberta === e.id ? null : e.id)} className="rounded-full bg-secondary px-3 py-1 text-secondary-foreground">{aberta === e.id ? "Fechar" : "Avaliar"}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {aberta && senha && (() => {
        const e = daTurma.find((x) => x.id === aberta);
        const f = finais?.find((x) => x.equipe_id === aberta);
        return e ? <Formulario key={e.id} equipe={e} senha={senha} inicial={f?.dados} finalizada={!!f?.finalizada} onPronto={() => setAberta(null)} /> : null;
      })()}
    </main>
  );
}

function Nota({ valor, onChange }: { valor: number | null | undefined; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: 11 }, (_, i) => (
        <button key={i} type="button" onClick={() => onChange(i)} className={`size-9 rounded-lg font-extrabold ${valor === i ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{i}</button>
      ))}
    </div>
  );
}

function Formulario({ equipe, senha, inicial, finalizada, onPronto }: { equipe: Equipe; senha: string; inicial?: DadosFinal | undefined; finalizada: boolean; onPronto: () => void }) {
  const [d, setD] = useState<DadosFinal>({ ...DADOS_VAZIOS, ...inicial });
  const recarregar = useRecarregarFinais();
  const n = calcularNotas(d);
  const pronto = completo(d);

  async function guardar(finalizar: boolean) {
    try {
      await salvarFinal(senha, equipe.id, d, finalizar);
      await recarregar();
      toast.success(finalizar ? "Avaliação finalizada. A nota já aparece para o grupo." : "Rascunho guardado.");
      onPronto();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Não deu."); }
  }

  return (
    <section className="cartao-toque space-y-5 p-5">
      <h2 className="text-2xl">{equipe.nomeEquipe} · {equipe.turma}</h2>

      <div>
        <p className="text-sm font-extrabold text-muted-foreground">
          Integrantes ({equipe.integrantes.length})
        </p>
        {equipe.integrantes.length === 0 ? (
          <p className="mt-1 text-sm font-bold text-muted-foreground">Nenhum integrante cadastrado.</p>
        ) : (
          <div className="mt-1 flex flex-wrap gap-1">
            {equipe.integrantes.map((i) => (
              <span key={i.id} className="rounded-full bg-muted px-3 py-1 text-sm font-bold">
                {i.nome} <span className="text-muted-foreground">· {i.papel}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl">Medidas do carrinho <span className="text-base text-muted-foreground">· em cm</span></h3>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {MEDIDAS.map((m) => (
            <label key={m.id} className="rounded-xl bg-muted/50 p-2 text-sm font-bold">
              {m.nome}
              <input inputMode="decimal" value={d.medidas?.[m.id] ?? ""} placeholder="cm"
                onChange={(ev) => setD({ ...d, medidas: { ...d.medidas, [m.id]: ev.target.value } })}
                className="mt-1 w-full rounded-lg border-2 border-input bg-background px-2 py-1 text-base outline-none focus:border-ring" />
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl">Desenvolvimento <span className="text-base text-muted-foreground">· {formatar(n.desenvolvimento)} pts</span></h3>
        <div className="mt-2 space-y-2">
          {ITENS_DESENVOLVIMENTO.map((i) => (
            <label key={i.id} className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2 font-bold">
              <input type="checkbox" className="size-5 accent-primary" checked={!!d.desenvolvimento[i.id]} onChange={(ev) => setD({ ...d, desenvolvimento: { ...d.desenvolvimento, [i.id]: ev.target.checked } })} />
              <span className="flex-1">{i.nome}</span><span className="text-sm text-muted-foreground">+{i.pontos}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl">Acabamento <span className="text-base text-muted-foreground">· {formatar(n.acabamento)}</span></h3>
        {ITENS_ACABAMENTO.map((i) => (
          <div key={i.id} className="mt-3 rounded-xl bg-muted/50 p-3">
            <p className="font-extrabold">{i.nome}</p>
            <ul className="mb-2 list-disc pl-5 text-sm font-semibold text-muted-foreground">{i.criterios.map((c) => <li key={c}>{c}</li>)}</ul>
            <Nota valor={d.acabamento[i.id]} onChange={(v) => setD({ ...d, acabamento: { ...d.acabamento, [i.id]: v } })} />
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xl">Engenharia <span className="text-base text-muted-foreground">· {formatar(n.engenharia)}</span></h3>
        {ITENS_ENGENHARIA.map((i) => (
          <div key={i.id} className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 p-3">
            <span className="min-w-48 flex-1 font-bold">{i.nome}</span>
            {NIVEIS_ENGENHARIA.map((nv) => (
              <button key={nv.valor} type="button" onClick={() => setD({ ...d, engenharia: { ...d.engenharia, [i.id]: nv.valor } })} className={`rounded-full px-3 py-1 text-sm font-extrabold ${d.engenharia[i.id] === nv.valor ? "bg-primary text-primary-foreground" : "bg-card"}`}>{nv.nome}</button>
            ))}
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xl">Equipe <span className="text-base text-muted-foreground">· {formatar(n.equipe)}</span></h3>
        <p className="mb-2 font-bold">{ITEM_EQUIPE}</p>
        <Nota valor={d.equipe} onChange={(v) => setD({ ...d, equipe: v })} />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-accent px-4 py-3 text-accent-foreground">
        <span className="flex-1 text-xl font-extrabold">Média geral: {formatar(mediaGeral(n))}</span>
        <button onClick={() => void guardar(false)} className="rounded-full bg-card px-4 py-2 font-extrabold text-foreground">{finalizada ? "Voltar a rascunho" : "Guardar rascunho"}</button>
        <button disabled={!pronto} onClick={() => void guardar(true)} className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 font-extrabold text-primary-foreground disabled:opacity-50">
          <CheckCircle2 className="size-4" /> Finalizar e mostrar ao grupo
        </button>
      </div>
      {!pronto && <p className="text-sm font-bold text-muted-foreground">Preencha acabamento, engenharia e equipe para finalizar.</p>}
    </section>
  );
}
