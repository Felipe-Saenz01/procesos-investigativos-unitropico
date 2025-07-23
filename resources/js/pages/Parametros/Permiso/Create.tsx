import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { SearchSelect } from '@/components/form-search-select';

const breadcrumbs = [
  { title: 'Parámetros', href: '/parametros/periodo' },
  { title: 'Permisos', href: route('parametros.permiso.index') },
  { title: 'Crear', href: route('parametros.permiso.create') },
];

interface PermisoCreateProps {
  entidades: string[];
  acciones: string[];
}

export default function PermisoCreate({ entidades, acciones }: PermisoCreateProps) {
  const entidadesOptions = entidades.map(e => ({ value: e, label: e.charAt(0).toUpperCase() + e.slice(1) }));
  const accionesOptions = acciones.map(a => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) }));

  const { data, setData, post, processing, errors, reset } = useForm({ entidad: '', accion: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('parametros.permiso.store'), {
      onSuccess: () => reset(),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Crear Permiso" />
      <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
        <form onSubmit={handleSubmit} className='sm:w-2/5'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl flex justify-between items-center'>
                Crear un Nuevo Permiso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="entidad">Entidad</Label>
                  <SearchSelect
                    options={entidadesOptions}
                    value={data.entidad}
                    onValueChange={value => setData('entidad', String(value))}
                    placeholder="Selecciona una entidad"
                    searchPlaceholder="Buscar entidad..."
                    name="entidad"
                  />
                  {errors.entidad && <p className="text-red-500 text-xs mt-1">{errors.entidad}</p>}
                </div>
                <div>
                  <Label htmlFor="accion">Acción</Label>
                  <SearchSelect
                    options={accionesOptions}
                    value={data.accion}
                    onValueChange={value => setData('accion', String(value))}
                    placeholder="Selecciona una acción"
                    searchPlaceholder="Buscar acción..."
                    name="accion"
                  />
                  {errors.accion && <p className="text-red-500 text-xs mt-1">{errors.accion}</p>}
                </div>
              </div>
            </CardContent>
            <CardFooter className='flex justify-end'>
              <Button type="submit" disabled={processing}>Crear</Button>
              <Button asChild variant="secondary">
                <Link href={route('parametros.permiso.index')}>Cancelar</Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
} 