import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "@inertiajs/react"
import { FormEvent } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CircleAlert } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route('login'));
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Procesos Investigativos Unitrópico</h1>
      </div>
      
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <CircleAlert className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-5">
              {Object.values(errors).map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Correo</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="ejemplo@unitropico.edu.co" 
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            required 
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Contraseña</Label>
          </div>
          <Input 
            id="password" 
            type="password" 
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            required 
          />
        </div>
        <Button type="submit" className="w-full" disabled={processing}>
          {processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </div>
    </form>
  )
}
