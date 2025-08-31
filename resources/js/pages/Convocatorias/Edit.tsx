import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DatePicker } from '@/components/form-date-picker';
import { type BreadcrumbItem } from '@/types';
import { FileText, Loader2, Plus, Trash2, Save, Edit, X } from 'lucide-react';

type Serializable = string | number | boolean | null | Serializable[] | { [key: string]: Serializable };

interface RequisitoForm extends Record<string, Serializable> {
  id: number;
  nombre: string;
  descripcion: string;
  tipo_archivo: string;
  obligatorio: boolean;
}

interface Requisito {
  id: number;
  nombre: string;
  descripcion: string;
  tipo_archivo: string;
  obligatorio: boolean;
}

interface ConvocatoriaEdit {
  id: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  requisitos: Requisito[];
  postulaciones_count?: number;
}

interface Props {
  convocatoria: ConvocatoriaEdit;
}

export default function ConvocatoriaEdit({ convocatoria }: Props) {
  const [requisitos, setRequisitos] = useState<Requisito[]>(
    (convocatoria.requisitos || []).map((r) => ({
      ...r,
      obligatorio: !!r.obligatorio,
    }))
  );
  const [editingRequisito, setEditingRequisito] = useState<Requisito | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteRequisitoDialog, setDeleteRequisitoDialog] = useState(false);
  const [requisitoToDelete, setRequisitoToDelete] = useState<Requisito | null>(null);

  const { data, setData, put, processing, errors } = useForm<{ 
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    requisitos: RequisitoForm[];
  }>({
    nombre: convocatoria.nombre,
    descripcion: convocatoria.descripcion,
    fecha_inicio: convocatoria.fecha_inicio,
    fecha_fin: convocatoria.fecha_fin,
    estado: convocatoria.estado,
    requisitos: (convocatoria.requisitos || []).map(r => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion,
      tipo_archivo: (r.tipo_archivo.includes(',') ? r.tipo_archivo.split(',')[0].trim() : r.tipo_archivo),
      obligatorio: !!r.obligatorio,
    }))
  });

  // Sincronizar requisitos con el formulario cuando cambien
  useEffect(() => {
    const serializables: RequisitoForm[] = requisitos.map(r => ({
      id: r.id,
      nombre: r.nombre,
      descripcion: r.descripcion,
      tipo_archivo: (r.tipo_archivo.includes(',') ? r.tipo_archivo.split(',')[0].trim() : r.tipo_archivo),
      obligatorio: !!r.obligatorio,
    }));
    setData('requisitos', serializables);
  }, [requisitos, setData]);

  const iniciarEdicion = (requisito: Requisito) => {
    const tipoArchivo = requisito.tipo_archivo.includes(',')
      ? requisito.tipo_archivo.split(',')[0].trim()
      : requisito.tipo_archivo;

    setEditingRequisito({
      ...requisito,
      tipo_archivo: tipoArchivo,
      obligatorio: !!requisito.obligatorio,
    });
    setIsEditing(true);
  };

  const cancelarEdicion = () => {
    setEditingRequisito(null);
    setIsEditing(false);
  };

  const guardarEdicion = () => {
    if (editingRequisito && editingRequisito.nombre.trim()) {
      if (editingRequisito.id) {
        // Actualizar requisito existente
        const requisitosActualizados = requisitos.map(r => 
          r.id === editingRequisito.id ? editingRequisito : r
        );
        setRequisitos(requisitosActualizados);
      } else {
        // Agregar nuevo requisito
        const requisitosActualizados = [...requisitos, editingRequisito];
        setRequisitos(requisitosActualizados);
      }
      setEditingRequisito(null);
      setIsEditing(false);
    }
  };

  const agregarNuevoRequisito = () => {
    setEditingRequisito({
      id: 0,
      nombre: '',
      descripcion: '',
      tipo_archivo: 'pdf',
      obligatorio: true
    });
    setIsEditing(true);
  };

  const solicitarEliminarRequisito = (requisito: Requisito) => {
    setRequisitoToDelete(requisito);
    setDeleteRequisitoDialog(true);
  };

  const confirmarEliminarRequisito = () => {
    if (requisitoToDelete) {
      // Si el requisito tiene ID, verificar si tiene postulaciones
      if (requisitoToDelete.id && convocatoria.postulaciones_count && convocatoria.postulaciones_count > 0) {
        alert('No se puede eliminar un requisito que tiene postulaciones asociadas.');
        return;
      }
      
      const nuevosRequisitos = requisitos.filter(r => r !== requisitoToDelete);
      setRequisitos(nuevosRequisitos);
      setRequisitoToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('convocatorias.update', convocatoria.id));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Convocatorias', href: route('convocatorias.index') },
    { title: convocatoria.nombre, href: route('convocatorias.show', convocatoria.id) },
    { title: 'Editar', href: route('convocatorias.edit', convocatoria.id) }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Editar - ${convocatoria.nombre}`} />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className='relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border'>
          <div className="flex flex-row items-center justify-between p-5">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Convocatoria</h1>
              <p className="text-gray-600 mt-2">
                Modifica la convocatoria "{convocatoria.nombre}"
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-5">
            {/* Información de la Convocatoria */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Convocatoria</CardTitle>
                <CardDescription>
                  Modifica los datos de la convocatoria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={data.nombre as string}
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
                      value={data.estado as string}
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
                    <DatePicker
                      value={data.fecha_inicio ? new Date(data.fecha_inicio as string) : undefined}
                      onValueChange={(date) => setData('fecha_inicio', date ? date.toISOString().split('T')[0] : '')}
                      placeholder="Seleccionar fecha de inicio..."
                      required
                    />
                    {errors.fecha_inicio && (
                      <p className="text-sm text-red-600">{errors.fecha_inicio}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
                    <DatePicker
                      value={data.fecha_fin ? new Date(data.fecha_fin as string) : undefined}
                      onValueChange={(date) => setData('fecha_fin', date ? date.toISOString().split('T')[0] : '')}
                      placeholder="Seleccionar fecha de fin..."
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
                    value={data.descripcion as string}
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
                  Gestiona los requisitos existentes y agrega nuevos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulario para agregar/editar requisito */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-gray-900">
                    {isEditing ? 'Editar Requisito' : 'Agregar Nuevo Requisito'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="req-nombre">Nombre del Requisito *</Label>
                      <Input
                        id="req-nombre"
                        type="text"
                        value={editingRequisito?.nombre || ''}
                        onChange={(e) => setEditingRequisito(editingRequisito ? {...editingRequisito, nombre: e.target.value} : null)}
                        placeholder="Ej: CV, Certificado de estudios, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="req-tipo">Tipo de Archivo</Label>
                      <Select
                        value={editingRequisito?.tipo_archivo || 'pdf'}
                        onValueChange={(value) => setEditingRequisito(editingRequisito ? {...editingRequisito, tipo_archivo: value} : null)}
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
                      value={editingRequisito?.descripcion || ''}
                      onChange={(e) => setEditingRequisito(editingRequisito ? {...editingRequisito, descripcion: e.target.value} : null)}
                      placeholder="Descripción del requisito (opcional)"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="req-obligatorio"
                        checked={editingRequisito?.obligatorio || false}
                        onChange={(e) => setEditingRequisito(editingRequisito ? {...editingRequisito, obligatorio: e.target.checked} : null)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="req-obligatorio">Requisito obligatorio</Label>
                    </div>

                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={guardarEdicion}
                          disabled={!editingRequisito?.nombre.trim()}
                          size="sm"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {editingRequisito?.id ? 'Guardar Cambios' : 'Agregar Requisito'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelarEdicion}
                          size="sm"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={agregarNuevoRequisito}
                        size="sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Requisito
                      </Button>
                    )}
                  </div>
                </div>

                {/* Lista de requisitos configurados */}
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
                            {!requisito.obligatorio && (
                              <Badge variant="default" className="bg-gray-500 text-xs">
                                Opcional
                              </Badge>
                            )}
                          </div>
                          {requisito.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">{requisito.descripcion}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => iniciarEdicion(requisito)}
                            disabled={isEditing}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => solicitarEliminarRequisito(requisito)}
                            disabled={isEditing}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {requisitos.length === 0 && !isEditing && (
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
              
              <Button type="submit" disabled={processing || requisitos.length === 0 || isEditing}>
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Modal de confirmación para eliminar requisito */}
        <ConfirmDialog
          open={deleteRequisitoDialog}
          onOpenChange={setDeleteRequisitoDialog}
          title="Eliminar Requisito"
          description={`¿Estás seguro de que quieres eliminar el requisito "${requisitoToDelete?.nombre}"? Esta acción es irreversible.`}
          confirmText="Eliminar"
          confirmVariant="destructive"
          onConfirm={confirmarEliminarRequisito}
        />
      </div>
    </AppLayout>
  );
}
