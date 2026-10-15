import { NextRequest } from "next/server";
import { handleApiError, json } from "@/app/_lib/api/http";
import { listBarbershops } from "@/app/_lib/services/barbershops";

export const dynamic = "force-dynamic";

// GET /api/barbershops?search=termo — lista barbearias (busca por nome, endereço ou serviço)
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    return json(await listBarbershops(search));
  } catch (error) {
    return handleApiError(error);
  }
}
