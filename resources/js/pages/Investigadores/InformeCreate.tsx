import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchSelect } from '@/components/form-search-select';
import { Slider } from '@/components/ui/slider';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

interface ActividadInvestigacionLight {
    id: number;
    nombre: string;
}

interface ActividadPlanItem {
    id: number;
    actividad_investigacion_id: number;
    alcance: string;
    entregable: string;
    actividad_investigacion?: ActividadInvestigacionLight;
    porcentaje_progreso: number;
}

interface PeriodoInfo {
    id: number;
    nombre: string;
    fecha_limite_planeacion: string;
    fecha_limite_evidencias: string;
}

interface PlanTrabajoWithActs {
    id: number;
    nombre: string;
    estado: string;
    vigencia: 'Anual' | 'Semestral';
    periodo_id: number;
    actividades: ActividadPlanItem[];
    periodo?: PeriodoInfo;
}

// interface PeriodoOption { id: number; nombre: string }

interface Errors {
    [key: string]: string | string[];
}

interface Props {
    planTrabajo: PlanTrabajoWithActs;
    investigadorId: number;
    puedeCrear: boolean;
    periodo: PeriodoInfo;
}

type TipoEvidenciaSeleccion = 'Archivo' | 'Enlace';

export default function InformeCreate({ planTrabajo, investigadorId, puedeCrear, periodo }: Props) {
    const [errorsState, setErrorsState] = useState<Errors>({});

    const { data, setData, processing, reset } = useForm({
        // Estados por actividad
        actividades: planTrabajo.actividades.map(a => ({
            actividad_plan_id: a.id,
            porcentaje_progreso_nuevo: a.porcentaje_progreso,
            tipo: 'Archivo' as TipoEvidenciaSeleccion,
            archivo: null as File | null,
            url_link: '',
            descripcion: '',
        }))
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Investigadores', href: route('investigadores.index') },
        { title: 'Plan de Trabajo', href: route('investigadores.planes-trabajo.show', [investigadorId, planTrabajo.id]) },
        { title: 'Crear Informe', href: '#' }
    ];

    // Eliminado periodoOptions ya que no se selecciona período

    const progresoInvalido = useMemo(() => {
        return data.actividades.some((act, idx) => {
            const actual = planTrabajo.actividades[idx]?.porcentaje_progreso ?? 0;
            return Number(act.porcentaje_progreso_nuevo) < Number(actual);
        });
    }, [data.actividades, planTrabajo.actividades]);

    const evidenciasVacias = useMemo(() => {
        return data.actividades.some(act => {
            if (act.tipo === 'Archivo') return !act.archivo;
            if (act.tipo === 'Enlace') return !act.url_link;
            return true;
        });
    }, [data.actividades]);

    const observacionesVacias = useMemo(() => {
        return data.actividades.some(act => !act.descripcion || act.descripcion.length < 10);
    }, [data.actividades]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setErrorsState({});

        const form = new FormData();

        let idx = 0;
        data.actividades.forEach((act, i) => {
            const base = planTrabajo.actividades[i];
            if (!base) return;
            // Crear una entrada de evidencia por actividad
            form.append(`evidencias[${idx}][actividad_plan_id]`, String(base.id));
            form.append(`evidencias[${idx}][tipo_evidencia]`, act.tipo);
            form.append(`evidencias[${idx}][porcentaje_progreso_nuevo]`, String(act.porcentaje_progreso_nuevo));
            if (act.descripcion) form.append(`evidencias[${idx}][descripcion]`, act.descripcion);
            if (act.archivo) form.append(`evidencias[${idx}][archivo]`, act.archivo);
            if (act.url_link) form.append(`evidencias[${idx}][url_link]`, act.url_link);
            idx += 1;
        });

        router.post(route('investigadores.planes-trabajo.informes.store', [investigadorId, planTrabajo.id]), form, {
            forceFormData: true,
            onError: (errs) => setErrorsState(errs),
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Informe del Plan de Trabajo" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='w-full lg:w-5/6'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-2xl'>Crear Informe</CardTitle>
                            <p className="text-gray-600">Plan: {planTrabajo.nombre}</p>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            {(!puedeCrear || Object.keys(errorsState).length > 0) && (
                                <Alert variant={!puedeCrear ? 'destructive' : 'default'} className='mb-3 w-full'>
                                    <CircleAlert />
                                    <AlertTitle>{!puedeCrear ? 'El plan debe estar Aprobado' : 'Por favor corrige los siguientes errores:'}</AlertTitle>
                                    {Object.keys(errorsState).length > 0 && (
                                        <AlertDescription>
                                            <ul className='list-disc pl-5'>
                                                {Object.values(errorsState).flat().map((err, idx) => (
                                                    <li key={idx} className='text-red-500 text-sm'>{err}</li>
                                                ))}
                                            </ul>
                                        </AlertDescription>
                                    )}
                                </Alert>
                            )}

                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h3 className="font-semibold text-blue-900 mb-2">Información del Período</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Período:</span>
                                        <p className="text-blue-700">{periodo.nombre}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Fecha Inicio:</span>
                                        <p className="text-blue-700">{new Date(periodo.fecha_limite_planeacion).toLocaleDateString('es-ES')}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Fecha Fin:</span>
                                        <p className="text-blue-700">{new Date(periodo.fecha_limite_evidencias).toLocaleDateString('es-ES')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='space-y-6'>
                                {planTrabajo.actividades.map((act, idx) => (
                                    <Card key={act.id} className='border border-gray-200'>
                                        <CardHeader>
                                            <CardTitle className='text-base'>
                                                {act.actividad_investigacion?.nombre ?? `Actividad ${act.id}`}
                                            </CardTitle>
                                            <p className='text-sm text-gray-600'>Progreso actual: {act.porcentaje_progreso}%</p>
                                            <div className="mt-2 p-3 bg-gray-50 rounded">
                                                <p className="text-sm font-medium text-gray-700 mb-1">Entregable:</p>
                                                <p className="text-sm text-gray-600">{act.entregable}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <div>
                                                <Label>Nuevo Progreso</Label>
                                                <div className="mt-2 space-y-2">
                                                    <Slider
                                                        value={[data.actividades[idx].porcentaje_progreso_nuevo]}
                                                        onValueChange={(value) => {
                                                            const v = value[0];
                                                            setData('actividades', data.actividades.map((a, i) => i === idx ? { ...a, porcentaje_progreso_nuevo: v } : a));
                                                        }}
                                                        min={act.porcentaje_progreso}
                                                        max={100}
                                                        step={1}
                                                    />
                                                    <div className="flex justify-between text-sm text-gray-500">
                                                        <span>{act.porcentaje_progreso}%</span>
                                                        <span className="font-medium">{data.actividades[idx].porcentaje_progreso_nuevo}%</span>
                                                        <span>100%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                                                <div>
                                                    <Label>Tipo de Evidencia Principal</Label>
                                                    <SearchSelect
                                                        options={[
                                                            { value: 'Archivo', label: 'Archivo' },
                                                            { value: 'Enlace', label: 'Enlace' },
                                                        ]}
                                                        value={data.actividades[idx].tipo}
                                                        onValueChange={(value) => setData('actividades', data.actividades.map((a, i) => i === idx ? { ...a, tipo: value as TipoEvidenciaSeleccion } : a))}
                                                        placeholder="Seleccionar..."
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {data.actividades[idx].tipo === 'Archivo' 
                                                            ? 'El archivo es obligatorio' 
                                                            : 'El enlace es obligatorio'
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label>Archivo</Label>
                                                    <Input 
                                                        type='file' 
                                                        onChange={(e) => {
                                                            const file = e.currentTarget.files?.[0] || null;
                                                            setData('actividades', data.actividades.map((a, i) => i === idx ? { ...a, archivo: file } : a));
                                                        }}
                                                        className={data.actividades[idx].tipo === 'Archivo' ? 'border-red-300' : ''}
                                                    />
                                                    {data.actividades[idx].tipo === 'Archivo' && (
                                                        <p className="text-xs text-red-500 mt-1">Campo obligatorio</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label>Enlace (URL)</Label>
                                                    <Input 
                                                        placeholder='https://...' 
                                                        value={data.actividades[idx].url_link}
                                                        onChange={(e) => setData('actividades', data.actividades.map((a, i) => i === idx ? { ...a, url_link: e.target.value } : a))}
                                                        className={data.actividades[idx].tipo === 'Enlace' ? 'border-red-300' : ''}
                                                    />
                                                    {data.actividades[idx].tipo === 'Enlace' && (
                                                        <p className="text-xs text-red-500 mt-1">Campo obligatorio</p>
                                                    )}
                                                </div>
                                                <div className='md:col-span-3'>
                                                    <Label>Observaciones de la Evidencia *</Label>
                                                    <Textarea 
                                                        rows={3} 
                                                        className={`mt-1 ${(!data.actividades[idx].descripcion || data.actividades[idx].descripcion.length < 10) ? 'border-red-300' : ''}`}
                                                        value={data.actividades[idx].descripcion}
                                                        onChange={(e) => setData('actividades', data.actividades.map((a, i) => i === idx ? { ...a, descripcion: e.target.value } : a))}
                                                        placeholder="Describe las observaciones sobre la evidencia presentada (mínimo 10 caracteres)"
                                                    />
                                                    {(!data.actividades[idx].descripcion || data.actividades[idx].descripcion.length < 10) && (
                                                        <p className="text-xs text-red-500 mt-1">Campo obligatorio (mínimo 10 caracteres)</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Link href={route('investigadores.planes-trabajo.show', [investigadorId, planTrabajo.id])}>
                                <Button type='button' variant="outline" className='mr-3'>Cancelar</Button>
                            </Link>
                            <Button type='submit' className='bg-primary hover:bg-primary/90' disabled={processing || !puedeCrear || progresoInvalido || evidenciasVacias || observacionesVacias}>
                                Guardar Informe
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}


