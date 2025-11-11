import { EstadoBadge } from '@/components/EstadoBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Plus, SquarePen, Trash, List, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';

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
    actividades: ActividadPlan[];
}

interface Investigador {
    id: number;
    name: string;
    email: string;
    tipo: string;
}

interface PlanesTrabajoProps {
    investigador: Investigador;
    planesTrabajo: PlanTrabajo[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function PlanesTrabajo({ investigador, planesTrabajo }: PlanesTrabajoProps) {
    const { delete: destroy } = useForm();
    const { flash } = usePage().props as PageProps;
    const { hasPermission } = usePermissions();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [planIdToDelete, setPlanIdToDelete] = useState<number | null>(null);
    
    // Mostrar notificaciones toast cuando hay flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);
    
    const handleRequestDelete = (planId: number) => {
        setPlanIdToDelete(planId);
        setDeleteDialogOpen(true);
    };
    
    const confirmDelete = () => {
        if (planIdToDelete) {
            destroy(route('investigadores.planes-trabajo.destroy', [investigador.id, planIdToDelete]));
            setPlanIdToDelete(null);
        }
    };
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Investigadores',
            href: route('investigadores.show', investigador.id),
        },
        {
            title: investigador.name,
            href: route('investigadores.show', investigador.id),
        },
        {
            title: 'Planes de Trabajo',
            href: route('investigadores.planes-trabajo', investigador.id),
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Planes de Trabajo - ${investigador.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between p-5'>
                        <div>
                            <h1 className='text-2xl font-bold m-5'>Planes de Trabajo</h1>
                            <p className='ml-5 text-gray-600'>Investigador: {investigador.name}</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href={route('investigadores.show', investigador.id)}>
                                <Button variant="outline">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver
                                </Button>
                            </Link>
                            {hasPermission('crear-planes-trabajo') && (
                                <Link href={route('investigadores.planes-trabajo.create', investigador.id)} prefetch>
                                    <Button className="ml-4"><Plus /> Nuevo Plan</Button>
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className='p-5'>
                        {planesTrabajo.length === 0 && <p className='mx-5 text-gray-400'>No hay planes de trabajo registrados.</p>}
                        {planesTrabajo.length > 0 &&
                            <Table className='table-auto'>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='font-bold'>Nombre</TableHead>
                                        <TableHead className='font-bold'>Vigencia</TableHead>
                                        <TableHead className='font-bold'>Estado</TableHead>
                                        <TableHead className='font-bold'>Actividades</TableHead>
                                        <TableHead className='font-bold'>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {planesTrabajo.map((plan) => (
                                        <TableRow key={plan.id}>
                                            <TableCell className='font-medium whitespace-normal break-words'>{plan.nombre}</TableCell>
                                            <TableCell className='whitespace-normal break-words'>{plan.vigencia}</TableCell>
                                            <TableCell>
                                                <EstadoBadge estado={plan.estado} />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                                    {plan.actividades.length} actividades
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='flex gap-2 justify-content-end'>
                                                <Link href={route('investigadores.planes-trabajo.show', [investigador.id, plan.id])} prefetch>
                                                    <Button variant="outline" size="sm" title="Ver plan de trabajo">
                                                        <List className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {(hasPermission('editar-planes-trabajo') && plan.estado === 'Creado') && (
                                                    <>
                                                        <Link href={route('investigadores.planes-trabajo.edit', [investigador.id, plan.id])} prefetch>
                                                            <Button variant="outline" size="sm" title="Editar plan de trabajo">
                                                                <SquarePen className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            type='button'
                                                            variant='destructive' 
                                                            size="sm" 
                                                            title="Eliminar plan de trabajo"
                                                            onClick={() => handleRequestDelete(plan.id)}
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        }
                    </div>
                </div>
            </div>
            
            {/* Diálogo de confirmación de eliminación */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Eliminar Plan de Trabajo"
                description="¿Estás seguro de que deseas eliminar este plan de trabajo? Esta acción es irreversible."
                confirmText="Eliminar"
                cancelText="Cancelar"
                confirmVariant="destructive"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
} 