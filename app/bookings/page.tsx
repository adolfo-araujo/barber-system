import Header from "../_components/header";
import { redirect } from "next/navigation";
import BookingItem from "../_components/booking-item";
import { getCurrentUser } from "../_lib/auth";
import { getUserBookings } from "../_lib/services/bookings";

export const dynamic = "force-dynamic";

const BookingsPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/login?callbackUrl=/bookings");
  }

  const { confirmed: confirmedBookings, finished: finishedBookings } = await getUserBookings(user.id);

  return (
    <>
      <Header />

      <div className="px-5 py-6">
        <h1 className="text-xl font-bold mb-6">Agendamentos</h1>

        {confirmedBookings.length === 0 && finishedBookings.length === 0 && (
          <p className="text-sm text-gray-400">Você ainda não tem agendamentos.</p>
        )}

        {confirmedBookings.length > 0 && (
          <>
            <h2 className="text-gray-400 uppercase font-bold text-sm mb-3">Confirmados</h2>

            <div className="flex flex-col gap-3">
              {confirmedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}

        {finishedBookings.length > 0 && (
          <>
            <h2 className="text-gray-400 uppercase font-bold text-sm mt-6 mb-3">Finalizados</h2>

            <div className="flex flex-col gap-3">
              {finishedBookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BookingsPage;
