import { redirect } from "next/navigation";
import Header from "../_components/header";
import RegisterForm from "../_components/auth/register-form";
import { Card, CardContent } from "../_components/ui/card";
import { getCurrentUser, isGoogleAuthEnabled } from "../_lib/auth";
import { safeCallbackUrl } from "../_lib/safe-callback";

export const dynamic = "force-dynamic";

interface RegisterPageProps {
  searchParams: { callbackUrl?: string };
}

const RegisterPage = async ({ searchParams }: RegisterPageProps) => {
  const callbackUrl = safeCallbackUrl(searchParams.callbackUrl);
  const user = await getCurrentUser();

  if (user) {
    return redirect(callbackUrl);
  }

  return (
    <>
      <Header />

      <div className="px-5 py-6">
        <h1 className="text-xl font-bold">Criar conta</h1>
        <p className="text-sm text-gray-400 mt-1 mb-6">Cadastre-se para reservar na sua barbearia favorita.</p>

        <Card>
          <CardContent className="p-5">
            <RegisterForm callbackUrl={callbackUrl} googleEnabled={isGoogleAuthEnabled} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RegisterPage;
