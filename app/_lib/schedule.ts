import { ptBR } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

/**
 * Regras de horário de funcionamento compartilhadas entre o servidor e o navegador.
 * Todos os horários são calculados no fuso da barbearia, para que o cliente veja
 * os mesmos horários independentemente do fuso do servidor (ex.: Vercel em UTC).
 */
export const TIMEZONE = process.env.NEXT_PUBLIC_TIMEZONE || "America/Sao_Paulo";
export const OPENING_HOUR = 9; // 09:00
export const CLOSING_HOUR = 21; // 21:00
export const SLOT_INTERVAL_MINUTES = 45;

export const DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value: number) => String(value).padStart(2, "0");

/** Lista de horários do dia no formato "HH:mm" (09:00, 09:45, ..., 21:00). */
export function generateDayTimeList(): string[] {
  const times: string[] = [];
  for (let minutes = OPENING_HOUR * 60; minutes <= CLOSING_HOUR * 60; minutes += SLOT_INTERVAL_MINUTES) {
    times.push(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`);
  }
  return times;
}

/** Converte um dia ("yyyy-MM-dd") + horário ("HH:mm") no fuso da barbearia em um instante UTC. */
export function slotToDate(day: string, time: string): Date {
  return fromZonedTime(`${day}T${time}:00`, TIMEZONE);
}

/** Formata uma data no fuso da barbearia, em português. */
export function formatInShopTz(date: Date | string, format: string): string {
  return formatInTimeZone(new Date(date), TIMEZONE, format, { locale: ptBR });
}

/** Dia ("yyyy-MM-dd") de uma data no fuso da barbearia. */
export function toShopDay(date: Date | string): string {
  return formatInShopTz(date, "yyyy-MM-dd");
}

/** Converte uma data escolhida no calendário (meia-noite local do navegador) em "yyyy-MM-dd". */
export function calendarDateToDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
