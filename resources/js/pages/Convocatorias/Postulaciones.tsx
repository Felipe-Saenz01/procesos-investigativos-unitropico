import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Convocatoria, Postulacion } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Check, Eye, RefreshCcw, Send, Users, X } from 'lucide-react';
import { EstadoBadge } from '@/components/EstadoBadge';

interface Props {
  convocatoria: Convocatoria;
  postulaciones: (Postulacion & {
    usuario: {
      id: number;
      name: string;
      email: string;
      tipo: string;
    };
    archivos: Array<{
      id: number;
      nombre_original: string;
      requisito_convocatoria: {
        nombre: string;
        obligatorio: boolean;
      };
    }>;
  })[];
  isAdmin: boolean;
}

export default function ConvocatoriasPostulaciones({ convocatoria, postulaciones, isAdmin }: Props) {

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Convocatorias', href: route('convocatorias.index') },
    { title: convocatoria.nombre, href: route('convocatorias.show', convocatoria.id) },
    { title: isAdmin ? 'Todas las Postulaciones' : 'Mis Postulaciones', href: route('convocatorias.postulaciones', convocatoria.id) }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${isAdmin ? 'Todas las Postulaciones' : 'Mis Postulaciones'} - ${convocatoria.nombre}`} />
      <div className="container mx-auto py-6 px-5">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'Todas las Postulaciones' : 'Mis Postulaciones'}
              </h1>
              <p className="text-gray-600 mt-2">
                Convocatoria: {convocatoria.nombre}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link href={route('convocatorias.show', convocatoria.id)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Convocatoria
                </Link>
              </Button>

              {!isAdmin && convocatoria.esta_abierta && (
                <Button asChild>
                  <Link href={route('convocatorias.postular', convocatoria.id)}>
                    <Send className="mr-2 h-4 w-4" />
                    Postularse
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isAdmin ? 'Lista de Todas las Postulaciones' : 'Historial de Mis Postulaciones'}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? 'Revisa y gestiona todas las postulaciones recibidas'
                : 'Todas tus postulaciones a esta convocatoria'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {postulaciones.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    {isAdmin && <TableHead>Postulante</TableHead>}
                    {isAdmin && <TableHead>Tipo Usuario</TableHead>}
                    <TableHead>Estado</TableHead>
                    <TableHead>N° Archivos</TableHead>
                    <TableHead>Fecha Postulación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postulaciones.map((postulacion) => (
                    <TableRow key={postulacion.id}>
                      {isAdmin && (
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{postulacion.usuario.name}</p>
                            <p className="text-sm text-gray-500">{postulacion.usuario.email}</p>
                          </div>
                        </TableCell>
                      )}
                      {isAdmin && (
                        <TableCell>
                          <Badge variant="outline">
                            {postulacion.usuario.tipo}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell>
                        <EstadoBadge estado={postulacion.estado} />
                      </TableCell>
                      <TableCell>
                        {postulacion.archivos.length}
                      </TableCell>
                      <TableCell>
                        {formatDate(postulacion.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={route('postulaciones.show', postulacion.id)}>
                              <Eye className="h-4 w-4" />
                              Ver
                            </Link>
                          </Button>

                          {isAdmin && postulacion.estado === 'pendiente' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                asChild
                              >
                                <Link href={route('postulaciones.aprobar', postulacion.id)}>
                                  <Check className="h-4 w-4" />
                                  Aprobar
                                </Link>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                asChild
                              >
                                <Link href={route('postulaciones.rechazar', postulacion.id)}>
                                  <X className="h-4 w-4" />
                                  Rechazar
                                </Link>
                              </Button>
                            </>
                          )}

                          {!isAdmin && postulacion.estado === 'rechazada' && convocatoria.esta_abierta && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={route('convocatorias.postular', convocatoria.id)}>
                                <RefreshCcw className="h-4 w-4" />
                                Postularse Nuevamente
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isAdmin ? 'No hay postulaciones' : 'No tienes postulaciones'}
                </h3>
                <p className="text-gray-600">
                  {isAdmin
                    ? 'Aún no se han recibido postulaciones para esta convocatoria.'
                    : 'Aún no te has postulado a esta convocatoria.'
                  }
                </p>
                {!isAdmin && convocatoria.esta_abierta && (
                  <div className="mt-4">
                    <Button asChild>
                      <Link href={route('convocatorias.postular', convocatoria.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Postularse Ahora
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
