"use server";

import { registerUser } from "../_lib/services/users";
import { ActionResult } from "../_lib/types";
import { RegisterInput } from "../_lib/validation";
import { toActionError } from "./action-error";

export const register = async (input: RegisterInput): Promise<ActionResult> => {
  try {
    await registerUser(input);
    return { success: true, data: undefined };
  } catch (error) {
    return toActionError(error);
  }
};
