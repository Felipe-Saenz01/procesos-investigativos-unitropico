import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { FormEvent } from 'react';

interface Investigador {
    id: number;
    name: string;
    email: string;
    tipo: string;
}

interface PlanTrabajo {
    id: number;
    nombre: string;
    vigencia: string;
    estado: string;
}

interface ActividadesInvestigacion {
    id: number;
    nombre: string;
}

interface CreateProps {
    investigador: Investigador;
    planTrabajo: PlanTrabajo;
    actividadesInvestigacion: ActividadesInvestigacion[];
}

export default function ActividadPlanCreate({ investigador, planTrabajo, actividadesInvestigacion }: CreateProps) {
    const { data, setData, post, errors, reset } = useForm({
        actividad_investigacion_id: '',
        alcance: '',
        entregable: '',
        horas_semana: '',
        total_horas: ''
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('investigadores.actividades-plan.store', [investigador.id, planTrabajo.id]), {
            onSuccess: () => reset()
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
            title: planTrabajo.nombre,
            href: route('investigadores.planes-trabajo.show', [investigador.id, planTrabajo.id]),
        },
        {
            title: 'Nueva Actividad',
            href: '#',
        }
    ];

    const actividadOptions = actividadesInvestigacion.map(actividad => ({
        value: actividad.id,
        label: actividad.nombre
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva Actividad del Plan" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Nueva Actividad del Plan
                            </CardTitle>
                            <p className="text-gray-600">Plan: {planTrabajo.nombre}</p>
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
                                    <Label htmlFor="actividad_investigacion_id">Actividad de Investigación</Label>
                                    <SearchSelect
                                        options={actividadOptions}
                                        value={data.actividad_investigacion_id}
                                        onValueChange={(value) => setData('actividad_investigacion_id', String(value))}
                                        placeholder="Seleccionar actividad..."
                                        name="actividad_investigacion_id"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="alcance">Alcance</Label>
                                    <Textarea
                                        id='alcance'
                                        className="mt-1"
                                        value={data.alcance}
                                        onChange={(e) => setData('alcance', e.target.value)}
                                        name='alcance'
                                        placeholder="Describa el alcance de la actividad..."
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="entregable">Entregable</Label>
                                    <Textarea
                                        id='entregable'
                                        className="mt-1"
                                        value={data.entregable}
                                        onChange={(e) => setData('entregable', e.target.value)}
                                        name='entregable'
                                        placeholder="Describa el entregable de la actividad..."
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="horas_semana">Horas por Semana</Label>
                                    <Input
                                        id='horas_semana'
                                        className="mt-1"
                                        value={data.horas_semana}
                                        onChange={(e) => setData('horas_semana', e.target.value)}
                                        type='number'
                                        name='horas_semana'
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="total_horas">Total de Horas</Label>
                                    <Input
                                        id='total_horas'
                                        className="mt-1"
                                        value={data.total_horas}
                                        onChange={(e) => setData('total_horas', e.target.value)}
                                        type='number'
                                        name='total_horas'
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Link href={route('investigadores.planes-trabajo.show', [investigador.id, planTrabajo.id])}>
                                <Button type='button' variant="outline" className='mr-3'>
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type='submit' className='bg-primary hover:bg-primary/90'>
                                Crear Actividad
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 