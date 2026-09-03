export function BarraProgresso({ feitas, total }: { feitas: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((feitas / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--linha)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: pct === 100 ? 'var(--feito)' : 'var(--acento)' }}
        />
      </div>
      <span className="text-xs tabular-nums" style={{ color: 'var(--texto-fraco)' }}>
        {feitas === 0 ? 'comece por aqui' : `${feitas} de ${total}`}
      </span>
    </div>
  );
}
