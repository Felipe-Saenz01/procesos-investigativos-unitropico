import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RevisionModal } from '@/components/RevisionModal';
import { HistorialRevisionesModal } from '@/components/HistorialRevisionesModal';
import { EstadoBadge } from '@/components/EstadoBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { usePermissions } from '@/hooks/use-permissions';
import { Plus, SquarePen, Trash, Eye, History, Send } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { Separator } from '@/components/ui/separator';

interface ActividadInvestigacion {
    id: number;
    nombre: string;
}

interface ActividadPlan {
    id: number;
    plan_trabajo_id: number;
    actividad_investigacion_id: number;
    alcance: string;
    entregable: string;
    horas_semana: number;
    total_horas: number;
    actividad_investigacion?: ActividadInvestigacion;
}

interface Revision {
    id: number;
    estado: string;
    comentario: string;
    created_at: string;
    revisor?: {
        name: string;
    };
}

interface PlanTrabajo {
    id: number;
    nombre: string;
    vigencia: string;
    estado: string;
    actividades?: ActividadPlan[];
    revisiones?: Revision[];
}

interface User {
    id: number;
    name: string;
    email: string;
    tipo: string;
    grupo_investigacion_id?: number;
    grupoInvestigacion?: {
        nombre: string;
    };
}

interface Props {
    planTrabajo: PlanTrabajo;
    investigador: User;
}

export default function PlanTrabajoShow({ planTrabajo, investigador }: Props) {
    const { delete: destroy, put } = useForm();
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [showHistorialModal, setShowHistorialModal] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actividadIdToDelete, setActividadIdToDelete] = useState<number | null>(null);
    const [sendRevisionDialogOpen, setSendRevisionDialogOpen] = useState(false);

    // Usar el hook de permisos
    const { hasPermission, hasRole, user } = usePermissions();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Investigadores', href: route('investigadores.index') },
        // { title: investigador.name, href: route('investigadores.show', investigador.id) },
        { title: investigador.name, href: route('investigadores.index') },
        { title: 'Planes de Trabajo', href: route('investigadores.planes-trabajo', investigador.id) },
        { title: planTrabajo.nombre, href: '#' }
    ];

    const handleRequestDeleteActividad = (actividadId: number) => {
        setActividadIdToDelete(actividadId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteActividad = () => {
        if (actividadIdToDelete != null) {
            destroy(route('investigadores.actividades-plan.destroy', [investigador.id, planTrabajo.id, actividadIdToDelete]));
            setActividadIdToDelete(null);
        }
    };

    const confirmSendRevision = () => {
        put(route('investigadores.planes-trabajo.enviar-revision', [investigador.id, planTrabajo.id]));
    };

    const handleRevisionSuccess = () => {
        // Reload de la vista despues de ejecutar el modal de revision
        window.location.reload();
    };

    // Visibilidad del botón de revisión según estado y permisos
    const showRevisionButton = (
        (planTrabajo.estado === 'Pendiente' && hasPermission('aprobar-planes-trabajo')) ||
        (planTrabajo.estado === 'Aprobado' && hasRole('Administrador'))
    );

    // Verificar si se puede editar basado en el estado del plan
    const canEditByState = planTrabajo.estado === 'Creado' || planTrabajo.estado === 'Corrección';
    const canEditPlan = hasPermission('editar-planes-trabajo') && canEditByState;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Plan de Trabajo - ${planTrabajo.nombre}`} />

            <div className="px-4 py-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">
                                    Plan de Trabajo: {planTrabajo.nombre}
                                </CardTitle>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Investigador: {investigador.name}
                                </p>
                                <div>
                                    <div className="flex flex-row content-center justify-start gap-2 mt-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Estado Actual:
                                        </label>
                                        <div className="">
                                            <EstadoBadge estado={planTrabajo.estado} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-start gap-2 mt-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Vigencia:
                                        </label>
                                        <p className="text-gray-900 dark:text-white">{planTrabajo.vigencia}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                {showRevisionButton && (
                                    <>
                                        <Button
                                            onClick={() => setShowRevisionModal(true)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Realizar Revisión
                                        </Button>
                                    </>
                                )}
                                
                                {/* Botón enviar a revisión (solo para el investigador del plan) */}
                                {(planTrabajo.estado === 'Creado' || planTrabajo.estado === 'Corrección') &&  user?.id !== investigador.id && 
                                (
                                    <Button
                                        onClick={() => {
                                            setSendRevisionDialogOpen(true);
                                        }}
                                        variant="outline"
                                        className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar para Revisión
                                    </Button>
                                )}
                                
                                <Button
                                    onClick={() => setShowHistorialModal(true)}
                                    variant="outline"
                                >
                                    <History className="w-4 h-4 mr-2" />
                                    Historial Revisiones
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <Separator />

                    <CardContent className="space-y-6">

                        {/* Actividades del Plan */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Actividades del Plan</h3>
                                {canEditPlan && (
                                    <Button asChild>
                                        <a href={route('investigadores.actividades-plan.create', [investigador.id, planTrabajo.id])}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Agregar Actividad
                                        </a>
                                    </Button>
                                )}
                            </div>

                            <div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-1/5">Actividad</TableHead>
                                            <TableHead className="w-2/5">Alcance</TableHead>
                                            <TableHead className="w-2/5">Entregable</TableHead>
                                            <TableHead className="w-1/10 text-center">Horas/Semana</TableHead>
                                            <TableHead className="w-1/10 text-center">Total Horas</TableHead>
                                            {canEditPlan && (
                                                <TableHead className="w-1/10 text-center">Acciones</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {planTrabajo.actividades?.map((actividad) => (
                                            <TableRow key={actividad.id}>
                                                <TableCell className="whitespace-normal break-words align-top">
                                                    {actividad.actividad_investigacion?.nombre}
                                                </TableCell>
                                                <TableCell className="whitespace-normal break-words align-top">
                                                    <div className="max-w-xs">
                                                        <p className="text-sm leading-relaxed">
                                                            {actividad.alcance}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-normal break-words align-top">
                                                    <div className="max-w-xs">
                                                        <p className="text-sm leading-relaxed">
                                                            {actividad.entregable}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center align-top">{actividad.horas_semana}</TableCell>
                                                <TableCell className="text-center align-top">{actividad.total_horas}</TableCell>
                                                {canEditPlan && (
                                                    <TableCell className="align-top">
                                                        <div className="flex justify-center space-x-2">
                                                            <Button asChild variant="default" size="sm" className="bg-yellow-400 hover:bg-yellow-600" title="Editar actividad">
                                                                <a href={route('investigadores.actividades-plan.edit', [investigador.id, planTrabajo.id, actividad.id])}>
                                                                    <SquarePen className="w-4 h-4" />
                                                                </a>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                title="Eliminar actividad"
                                                                size="sm"
                                                                onClick={() => handleRequestDeleteActividad(actividad.id)}
                                                            >
                                                                <Trash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <RevisionModal
                isOpen={showRevisionModal}
                onClose={() => setShowRevisionModal(false)}
                onSubmit={handleRevisionSuccess}
                route={route('planes-trabajo.revision', [investigador.id, planTrabajo.id])}
            />

            <HistorialRevisionesModal
                isOpen={showHistorialModal}
                onClose={() => setShowHistorialModal(false)}
                revisiones={planTrabajo.revisiones || []}
                titulo={`Historial de Revisiones - ${planTrabajo.nombre}`}
            />

            {/* Confirmación de eliminación */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Eliminar actividad"
                description="Esta acción es irreversible. ¿Deseas eliminar la actividad del plan?"
                confirmText="Eliminar"
                confirmVariant="destructive"
                onConfirm={confirmDeleteActividad}
            />

            {/* Confirmación de envío para revisión */}
            <ConfirmDialog
                open={sendRevisionDialogOpen}
                onOpenChange={setSendRevisionDialogOpen}
                title="Enviar Plan para Revisión"
                description="¿Estás seguro de que quieres enviar este plan para revisión? Una vez enviado no podrás editarlo hasta que sea revisado."
                confirmText="Enviar"
                confirmVariant="default"
                onConfirm={() => {
                    confirmSendRevision();
                    setSendRevisionDialogOpen(false);
                }}
            />
        </AppLayout>
    );
} 