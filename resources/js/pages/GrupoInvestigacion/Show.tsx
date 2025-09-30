import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Head, Link } from '@inertiajs/react'

interface Usuario {
    id: number;
    name: string;
    email: string;
    tipo: string;
}

interface GrupoInvestigacion {
    id: number;
    nombre: string;
    correo: string;
    descripcion?: string | null;
    objetivos?: string | null;
    vision?: string | null;
    mision?: string | null;
    ruta_plan_trabajo?: string | null;
    nombre_archivo_plan_trabajo?: string | null;
    usuarios?: Usuario[];
}

interface Props {
    grupoInvestigacion: GrupoInvestigacion;
}

export default function GrupoInvestigacionShow({ grupoInvestigacion }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Grupos de Investigación', href: route('grupo-investigacion.index') },
            { title: grupoInvestigacion.nombre, href: '#' },
        ]}>
            <Head title={`Grupo: ${grupoInvestigacion.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">{grupoInvestigacion.nombre}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Correo</p>
                                    <p className="font-medium">{grupoInvestigacion.correo}</p>
                                </div>
                                {grupoInvestigacion.descripcion && (
                                    <div>
                                        <p className="text-sm text-gray-500">Descripción</p>
                                        <p className="whitespace-pre-line">{grupoInvestigacion.descripcion}</p>
                                    </div>
                                )}
                                {grupoInvestigacion.mision && (
                                    <div>
                                        <p className="text-sm text-gray-500">Misión</p>
                                        <p className="whitespace-pre-line">{grupoInvestigacion.mision}</p>
                                    </div>
                                )}
                                {grupoInvestigacion.vision && (
                                    <div>
                                        <p className="text-sm text-gray-500">Visión</p>
                                        <p className="whitespace-pre-line">{grupoInvestigacion.vision}</p>
                                    </div>
                                )}
                                {grupoInvestigacion.objetivos && (
                                    <div>
                                        <p className="text-sm text-gray-500">Objetivos</p>
                                        <p className="whitespace-pre-line">{grupoInvestigacion.objetivos}</p>
                                    </div>
                                )}
                                {grupoInvestigacion.ruta_plan_trabajo && (
                                    <div>
                                        <p className="text-sm text-gray-500">Plan de Trabajo</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(route('grupo-investigacion.descargar-plan', grupoInvestigacion.id), '_blank')}
                                        >
                                            Descargar plan
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Investigadores</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Correo</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(grupoInvestigacion.usuarios || []).length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-sm text-gray-500">Sin investigadores asignados</TableCell>
                                            </TableRow>
                                        )}
                                        {(grupoInvestigacion.usuarios || []).map(usuario => (
                                            <TableRow key={usuario.id}>
                                                <TableCell className="whitespace-normal break-words">{usuario.name}</TableCell>
                                                <TableCell className="whitespace-normal break-words">{usuario.email}</TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={route('investigadores.show', usuario.id)}>
                                                        <Button size="sm" variant="outline">Ver</Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}


