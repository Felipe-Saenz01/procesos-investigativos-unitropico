import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Calendar, Users, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    },
    {
        title: 'Detalle del Período',
        href: '#',
    }
];

interface Proyecto {
    id: number;
    titulo: string;
    estado: string;
    eje_tematico: string;
}

interface SubTipoProducto {
    id: number;
    nombre: string;
    descripcion: string;
    tipo_producto: {
        id: number;
        nombre: string;
    };
}

interface Usuario {
    id: number;
    name: string;
    email: string;
    tipo: string;
}

interface Entrega {
    id: number;
    tipo: 'planeacion' | 'evidencia';
    planeacion: Array<{
        nombre: string;
        porcentaje: number;
        completado?: number;
    }>;
    evidencia: string | null;
    created_at: string;
    updated_at: string;
    usuario: Usuario;
    progreso_planeacion: number;
    horas_planeacion: number;
    estado: string;
}

interface Periodo {
    id: number;
    nombre: string;
    fecha_limite_planeacion: string;
    fecha_limite_evidencias: string;
    estado: string;
    horas_disponibles: number;
}

interface Estadisticas {
    total_entregas: number;
    tiene_planeacion: boolean;
    tiene_evidencia: boolean;
    progreso_planeacion: number;
    progreso_evidencia: number;
    horas_planeacion: number;
    fecha_planeacion: string | null;
    fecha_evidencia: string | null;
}

interface Comparacion {
    diferencia_progreso: number;
    cumplimiento_planeacion: boolean;
    elementos_planeacion: Array<{
        nombre: string;
        porcentaje: number;
    }>;
    elementos_evidencia: Array<{
        nombre: string;
        porcentaje: number;
        completado?: number;
    }>;
}

interface PeriodoDetalleProps {
    producto: {
        id: number;
        titulo: string;
        resumen: string;
        progreso: number;
        proyecto: Proyecto;
        sub_tipo_producto: SubTipoProducto;
        usuarios: Usuario[];
    };
    periodo: Periodo;
    planeacion: Entrega | null;
    evidencia: Entrega | null;
    estadisticas: Estadisticas;
    comparacion: Comparacion | null;
}

export default function PeriodoDetalle({ producto, periodo, planeacion, evidencia, estadisticas, comparacion }: PeriodoDetalleProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTipoBadgeVariant = (tipo: string) => {
        switch (tipo) {
            case 'Lider Grupo':
                return 'default';
            case 'Investigador':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detalle del Período: ${periodo.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('productos.show', producto.id)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al Producto
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Información del Producto y Período */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Información del Producto y Período
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Información del Producto */}
                        <div>
                            <h3 className="font-semibold text-lg mb-2">{producto.titulo}</h3>
                            <p className="text-sm text-gray-600 mb-4">{producto.resumen}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Proyecto:</span>
                                    <p className="font-medium">{producto.proyecto.titulo}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Tipo:</span>
                                    <p className="font-medium">{producto.sub_tipo_producto.nombre}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Progreso General:</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full" 
                                                style={{ width: `${producto.progreso}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium">{producto.progreso}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Información del Período */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="h-5 w-5" />
                                <h3 className="font-semibold text-lg">{periodo.nombre}</h3>
                                <Badge variant={periodo.estado === 'Activo' ? 'default' : 'secondary'}>
                                    {periodo.estado}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Estadísticas Generales */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Estadísticas del Período
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{estadisticas.total_entregas}</div>
                                <div className="text-sm text-gray-600">Total Entregas</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{estadisticas.progreso_planeacion}%</div>
                                <div className="text-sm text-gray-600">Progreso Planeación</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{estadisticas.progreso_evidencia}%</div>
                                <div className="text-sm text-gray-600">Progreso Evidencia</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">{estadisticas.horas_planeacion}h</div>
                                <div className="text-sm text-gray-600">Horas Planeación</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detalles de Entregas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Entrega de Planeación */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Entrega de Planeación
                                {estadisticas.tiene_planeacion ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {planeacion ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Progreso:</span>
                                        <span className="font-bold">{planeacion.progreso_planeacion}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Horas:</span>
                                        <span className="font-bold">{planeacion.horas_planeacion}h</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Fecha:</span>
                                        <span className="font-bold">{formatDate(planeacion.created_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Responsable:</span>
                                        <span className="font-bold">{planeacion.usuario.name}</span>
                                    </div>
                                    <Separator />
                                    <Button asChild size="sm" className="w-full">
                                        <Link href={route('entregas.show', planeacion.id)}>
                                            Ver Detalles
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No hay entrega de planeación registrada</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Entrega de Evidencia */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Entrega de Evidencia
                                {estadisticas.tiene_evidencia ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {evidencia ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Progreso:</span>
                                        <span className="font-bold">{evidencia.progreso_planeacion}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Fecha:</span>
                                        <span className="font-bold">{formatDate(evidencia.created_at)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Responsable:</span>
                                        <span className="font-bold">{evidencia.usuario.name}</span>
                                    </div>
                                    {evidencia.evidencia && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Archivo:</span>
                                            <Button asChild size="sm" variant="outline">
                                                <a href={`/storage/${evidencia.evidencia}`} target="_blank" rel="noopener noreferrer">
                                                    Descargar
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                    <Separator />
                                    <Button asChild size="sm" className="w-full">
                                        <Link href={route('entregas.show', evidencia.id)}>
                                            Ver Detalles
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No hay entrega de evidencia registrada</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Comparación Planeación vs Evidencia - Gráfica */}
                {comparacion && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5" />
                                Comparación: Planeación vs Evidencia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{
                                planeacion: {
                                    label: "Planeación (%)",
                                    color: "hsl(var(--chart-1))",
                                },
                                evidencia: {
                                    label: "Evidencia (%)",
                                    color: "hsl(var(--chart-2))",
                                },
                            }}>
                                <BarChart
                                    data={[
                                        {
                                            elemento: 'Progreso General',
                                            planeacion: estadisticas.progreso_planeacion,
                                            evidencia: estadisticas.progreso_evidencia,
                                        },
                                        ...comparacion.elementos_planeacion.map((elemento, index) => ({
                                            elemento: elemento.nombre,
                                            planeacion: elemento.porcentaje,
                                            evidencia: comparacion.elementos_evidencia[index]?.completado || 0,
                                        }))
                                    ]}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="elemento" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        fontSize={12}
                                    />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="planeacion" fill="hsl(var(--chart-1))" name="Planeación" />
                                    <Bar dataKey="evidencia" fill="hsl(var(--chart-2))" name="Evidencia" />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Comparación Detallada de Elementos */}
                {comparacion && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Comparación Detallada de Elementos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Elemento</TableHead>
                                        <TableHead className="text-center">Planeado (%)</TableHead>
                                        <TableHead className="text-center">Completado (%)</TableHead>
                                        <TableHead className="text-center">Diferencia</TableHead>
                                        <TableHead className="text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {comparacion.elementos_planeacion.map((elementoPlaneacion, index) => {
                                        const elementoEvidencia = comparacion.elementos_evidencia[index];
                                        const completado = elementoEvidencia?.completado || 0;
                                        const diferencia = completado - elementoPlaneacion.porcentaje;
                                        const cumplido = completado >= elementoPlaneacion.porcentaje;
                                        
                                        return (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">
                                                    {elementoPlaneacion.nombre}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {elementoPlaneacion.porcentaje}%
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {completado}%
                                                </TableCell>
                                                <TableCell className={`text-center font-bold ${diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {diferencia >= 0 ? '+' : ''}{diferencia}%
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {cumplido ? (
                                                        <Badge variant="default" className="bg-green-600">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                            Cumplido
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Pendiente
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
