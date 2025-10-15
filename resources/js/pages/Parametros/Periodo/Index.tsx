import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheckBig, CircleX, Eye, Plus, SquarePen, Trash } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Períodos',
        href: '/parametros/periodo',
    }
];

interface Periodo {
    id: number;
    nombre: string;
    fecha_limite_planeacion: string;
    fecha_limite_evidencias: string;
    estado: string;
    created_at: string;
    updated_at: string;
}

interface PeriodoProps {
    periodos: Periodo[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function PeriodoIndex({ periodos }: PeriodoProps) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props as PageProps;

    const getEstadoBadge = (estado: string) => {
        if (estado === 'Activo') {
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Activo</Badge>;
        }
        return <Badge variant="secondary">Inactivo</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Períodos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between p-5'>
                        <h1 className='text-2xl font-bold'>Períodos Académicos</h1>
                        <Link href={route('parametros.periodo.create')} prefetch>
                            <Button><Plus /> Nuevo Período</Button>
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
                        {periodos.length === 0 && <p className='mx-5 text-gray-400'>No hay períodos registrados.</p>}
                        {periodos.length > 0 &&
                            <Table className=''>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-1/6'>Nombre</TableHead>
                                        <TableHead className='w-1/6'>Fecha Límite Planeación</TableHead>
                                        <TableHead className='w-1/6'>Fecha Límite Evidencias</TableHead>
                                        <TableHead className='w-1/6'>Estado</TableHead>
                                        <TableHead className='w-1/6'>Fecha Creación</TableHead>
                                        <TableHead className='w-1/6'>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {periodos.map((periodo) => (
                                        <TableRow key={periodo.id}>
                                            <TableCell className='w-1/6 font-medium'>{periodo.nombre}</TableCell>
                                            <TableCell className='w-1/6'>{new Date(periodo.fecha_limite_planeacion).toLocaleDateString()}</TableCell>
                                            <TableCell className='w-1/6'>{new Date(periodo.fecha_limite_evidencias).toLocaleDateString()}</TableCell>
                                            <TableCell className='w-1/6'>{getEstadoBadge(periodo.estado)}</TableCell>
                                            <TableCell className='w-1/6'>{formatDate(periodo.updated_at)}</TableCell>
                                            <TableCell className='w-1/6 flex gap-2 justify-items-end'>
                                                <Link href={route('parametros.periodo.show', periodo.id)} prefetch>
                                                    <Button variant="outline" size="sm"><Eye /></Button>
                                                </Link>
                                                <Link href={route('parametros.periodo.edit', periodo.id)} prefetch>
                                                    <Button variant="outline" size="sm"><SquarePen /></Button>
                                                </Link>
                                                <form onSubmit={(e: FormEvent) => {
                                                    e.preventDefault();
                                                    if (confirm('¿Estás seguro de que deseas eliminar este período?')) {
                                                        destroy(route('parametros.periodo.destroy', periodo.id));
                                                    }
                                                }}>
                                                    <Button type='submit' variant='destructive' size="sm"><Trash /></Button>
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