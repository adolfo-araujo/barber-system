"use server";

import { toActionError } from "@/app/_actions/action-error";
import { getAvailableTimes as getAvailableTimesService } from "@/app/_lib/services/bookings";
import { ActionResult, AvailableTime } from "@/app/_lib/types";

export const getAvailableTimes = async (barbershopId: string, day: string): Promise<ActionResult<AvailableTime[]>> => {
  try {
    return { success: true, data: await getAvailableTimesService(barbershopId, day) };
  } catch (error) {
    return toActionError(error);
  }
};
