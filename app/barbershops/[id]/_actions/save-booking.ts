"use server";

import { revalidatePath } from "next/cache";
import { toActionError } from "@/app/_actions/action-error";
import { getCurrentUser } from "@/app/_lib/auth";
import { createBooking } from "@/app/_lib/services/bookings";
import { ActionResult } from "@/app/_lib/types";
import { createBookingSchema } from "@/app/_lib/validation";

interface SaveBookingParams {
  serviceId: string;
  date: string; // ISO 8601
}

export const saveBooking = async (params: SaveBookingParams): Promise<ActionResult<{ date: string }>> => {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Faça login para reservar." };

    const parsed = createBookingSchema.safeParse(params);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

    // O usuário vem da sessão e a barbearia vem do serviço: nada disso é confiado ao navegador
    const booking = await createBooking({ userId: user.id, ...parsed.data });

    revalidatePath("/");
    revalidatePath("/bookings");
    return { success: true, data: { date: booking.date.toISOString() } };
  } catch (error) {
    return toActionError(error);
  }
};
