import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { usePermissions } from '@/hooks/use-permissions';
import { Convocatoria } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { EstadoBadge } from '@/components/EstadoBadge';
import Paginator from '@/components/Paginator';

interface Props {
  convocatorias: Convocatoria[];
  convocatorias_links?: { url: string | null; label: string; active: boolean }[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Convocatorias',
    href: '/investigadores',
  }
];

export default function ConvocatoriasIndex({ convocatorias, convocatorias_links }: Props) {
  const { hasPermission } = usePermissions();
  const { delete: destroy } = useForm();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convocatoriaToDelete, setConvocatoriaToDelete] = useState<Convocatoria | null>(null);

  const handleRequestDelete = (convocatoria: Convocatoria) => {
    setConvocatoriaToDelete(convocatoria);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (convocatoriaToDelete) {
      destroy(route('convocatorias.destroy', convocatoriaToDelete.id));
      setConvocatoriaToDelete(null);
    }
  };


  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Convocatorias" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className='relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border'>
          <div className="flex flex-row items-center justify-between p-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Convocatorias</h1>
            </div>
            <div className='flex flex-row items-center gap-2'>
              {hasPermission('crear-convocatorias') && (
                <Button asChild>
                  <Link href={route('convocatorias.create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Convocatoria
                  </Link>
                </Button>
              )}
            </div>
          </div>
          {convocatorias.length > 0 ? (
            <div className="py-6 px-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead>Días Restantes</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {convocatorias.map((convocatoria) => (
                    <TableRow key={convocatoria.id}>
                      <TableCell className="font-medium whitespace-normal break-words">
                        {convocatoria.nombre}
                      </TableCell>
                      <TableCell>
                        <EstadoBadge estado={convocatoria.estado} />
                      </TableCell>
                      <TableCell>
                        {formatDate(convocatoria.fecha_inicio)}
                      </TableCell>
                      <TableCell>
                        {formatDate(convocatoria.fecha_fin)}
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          {convocatoria.dias_restantes} días
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={route('convocatorias.show', convocatoria.id)}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>

                          {hasPermission('editar-convocatorias') && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={route('convocatorias.edit', convocatoria.id)}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}

                          {hasPermission('ver-postulaciones') && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={route('convocatorias.postulaciones', convocatoria.id)}>
                                <FileText className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}

                          {hasPermission('eliminar-convocatorias') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRequestDelete(convocatoria)}
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-6 px-5">
              <div className="text-center py-8 text-gray-500">
                No hay convocatorias disponibles
              </div>
            </div>
          )}
          <div className="px-5 pb-6">
            <Paginator links={convocatorias_links} />
          </div>
        </div>


        {/* Modal de confirmación para eliminar */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Convocatoria"
          description={`¿Estás seguro de que quieres eliminar la convocatoria "${convocatoriaToDelete?.nombre}"? Esta acción es irreversible y eliminará todos los datos asociados.`}
          confirmText="Eliminar"
          confirmVariant="destructive"
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  );
}
