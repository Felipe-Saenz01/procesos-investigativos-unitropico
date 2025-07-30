import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Permiso {
  id: number;
  name: string;
}

interface Rol {
  id: number;
  name: string;
  permissions?: Permiso[];
}

interface RolesIndexProps {
  roles: Rol[];
}

const breadcrumbs = [
  { title: 'Parámetros', href: '/parametros/periodo' },
  { title: 'Roles', href: route('parametros.rol.index') },
];

export default function RolesIndex({ roles }: RolesIndexProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Roles" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
          <div className='flex flex-row items-center justify-between p-5'>
            <h1 className='text-2xl font-bold'>Roles</h1>
            <Link href={route('parametros.rol.create')} prefetch>
              <Button><Plus /> Nuevo Rol</Button>
            </Link>
          </div>
          <div className='p-5'>
            <Card>
              <CardContent>
                <Table className='table-auto'>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='font-bold'>Nombre</TableHead>
                      <TableHead className='font-bold'>Permisos</TableHead>
                      <TableHead className='font-bold'>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((rol) => (
                      <TableRow key={rol.id}>
                        <TableCell>{rol.name}</TableCell>
                        <TableCell>
                          {rol.permissions && rol.permissions.length > 0 && (
                            <>
                              {rol.permissions.slice(0, 4).map((permiso) => (
                                <span key={permiso.id} className="inline-block bg-gray-200 rounded px-2 py-1 mr-1 text-xs">{permiso.name}</span>
                              ))}
                              {rol.permissions.length > 4 && (
                                <span className="inline-block text-xs text-gray-500">.. {rol.permissions.length - 4} más</span>
                              )}
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={route('parametros.rol.edit', rol.id)}><Edit className="h-4 w-4" /></Link>
                            </Button>
                            <Button asChild size="sm" variant="default">
                              <Link href={route('parametros.rol.permisos', rol.id)}>
                                <Shield className="h-4 w-4 mr-1" />Asignar permisos
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="destructive">
                              <Link href={route('parametros.rol.destroy', rol.id)}><Trash2 className="h-4 w-4" /></Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 