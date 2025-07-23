import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface Permiso {
  id: number;
  name: string;
}

interface RolPermisosProps {
  rol: {
    id: number;
    name: string;
    permissions: number[];
  };
  permisos: Permiso[];
}

const breadcrumbs = [
  { title: 'Parámetros', href: '/parametros/periodo' },
  { title: 'Roles', href: route('parametros.rol.index') },
  { title: 'Asignar permisos', href: '#' },
];

export default function RolPermisos({ rol, permisos }: RolPermisosProps) {
  const { data, setData, put, processing, errors } = useForm({
    permissions: rol.permissions,
  });

  const handlePermissionChange = (id: number) => {
    setData('permissions', data.permissions.includes(id)
      ? data.permissions.filter(pid => pid !== id)
      : [...data.permissions, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('parametros.rol.permisos.update', rol.id));
  };

  // Agrupar permisos por entidad
  const permisosPorEntidad: { [entidad: string]: Permiso[] } = {};
  permisos.forEach((permiso) => {
    const partes = permiso.name.split('-');
    const entidad = partes[1] || 'otros';
    if (!permisosPorEntidad[entidad]) permisosPorEntidad[entidad] = [];
    permisosPorEntidad[entidad].push(permiso);
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Permisos de ${rol.name}`} />
      <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
        <form onSubmit={handleSubmit} className='sm:w-4/5'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl flex justify-between items-center'>
                Permisos de {rol.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Permisos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                  {Object.entries(permisosPorEntidad).map(([entidad, permisosEntidad]) => (
                    <div key={entidad} className="border rounded p-3">
                      <div className="font-semibold mb-2 capitalize">{entidad}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {permisosEntidad.map(permiso => (
                          <label key={permiso.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={data.permissions.includes(permiso.id)}
                              onChange={() => handlePermissionChange(permiso.id)}
                            />
                            {permiso.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.permissions && <div className="text-red-500 text-sm">{errors.permissions}</div>}
              </div>
            </CardContent>
            <CardFooter className='flex justify-end gap-2'>
              <Button type="submit" disabled={processing}>Guardar cambios</Button>
              <Button asChild variant="secondary">
                <Link href={route('parametros.rol.index')}>Volver</Link>
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
} 