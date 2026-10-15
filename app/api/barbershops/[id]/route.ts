import { errorResponse, handleApiError, json } from "@/app/_lib/api/http";
import { getBarbershopById } from "@/app/_lib/services/barbershops";

export const dynamic = "force-dynamic";

// GET /api/barbershops/:id — detalhes da barbearia com seus serviços
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const barbershop = await getBarbershopById(params.id);
    if (!barbershop) return errorResponse("Barbearia não encontrada.", 404);
    return json(barbershop);
  } catch (error) {
    return handleApiError(error);
  }
}
