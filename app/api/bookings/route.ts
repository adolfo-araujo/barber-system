import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/_lib/auth";
import { errorResponse, handleApiError, json } from "@/app/_lib/api/http";
import { createBooking, getUserBookings } from "@/app/_lib/services/bookings";
import { createBookingSchema } from "@/app/_lib/validation";

export const dynamic = "force-dynamic";

// GET /api/bookings — reservas do usuário autenticado (confirmadas e finalizadas)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Não autenticado.", 401);
    return json(await getUserBookings(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/bookings — cria uma reserva. Body: { serviceId: string, date: ISO 8601 }
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Não autenticado.", 401);

    const body = createBookingSchema.parse(await request.json());
    const booking = await createBooking({ userId: user.id, serviceId: body.serviceId, date: body.date });

    revalidatePath("/");
    revalidatePath("/bookings");
    return json(booking, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
