import { Barbershop } from "@prisma/client";
import { formatInShopTz } from "../_lib/schedule";
import { ServiceDTO } from "../_lib/types";
import { Card, CardContent } from "./ui/card";

interface BookingInfoProps {
  booking: {
    date?: Date | string;
    service: Pick<ServiceDTO, "name" | "price">;
    barbershop: Pick<Barbershop, "name">;
  };
}

const BookingInfo = ({ booking }: BookingInfoProps) => {
  return (
    <Card>
      <CardContent className="p-3 gap-3 flex flex-col">
        <div className="flex justify-between">
          <h2 className="font-bold">{booking.service.name}</h2>
          <h3 className="font-bold text-sm">
            {Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(Number(booking.service.price))}
          </h3>
        </div>

        {booking.date && (
          <>
            <div className="flex justify-between">
              <h3 className="text-gray-400 text-sm">Data</h3>
              <h4 className="text-sm">
                {formatInShopTz(booking.date, "dd 'de' MMMM")}
              </h4>
            </div>

            <div className="flex justify-between">
              <h3 className="text-gray-400 text-sm">Horário</h3>
              <h4 className="text-sm">{formatInShopTz(booking.date, "HH:mm")}</h4>
            </div>
          </>
        )}

        <div className="flex justify-between">
          <h3 className="text-gray-400 text-sm">Barbearia</h3>
          <h4 className="text-sm">{booking.barbershop.name}</h4>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingInfo;
