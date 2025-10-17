import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Paginator from '@/components/Paginator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheckBig, CircleX, Eye, Plus, SquarePen, Trash } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Proyectos Investigativos',
        href: '/proyectos',
    }
];

interface Usuario {
    id: number;
    name: string;
    email: string;
}

interface GrupoInvestigacion {
    id: number;
    nombre: string;
}

interface ProyectoInvestigativo {
    id: number;
    titulo: string;
    eje_tematico: string;
    estado: string;
    created_at: string;
    updated_at: string;
    usuarios: Usuario[];
    grupos: GrupoInvestigacion[];
}

interface ProyectosProps {
    proyectos: ProyectoInvestigativo[];
    proyectos_links?: { url: string | null; label: string; active: boolean }[];
    user_permissions: {
        can_edit_proyecto: boolean;
        can_delete_proyecto: boolean;
    };
    user_id: number;
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ProyectosIndex({ proyectos, proyectos_links, user_permissions, user_id }: ProyectosProps) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props as PageProps;

    const getEstadoBadge = (estado: string) => {
        if (estado === 'Formulado') {
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Formulado</Badge>;
        }
        return <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white">En Formulación</Badge>;
    };

    const getGruposText = (grupos: GrupoInvestigacion[]) => {
        if (grupos.length === 0) {
            return <span className="text-gray-400">Sin grupos asignados</span>;
        }
        return grupos.map(grupo => grupo.nombre).join(', ');
    };

    const getUsuariosText = (usuarios: Usuario[]) => {
        if (usuarios.length === 0) {
            return <span className="text-gray-400">Sin usuarios asignados</span>;
        }
        return (
            <div className="flex flex-wrap gap-1">
                {usuarios.slice(0, 2).map((usuario) => (
                    <Badge key={usuario.id} variant="outline" className="text-xs">
                        {usuario.name}
                    </Badge>
                ))}
                {usuarios.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                        +{usuarios.length - 2} más
                    </Badge>
                )}
            </div>
        );
    };

    const isAuthor = (proyecto: ProyectoInvestigativo) => {
        // El autor es el primer usuario asociado al proyecto
        return proyecto.usuarios.length > 0 && proyecto.usuarios[0].id === user_id;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Proyectos Investigativos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center'>
                        <h1 className='text-2xl font-bold m-5'>Proyectos Investigativos</h1>
                        <Link href={route('proyectos.create')} prefetch>
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
                        {flash?.error &&
                            <Alert variant='destructive' className='mb-3 my-5'>
                                <CircleX />
                                <AlertTitle>
                                    {flash.error}
                                </AlertTitle>
                            </Alert>
                        }
                        {proyectos.length === 0 && <p className='mx-5 text-gray-400'>No hay proyectos investigativos registrados.</p>}
                        {proyectos.length > 0 &&
                            <>
                                <Table className=''>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-1/4'>Título</TableHead>
                                            <TableHead className='w-1/6'>Eje Temático</TableHead>
                                            <TableHead className='w-1/6'>Estado</TableHead>
                                            <TableHead className='w-1/4'>Usuarios</TableHead>
                                            <TableHead className='w-1/4'>Grupos de Investigación</TableHead>
                                            <TableHead className='w-1/4'>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {proyectos.map((proyecto) => (
                                            <TableRow key={proyecto.id}>
                                                <TableCell className='w-1/4 font-medium'>{proyecto.titulo}</TableCell>
                                                <TableCell className='w-1/6'>{proyecto.eje_tematico}</TableCell>
                                                <TableCell className='w-1/6'>
                                                    {getEstadoBadge(proyecto.estado)}
                                                </TableCell>
                                                <TableCell className='w-1/4'>
                                                    {getUsuariosText(proyecto.usuarios)}
                                                </TableCell>
                                                <TableCell className='w-1/4'>
                                                    {getGruposText(proyecto.grupos)}
                                                </TableCell>
                                                <TableCell className='w-1/4 flex gap-2 justify-items-center'>
                                                    <Link href={route('proyectos.show', proyecto.id)} prefetch>
                                                        <Button variant="outline" size="sm" title="Ver proyecto">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {user_permissions.can_edit_proyecto && isAuthor(proyecto) && (
                                                        <Link href={route('proyectos.edit', proyecto.id)} prefetch>
                                                            <Button variant="outline" size="sm" title="Editar proyecto">
                                                                <SquarePen className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {user_permissions.can_delete_proyecto && isAuthor(proyecto) && (
                                                        <form onSubmit={(e: FormEvent) => {
                                                            e.preventDefault();
                                                            if (confirm('¿Estás seguro de que deseas eliminar este proyecto investigativo?')) {
                                                                destroy(route('proyectos.destroy', proyecto.id));
                                                            }
                                                        }}>
                                                            <Button type='submit' variant='destructive' size="sm" title="Eliminar proyecto">
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </form>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <Paginator links={proyectos_links} />
                            </>
                        }
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 