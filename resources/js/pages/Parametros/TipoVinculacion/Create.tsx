import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';

const breadcrumbs = [
  { title: 'Parámetros', href: '/parametros/periodo' },
  { title: 'Tipo de Vinculación', href: route('parametros.tipo-vinculacion.index') },
  { title: 'Crear', href: route('parametros.tipo-vinculacion.create') },
];

export default function Create() {
  const { data, setData, post, processing, errors, reset } = useForm({
    nombre: '',
    horas_semanales: 0, 
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('parametros.tipo-vinculacion.store'), {
      onSuccess: () => reset(),
    });
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Nuevo Tipo de Vinculación" />
      <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
        <form onSubmit={handleSubmit} className='sm:w-2/5'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl flex justify-between items-center'>
                Crear Tipo de Vinculación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={data.nombre}
                    onChange={e => setData('nombre', e.target.value)}
                    type='text'
                    name='nombre'
                    required
                  />
                  {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <Label htmlFor="horas_semanales">Horas Semanales</Label>
                  <Input
                    id="horas_semanales"
                    value={data.horas_semanales}
                    onChange={e => setData('horas_semanales', parseInt(e.target.value))}
                    type='number'
                    name='horas_semanales'
                    min={0}
                    required
                  />
                  {errors.horas_semanales && <p className="text-red-500 text-xs mt-1">{errors.horas_semanales}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Button type="submit" disabled={processing}>Crear</Button>
              <Button asChild variant="secondary">
                <Link href={route('parametros.tipo-vinculacion.index')}>Cancelar</Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
} 