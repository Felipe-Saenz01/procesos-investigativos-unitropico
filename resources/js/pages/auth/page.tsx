import { LoginForm } from "@/components/login-form"
import { User } from "@/types";
import { Head, router } from "@inertiajs/react"
import { useEffect } from "react"

interface LoginPageProps {
  auth: {
    user: User;
  };
  canResetPassword?: boolean;
  status?: string;
}

export default function LoginPage({ auth }: LoginPageProps) {
  // Si el usuario ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (auth.user) {
      router.visit(route('dashboard'));
    }
  }, [auth.user]);

  // Si el usuario está autenticado, no renderizar nada mientras se redirige
  if (auth.user) {
    return null;
  }

  return (
    <>
    <Head title="Login">
      <link rel="preconnect" href="https://fonts.bunny.net" />
      <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
    </Head>
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 px-6 md:px-10 py-3 md:py-6">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="https://www.unitropico.edu.co" target="_blank" className="flex items-center gap-2 font-medium justify-center md:justify-start">
            <img src="/logo-simbolo-unitropico-1.png" alt="Logo de unitrópico" className="w-1/3 md:w-1/5  " />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/login_image.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
    </>
  )
}
