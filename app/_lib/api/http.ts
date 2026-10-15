import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isAppError } from "../services/errors";

export const json = <T>(data: T, status = 200) => NextResponse.json(data, { status });

export const errorResponse = (message: string, status: number) => NextResponse.json({ error: message }, { status });

/** Converte qualquer erro em uma resposta JSON padronizada: { error: string }. */
export function handleApiError(error: unknown) {
  if (isAppError(error)) return errorResponse(error.message, error.status);
  if (error instanceof ZodError) return errorResponse(error.issues[0]?.message ?? "Dados inválidos.", 400);
  if (error instanceof SyntaxError) return errorResponse("JSON inválido.", 400);

  console.error(error);
  return errorResponse("Erro interno do servidor.", 500);
}
