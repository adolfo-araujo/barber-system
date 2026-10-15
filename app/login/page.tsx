import { redirect } from "next/navigation";
import Header from "../_components/header";
import LoginForm from "../_components/auth/login-form";
import { Card, CardContent } from "../_components/ui/card";
import { getCurrentUser, isGoogleAuthEnabled } from "../_lib/auth";
import { safeCallbackUrl } from "../_lib/safe-callback";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: { callbackUrl?: string };
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const callbackUrl = safeCallbackUrl(searchParams.callbackUrl);
  const user = await getCurrentUser();

  if (user) {
    return redirect(callbackUrl);
  }

  return (
    <>
      <Header />

      <div className="px-5 py-6">
        <h1 className="text-xl font-bold">Fazer login</h1>
        <p className="text-sm text-gray-400 mt-1 mb-6">Entre para agendar seus horários.</p>

        <Card>
          <CardContent className="p-5">
            <LoginForm callbackUrl={callbackUrl} googleEnabled={isGoogleAuthEnabled} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default LoginPage;
