import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

interface RolEditProps {
  rol: {
    id: number;
    name: string;
  };
}

const breadcrumbs = [
  { title: 'Parámetros', href: '/parametros/periodo' },
  { title: 'Roles', href: route('parametros.rol.index') },
  { title: 'Editar', href: '#' },
];

export default function RolEdit({ rol }: RolEditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: rol.name,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('parametros.rol.update', rol.id));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Editar Rol" />
      <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
        <form onSubmit={handleSubmit} className='sm:w-2/5'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl flex justify-between items-center'>
                Editar Rol
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Nombre del Rol</Label>
                <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
              </div>
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Button type="submit" disabled={processing}>Actualizar</Button>
              <Button asChild variant="secondary">
                <Link href={route('parametros.rol.index')}>Cancelar</Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
} 