import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EstadoBadge } from '@/components/EstadoBadge';
import {
    ArrowLeft,
    Clock,
    Users,
    FolderOpen,
    FileText,
    Calendar,
    Mail,
    GraduationCap,
    Award,
    TrendingUp,
    Eye
} from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

interface GrupoInvestigacion {
    id: number;
    nombre: string;
    correo: string;
}

interface EscalafonProfesoral {
    id: number;
    nombre: string;
    horas_semanales: number;
}

interface TipoContrato {
    id: number;
    nombre: string;
    numero_periodos: number;
}

interface ProyectoInvestigativo {
    id: number;
    titulo: string;
    estado: string;
    created_at: string;
}

interface ProductoInvestigativo {
    id: number;
    titulo: string;
    actividad_investigacion: {
        nombre: string;
    };
    sub_tipo_producto: {
        nombre: string;
    };
    tipo_producto: {
        nombre: string;
    };
    estado: string;
    fecha_publicacion?: string;
}
interface Props {
    auth: SharedData['auth'];
    investigador: {
        id: number;
        name: string;
        email: string;
        tipo?: string;
        cedula?: string;
        isInvestigador?: boolean;
        grupo_investigacion?: GrupoInvestigacion;
        escalafon_profesoral?: EscalafonProfesoral;
        tipo_contrato?: TipoContrato;
        proyectosInvestigativos?: ProyectoInvestigativo[];
        productosInvestigativos?: ProductoInvestigativo[];
        horasInvestigacion?: Array<{
            id: number;
            horas: number;
            estado: string;
            periodo: {
                nombre: string;
            };
            created_at: string;
        }>;
        planesTrabajo: Array<{
            id: number;
            titulo: string;
            estado: string;
            fecha_creacion: string;
        }>;
    };
}

export default function Show({ investigador }: Props) {
    const { hasPermission } = usePermissions();
    const breadcrumbs = [
        { title: 'Investigadores', href: route('investigadores.index') },
        { title: investigador.name, href: '#' }
    ];

    const horasActivas = investigador.horasInvestigacion?.filter(h => h.estado === 'Activo');
    const totalHorasActivas = horasActivas?.reduce((sum, h) => sum + h.horas, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Investigador - ${investigador.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    {/* Header */}
                    <div className='flex flex-row items-center justify-between p-5 border-b'>
                        <div>
                            <h1 className='text-3xl font-bold'>{investigador.name}</h1>
                            <p className='text-gray-600 mt-1'>Perfil del Investigador</p>
                        </div>
                        <Link href={investigador.isInvestigador ? route('dashboard') : route('investigadores.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                    </div>

                    <div className='p-5 space-y-6'>
                        <div className='flex flex-row gap-3 w-full'>
                            {/* Información Personal */}
                            <Card className='md:w-3/4'>
                                <CardHeader>
                                    <CardTitle className='text-xl flex items-center gap-2'>
                                        <Users className="h-5 w-5" />
                                        Información Personal
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">Email:</span>
                                                <span>{investigador.email}</span>
                                            </div>
                                            {investigador.cedula && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Cédula:</span>
                                                    <span>{investigador.cedula}</span>
                                                </div>
                                            )}
                                            {investigador.tipo && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Tipo:</span>
                                                    <span>{investigador.tipo}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            {investigador.escalafon_profesoral && (
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium">Escalafón:</span>
                                                    <span>{investigador.escalafon_profesoral.nombre}</span>
                                                </div>
                                            )}
                                            {investigador.grupo_investigacion && (
                                                <div className="flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium">Grupo:</span>
                                                    <span>{investigador.grupo_investigacion.nombre}</span>
                                                    <Badge variant="outline">{investigador.grupo_investigacion.correo}</Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Acciones */}
                            <Card className='md:w-1/4'>
                                <CardHeader>
                                    <CardTitle className='text-xl flex items-center gap-2'>
                                        <Calendar className="h-5 w-5" />
                                        Acciones
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-3">
                                        <Link href={route('investigadores.horas', investigador.id)}>
                                            <Button variant="outline">
                                                <Clock className="h-4 w-4 mr-2" />
                                                Horas de Investigación
                                            </Button>
                                        </Link>
                                        <Link href={route('investigadores.planes-trabajo', investigador.id)}>
                                            <Button variant="outline">
                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                Planes de Trabajo
                                            </Button>
                                        </Link>
                                        {hasPermission('editar-usuario') && (
                                        <Link href={route('investigadores.edit', investigador.id)}>
                                            <Button variant="outline">
                                                <Users className="h-4 w-4 mr-2" />
                                                    Editar Perfil
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Resumen Estadístico */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <FolderOpen className="h-8 w-8 text-blue-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Proyectos</p>
                                            <p className="text-2xl font-bold">{investigador.proyectosInvestigativos?.length || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-8 w-8 text-green-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Productos</p>
                                            <p className="text-2xl font-bold">{investigador.productosInvestigativos?.length || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-8 w-8 text-orange-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Horas Activas</p>
                                            <p className="text-2xl font-bold">{totalHorasActivas}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-8 w-8 text-purple-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">Planes de Trabajo</p>
                                            <p className="text-2xl font-bold">{investigador.planesTrabajo?.length || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Proyectos de Investigación */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-xl flex items-center gap-2'>
                                    <FolderOpen className="h-5 w-5" />
                                    Proyectos de Investigación
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!investigador.proyectosInvestigativos || investigador.proyectosInvestigativos.length === 0 ? (
                                    <p className='text-gray-400 text-center py-4'>No hay proyectos asignados.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Título</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Fecha Creación</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {investigador.proyectosInvestigativos.map((proyecto) => (
                                                <TableRow key={proyecto.id}>
                                                    <TableCell className='font-medium'>{proyecto.titulo}</TableCell>
                                                    <TableCell><EstadoBadge estado={proyecto.estado} /></TableCell>
                                                    <TableCell>{new Date(proyecto.created_at).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* Productos Investigativos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-xl flex items-center gap-2'>
                                    <FileText className="h-5 w-5" />
                                    Productos Investigativos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!investigador.productosInvestigativos || investigador.productosInvestigativos.length === 0 ? (
                                    <p className='text-gray-400 text-center py-4'>No hay productos registrados.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Título</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>Sub-tipo</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Fecha Publicación</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {investigador.productosInvestigativos?.map((producto) => (
                                                <TableRow key={producto.id}>
                                                    <TableCell className='font-medium'>{producto.titulo}</TableCell>
                                                    <TableCell>{producto.tipo_producto.nombre}</TableCell>
                                                    <TableCell>{producto.sub_tipo_producto.nombre}</TableCell>
                                                    <TableCell><EstadoBadge estado={producto.estado} /></TableCell>
                                                    <TableCell>
                                                        {producto.fecha_publicacion
                                                            ? new Date(producto.fecha_publicacion).toLocaleDateString()
                                                            : 'No publicado'
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* Horas de Investigación */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-xl flex items-center gap-2'>
                                    <Clock className="h-5 w-5" />
                                    Horas de Investigación
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {investigador.horasInvestigacion?.length === 0 ? (
                                    <p className='text-gray-400 text-center py-4'>No hay horas de investigación asignadas.</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Período</TableHead>
                                                <TableHead>Horas</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Fecha Asignación</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {investigador.horasInvestigacion?.map((horas) => (
                                                <TableRow key={horas.id}>
                                                    <TableCell className='font-medium'>{horas.periodo.nombre}</TableCell>
                                                    <TableCell>{horas.horas} horas</TableCell>
                                                    <TableCell><EstadoBadge estado={horas.estado} /></TableCell>
                                                    <TableCell>{new Date(horas.created_at).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>

                        {/* Planes de Trabajo */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='text-xl flex items-center gap-2'>
                                    <TrendingUp className="h-5 w-5" />
                                    Planes de Trabajo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!investigador.planesTrabajo || investigador.planesTrabajo.length === 0 ? (
                                    <p className='text-gray-400 text-center py-4'>No hay planes de trabajo registrados.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {investigador.planesTrabajo.map((plan) => (
                                            <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">{plan.titulo}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Creado: {new Date(plan.fecha_creacion).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <EstadoBadge estado={plan.estado} />
                                                    <Link href={route('investigadores.planes-trabajo.show', [investigador.id, plan.id])}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Ver Detalles
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>


                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
