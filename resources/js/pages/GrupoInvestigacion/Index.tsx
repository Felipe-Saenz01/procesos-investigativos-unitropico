import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheckBig, CircleX, Plus, SquarePen, Trash } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Grupos de Investigación',
        href: '/grupo-investigacion',
    }
];

interface Usuario {
    id: number;
    name: string;
    email: string;
    tipo: string;
    grupo_investigacion_id: number;
}

interface GrupoInvestigacion {
    id: number;
    nombre: string;
    correo: string;
    created_at: string;
    updated_at: string;
    usuarios: Usuario[];
}

interface GrupoInvestigacionProps {
    gruposInvestigacion: GrupoInvestigacion[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
    auth?: {
        user: {
            permissions: string[];
        };
    };
}

export default function GrupoInvestigacionIndex({ gruposInvestigacion }: GrupoInvestigacionProps) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props as PageProps;
    // const puedeCrearUsuario = auth?.user?.permissions?.includes('crear-usuario');

    const getTipoBadge = (tipo: string) => {
        if (tipo === 'Lider Grupo') {
            return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">Líder Grupo</Badge>;
        }
        return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">Investigador</Badge>;
    };

    const getInvestigadoresText = (usuarios: Usuario[]) => {
        if (usuarios.length === 0) {
            return <span className="text-gray-400">Sin investigadores</span>;
        }
        return usuarios.map((usuario) => (
            <div key={usuario.id} className="flex items-center gap-2 mb-1">
                <span className="text-sm">{usuario.name}</span>
                {getTipoBadge(usuario.tipo)}
            </div>
        ));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos de Investigación" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between p-5'>
                        <h1 className='text-2xl font-bold m-5'>Grupos de Investigación</h1>
                        {/* {puedeCrearUsuario && (
                          <Link href={route('usuarios.create')} prefetch>
                            <Button className="ml-4">Agregar Investigador</Button>
                          </Link>
                        )} */}
                        <Link href={route('grupo-investigacion.create')} prefetch>
                            <Button><Plus /> Nuevo Grupo</Button>
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
                        {gruposInvestigacion.length === 0 && <p className='mx-5 text-gray-400'>No hay grupos de investigación registrados.</p>}
                        {gruposInvestigacion.length > 0 &&
                            <Table className=''>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-1/4'>Nombre del Grupo</TableHead>
                                        <TableHead className='w-1/4'>Correo</TableHead>
                                        <TableHead className='w-1/2'>Investigadores</TableHead>
                                        <TableHead className='w-1/6'>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gruposInvestigacion.map((grupo) => (
                                        <TableRow key={grupo.id}>
                                            <TableCell className='w-1/4 font-medium'>{grupo.nombre}</TableCell>
                                            <TableCell className='w-1/4'>{grupo.correo}</TableCell>
                                            <TableCell className='w-1/2'>
                                                <div className="space-y-1">
                                                    {getInvestigadoresText(grupo.usuarios)}
                                                </div>
                                            </TableCell>
                                            <TableCell className='w-1/6 flex gap-2 justify-end'>
                                                <Link href={route('grupo-investigacion.edit', grupo.id)} prefetch>
                                                    <Button variant="outline" size="sm"><SquarePen /></Button>
                                                </Link>
                                                <form onSubmit={(e: FormEvent) => {
                                                    e.preventDefault();
                                                    if (confirm('¿Estás seguro de que deseas eliminar este grupo de investigación?')) {
                                                        destroy(route('grupo-investigacion.destroy', grupo.id));
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