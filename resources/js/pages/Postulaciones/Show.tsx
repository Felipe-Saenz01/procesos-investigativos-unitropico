import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';
import { Postulacion, Convocatoria } from '@/types';
import { ArrowLeft, Check, Download, File, X, Edit } from 'lucide-react';
import { EstadoBadge } from '@/components/EstadoBadge';
import EditarObservacionModal from '@/components/EditarObservacionModal';

interface Props {
  postulacion: Postulacion & {
    convocatoria: Convocatoria;
    usuario: {
      id: number;
      name: string;
      email: string;
      tipo: string;
      grupo_investigacion?: {
        nombre: string;
      };
    };
    archivos: Array<{
      id: number;
      nombre_original: string;
      nombre_archivo: string;
      ruta_archivo: string;
      tipo_mime: string;
      tamaño_bytes: number;
      observaciones?: string | null;
      requisito_convocatoria: {
        id: number;
        nombre: string;
        descripcion?: string;
        tipo_archivo: string;
        obligatorio: boolean;
      };
    }>;
  };
}

export default function PostulacionShow({ postulacion }: Props) {
  const { hasPermission } = usePermissions();
  const [observacionModalOpen, setObservacionModalOpen] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<{
    id: number;
    nombre_original: string;
    observaciones?: string | null;
  } | null>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canReview = hasPermission('revisar-postulaciones') && postulacion.estado === 'Pendiente';

  const handleGuardarObservacion = (observacion: string) => {
    if (archivoSeleccionado) {
      // Enviar la actualización al servidor
      router.put(route('postulaciones.archivos.observaciones', [postulacion.id, archivoSeleccionado.id]), {
        observacion: observacion
      }, {
        onSuccess: () => {
          setObservacionModalOpen(false);
          setArchivoSeleccionado(null);
        }
      });
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Convocatorias', href: route('convocatorias.index') },
    { title: postulacion.convocatoria.nombre.slice(0, 30) + '...', href: route('convocatorias.show', postulacion.convocatoria.id) },
    { title: 'Postulaciones', href: route('convocatorias.postulaciones', postulacion.convocatoria.id) },
    { title: `Postulación de ${postulacion.usuario.name}`, href: route('postulaciones.show', postulacion.id) }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Postulación - ${postulacion.usuario.name}`} />

      <div className="py-6 px-5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Postulación</h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link href={route('convocatorias.postulaciones', postulacion.convocatoria.id)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Postulaciones
              </Link>
            </Button>

            {canReview && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  asChild
                >
                  <Link href="#">
                    <Check className="mr-2 h-4 w-4" />
                    Aprobar
                  </Link>
                </Button>

                <Button
                  variant="destructive"
                  asChild
                >
                  <Link href="#">
                    <X className="mr-2 h-4 w-4" />
                    Rechazar
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Información Principal - Postulación y Convocatoria */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Información de la Postulación */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Postulante */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Postulante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre</p>
                    <p className="text-gray-900">{postulacion.usuario.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{postulacion.usuario.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tipo de Usuario</p>
                    <Badge variant="outline">{postulacion.usuario.tipo}</Badge>
                  </div>
                  {postulacion.usuario.grupo_investigacion && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Grupo de Investigación</p>
                      <p className="text-gray-900">{postulacion.usuario.grupo_investigacion.nombre}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estado de la Postulación */}
            <Card>
              <CardHeader>
                <CardTitle>Estado de la Postulación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <EstadoBadge estado={postulacion.estado} />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Postulación</p>
                    <p className="text-gray-900">{formatDate(postulacion.created_at)}</p>
                  </div>
                  {postulacion.updated_at !== postulacion.created_at && (
                    <div>
                      <p className="text-sm text-gray-500">Última Actualización</p>
                      <p className="text-gray-900">{formatDate(postulacion.updated_at)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar con información de la Convocatoria */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Convocatoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-gray-900">{postulacion.convocatoria.nombre}</p>
                </div>
                <div>
                  <EstadoBadge estado={postulacion.convocatoria.estado} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Inicio</p>
                  <p className="text-gray-900">{formatDate(postulacion.convocatoria.fecha_inicio)}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha de Fin</p>
                  <p className="text-gray-900">{formatDate(postulacion.convocatoria.fecha_fin)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Archivos Subidos - Ocupando todo el ancho */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Subidos</CardTitle>
            <CardDescription>
              Archivos entregados por el postulante
            </CardDescription>
          </CardHeader>
          <CardContent>
            {postulacion.archivos.length > 0 ? (
              <div className="space-y-4">
                {postulacion.archivos.map((archivo) => (
                  <div key={archivo.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <File className="h-5 w-5 text-gray-400" />
                          <h4 className="font-medium text-gray-900">{archivo.requisito_convocatoria.nombre}</h4>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {hasPermission('revisar-postulaciones') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setArchivoSeleccionado({
                                  id: archivo.id,
                                  nombre_original: archivo.nombre_original,
                                  observaciones: archivo.observaciones
                                });
                                setObservacionModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              Observaciones
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(route('postulaciones.archivos.descargar', [postulacion.id, archivo.id]), '_blank')}
                          >
                            <Download className="h-4 w-4" />
                            Descargar
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {archivo.requisito_convocatoria.tipo_archivo}
                            </Badge>
                            {archivo.requisito_convocatoria.obligatorio ? (
                              <Badge variant="destructive" className="text-xs">
                                Obligatorio
                              </Badge>
                            ) : (
                              <Badge variant="default" className="bg-gray-500 text-xs">
                                Opcional
                              </Badge>
                            )}
                          </div>
                          {archivo.requisito_convocatoria.descripcion && (
                            <>
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Descripción:</span> {archivo.requisito_convocatoria.descripcion}
                              </p>
                            </>
                          )}
                        </div>

                        <div className="bg-gray-100 p-2 rounded-lg">
                          <h4 className="text-2sm font-bold text-gray-800 mb-1">
                            Información del archivo
                          </h4>
                          <p className="text-sm text-gray-800 mb-1">
                            Archivo: {archivo.nombre_original}
                          </p>
                          <p className="text-sm text-gray-800">
                            Tamaño: {formatFileSize(archivo.tamaño_bytes)}
                          </p>
                          <p className="text-sm text-gray-800 mb-1">
                            Observaciones:
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            {archivo.observaciones || 'No hay observaciones'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No se han subido archivos para esta postulación.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para editar observaciones */}
      {archivoSeleccionado && (
        <EditarObservacionModal
          open={observacionModalOpen}
          onOpenChange={setObservacionModalOpen}
          archivo={archivoSeleccionado}
          onSave={handleGuardarObservacion}
        />
      )}
    </AppLayout>
  );
}
