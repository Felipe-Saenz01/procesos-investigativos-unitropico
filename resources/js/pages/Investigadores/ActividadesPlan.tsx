import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheckBig, CircleX, Plus, SquarePen, Trash, ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface ActividadInvestigacion {
    id: number;
    nombre: string;
}

interface ActividadPlan {
    id: number;
    alcance: string;
    entregable: string;
    horas_semana: number;
    total_horas: number;
    actividad_investigacion: ActividadInvestigacion;
}

interface PlanTrabajo {
    id: number;
    nombre: string;
    vigencia: string;
    estado: string;
}

interface Investigador {
    id: number;
    name: string;
    email: string;
    tipo: string;
}

interface ActividadesPlanProps {
    investigador: Investigador;
    planTrabajo: PlanTrabajo;
    actividades: ActividadPlan[];
    actividadesInvestigacion: ActividadInvestigacion[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ActividadesPlan({ investigador, planTrabajo, actividades, actividadesInvestigacion }: ActividadesPlanProps) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props as PageProps;

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
            href: '#',
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Actividades del Plan - ${planTrabajo.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between p-5'>
                        <div>
                            <h1 className='text-2xl font-bold m-5'>Actividades del Plan</h1>
                            <p className='ml-5 text-gray-600'>Plan: {planTrabajo.nombre}</p>
                            <p className='ml-5 text-gray-600'>Investigador: {investigador.name}</p>
                        </div>
                        <div className='flex gap-2'>
                            <Link href={route('investigadores.planes-trabajo.show', [investigador.id, planTrabajo.id])}>
                                <Button variant="outline" className="mr-2">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver al Plan
                                </Button>
                            </Link>
                            <Link href={route('investigadores.actividades-plan.create', [investigador.id, planTrabajo.id])} prefetch>
                                <Button className="ml-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nueva Actividad
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className='p-5'>
                        {flash?.success &&
                            <Alert variant='default' className='mb-3 my-5'>
                                <CircleCheckBig />
                                <AlertTitle>
                                    {flash.success}
                                </AlertTitle>
                            </Alert>
                        }
                        {flash?.error &&
                            <Alert variant='destructive' className='mb-3 my-5'>
                                <CircleX />
                                <AlertTitle>
                                    {flash.error}
                                </AlertTitle>
                            </Alert>
                        }
                        {actividades.length === 0 && <p className='mx-5 text-gray-400'>No hay actividades registradas en este plan.</p>}
                        {actividades.length > 0 &&
                            <Table className='table-auto'>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='font-bold'>Actividad de Investigación</TableHead>
                                        <TableHead className='font-bold'>Alcance</TableHead>
                                        <TableHead className='font-bold'>Entregable</TableHead>
                                        <TableHead className='font-bold'>Horas/Semana</TableHead>
                                        <TableHead className='font-bold'>Total Horas</TableHead>
                                        <TableHead className='font-bold'>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {actividades.map((actividad) => (
                                        <TableRow key={actividad.id}>
                                            <TableCell className='font-medium whitespace-normal break-words'>
                                                {actividad.actividad_investigacion.nombre}
                                            </TableCell>
                                            <TableCell className='whitespace-normal break-words'>{actividad.alcance}</TableCell>
                                            <TableCell className='whitespace-normal break-words'>{actividad.entregable}</TableCell>
                                            <TableCell>{actividad.horas_semana}</TableCell>
                                            <TableCell>{actividad.total_horas}</TableCell>
                                            <TableCell className='flex gap-2 justify-content-end'>
                                                <Link href={route('investigadores.actividades-plan.edit', [investigador.id, planTrabajo.id, actividad.id])} prefetch>
                                                    <Button variant="outline" size="sm" title="Editar actividad">
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <form onSubmit={(e: FormEvent) => {
                                                    e.preventDefault();
                                                    if (confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
                                                        destroy(route('investigadores.actividades-plan.destroy', [investigador.id, planTrabajo.id, actividad.id]));
                                                    }
                                                }}>
                                                    <Button type='submit' variant='destructive' size="sm" title="Eliminar actividad">
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        }
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 