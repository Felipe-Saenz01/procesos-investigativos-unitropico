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
        title: 'Tipos Productos',
        href: '/parametros/tipos-productos',
    }
];

interface ActividadInvestigacion {
    id: number;
    nombre: string;
}

interface TipoProducto {
    id: number;
    nombre: string;
    actividad_investigacion_id: number;
    actividad_investigacion?: ActividadInvestigacion;
    created_at: string;
    updated_at: string;
}

interface TipoProductoProps {
    tiposProductos: TipoProducto[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function TipoProductoIndex({ tiposProductos }: TipoProductoProps) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props as PageProps;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tipos de Productos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between p-5'>
                        <h1 className='text-2xl font-bold m-5'>Tipos de Productos Investigativos</h1>
                        <Link href={route('parametros.tipo-producto.create')} prefetch>
                            <Button className="ml-4"><Plus /> Nuevo Tipo</Button>
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
                        {tiposProductos.length === 0 && <p className='mx-5 text-gray-400'>No hay tipos de productos registrados.</p>}
                        {tiposProductos.length > 0 &&
                            <Table className='table-auto'>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='font-bold'>Nombre</TableHead>
                                        <TableHead className='font-bold'>Actividad de Investigación</TableHead>
                                        <TableHead className='font-bold'>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tiposProductos.map((tipoProducto) => (
                                        <TableRow key={tipoProducto.id}>
                                            <TableCell className='font-medium whitespace-normal break-words'>{tipoProducto.nombre}</TableCell>
                                            <TableCell className='whitespace-normal break-words'>
                                                {tipoProducto.actividad_investigacion ? 
                                                    tipoProducto.actividad_investigacion.nombre : 
                                                    <span className="text-gray-400">Sin actividad asignada</span>
                                                }
                                            </TableCell>
                                            <TableCell className='flex gap-2 justify-content-end'>
                                                <Link href={route('parametros.tipo-producto.edit', tipoProducto.id)} prefetch>
                                                    <Button variant="outline" size="sm" title="Editar tipo de producto">
                                                        <SquarePen className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <form onSubmit={(e: FormEvent) => {
                                                    e.preventDefault();
                                                    if (confirm('¿Estás seguro de que deseas eliminar este tipo de producto?')) {
                                                        destroy(route('parametros.tipo-producto.destroy', tipoProducto.id));
                                                    }
                                                }}>
                                                    <Button type='submit' variant='destructive' size="sm" title="Eliminar tipo de producto">
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