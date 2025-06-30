import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/form-date-picker';
import { Plus, Trash, Calendar } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export interface Actividad {
    [key: string]: string | number | boolean | null | undefined;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
}

interface ActividadesProyectoProps {
    actividades: Actividad[];
    setData: (key: string, value: Actividad[]) => void;
}

export default function ActividadesProyecto({ actividades, setData }: ActividadesProyectoProps) {
    const [nuevaActividad, setNuevaActividad] = useState<Actividad>({
        nombre: '',
        fecha_inicio: '',
        fecha_fin: ''
    });

    const agregarActividad = () => {
        if (nuevaActividad.nombre && nuevaActividad.fecha_inicio && nuevaActividad.fecha_fin) {
            setData('actividades', [...actividades, nuevaActividad]);
            setNuevaActividad({
                nombre: '',
                fecha_inicio: '',
                fecha_fin: ''
            });
        }
    };

    const eliminarActividad = (index: number) => {
        setData('actividades', actividades.filter((_, i) => i !== index));
    };

    return (
        <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5" />
                <Label className="text-lg font-semibold">Actividades del Proyecto</Label>
            </div>
            
            {/* Lista de actividades */}
            {actividades.length > 0 && (
                <div className="mb-4 space-y-2">
                    {actividades.map((actividad, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <p className="font-medium">{actividad.nombre}</p>
                                <p className="text-sm text-gray-600">
                                    {actividad.fecha_inicio} - {actividad.fecha_fin}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => eliminarActividad(index)}
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Formulario para agregar nueva actividad */}
            <div className="space-y-3 p-4 border rounded-lg bg-white">
                <Label className="text-sm font-medium">Agregar Nueva Actividad</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                        <Label htmlFor="actividad_nombre" className="text-xs">Nombre de la Actividad</Label>
                        <Input
                            id="actividad_nombre"
                            type="text"
                            value={nuevaActividad.nombre}
                            onChange={(e) => setNuevaActividad({...nuevaActividad, nombre: e.target.value})}
                            placeholder="Nombre de la actividad"
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="actividad_inicio" className="text-xs">Fecha de Inicio</Label>
                        <DatePicker
                            value={nuevaActividad.fecha_inicio ? new Date(nuevaActividad.fecha_inicio) : undefined}
                            onValueChange={(date) => setNuevaActividad({
                                ...nuevaActividad, 
                                fecha_inicio: date ? format(date, 'yyyy-MM-dd') : ''
                            })}
                            placeholder="Seleccionar fecha inicio..."
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="actividad_fin" className="text-xs">Fecha de Finalización</Label>
                        <DatePicker
                            value={nuevaActividad.fecha_fin ? new Date(nuevaActividad.fecha_fin) : undefined}
                            onValueChange={(date) => setNuevaActividad({
                                ...nuevaActividad, 
                                fecha_fin: date ? format(date, 'yyyy-MM-dd') : ''
                            })}
                            placeholder="Seleccionar fecha fin..."
                            minDate={nuevaActividad.fecha_inicio ? new Date(nuevaActividad.fecha_inicio) : undefined}
                            className="mt-1"
                        />
                    </div>
                </div>
                <Button
                    type="button"
                    onClick={agregarActividad}
                    disabled={!nuevaActividad.nombre || !nuevaActividad.fecha_inicio || !nuevaActividad.fecha_fin}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Actividad
                </Button>
            </div>
        </div>
    );
} 