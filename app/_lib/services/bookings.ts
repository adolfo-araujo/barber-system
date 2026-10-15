import "server-only";

import { Prisma } from "@prisma/client";
import { db } from "../prisma";
import { generateDayTimeList, slotToDate, toShopDay, formatInShopTz } from "../schedule";
import { AvailableTime, BookingDTO, toServiceDTO } from "../types";
import { daySchema } from "../validation";
import { AppError } from "./errors";

const bookingInclude = { service: true, barbershop: true } satisfies Prisma.BookingInclude;

type BookingWithRelations = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

const toBookingDTO = (booking: BookingWithRelations): BookingDTO => ({
  ...booking,
  service: toServiceDTO(booking.service),
});

/** Horários livres de uma barbearia em um dia ("yyyy-MM-dd"), já descontando reservas e horários passados. */
export async function getAvailableTimes(barbershopId: string, day: string): Promise<AvailableTime[]> {
  const parsedDay = daySchema.safeParse(day);
  if (!parsedDay.success) throw new AppError("Data inválida.", 400);

  const barbershop = await db.barbershop.findUnique({ where: { id: barbershopId }, select: { id: true } });
  if (!barbershop) throw new AppError("Barbearia não encontrada.", 404);

  const slots = generateDayTimeList().map((time) => ({ time, date: slotToDate(day, time) }));

  const bookings = await db.booking.findMany({
    where: {
      barbershopId,
      date: { gte: slots[0].date, lte: slots[slots.length - 1].date },
    },
    select: { date: true },
  });

  const taken = new Set(bookings.map((booking) => booking.date.getTime()));
  const now = Date.now();

  return slots
    .filter((slot) => slot.date.getTime() > now && !taken.has(slot.date.getTime()))
    .map((slot) => ({ time: slot.time, date: slot.date.toISOString() }));
}

export async function createBooking(params: { userId: string; serviceId: string; date: Date }): Promise<BookingDTO> {
  const { userId, serviceId, date } = params;

  if (Number.isNaN(date.getTime())) throw new AppError("Data inválida.", 400);

  const service = await db.service.findUnique({ where: { id: serviceId }, select: { id: true, barbershopId: true } });
  if (!service) throw new AppError("Serviço não encontrado.", 404);

  // O horário precisa ser exatamente um dos horários de atendimento da barbearia
  const day = toShopDay(date);
  const time = formatInShopTz(date, "HH:mm");
  const isValidSlot = generateDayTimeList().includes(time) && slotToDate(day, time).getTime() === date.getTime();
  if (!isValidSlot) throw new AppError("Horário fora do expediente da barbearia.", 400);

  if (date.getTime() <= Date.now()) throw new AppError("Não é possível reservar um horário que já passou.", 400);

  try {
    const booking = await db.booking.create({
      data: { userId, serviceId: service.id, barbershopId: service.barbershopId, date },
      include: bookingInclude,
    });
    return toBookingDTO(booking);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Este horário acabou de ser reservado. Escolha outro horário.", 409);
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new AppError("Sessão inválida. Faça login novamente.", 401);
    }
    throw error;
  }
}

export async function cancelBooking(params: { userId: string; bookingId: string }): Promise<void> {
  const booking = await db.booking.findUnique({ where: { id: params.bookingId } });

  // Responde 404 também quando a reserva é de outro usuário, para não revelar que ela existe
  if (!booking || booking.userId !== params.userId) throw new AppError("Reserva não encontrada.", 404);

  if (booking.date.getTime() <= Date.now()) {
    throw new AppError("Reservas finalizadas não podem ser canceladas.", 400);
  }

  await db.booking.delete({ where: { id: booking.id } });
}

export async function getUserBookings(userId: string): Promise<{ confirmed: BookingDTO[]; finished: BookingDTO[] }> {
  const now = new Date();

  const [confirmed, finished] = await Promise.all([
    db.booking.findMany({
      where: { userId, date: { gte: now } },
      include: bookingInclude,
      orderBy: { date: "asc" },
    }),
    db.booking.findMany({
      where: { userId, date: { lt: now } },
      include: bookingInclude,
      orderBy: { date: "desc" },
    }),
  ]);

  return { confirmed: confirmed.map(toBookingDTO), finished: finished.map(toBookingDTO) };
}
