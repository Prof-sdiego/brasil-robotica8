// Toca as melodias aqui no site, só para os alunos ouvirem antes de escolher.
// Nada disso vai para o código do robô.

export async function tocarNotas(notas: [number, number][]) {
  if (typeof window === "undefined") return;
  const Contexto =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Contexto) return;
  const contexto = new Contexto();
  let inicio = contexto.currentTime + 0.05;
  for (const [altura, duracao] of notas) {
    const oscilador = contexto.createOscillator();
    const volume = contexto.createGain();
    oscilador.type = "square";
    oscilador.frequency.value = altura;
    volume.gain.value = 0.08;
    oscilador.connect(volume).connect(contexto.destination);
    const segundos = duracao / 1000;
    oscilador.start(inicio);
    oscilador.stop(inicio + segundos * 0.9);
    inicio += segundos;
  }
  window.setTimeout(() => void contexto.close(), (inicio - contexto.currentTime + 0.3) * 1000);
}
