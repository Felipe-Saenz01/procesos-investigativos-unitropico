import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';
import { Convocatoria, RequisitosConvocatoria } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { FileText, Send, Users, ArrowLeft } from 'lucide-react';
import { EstadoBadge } from '@/components/EstadoBadge';

interface Props {
  convocatoria: Convocatoria & {
    requisitos: RequisitosConvocatoria[];

  };
}

export default function ConvocatoriaShow({ convocatoria }: Props) {
  const { hasPermission } = usePermissions();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const canPostularse = convocatoria.esta_abierta &&
    hasPermission('crear-postulaciones') &&
    !convocatoria.mi_postulacion;

  const handleVerPostulaciones = () => {
    if (convocatoria.mi_postulacion) {
      // Si tiene postulación, ir directamente a ella
      window.location.href = route('postulaciones.show', convocatoria.mi_postulacion.id);
    } else {
      // Si no tiene postulación, ir al listado (solo administradores)
      window.location.href = route('convocatorias.postulaciones', convocatoria.id);
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Convocatorias', href: route('convocatorias.index') },
    { title: convocatoria.nombre, href: route('convocatorias.show', convocatoria.id) }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={convocatoria.nombre} />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className='relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border'>
          <div className="flex flex-row items-center justify-between p-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{convocatoria.nombre}</h1>
              <div className="flex items-center space-x-3 mt-2">
                <EstadoBadge estado={convocatoria.estado} />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link href={route('convocatorias.index')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a convocatorias
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5">
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {convocatoria.descripcion || 'No hay descripción disponible para esta convocatoria.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requisitos de la Convocatoria</CardTitle>
                  <CardDescription>
                    Documentos y requisitos que debes entregar para postularte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {convocatoria.requisitos.length > 0 ? (
                    <div className="space-y-4">
                      {convocatoria.requisitos.map((requisito) => (
                        <div key={requisito.id} className="p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <h4 className="font-medium text-gray-900">{requisito.nombre}</h4>
                              </div>
                              <div className="flex items-center space-x-2 my-2">
                                <Badge variant="outline" className="text-xs">
                                  {requisito.tipo_archivo}
                                </Badge>
                                {requisito.obligatorio ? (
                                  <Badge variant="destructive" className="text-xs">
                                    Obligatorio
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="bg-gray-500 text-xs">
                                    Opcional
                                  </Badge>
                                )}
                              </div>
                            </div>


                            {requisito.descripcion && (
                              <p className="text-sm text-gray-600 mb-2">
                                {requisito.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p>No hay requisitos configurados</p>
                      <p className="text-sm">Esta convocatoria no requiere documentos específicos</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar con Acciones */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hasPermission('ver-postulaciones') && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleVerPostulaciones}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {convocatoria.mi_postulacion ? 'Ver Mi Postulación' : 'Ver Postulaciones'}
                    </Button>
                  )}

                  {canPostularse && (
                    <Button className="w-full" asChild>
                      <Link href={route('convocatorias.postular', convocatoria.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Postularse
                      </Link>
                    </Button>
                  )}

                  {convocatoria.mi_postulacion && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={route('postulaciones.show', convocatoria.mi_postulacion.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Mi Postulación
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información de la Convocatoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estado</p>
                    <div className="mt-1">
                      <EstadoBadge estado={convocatoria.estado} />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Inicio</p>
                    <p className="text-gray-900">{formatDate(convocatoria.fecha_inicio)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Fin</p>
                    <p className="text-gray-900">{formatDate(convocatoria.fecha_fin)}</p>
                  </div>

                  {convocatoria.esta_abierta && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Días Restantes</p>
                      <p className="text-green-600 font-medium">{convocatoria.dias_restantes} días</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-500">Requisitos</p>
                    <p className="text-gray-900">{convocatoria.requisitos.length} requisitos</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
