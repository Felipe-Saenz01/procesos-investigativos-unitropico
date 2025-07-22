import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
    created_at: string;
    updated_at: string;
    periodo: Periodo;
    usuario: Usuario;
    producto_investigativo: ProductoInvestigativo;
    horas_planeacion: number;
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
            <Head title={`Entrega: ${getTipoLabel(entrega.tipo)}`} />
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
                            <CardContent className=" flex space-x-2 items-center ">
                                <div >
                                    <Badge variant={entrega.tipo === 'planeacion' ? 'default' : 'secondary'} className="text-sm">
                                        {getTipoLabel(entrega.tipo)}
                                    </Badge>
                                </div>
                                <Separator orientation="vertical"/>
                                <div className="grid grid-cols-2 gap-4 text-sm h-full w-full">
                                    <div>
                                        <p className="flex items-center gap-1 mt-1">
                                            <span className=" text-gray-500">Fecha de entrega:</span>
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(entrega.created_at)}
                                        </p>
                                        <p className="flex items-center gap-1 mt-1">
                                            <span className=" text-gray-500">Estado:</span>
                                            <Badge variant={entrega.estado === 'aprobada' ? 'default' : 'secondary'}>{entrega.estado}</Badge>
                                        </p>
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
                                        Entrega planeación: {formatDate(entrega.periodo.fecha_limite_planeacion)} - Entrega evidencia: {formatDate(entrega.periodo.fecha_limite_evidencias)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Elementos de planeación/avance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {entrega.tipo === 'planeacion' ? 'Elementos de Planificación' : 'Elementos de Avance'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {entrega.planeacion.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.nombre}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {entrega.tipo === 'planeacion' ? 'Porcentaje esperado' : 'Porcentaje completado'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className="text-lg font-semibold">
                                                    {item.porcentaje}%
                                                </Badge>
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
                                        <p className="text-sm text-gray-500">Usuario del sistema</p>
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
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium text-sm">Horas de Planeación</p>
                                            <p className="text-xs text-gray-500">Tiempo dedicado a planificar</p>
                                        </div>
                                        <Badge variant="outline" className="text-lg font-semibold">
                                            {entrega.horas_planeacion}h
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 