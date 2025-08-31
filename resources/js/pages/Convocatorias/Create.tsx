import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { FileText, Loader2, Plus, Trash2 } from 'lucide-react';

interface Requisito {
  nombre: string;
  descripcion: string;
  tipo_archivo: string;
  obligatorio: boolean;
}

export default function ConvocatoriaCreate() {
  const [requisitos, setRequisitos] = useState<Requisito[]>([]);
  const [nuevoRequisito, setNuevoRequisito] = useState<Requisito>({
    nombre: '',
    descripcion: '',
    tipo_archivo: 'pdf',
    obligatorio: true
  });

  const { data, setData, post, processing, errors } = useForm({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Pendiente',
    requisitos: []
  });

  const agregarRequisito = () => {
    if (nuevoRequisito.nombre.trim()) {
      const requisitosActualizados: Requisito[] = [...requisitos, { ...nuevoRequisito }];
      setRequisitos(requisitosActualizados);
      setData('requisitos', requisitosActualizados as never[]);
      setNuevoRequisito({
        nombre: '',
        descripcion: '',
        tipo_archivo: 'pdf',
        obligatorio: true
      });
    }
  };

  const eliminarRequisito = (index: number) => {
    const nuevosRequisitos = requisitos.filter((_, i) => i !== index);
    setRequisitos(nuevosRequisitos);
    setData('requisitos', nuevosRequisitos as never[]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('convocatorias.store'));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Convocatorias', href: route('convocatorias.index') },
    { title: 'Nueva Convocatoria', href: route('convocatorias.create') }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Nueva Convocatoria" />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className='relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border'>
          <div className="flex flex-row items-center justify-between p-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Convocatoria</h1>
              <p className="text-gray-600 mt-2">
                Crea una nueva convocatoria interna para la universidad
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5">
            {/* Información de la Convocatoria */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Convocatoria</CardTitle>
                <CardDescription>
                  Completa los datos requeridos para crear la convocatoria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={data.nombre}
                      onChange={(e) => setData('nombre', e.target.value)}
                      placeholder="Nombre de la convocatoria"
                      required
                    />
                    {errors.nombre && (
                      <p className="text-sm text-red-600">{errors.nombre}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                      value={data.estado}
                      onValueChange={(value) => setData('estado', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Abierta">Abierta</SelectItem>
                        <SelectItem value="Cerrada">Cerrada</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-sm text-red-600">{errors.estado}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                    <Input
                      id="fecha_inicio"
                      type="date"
                      value={data.fecha_inicio}
                      onChange={(e) => setData('fecha_inicio', e.target.value)}
                      required
                    />
                    {errors.fecha_inicio && (
                      <p className="text-sm text-red-600">{errors.fecha_inicio}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
                    <Input
                      id="fecha_fin"
                      type="date"
                      value={data.fecha_fin}
                      onChange={(e) => setData('fecha_fin', e.target.value)}
                      required
                    />
                    {errors.fecha_fin && (
                      <p className="text-sm text-red-600">{errors.fecha_fin}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={data.descripcion}
                    onChange={(e) => setData('descripcion', e.target.value)}
                    placeholder="Descripción detallada de la convocatoria"
                    rows={4}
                  />
                  {errors.descripcion && (
                    <p className="text-sm text-red-600">{errors.descripcion}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Requisitos de la Convocatoria */}
            <Card>
              <CardHeader>
                <CardTitle>Requisitos de la Convocatoria</CardTitle>
                <CardDescription>
                  Define los documentos y requisitos que los postulantes deben entregar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulario para agregar requisito */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">Agregar Nuevo Requisito</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="req-nombre">Nombre del Requisito *</Label>
                      <Input
                        id="req-nombre"
                        value={nuevoRequisito.nombre}
                        onChange={(e) => setNuevoRequisito({...nuevoRequisito, nombre: e.target.value})}
                        placeholder="Ej: CV, Certificado de estudios, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="req-tipo">Tipo de Archivo</Label>
                      <Select
                        value={nuevoRequisito.tipo_archivo}
                        onValueChange={(value) => setNuevoRequisito({...nuevoRequisito, tipo_archivo: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="word">Word (.doc, .docx)</SelectItem>
                          <SelectItem value="excel">Excel (.xls, .xlsx)</SelectItem>
                          <SelectItem value="image">Imagen</SelectItem>
                          <SelectItem value="any">Cualquier formato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="req-descripcion">Descripción</Label>
                    <Textarea
                      id="req-descripcion"
                      value={nuevoRequisito.descripcion}
                      onChange={(e) => setNuevoRequisito({...nuevoRequisito, descripcion: e.target.value})}
                      placeholder="Descripción del requisito (opcional)"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="req-obligatorio"
                        checked={nuevoRequisito.obligatorio}
                        onChange={(e) => setNuevoRequisito({...nuevoRequisito, obligatorio: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="req-obligatorio">Requisito obligatorio</Label>
                    </div>

                    <Button
                      type="button"
                      onClick={agregarRequisito}
                      disabled={!nuevoRequisito.nombre.trim()}
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Requisito
                    </Button>
                  </div>
                </div>

                {/* Lista de requisitos agregados */}
                {requisitos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Requisitos Configurados</h4>
                    {requisitos.map((requisito, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">{requisito.nombre}</h5>
                            <Badge variant="outline" className="text-xs">
                              {requisito.tipo_archivo.toUpperCase()}
                            </Badge>
                            {requisito.obligatorio && (
                              <Badge variant="destructive" className="text-xs">
                                Obligatorio
                              </Badge>
                            )}
                          </div>
                          {requisito.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">{requisito.descripcion}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => eliminarRequisito(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {requisitos.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p>No hay requisitos configurados</p>
                    <p className="text-sm">Agrega al menos un requisito para la convocatoria</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="flex items-center justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              
              <Button type="submit" disabled={processing || requisitos.length === 0}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Convocatoria
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
