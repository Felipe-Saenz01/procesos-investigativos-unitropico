import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, FileText, ArrowLeft, User, Clock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    },
    {
        title: 'Detalles de Entrega',
        href: '/entregas/show',
    }
];

interface Proyecto {
    id: number;
    titulo: string;
}

interface SubTipoProducto {
    id: number;
    nombre: string;
}

interface Periodo {
    id: number;
    nombre: string;
    fecha_limite_planeacion: string;
    fecha_limite_evidencias: string;
    estado: string;
}

interface Usuario {
    id: number;
    name: string;
    tipo: string;
}

interface ProductoInvestigativo {
    id: number;
    titulo: string;
    proyecto: Proyecto;
    sub_tipo_producto: SubTipoProducto;
}

interface Entrega {
    id: number;
    tipo: 'planeacion' | 'evidencia';
    planeacion: Array<{
        nombre: string;
        porcentaje: number;
    }>;
    evidencia: string | null;
    created_at: string;
    updated_at: string;
    periodo: Periodo;
    usuario: Usuario;
    producto_investigativo: ProductoInvestigativo;
    horas_planeacion: number;
    progreso_planeacion: number;
    estado: string;
}

interface EntregasShowProps {
    entrega: Entrega;
}

export default function EntregasShow({ entrega }: EntregasShowProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getTipoLabel = (tipo: string) => {
        return tipo === 'planeacion' ? 'Planeación' : 'Evidencia';
    };

    // const getTipoDescription = (tipo: string) => {
    //     return tipo === 'planeacion'
    //         ? 'Planificación de actividades y porcentajes esperados'
    //         : 'Evidencia del avance realizado según la planificación';
    // };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Entrega ${getTipoLabel(entrega.tipo)}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header con botones de acción */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('productos.show', entrega.producto_investigativo.id)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al Producto
                            </Link>
                        </Button>
                    </div>
                    <Button asChild>
                        <Link href={route('entregas.edit', entrega.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Detalles de la entrega */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Detalles de la Entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Información básica */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={entrega.tipo === 'planeacion' ? 'default' : 'secondary'} className="text-sm">
                                                {getTipoLabel(entrega.tipo)}
                                            </Badge>
                                            <Badge variant={entrega.estado === 'aprobada' ? 'default' : 'secondary'}>
                                                {entrega.estado}
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">Fecha de entrega:</span>
                                                <span className="text-sm font-medium">{formatDate(entrega.created_at)}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">Horas registradas:</span>
                                                <span className="text-sm font-medium">{entrega.horas_planeacion}h</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progreso */}
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                                {entrega.tipo === 'planeacion' ? 'Progreso de Planeación' : 'Progreso de Evidencia'}
                                            </h4>
                                            <div className="relative w-24 h-24 mx-auto">
                                                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                                                    <path
                                                        className="text-gray-200"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                    <path
                                                        className={entrega.tipo === 'planeacion' ? 'text-blue-600' : 'text-green-600'}
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        fill="none"
                                                        strokeDasharray={`${entrega.progreso_planeacion}, 100`}
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className={`text-lg font-bold ${entrega.tipo === 'planeacion' ? 'text-blue-600' : 'text-green-600'}`}>
                                                        {entrega.progreso_planeacion}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Período */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Período Académico
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{entrega.periodo.nombre}</h4>
                                        <Badge variant={entrega.periodo.estado === 'Activo' ? 'default' : 'secondary'}>
                                            {entrega.periodo.estado}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Entrega planeación: {new Date(entrega.periodo.fecha_limite_planeacion).toLocaleDateString()} - Entrega evidencia: {new Date(entrega.periodo.fecha_limite_evidencias).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Archivo de evidencia */}
                        {entrega.tipo === 'evidencia' && entrega.evidencia && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Archivo de Evidencia
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                                        <FileText className="h-8 w-8 text-blue-600" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">Archivo adjunto</p>
                                            <p className="text-xs text-gray-500">Evidencia del avance realizado</p>
                                        </div>
                                        <Button asChild size="sm" variant="outline">
                                            <a href={`/storage/${entrega.evidencia}`} target="_blank" rel="noopener noreferrer">
                                                Descargar
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Elementos de planeación/avance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {entrega.tipo === 'planeacion' ? 'Elementos de Planificación' : 'Elementos de Avance'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {entrega.planeacion.map((item, index) => (
                                        <div key={index} className="p-4 border rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-sm">{item.nombre}</h4>
                                                <Badge variant="outline" className="text-sm font-semibold">
                                                    {item.porcentaje}%
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {entrega.tipo === 'planeacion' ? 'Porcentaje esperado' : 'Porcentaje completado'}
                                            </p>
                                            {/* Barra de progreso */}
                                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                    style={{ width: `${item.porcentaje}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel lateral */}
                    <div className="space-y-6">
                        {/* Producto asociado */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Producto Asociado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-medium">{entrega.producto_investigativo.titulo}</h4>
                                        <p className="text-sm text-gray-500">
                                            {entrega.producto_investigativo.sub_tipo_producto.nombre}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Proyecto:</p>
                                        <p className="font-medium text-sm">
                                            {entrega.producto_investigativo.proyecto.titulo}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Usuario que realizó la entrega */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Entregado por
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{entrega.usuario.name}</p>
                                        <p className="text-sm text-gray-500">{entrega.usuario.tipo}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Horas registradas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Horas Registradas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center p-4 border rounded-lg bg-blue-50">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">
                                        {entrega.horas_planeacion}h
                                    </div>
                                    <p className="text-sm text-gray-600">Horas de Planeación</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 