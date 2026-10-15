import "server-only";

import bcrypt from "bcryptjs";
import { db } from "../prisma";
import { registerSchema } from "../validation";
import { AppError } from "./errors";

export async function registerUser(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) throw new AppError(parsed.error.issues[0]?.message ?? "Dados inválidos.", 400);

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Já existe uma conta com este e-mail.", 409);

  const user = await db.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10) },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return user;
}

export async function verifyCredentials(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user?.password) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return { id: user.id, name: user.name, email: user.email, image: user.image };
}
