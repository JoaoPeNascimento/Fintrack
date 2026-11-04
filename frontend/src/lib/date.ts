// Datas de gastos são dias do calendário ("yyyy-MM-dd"), sem hora nem fuso. Nunca passe essas strings
// direto para `new Date(...)`: o JS as interpreta como meia-noite UTC, e em America/Sao_Paulo isso
// vira o dia anterior.

const dateFormatter = new Intl.DateTimeFormat('pt-BR');

/** "2026-03-01" -> Date local de 1º/03/2026 00:00 (aceita também o formato ISO legado). */
export function parseCalendarDate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "2026-03-01" -> "01/03/2026". */
export function formatCalendarDate(value: string | null | undefined, fallback = '--/--/----'): string {
  return value ? dateFormatter.format(parseCalendarDate(value)) : fallback;
}

/** Dia de hoje no fuso do navegador, no formato do <input type="date">. */
export function todayCalendarDate(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
