import { notFound } from "next/navigation";
import BarbershopInfo from "./_components/barbershop-info";
import ServiceItem from "./_components/service-item";
import { getCurrentUser } from "@/app/_lib/auth";
import { getBarbershopById } from "@/app/_lib/services/barbershops";

export const dynamic = "force-dynamic";

interface BarbershopDetailsPageProps {
  params: {
    id: string;
  };
}

const BarbershopDetailsPage = async ({ params }: BarbershopDetailsPageProps) => {
  const [user, barbershop] = await Promise.all([getCurrentUser(), getBarbershopById(params.id)]);

  if (!barbershop) {
    return notFound();
  }

  const { services, ...barbershopData } = barbershop;

  return (
    <div>
      <BarbershopInfo barbershop={barbershopData} />

      <div className="px-5 flex flex-col gap-4 py-6">
        {services.map((service) => (
          <ServiceItem key={service.id} barbershop={barbershopData} service={service} isAuthenticated={!!user} />
        ))}
      </div>
    </div>
  );
};

export default BarbershopDetailsPage;
