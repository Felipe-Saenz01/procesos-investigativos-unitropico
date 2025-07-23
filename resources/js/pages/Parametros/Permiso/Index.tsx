import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface Rol {
  id: number;
  name: string;
}

interface Permiso {
  id: number;
  name: string;
  roles?: Rol[];
}

interface PermisosIndexProps {
  permisos: Permiso[];
}

const breadcrumbs = [
  { title: 'Parámetros', href: '/parametros/periodo' },
  { title: 'Permisos', href: route('parametros.permiso.index') },
];

export default function PermisosIndex({ permisos }: PermisosIndexProps) {
  const { delete: destroy, processing } = useForm();
  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este permiso?')) {
      destroy(route('parametros.permiso.destroy', id));
    }
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
      <Head title="Permisos" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <div className='flex flex-row items-center justify-between p-5'>
            <h1 className='text-2xl font-bold'>Permisos</h1>
            <Link href={route('parametros.permiso.create')} prefetch>
              <Button><Plus /> Nuevo Permiso</Button>
            </Link>
          </div>
          <div className='p-5'>
            <Card>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {Object.entries(permisosPorEntidad).map(([entidad, permisosEntidad]) => (
                    <AccordionItem key={entidad} value={entidad}>
                      <AccordionTrigger className="capitalize font-semibold text-base">{entidad}</AccordionTrigger>
                      <AccordionContent>
                        <Table className="mb-4">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Roles Asociados</TableHead>
                              <TableHead>Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {permisosEntidad.map((permiso) => (
                              <TableRow key={permiso.id}>
                                <TableCell>{permiso.name}</TableCell>
                                <TableCell>
                                  {permiso.roles?.map((rol) => (
                                    <span key={rol.id} className="inline-block bg-gray-200 rounded px-2 py-1 mr-1 text-xs">{rol.name}</span>
                                  ))}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button asChild size="sm" variant="outline">
                                      <Link href={route('parametros.permiso.edit', permiso.id)}><Edit className="h-4 w-4" /></Link>
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(permiso.id)} disabled={processing}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button asChild size="sm" variant="secondary">
                                      <Link href={route('parametros.rol.index')}><Shield className="h-4 w-4 mr-1" />Roles</Link>
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 