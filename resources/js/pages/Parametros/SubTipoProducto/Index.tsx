import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheckBig, Plus, SquarePen, Trash } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subtipos Productos',
        href: '/parametros/subtipo-producto',
    }
];

interface TipoProducto {
    id: number;
    nombre: string;
}

interface SubTipoProducto {
    id: number;
    nombre: string;
    tipo_producto_id: number;
    tipo_producto: TipoProducto;
    created_at: string;
    updated_at: string;
}

interface SubTipoProductoProps {
    subTiposProductos: SubTipoProducto[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function SubTipoProductoIndex({ subTiposProductos }: SubTipoProductoProps) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props as PageProps;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subtipos Productos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center'>
                        <h1 className='text-2xl font-bold m-5'>Subtipos de Productos Investigativos</h1>
                        <Link href={route('parametros.subtipo-producto.create')} prefetch>
                            <Button><Plus /></Button>
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
                        {subTiposProductos.length === 0 && <p className='mx-5 text-gray-400'>No hay subtipos de productos registrados.</p>}
                        {subTiposProductos.length > 0 &&
                            <Table className=''>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-1/2'>Nombre</TableHead>
                                        <TableHead className='w-1/4'>Tipo de Producto</TableHead>
                                        <TableHead className='w-1/4'>Fecha Creación</TableHead>
                                        <TableHead className='w-1/4'>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subTiposProductos.map((subTipoProducto) => (
                                        <TableRow key={subTipoProducto.id}>
                                            <TableCell className='w-1/2 max-w-xs whitespace-normal break-words'>{subTipoProducto.nombre}</TableCell>
                                            <TableCell className='w-1/4'>{subTipoProducto.tipo_producto.nombre}</TableCell>
                                            <TableCell className='w-1/4'>{new Date(subTipoProducto.updated_at).toLocaleDateString()}</TableCell>
                                            <TableCell className='w-1/4 flex gap-2 justify-end'>
                                                <Link href={route('parametros.subtipo-producto.edit', subTipoProducto.id)} prefetch>
                                                    <Button variant="outline"><SquarePen /></Button>
                                                </Link>
                                                <form onSubmit={(e: FormEvent) => {
                                                    e.preventDefault();
                                                    if (confirm('¿Estás seguro de que deseas eliminar este subtipo de producto?')) {
                                                        destroy(route('parametros.subtipo-producto.destroy', subTipoProducto.id));
                                                    }
                                                }}>
                                                    <Button type='submit' variant='destructive'><Trash /></Button>
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