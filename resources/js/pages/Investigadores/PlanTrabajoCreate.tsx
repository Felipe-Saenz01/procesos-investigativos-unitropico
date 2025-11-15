import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Investigador {
    id: number;
    name: string;
    email: string;
    tipo: string;
}

interface Periodo {
    id: number;
    nombre: string;
    estado: string;
    fecha_limite_planeacion?: string;
    fecha_limite_evidencias?: string;
}

interface CreateProps {
    investigador: Investigador;
    periodos: Periodo[];
}

export default function PlanTrabajoCreate({ investigador, periodos }: CreateProps) {
    const { data, setData, post, errors, reset } = useForm({
        nombre: '',
        vigencia: '',
        periodo_inicio_id: '',
        periodo_fin_id: null as number | null,
        estado: 'Creado', // Estado fijo por defecto
    });
    const [periodoFinLabel, setPeriodoFinLabel] = useState<string>('');
    const [periodoFinEstado, setPeriodoFinEstado] = useState<'none' | 'existing' | 'auto'>('none');
    
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };
    
    // Mostrar notificaciones toast cuando hay flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);
    
    // Mostrar toast cuando hay errores de validación
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error('Por favor corrige los errores en el formulario');
        }
    }, [errors]);

    const periodoInicioSeleccionado = useMemo(() => (
        periodos.find(periodo => periodo.id.toString() === data.periodo_inicio_id)
    ), [data.periodo_inicio_id, periodos]);

    const getNextPeriodoNombre = (nombre: string): string | null => {
        const match = nombre.match(/^(\d{4})-(A|B)$/);
        if (!match) {
            return null;
        }
        const year = parseInt(match[1], 10);
        const label = match[2];
        return label === 'A' ? `${year}-B` : `${year + 1}-A`;
    };

    useEffect(() => {
        if (!data.vigencia || !data.periodo_inicio_id || !periodoInicioSeleccionado) {
            setData('periodo_fin_id', null);
            setPeriodoFinLabel('');
            setPeriodoFinEstado('none');
            return;
        }

        if (data.vigencia === 'Semestral') {
            setData('periodo_fin_id', periodoInicioSeleccionado.id);
            setPeriodoFinLabel(periodoInicioSeleccionado.nombre);
            setPeriodoFinEstado('existing');
            return;
        }

        const siguienteNombre = getNextPeriodoNombre(periodoInicioSeleccionado.nombre);
        if (!siguienteNombre) {
            setData('periodo_fin_id', null);
            setPeriodoFinLabel('');
            setPeriodoFinEstado('none');
            return;
        }

        const periodoEncontrado = periodos.find(periodo => periodo.nombre === siguienteNombre);
        if (periodoEncontrado) {
            setData('periodo_fin_id', periodoEncontrado.id);
            setPeriodoFinLabel(periodoEncontrado.nombre);
            setPeriodoFinEstado('existing');
            return;
        }

        setData('periodo_fin_id', null);
        setPeriodoFinLabel(`${siguienteNombre}`);
        setPeriodoFinEstado('auto');
    }, [data.vigencia, data.periodo_inicio_id, periodoInicioSeleccionado, periodos, setData]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('investigadores.planes-trabajo.store', investigador.id), {
            onSuccess: () => {
                reset();
                setPeriodoFinLabel('');
                setPeriodoFinEstado('none');
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Investigadores',
            href: route('investigadores.index'),
        },
        {
            title: investigador.name,
            href: '#',
        },
        {
            title: 'Planes de Trabajo',
            href: route('investigadores.planes-trabajo', investigador.id),
        },
        {
            title: 'Crear Plan',
            href: '#',
        }
    ];

    const vigenciaOptions = [
        { value: 'Anual', label: 'Anual' },
        { value: 'Semestral', label: 'Semestral' }
    ];

    const periodoOptions = useMemo(() => (
        periodos
            .filter(periodo => periodo.estado === 'Activo')
            .map(periodo => ({
                value: periodo.id.toString(),
                label: periodo.nombre
            }))
    ), [periodos]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Plan de Trabajo" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Crear Plan de Trabajo
                            </CardTitle>
                            <p className="text-gray-600">Investigador: {investigador.name}</p>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(errors).length > 0 &&
                                <Alert variant='destructive' className='mb-3 w-full'>
                                    <CircleAlert />
                                    <AlertTitle>Por favor corrige los siguientes errores:</AlertTitle>
                                    <AlertDescription>
                                        <ul className='list-disc pl-5'>
                                            {Object.values(errors).map((error, index) => (
                                                <li key={index} className='text-red-500 text-sm'>{error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            }
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="nombre">Nombre del Plan</Label>
                                    <Input
                                        id='nombre'
                                        className="mt-1"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        type='text'
                                        name='nombre'
                                        placeholder="Ej: Plan de Investigación 2024"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="vigencia">Vigencia</Label>
                                    <SearchSelect
                                        options={vigenciaOptions}
                                        value={data.vigencia}
                                        onValueChange={(value) => setData('vigencia', value ? String(value) : '')}
                                        placeholder="Seleccionar vigencia..."
                                        name="vigencia"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="periodo_inicio_id">Período de Inicio</Label>
                                    <SearchSelect
                                        options={periodoOptions}
                                        value={data.periodo_inicio_id}
                                        onValueChange={(value) => setData('periodo_inicio_id', value ? String(value) : '')}
                                        placeholder="Seleccionar período..."
                                        name="periodo_inicio_id"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="periodo_fin_id">Período Final</Label>
                                    <Input
                                        id="periodo_fin_id"
                                        className="mt-1 bg-gray-100"
                                        value={periodoFinLabel || ''}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="estado">Estado</Label>
                                    <Input
                                        id='estado'
                                        className="mt-1 bg-gray-100"
                                        value={data.estado}
                                        type='text'
                                        name='estado'
                                        disabled
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Link href={route('investigadores.planes-trabajo', investigador.id)}>
                                <Button type='button' variant="outline" className='mr-3'>
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type='submit' className='bg-primary hover:bg-primary/90'>
                                Crear Plan de Trabajo
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 