import { Link, useLocation } from "@tanstack/react-router";
import { BellRing, DoorOpen, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

import { eCoordenador } from "@/lib/acessos";
import { marcarVoltou, ordemDaFila, useFila, useRecarregarFila, type ItemFila } from "@/lib/banheiro";
import { useEquipe } from "@/lib/equipes";
import { useCodigoGuardado } from "@/lib/sessao";
import { Button } from "@/components/ui/button";

const CHAVE = "oficina-robotica-banheiro-visto";

function tocarAlertaDaVez() {
  const AudioContextClass = window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  const contexto = new AudioContextClass();
  const inicio = contexto.currentTime;
  const notas = [880, 660, 880, 660, 1040];
  notas.forEach((frequencia, indice) => {
    const oscilador = contexto.createOscillator();
    const volume = contexto.createGain();
    oscilador.type = "square";
    oscilador.frequency.value = frequencia;
    volume.gain.setValueAtTime(0.0001, inicio + indice * 0.2);
    volume.gain.exponentialRampToValueAtTime(0.32, inicio + indice * 0.2 + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, inicio + indice * 0.2 + 0.16);
    oscilador.connect(volume);
    volume.connect(contexto.destination);
    oscilador.start(inicio + indice * 0.2);
    oscilador.stop(inicio + indice * 0.2 + 0.18);
  });
  window.setTimeout(() => void contexto.close(), 1400);
}

export async function ativarNotificacoesBanheiro(): Promise<NotificationPermission | "indisponivel"> {
  if (!("Notification" in window)) return "indisponivel";
  return Notification.requestPermission();
}

function avisarNoChromebook(nome: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const notificacao = new Notification("É a vez do banheiro!", {
    body: `${nome} pode ir agora.`,
    icon: "/favicon.ico",
    tag: "vez-banheiro",
    requireInteraction: true,
  });
  notificacao.onclick = () => {
    window.focus();
    notificacao.close();
  };
}

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
  const vez: ItemFila | undefined = (fila ?? []).find((i) => i.equipe_id === equipe?.id && i.status === "fora");
  const novo = Boolean(vez && !vistos.includes(vez.id));
  useEffect(() => {
    setVistos(JSON.parse(localStorage.getItem(CHAVE) ?? "[]") as string[]);
  }, []);

  useEffect(() => {
    if (!vez || !novo) return;
    tocarAlertaDaVez();
    avisarNoChromebook(vez.nome);
    navigator.vibrate?.([300, 120, 300, 120, 500]);
    document.documentElement.classList.add("aviso-banheiro-tremor");
    const parar = window.setTimeout(() => {
      document.documentElement.classList.remove("aviso-banheiro-tremor");
    }, 1400);
    return () => {
      window.clearTimeout(parar);
      document.documentElement.classList.remove("aviso-banheiro-tremor");
    };
  }, [novo, vez]);

  if (!equipe || local.pathname.startsWith("/professor")) return null;
  const integrante = equipe.integrantes.find((i) => i.id === integranteId) ?? null;
  if (!vez) return null;
  const coordena = eCoordenador(integrante);

  function fechar() {
    const lista = [...vistos, vez.id].slice(-50);
    localStorage.setItem(CHAVE, JSON.stringify(lista));
    setVistos(lista);
  }

  if (!novo) {
    return (
      <div className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-alerta px-4 py-2 font-extrabold text-alerta-foreground shadow-cartao">
        <DoorOpen className="size-5" /> {vez.nome} está no banheiro
        {coordena && <button onClick={async () => { await marcarVoltou(vez); await recarregar(); }} className="rounded-full bg-card px-3 py-1 text-sm text-foreground">Voltou</button>}
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 px-4" role="alertdialog" aria-modal="true" aria-labelledby="aviso-vez-banheiro">
      <div className="cartao-toque aviso-banheiro-pulso w-full max-w-md border-alerta p-6 text-center sm:p-8">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-alerta text-alerta-foreground">
          <BellRing className="size-11" />
        </span>
        <p className="mt-4 text-lg font-extrabold uppercase text-primary">Atenção, equipe!</p>
        <p id="aviso-vez-banheiro" className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">É a vez de {vez.nome}!</p>
        <p className="mt-3 text-lg font-bold text-muted-foreground">Pode ir ao banheiro agora.</p>
        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-bold">
          <Volume2 className="size-5" /> Alerta sonoro ativado
        </div>
        <Button onClick={fechar} size="lg" className="mt-5 w-full text-lg font-extrabold">Entendi</Button>
      </div>
    </div>
  );
}

/** Resumo direto no painel do aluno. */
export function ResumoBanheiroEquipe() {
  const { codigo } = useCodigoGuardado();
  const { data: equipe } = useEquipe(codigo);
  const { data: fila } = useFila();
  const [permissao, setPermissao] = useState<NotificationPermission | "indisponivel">("default");

  useEffect(() => {
    setPermissao("Notification" in window ? Notification.permission : "indisponivel");
  }, []);

  if (!equipe) return null;
  const itens = fila ?? [];
  const fora = itens.find((item) => item.turma === equipe.turma && item.status === "fora");
  const ordem = ordemDaFila(itens, equipe.turma);
  const esperando = ordem.filter((item) => item.equipe_id === equipe.id);
  const vezDaEquipe = fora?.equipe_id === equipe.id;

  return (
    <section className={`mt-4 rounded-2xl border-2 p-4 ${vezDaEquipe ? "border-alerta bg-alerta/20" : "border-border bg-card"}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${vezDaEquipe ? "bg-alerta text-alerta-foreground" : "bg-muted text-foreground"}`}>
          <DoorOpen className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg leading-tight">Banheiro agora</h2>
          <p className="text-sm font-bold text-muted-foreground">
            {vezDaEquipe
              ? `${fora.nome} pode ir agora!`
              : esperando.length > 0
                ? `${esperando[0]?.nome}: ${ordem.indexOf(esperando[0] as ItemFila) + 1}º na fila`
                : fora
                  ? `${fora.nome} (${fora.nome_equipe}) está fora`
                  : "Ninguém está fora ou esperando"}
          </p>
        </div>
        {permissao === "default" && (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => setPermissao(await ativarNotificacoesBanheiro())}
            className="gap-2"
          >
            <BellRing className="size-4" /> Ativar avisos
          </Button>
        )}
        {permissao === "granted" && <span className="text-sm font-extrabold text-sucesso">Avisos ativos</span>}
      </div>
    </section>
  );
}
