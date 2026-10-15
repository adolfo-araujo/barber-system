import Link from "next/link";
import Header from "./_components/header";
import { Button } from "./_components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="px-5 py-12 flex flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-bold">Página não encontrada</h1>
        <p className="text-sm text-gray-400">O endereço que você acessou não existe ou foi removido.</p>
        <Button asChild>
          <Link href="/">Voltar para o início</Link>
        </Button>
      </div>
    </>
  );
}
