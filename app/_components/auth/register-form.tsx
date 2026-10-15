"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { register } from "@/app/_actions/register";
import { RegisterInput, registerSchema } from "@/app/_lib/validation";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import GoogleButton from "./google-button";

interface RegisterFormProps {
  callbackUrl: string;
  googleEnabled: boolean;
}

const RegisterForm = ({ callbackUrl, googleEnabled }: RegisterFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleSubmit = async (data: RegisterInput) => {
    setIsLoading(true);

    try {
      const result = await register(data);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const login = await signIn("credentials", { email: data.email, password: data.password, redirect: false });

      if (!login || login.error) {
        toast.success("Conta criada! Faça login para continuar.");
        router.push("/login");
        return;
      }

      toast.success("Conta criada com sucesso!");
      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" placeholder="Mínimo de 6 caracteres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar conta
          </Button>
        </form>
      </Form>

      {googleEnabled && <GoogleButton callbackUrl={callbackUrl} />}

      <p className="text-sm text-gray-400 text-center">
        Já tem conta?{" "}
        <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-primary font-bold">
          Fazer login
        </Link>
      </p>
    </div>
  );
};

export default RegisterForm;
