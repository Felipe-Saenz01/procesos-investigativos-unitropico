import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RevisionModal } from '@/components/RevisionModal';
import { HistorialRevisionesModal } from '@/components/HistorialRevisionesModal';
import { EstadoBadge } from '@/components/EstadoBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { usePermissions } from '@/hooks/use-permissions';
import { Plus, SquarePen, Trash, Eye, History, Send, Download, FileText, ChevronDown, ChevronRight, SquareCheck } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
    porcentaje_progreso: number;
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

interface EvidenciaInforme {
    id: number;
    actividad_plan_id: number;
    tipo_evidencia: string;
    porcentaje_progreso_anterior: number;
    porcentaje_progreso_nuevo: number;
    descripcion: string;
    ruta_archivo?: string;
    url_link?: string;
    actividad_plan?: ActividadPlan;
}

interface InformePlanTrabajo {
    id: number;
    created_at: string;
    evidencias?: EvidenciaInforme[];
}

interface PlanTrabajo {
    id: number;
    nombre: string;
    vigencia: string;
    estado: string;
    actividades?: ActividadPlan[];
    revisiones?: Revision[];
    informes?: InformePlanTrabajo[];
    periodo_inicio?: {
        id: number;
        nombre: string;
    } | null;
    periodo_fin?: {
        id: number;
        nombre: string;
    } | null;
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
    const [terminarDialogOpen, setTerminarDialogOpen] = useState(false);
    const [informesExpanded, setInformesExpanded] = useState<Record<number, boolean>>({});

    // Usar el hook de permisos
    const { hasPermission, hasRole, user } = usePermissions();
    
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };
    
    // Mostrar notificaciones toast cuando hay flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Investigadores', href: route('investigadores.index') },
        { title: investigador.name, href: route('investigadores.show', investigador.id) },
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

    const confirmTerminarPlan = () => {
        put(route('investigadores.planes-trabajo.terminar', [investigador.id, planTrabajo.id]));
    };

    const handleRevisionSuccess = () => {
        // Reload de la vista despues de ejecutar el modal de revision
        window.location.reload();
    };

    const toggleInforme = (informeId: number) => {
        setInformesExpanded(prev => ({
            ...prev,
            [informeId]: !prev[informeId]
        }));
    };

    // Visibilidad del botón de revisión según estado y permisos
    const showRevisionButton = (
        (planTrabajo.estado === 'Pendiente' && hasPermission('aprobar-planes-trabajo')) ||
        (planTrabajo.estado === 'Aprobado' && hasRole('Administrador'))
    );

    // Verificar si se puede editar basado en el estado del plan
    const canEditByState = planTrabajo.estado === 'Creado' || planTrabajo.estado === 'Corrección';
    const canEditPlan = hasPermission('editar-planes-trabajo') && canEditByState;
    
    // Verificar si se puede crear informe (plan aprobado y usuario autorizado)
    const canCreateInforme = planTrabajo.estado === 'Aprobado' && user?.id === investigador.id;

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
                                <div className="flex items-center justify-start gap-2 mt-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Períodos:
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {planTrabajo.periodo_inicio?.nombre ?? 'Sin período'}
                                        </Badge>
                                        {planTrabajo.vigencia === 'Anual' && (
                                            <>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">→</span>
                                                <Badge variant="outline">
                                                    {planTrabajo.periodo_fin?.nombre ?? 'Pendiente'}
                                                </Badge>
                                            </>
                                        )}
                                    </div>
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
                                            Revisar
                                        </Button>
                                    </>
                                )}
                                
                                {/* Botón enviar a revisión (solo para el investigador del plan) */}
                                {(planTrabajo.estado === 'Creado' || planTrabajo.estado === 'Corrección') &&  user?.id == investigador.id && 
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
                                    Historial
                                </Button>
                                
                                {/* Botón para crear informe */}
                                {canCreateInforme && (
                                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                                        <a href={route('investigadores.planes-trabajo.informes.create', [investigador.id, planTrabajo.id])}>
                                            <FileText className="w-4 h-4 mr-2" />
                                            Informe
                                        </a>
                                    </Button>
                                )}
                                
                                {/* Botón para descargar PDF */}
                                <Button
                                    onClick={() => window.open(route('pdf.plan-trabajo.preview', planTrabajo.id), '_blank')}
                                    variant="outline"
                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    PDF
                                </Button>
                                
                                {/* Botón para terminar plan (solo para líderes y administradores) */}
                                {planTrabajo.estado === 'Aprobado' && hasPermission('revisar-planes-trabajo') && (
                                    <Button
                                        onClick={() => setTerminarDialogOpen(true)}
                                        variant="outline"
                                        className="border-purple-500 text-purple-600 hover:bg-purple-50"
                                    >
                                        <SquareCheck className="w-4 h-4 mr-2" />
                                        Finalizar
                                    </Button>
                                )}
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
                                            <TableHead className="w-1/10 text-center">Progreso</TableHead>
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
                                                <TableCell className="text-center align-top">
                                                    <div className="flex items-center justify-center">
                                                        <span className="text-sm font-medium">{actividad.porcentaje_progreso}%</span>
                                                    </div>
                                                </TableCell>
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

                        {/* Informes del Plan */}
                        {planTrabajo.informes && planTrabajo.informes.length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Informes del Plan</h3>
                                </div>

                                <div className="space-y-3">
                                    {planTrabajo.informes.map((informe) => (
                                        <Card key={informe.id} className="border border-gray-200">
                                            <CardHeader 
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => toggleInforme(informe.id)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <CardTitle className="text-base">
                                                            Informe del {new Date(informe.created_at).toLocaleDateString('es-ES')}
                                                        </CardTitle>
                                                        <p className="text-sm text-gray-600">
                                                            {informe.evidencias?.length || 0} actividades reportadas
                                                        </p>
                                                    </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(route('investigadores.planes-trabajo.informes.preview', [investigador.id, planTrabajo.id, informe.id]), '_blank');
                                                        }}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-green-500 text-green-600 hover:bg-green-50"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Ver
                                                    </Button>
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(route('investigadores.planes-trabajo.informes.pdf', [investigador.id, planTrabajo.id, informe.id]), '_blank');
                                                        }}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Download className="w-4 h-4 mr-1" />
                                                        PDF
                                                    </Button>
                                                        {informesExpanded[informe.id] ? (
                                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            
                                            {informesExpanded[informe.id] && (
                                                <CardContent>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Actividad</TableHead>
                                                                <TableHead>Observaciones</TableHead>
                                                                <TableHead className="text-center">Progreso</TableHead>
                                                                <TableHead className="text-center">Evidencias</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {informe.evidencias?.map((evidencia) => (
                                                                <TableRow key={evidencia.id}>
                                                                    <TableCell>
                                                                        <div className="whitespace-normal break-words align-top">
                                                                            {evidencia.actividad_plan?.actividad_investigacion?.nombre}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="whitespace-normal break-words align-top">
                                                                                {evidencia.descripcion}
                                                                        {/* <div className="max-w-xs">
                                                                            <p className="text-sm text-gray-600">
                                                                            </p>
                                                                        </div> */}
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <div className="text-sm">
                                                                            <span className="text-gray-500">{evidencia.porcentaje_progreso_anterior}%</span>
                                                                            <span className="mx-2">→</span>
                                                                            <span className="font-medium text-green-600">{evidencia.porcentaje_progreso_nuevo}%</span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <div className="space-y-2">
                                                                            {evidencia.ruta_archivo ? (
                                                                                <div className="flex flex-col items-center space-y-1">
                                                                                    <Button
                                                                                        onClick={() => window.open(route('investigadores.planes-trabajo.informes.evidencias.descargar', [investigador.id, planTrabajo.id, informe.id, evidencia.id]), '_blank')}
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="text-xs px-2 py-1 h-6 border-blue-500 text-blue-600 hover:bg-blue-50"
                                                                                    >
                                                                                        <Download className="w-3 h-3 mr-1" />
                                                                                        Descargar
                                                                                    </Button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-xs text-gray-400">
                                                                                    No se relacionó un archivo
                                                                                </div>
                                                                            )}
                                                                            {evidencia.url_link ? (
                                                                                <div className="text-xs">
                                                                                    <a 
                                                                                        href={evidencia.url_link} 
                                                                                        target="_blank" 
                                                                                        rel="noopener noreferrer"
                                                                                        className="text-blue-600 hover:underline"
                                                                                    >
                                                                                        🔗 Enlace
                                                                                    </a>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-xs text-gray-400">
                                                                                    No se relacionó un enlace
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
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

            {/* Confirmación de terminación del plan */}
            <ConfirmDialog
                open={terminarDialogOpen}
                onOpenChange={setTerminarDialogOpen}
                title="Finalizar Plan de Trabajo"
                description="¿Estás seguro de que deseas marcar este plan de trabajo como terminado? Esta acción no se puede deshacer y el plan pasará al estado 'Terminado'."
                confirmText="Finalizar"
                confirmVariant="default"
                onConfirm={confirmTerminarPlan}
            />
        </AppLayout>
    );
}