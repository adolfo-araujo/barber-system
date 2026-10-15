import { NextRequest } from "next/server";
import { errorResponse, handleApiError, json } from "@/app/_lib/api/http";
import { getAvailableTimes } from "@/app/_lib/services/bookings";

export const dynamic = "force-dynamic";

// GET /api/barbershops/:id/available-times?date=yyyy-MM-dd — horários livres do dia
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const day = request.nextUrl.searchParams.get("date");
    if (!day) return errorResponse("Informe o parâmetro date (yyyy-MM-dd).", 400);
    return json(await getAvailableTimes(params.id, day));
  } catch (error) {
    return handleApiError(error);
  }
}
