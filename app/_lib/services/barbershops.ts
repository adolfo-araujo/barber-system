import "server-only";

import { db } from "../prisma";
import { BarbershopDTO, BarbershopWithServicesDTO, toServiceDTO } from "../types";

export async function listBarbershops(search?: string): Promise<BarbershopDTO[]> {
  const term = search?.trim();

  return db.barbershop.findMany({
    where: term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { address: { contains: term, mode: "insensitive" } },
            { services: { some: { name: { contains: term, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  });
}

/** Barbearias ordenadas pela quantidade de reservas (mais populares primeiro). */
export async function listPopularBarbershops(): Promise<BarbershopDTO[]> {
  return db.barbershop.findMany({
    orderBy: [{ bookings: { _count: "desc" } }, { name: "desc" }],
  });
}

export async function getBarbershopById(id: string): Promise<BarbershopWithServicesDTO | null> {
  const barbershop = await db.barbershop.findUnique({
    where: { id },
    include: { services: { orderBy: { name: "asc" } } },
  });

  if (!barbershop) return null;

  return { ...barbershop, services: barbershop.services.map(toServiceDTO) };
}
