import "server-only";

import { isAppError } from "../_lib/services/errors";

/** Converte erros em mensagens seguras para exibir ao usuário. */
export function toActionError(error: unknown): { success: false; error: string } {
  if (isAppError(error)) return { success: false, error: error.message };
  console.error(error);
  return { success: false, error: "Ocorreu um erro inesperado. Tente novamente." };
}
