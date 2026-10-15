import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/app/_lib/auth";
import { errorResponse, handleApiError, json } from "@/app/_lib/api/http";
import { cancelBooking } from "@/app/_lib/services/bookings";

export const dynamic = "force-dynamic";

// DELETE /api/bookings/:id — cancela uma reserva futura do usuário autenticado
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Não autenticado.", 401);

    await cancelBooking({ userId: user.id, bookingId: params.id });

    revalidatePath("/");
    revalidatePath("/bookings");
    return json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
