import type { Barbershop, Booking, Service } from "@prisma/client";

/** Versões serializáveis (sem Decimal) dos modelos, seguras para Client Components e JSON. */
export type ServiceDTO = Omit<Service, "price"> & { price: number };

export type BarbershopDTO = Barbershop;

export type BarbershopWithServicesDTO = Barbershop & { services: ServiceDTO[] };

export type BookingDTO = Booking & {
  service: ServiceDTO;
  barbershop: Barbershop;
};

export type AvailableTime = {
  time: string; // "HH:mm" no fuso da barbearia
  date: string; // ISO 8601 (UTC)
};

export type ActionResult<T = undefined> = { success: true; data: T } | { success: false; error: string };

export const toServiceDTO = (service: Service): ServiceDTO => ({
  ...service,
  price: Number(service.price),
});
