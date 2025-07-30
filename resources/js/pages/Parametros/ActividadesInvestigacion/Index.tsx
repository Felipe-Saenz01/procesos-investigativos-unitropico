import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheckBig, CircleX, Plus, SquarePen, Trash } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Actividades de Investigación',
        href: '/parametros/actividades-investigacion',
    }
];

interface ActividadesInvestigacion {
    id: number;
    nombre: string;
    horas_maximas: number;
    created_at: string;
    updated_at: string;
}

interface ActividadesInvestigacionProps {
    actividadesInvestigacion: ActividadesInvestigacion[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ActividadesInvestigacionIndex({ actividadesInvestigacion }: ActividadesInvestigacionProps) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props as PageProps;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Actividades de Investigación" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between p-5'>
                        <h1 className='text-2xl font-bold m-5'>Actividades de Investigación</h1>
                        <Link href={route('parametros.actividades-investigacion.create')} prefetch>
                            <Button className="ml-4"><Plus /> Nueva Actividad</Button>
                        </Link>
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
                        {actividadesInvestigacion.length === 0 && <p className='mx-5 text-gray-400'>No hay actividades de investigación registradas.</p>}
                        {actividadesInvestigacion.length > 0 &&
                            <Table className=''>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-1/3'>Nombre</TableHead>
                                        <TableHead className='w-1/6'>Horas Máximas</TableHead>
                                        <TableHead className='w-1/4'>Fecha Creación</TableHead>
                                        <TableHead className='w-1/4'>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {actividadesInvestigacion.map((actividad) => (
                                        <TableRow key={actividad.id}>
                                            <TableCell className='w-1/3 font-medium'>{actividad.nombre}</TableCell>
                                            <TableCell className='w-1/6'>{actividad.horas_maximas} horas</TableCell>
                                            <TableCell className='w-1/4'>{new Date(actividad.updated_at).toLocaleDateString()}</TableCell>
                                            <TableCell className='w-1/4 flex gap-2 justify-end'>
                                                <Link href={route('parametros.actividades-investigacion.edit', actividad.id)} prefetch>
                                                    <Button variant="outline" size="sm" title="Editar actividad">
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <form onSubmit={(e: FormEvent) => {
                                                    e.preventDefault();
                                                    if (confirm('¿Estás seguro de que deseas eliminar esta actividad de investigación?')) {
                                                        destroy(route('parametros.actividades-investigacion.destroy', actividad.id));
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