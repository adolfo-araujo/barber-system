"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../_lib/auth";
import { cancelBooking as cancelBookingService } from "../_lib/services/bookings";
import { ActionResult } from "../_lib/types";
import { toActionError } from "./action-error";

export const cancelBooking = async (bookingId: string): Promise<ActionResult> => {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Faça login para cancelar a reserva." };

    await cancelBookingService({ userId: user.id, bookingId });

    revalidatePath("/");
    revalidatePath("/bookings");
    return { success: true, data: undefined };
  } catch (error) {
    return toActionError(error);
  }
};
