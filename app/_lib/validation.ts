import { z } from "zod";
import { DAY_REGEX } from "./schedule";

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Informe seu nome." })
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres.")
    .max(80, "O nome deve ter no máximo 80 caracteres."),
  email: z
    .string({ required_error: "Informe seu e-mail." })
    .trim()
    .toLowerCase()
    .email("E-mail inválido."),
  password: z
    .string({ required_error: "Informe uma senha." })
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  password: z.string().min(1, "Informe sua senha."),
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, "Serviço obrigatório."),
  date: z
    .string({ required_error: "Data obrigatória." })
    .datetime({ offset: true, message: "Data inválida." })
    .transform((value) => new Date(value)),
});

export const daySchema = z.string().regex(DAY_REGEX, "Use o formato yyyy-MM-dd.");

export type RegisterInput = z.infer<typeof registerSchema>;
