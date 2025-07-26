import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';

const breadcrumbs = [
  { title: 'Parámetros', href: '/parametros/periodo' },
  { title: 'Tipo de Contrato', href: route('parametros.tipo-contrato.index') },
  { title: 'Crear', href: route('parametros.tipo-contrato.create') },
];

export default function Create() {
  const { data, setData, post, processing, errors, reset } = useForm({
    nombre: '',
    numero_periodos: '',
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('parametros.tipo-contrato.store'), {
      onSuccess: () => reset(),
    });
  };
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Nuevo Tipo de Contrato" />
      <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
        <form onSubmit={handleSubmit} className='sm:w-2/5'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl flex justify-between items-center'>
                Crear Tipo de Contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input value={data.nombre} onChange={e => setData('nombre', e.target.value)} />
                  {errors.nombre && <div className="text-red-500 text-sm">{errors.nombre}</div>}
                  </div> 
                <div>
                  <Label htmlFor="numero_periodos">Número de Periodos</Label>
                  <Input
                    id="numero_periodos"
                    value={data.numero_periodos}
                    onChange={e => setData('numero_periodos', e.target.value)}
                    type='number'
                    name='numero_periodos'
                    min={0}
                    required
                  />
                  {errors.numero_periodos && <p className="text-red-500 text-xs mt-1">{errors.numero_periodos}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Button type="submit" disabled={processing}>Crear</Button>
              <Button asChild variant="secondary">
                <Link href={route('parametros.tipo-contrato.index')}>Cancelar</Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
} 