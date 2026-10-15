"use client";

import { Button } from "@/app/_components/ui/button";
import { Calendar } from "@/app/_components/ui/calendar";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/app/_components/ui/sheet";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import { useEffect, useState } from "react";
import { saveBooking } from "../_actions/save-booking";
import { getAvailableTimes } from "../_actions/get-available-times";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import BookingInfo from "@/app/_components/booking-info";
import { AvailableTime, BarbershopDTO, ServiceDTO } from "@/app/_lib/types";
import { calendarDateToDay, formatInShopTz } from "@/app/_lib/schedule";
import { startOfDay } from "date-fns";

interface ServiceItemProps {
  barbershop: BarbershopDTO;
  service: ServiceDTO;
  isAuthenticated: boolean;
}

const ServiceItem = ({ service, barbershop, isAuthenticated }: ServiceItemProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<AvailableTime | undefined>();
  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [timeList, setTimeList] = useState<AvailableTime[]>([]);
  const [timesAreLoading, setTimesAreLoading] = useState(false);

  useEffect(() => {
    if (!date) {
      setTimeList([]);
      return;
    }

    let ignore = false;

    const refreshAvailableHours = async () => {
      setTimesAreLoading(true);
      const result = await getAvailableTimes(barbershop.id, calendarDateToDay(date));
      if (ignore) return;

      if (result.success) {
        setTimeList(result.data);
      } else {
        setTimeList([]);
        toast.error(result.error);
      }
      setTimesAreLoading(false);
    };

    refreshAvailableHours();

    return () => {
      ignore = true;
    };
  }, [date, barbershop.id]);

  const handleDateClick = (date: Date | undefined) => {
    setDate(date);
    setHour(undefined);
  };

  const handleHourClick = (time: AvailableTime) => {
    setHour(time);
  };

  const handleSheetOpenChange = (open: boolean) => {
    if (open && !isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setSheetIsOpen(open);
  };

  const handleBookingSubmit = async () => {
    if (!hour || !date) {
      return;
    }

    setSubmitIsLoading(true);

    try {
      const result = await saveBooking({
        serviceId: service.id,
        date: hour.date,
      });

      if (!result.success) {
        toast.error(result.error);
        // Atualiza os horários: o escolhido pode ter sido reservado por outra pessoa
        const refreshed = await getAvailableTimes(barbershop.id, calendarDateToDay(date));
        if (refreshed.success) setTimeList(refreshed.data);
        setHour(undefined);
        return;
      }

      setSheetIsOpen(false);
      setHour(undefined);
      setDate(undefined);
      toast("Reserva realizada com sucesso!", {
        description: formatInShopTz(result.data.date, "'Para' dd 'de' MMMM 'às' HH':'mm'.'"),
        action: {
          label: "Visualizar",
          onClick: () => router.push("/bookings"),
        },
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível realizar a reserva. Tente novamente.");
    } finally {
      setSubmitIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-3 w-full">
        <div className="flex gap-4 items-center w-full">
          <div className="relative min-h-[110px] min-w-[110px] max-h-[110px] max-w-[110px]">
            <Image
              className="rounded-lg"
              src={service.imageUrl}
              fill
              style={{ objectFit: "contain" }}
              alt={service.name}
            />
          </div>

          <div className="flex flex-col w-full">
            <h2 className="font-bold">{service.name}</h2>
            <p className="text-sm text-gray-400">{service.description}</p>

            <div className="flex items-center justify-between mt-3">
              <p className="text-primary text-sm font-bold">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(service.price))}
              </p>
              <Sheet open={sheetIsOpen} onOpenChange={handleSheetOpenChange}>
                <SheetTrigger asChild>
                  <Button variant="secondary">
                    Reservar
                  </Button>
                </SheetTrigger>

                <SheetContent className="p-0 overflow-y-auto">
                  <SheetHeader className="text-left px-5 py-6 border-b border-solid border-secondary">
                    <SheetTitle>Fazer Reserva</SheetTitle>
                  </SheetHeader>

                  <div className="py-6">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateClick}
                      locale={ptBR}
                      fromDate={startOfDay(new Date())}
                      styles={{
                        head_cell: {
                          width: "100%",
                          textTransform: "capitalize",
                        },
                        cell: {
                          width: "100%",
                        },
                        button: {
                          width: "100%",
                        },
                        nav_button_previous: {
                          width: "32px",
                          height: "32px",
                        },
                        nav_button_next: {
                          width: "32px",
                          height: "32px",
                        },
                        caption: {
                          textTransform: "capitalize",
                        },
                      }}
                    />
                  </div>

                  {/* Mostrar lista de horários apenas se alguma data estiver selecionada */}
                  {date && (
                    <div className="flex gap-3 overflow-x-auto py-6 px-5 border-t border-solid border-secondary [&::-webkit-scrollbar]:hidden">
                      {timesAreLoading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}

                      {!timesAreLoading && timeList.length === 0 && (
                        <p className="text-sm text-gray-400">Não há horários disponíveis nesta data.</p>
                      )}

                      {!timesAreLoading &&
                        timeList.map((time) => (
                          <Button
                            onClick={() => handleHourClick(time)}
                            variant={hour?.date === time.date ? "default" : "outline"}
                            className="rounded-full"
                            key={time.date}
                          >
                            {time.time}
                          </Button>
                        ))}
                    </div>
                  )}

                  <div className="py-6 px-5 border-t border-solid border-secondary">
                    <BookingInfo
                      booking={{
                        barbershop: barbershop,
                        date: date && hour ? hour.date : undefined,
                        service: service,
                      }}
                    />
                  </div>

                  <SheetFooter className="px-5">
                    <Button onClick={handleBookingSubmit} disabled={!hour || !date || submitIsLoading}>
                      {submitIsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar reserva
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceItem;
