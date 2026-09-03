/** 1490 -> "24 min" · 3120 -> "52 min" · 4200 -> "1h10" */
export function duracao(segundos: number | null): string {
  if (!segundos) return '';
  const min = Math.round(segundos / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/** "2026-09-12" -> "12/09" */
export function dataCurta(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
