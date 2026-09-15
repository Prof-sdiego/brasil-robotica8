type Props = {
  feitos: number;
  total: number;
  compacta?: boolean;
};

export function BarraProgresso({ feitos, total, compacta }: Props) {
  const porcentagem = total > 0 ? Math.round((feitos / total) * 100) : 0;
  return (
    <div className="w-full">
      <div
        className={`w-full overflow-hidden rounded-full bg-muted ${compacta ? "h-3" : "h-5"}`}
        role="progressbar"
        aria-valuenow={feitos}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Progresso do checklist"
      >
        <div
          className="h-full rounded-full bg-sucesso transition-all duration-500"
          style={{ width: `${porcentagem}%` }}
        />
      </div>
      {!compacta && (
        <p className="mt-1 text-sm font-bold text-muted-foreground">
          {feitos} de {total} itens prontos
        </p>
      )}
    </div>
  );
}
