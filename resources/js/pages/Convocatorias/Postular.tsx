import React from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Convocatoria, RequisitosConvocatoria } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { CheckCircle, Loader2, Send } from 'lucide-react';

interface Props {
  convocatoria: Convocatoria & {
    requisitos: RequisitosConvocatoria[];
  };
}

export default function ConvocatoriaPostular({ convocatoria }: Props) {
  const { data, setData, processing, errors } = useForm<{
    convocatoria_id: number;
    archivos: Record<number, File | null>;
    observaciones: Record<number, string>;
  }>(
    {
      convocatoria_id: convocatoria.id,
      archivos: {},
      observaciones: {},
    }
  );

  const handleFileChange = (requisitoId: number, file: File | null) => {
    setData('archivos', {
      ...data.archivos,
      [requisitoId]: file,
    });
  };

  const handleObservacionChange = (requisitoId: number, observacion: string) => {
    setData('observaciones', {
      ...data.observaciones,
      [requisitoId]: observacion,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('convocatoria_id', String(data.convocatoria_id));

    Object.entries(data.archivos).forEach(([requisitoId, file]) => {
      if (file) {
        formData.append(`archivos[${requisitoId}]`, file);
      }
    });

    Object.entries(data.observaciones).forEach(([requisitoId, observacion]) => {
      if (observacion && observacion.trim()) {
        formData.append(`observaciones[${requisitoId}]`, observacion.trim());
      }
    });

    router.post(route('convocatorias.postular.store', convocatoria.id), formData, {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Convocatorias', href: route('convocatorias.index') },
    { title: convocatoria.nombre, href: route('convocatorias.show', convocatoria.id) },
    { title: 'Postularse', href: route('convocatorias.postular', convocatoria.id) }
  ];

  const acceptFromTipos = (tipos: string) => {
    // convierte 'pdf,word,excel,image,any' en extensiones/mimes aceptados por el input
    return tipos
      .split(',')
      .map(t => t.trim())
      .map(t => {
        switch (t) {
          case 'word': return '.doc,.docx';
          case 'excel': return '.xls,.xlsx';
          case 'image': return 'image/*';
          case 'any': return '';
          default: return `.${t}`;
        }
      })
      .filter(Boolean)
      .join(',');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Postularse - ${convocatoria.nombre}`} />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className='relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border'>
          <div className="flex flex-row items-center justify-between p-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Postularse a Convocatoria</h1>
              <p className="text-gray-600 mt-2">
                Completa tu postulación para "{convocatoria.nombre}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5">
            {/* Formulario de Postulación */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Formulario de Postulación</CardTitle>
                  <CardDescription>
                    Sube los documentos requeridos y completa la información
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requisitos y Archivos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Documentos Requeridos</h3>
                      
                      {convocatoria.requisitos.map((requisito) => (
                        <div key={requisito.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{requisito.nombre}</h4>
                              {requisito.descripcion && (
                                <p className="text-sm text-gray-600 mt-1">{requisito.descripcion}</p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
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
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`file-${requisito.id}`}>
                              {requisito.obligatorio ? 'Archivo *' : 'Archivo (Opcional)'}
                            </Label>
                            <Input
                              id={`file-${requisito.id}`}
                              type="file"
                              accept={acceptFromTipos(requisito.tipo_archivo)}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0] || null;
                                handleFileChange(requisito.id, file);
                              }}
                              required={requisito.obligatorio}
                            />
                            {data.archivos[requisito.id] && (
                              <div className="flex items-center space-x-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>{data.archivos[requisito.id]?.name}</span>
                              </div>
                            )}
                            {(errors as Record<string, string>)[`archivos.${requisito.id}`] && (
                              <p className="text-sm text-red-600">{(errors as Record<string, string>)[`archivos.${requisito.id}`]}</p>
                            )}
                          </div>

                          <div className="space-y-2 mt-4">
                            <Label htmlFor={`observacion-${requisito.id}`}>
                              Observaciones (Opcional)
                            </Label>
                            <Textarea
                              id={`observacion-${requisito.id}`}
                              placeholder="Agrega comentarios o notas sobre este documento..."
                              value={data.observaciones[requisito.id] || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                handleObservacionChange(requisito.id, e.target.value);
                              }}
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                      >
                        Cancelar
                      </Button>
                      
                      <Button type="submit" disabled={processing}>
                        {processing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar Postulación
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Información de la Convocatoria */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de la Convocatoria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estado</p>
                    <Badge className="mt-1 bg-green-100 text-green-800 border-green-200">
                      {convocatoria.estado.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Inicio</p>
                    <p className="text-gray-900">{formatDate(convocatoria.fecha_inicio)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Fecha de Fin</p>
                    <p className="text-gray-900">{formatDate(convocatoria.fecha_fin)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Días Restantes</p>
                    <p className="text-green-600 font-medium">{convocatoria.dias_restantes} días</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm leading-relajada">
                    {convocatoria.descripcion || 'No hay descripción disponible.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
