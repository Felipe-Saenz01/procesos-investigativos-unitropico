import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CircleCheckBig, CircleX, Clock, Plus, SquarePen, FileText, Download } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Investigadores',
        href: '/investigadores',
    }
];

interface GrupoInvestigacion {
    id: number;
    nombre: string;
    correo: string;
}

interface Investigador {
    id: number;
    name: string;
    email: string;
    tipo: string;
    grupo_investigacion_id: number;
    grupo_investigacion?: GrupoInvestigacion;
}

interface InvestigadoresProps {
    investigadores: Investigador[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function InvestigadoresIndex({ investigadores }: InvestigadoresProps) {
    const { flash } = usePage().props as PageProps;
    const { hasPermission } = usePermissions();

    const getRoleBadge = (tipo: string) => {
        if (tipo === 'Lider Grupo') {
            return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">Líder Grupo</Badge>;
        }
        return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">Investigador</Badge>;
    };

    // Verificar si debe mostrar la columna de acciones
    const mostrarAcciones = hasPermission('ver-horas-investigacion') || hasPermission('editar-usuario');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Investigadores" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between p-5'>
                        <h1 className='text-2xl font-bold m-5'>Investigadores</h1>
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => window.open(route('pdf.investigadores.preview'), '_blank')}
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Ver Reporte PDF
                            </Button>
                            {hasPermission('crear-usuario') && (
                              <Link href={route('investigadores.create')} prefetch>
                                <Button className="ml-4"><Plus /> Nuevo Investigador</Button>
                              </Link>
                            )}
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
                        {investigadores.length === 0 && <p className='mx-5 text-gray-400'>No hay investigadores registrados.</p>}
                        {investigadores.length > 0 &&
                            <Table className='w-full table-auto'>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='font-bold'>Nombre</TableHead>
                                        <TableHead className='font-bold'>Correo</TableHead>
                                        <TableHead className='font-bold'>Tipo</TableHead>
                                        <TableHead className='font-bold'>Grupo de Investigación</TableHead>
                                        {mostrarAcciones && (
                                            <TableHead className='font-bold'>Acciones</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {investigadores.map((investigador) => (
                                        <TableRow key={investigador.id}>
                                            <TableCell className='font-medium'>{investigador.name}</TableCell>
                                            <TableCell>{investigador.email}</TableCell>
                                            <TableCell>
                                                {getRoleBadge(investigador.tipo)}
                                            </TableCell>
                                            <TableCell >
                                                {investigador.grupo_investigacion ? 
                                                    investigador.grupo_investigacion.nombre : 
                                                    <span className="text-gray-400">Sin grupo asignado</span>
                                                }
                                            </TableCell>
                                            {mostrarAcciones && (
                                                <TableCell className='flex gap-2 justify-end'>
                                                    {hasPermission('editar-usuario') && (
                                                        <Link href={route('investigadores.edit', investigador.id)} prefetch>
                                                            <Button variant="outline" size="sm" title="Editar investigador">
                                                                <SquarePen className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {hasPermission('ver-horas-investigacion') && (
                                                        <Link href={route('investigadores.horas', investigador.id)} prefetch>
                                                            <Button variant="outline" size="sm" title="Ver horas de investigación">
                                                                <Clock className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {hasPermission('ver-planes-trabajo') && (
                                                        <Link href={route('investigadores.planes-trabajo', investigador.id)} prefetch>
                                                            <Button variant="outline" size="sm" title="Ver planes de trabajo">
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </TableCell>
                                            )}
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