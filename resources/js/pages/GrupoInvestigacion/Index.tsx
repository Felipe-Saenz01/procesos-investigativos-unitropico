import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheckBig, CircleX, Eye, Plus, SquarePen, Trash } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { FormEvent } from 'react';
import Paginator from '@/components/Paginator';

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
    grupos_links?: { url: string | null; label: string; active: boolean }[];
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

export default function GrupoInvestigacionIndex({ gruposInvestigacion, grupos_links }: GrupoInvestigacionProps) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props as PageProps;
    const { hasPermission } = usePermissions();
    // const puedeCrearUsuario = auth?.user?.permissions?.includes('crear-usuario');

    const getInvestigadoresText = (usuarios: Usuario[]) => {
        if (usuarios.length === 0) {
            return <span className="text-gray-400">Sin investigadores</span>;
        }
        return (
            <div>
                <Badge variant="secondary" className="bg-gray-200 mr-2">{usuarios.length}</Badge>
                Investigadores
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grupos de Investigación" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between p-5'>
                        <h1 className='text-2xl font-bold m-5'>Grupos de Investigación</h1>
                        {hasPermission('crear-grupo-investigacion') && (
                            <Link href={route('grupo-investigacion.create')} prefetch>
                                <Button><Plus /> Nuevo Grupo</Button>
                            </Link>
                        )}
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
                                        <TableHead className=''>Nombre del Grupo</TableHead>
                                        <TableHead className=''>Correo</TableHead>
                                        <TableHead className=''>Investigadores</TableHead>
                                        <TableHead className=''>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gruposInvestigacion.map((grupo) => (
                                        <TableRow key={grupo.id}>
                                            <TableCell className='font-medium'>{grupo.nombre}</TableCell>
                                            <TableCell className=''>{grupo.correo}</TableCell>
                                            <TableCell className=''>
                                                {getInvestigadoresText(grupo.usuarios)}
                                            </TableCell>
                                            <TableCell className='flex gap-2 justify-center'>
                                                <Link href={route('grupo-investigacion.show', grupo.id)} prefetch>
                                                    <Button variant="outline" size="sm" title="Ver perfil del investigador">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
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
                        <Paginator links={grupos_links} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 