import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, FileText, Users, ArrowLeft, Plus, Eye, Trash2, CheckCircle } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CircleAlert } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    },
    {
        title: 'Detalles del Producto',
        href: '/productos/show',
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

interface ElementoProducto {
    id: number;
    nombre: string;
    descripcion: string;
    progreso: number;
    created_at: string;
    updated_at: string;
}

interface ProductoInvestigativo {
    id: number;
    titulo: string;
    resumen: string;
    progreso: number;
    created_at: string;
    updated_at: string;
    proyecto: Proyecto;
    sub_tipo_producto: SubTipoProducto;
    usuarios: Usuario[];
    elementos: ElementoProducto[];
}

interface PeriodoEntrega {
    id: number;
    nombre: string;
    fecha_limite_planeacion: string;
    fecha_limite_evidencias: string;
    estado: string;
    puede_crear_planeacion: boolean;
    puede_crear_evidencia: boolean;
    planeacion: null | {
        id: number;
        estado: string;
        usuario: { id: number; name: string };
        created_at: string;
    };
    evidencia: null | {
        id: number;
        estado: string;
        usuario: { id: number; name: string };
        created_at: string;
    };
}

interface ProductosShowProps {
    producto: ProductoInvestigativo;
    periodos: PeriodoEntrega[];
}

export default function ProductosShow({ producto, periodos }: ProductosShowProps) {
    const { props } = usePage();
    const flash = props.flash as { success?: string; error?: string };
    
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
            <Head title={`Producto: ${producto.titulo}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Mostrar errores de horas insuficientes */}
                {flash.error && (
                    <Alert variant="destructive">
                        <CircleAlert className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Mostrar mensajes de éxito */}
                {flash.success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Éxito</AlertTitle>
                        <AlertDescription>
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Header con botones de acción */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('productos.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Link>
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild>
                            <Link href={route('productos.edit', producto.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Link>
                        </Button>
                        <Button variant="destructive" asChild>
                            <Link href={route('productos.destroy', producto.id)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Primera fila: Información del producto (izq) y Participantes + Proyecto (der) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Información del producto - Izquierda */}
                        <div className="lg:col-span-2">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                                        <FileText className="h-6 w-6"/>
                                        {producto.titulo}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge variant="secondary">
                                            {producto.sub_tipo_producto.nombre}
                                        </Badge>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-medium mb-2">Resumen</h4>
                                        <p className="text-gray-600 leading-relaxed">
                                            {producto.resumen}
                                        </p>
                                    </div>

                                    <Separator />

                                    {/* Progreso del producto */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">Progreso del Producto</h4>
                                            <span className="text-sm font-medium text-gray-600">{producto.progreso}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                                                style={{ width: `${producto.progreso}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Progreso general del producto investigativo
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Panel lateral derecho - Participantes y Proyecto */}
                        <div className="space-y-6">
                            {/* Participantes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Participantes ({producto.usuarios.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[200px]">
                                        <div className="space-y-3 pr-4">
                                            {producto.usuarios.map((usuario) => (
                                                <div key={usuario.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{usuario.name}</p>
                                                        <p className="text-sm text-gray-500">{usuario.email}</p>
                                                    </div>
                                                    <Badge variant={getTipoBadgeVariant(usuario.tipo)}>
                                                        {usuario.tipo}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>

                            {/* Proyecto asociado */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Proyecto Asociado
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <h5 className="font-medium">{producto.proyecto.titulo}</h5>
                                            <p className="text-sm text-gray-500">Eje Temático: {producto.proyecto.eje_tematico}</p>
                                        </div>
                                        <Badge variant={producto.proyecto.estado === 'En Formulación' ? 'outline' : 'default'}>
                                            {producto.proyecto.estado}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Segunda fila: Elementos del producto (ancho completo) */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Elementos del Producto ({producto.elementos.length})
                                </CardTitle>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/productos/${producto.id}/elementos`}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Gestionar Elementos
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {producto.elementos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {producto.elementos.map((elemento) => (
                                        <div key={elemento.id} className="p-4 border rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-medium">{elemento.nombre}</h4>
                                                <Badge variant='default'>
                                                    {elemento.progreso}%
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{elemento.descripcion}</p>
                                            <div className="text-xs text-gray-500">
                                                Actualizado: {formatDate(elemento.updated_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-4">No hay elementos definidos para este producto</p>
                                    <Button asChild variant="outline">
                                        <Link href={`/productos/${producto.id}/elementos`}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Crear Primer Elemento
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Entregas ocupando todo el ancho */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Entregas
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="multiple" className="w-full">
                                {periodos.length === 0 && (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-4">No hay entregas ni periodos activos para este producto</p>
                                    </div>
                                )}
                                {periodos.map((periodo) => (
                                    <AccordionItem key={periodo.id} value={String(periodo.id)} className="bg-gray-100 rounded-lg p-3">
                                        <AccordionTrigger>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{periodo.nombre}</span>
                                                    <Badge variant={periodo.estado === 'Activo' ? 'default' : 'secondary'}>
                                                        {periodo.estado}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-col gap-1 text-sm text-gray-500">
                                                    <span>Planeación hasta: {new Date(periodo.fecha_limite_planeacion).toLocaleDateString()}</span>
                                                    <span>Evidencias hasta: {new Date(periodo.fecha_limite_evidencias).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex gap-2 mt-1">
                                                    {periodo.planeacion && (
                                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                                            ✓ Planeación
                                                        </Badge>
                                                    )}
                                                    {periodo.evidencia && (
                                                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                                                            ✓ Evidencia
                                                        </Badge>
                                                    )}
                                                    {periodo.puede_crear_planeacion && (
                                                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                                                            Pendiente Planeación
                                                        </Badge>
                                                    )}
                                                    {periodo.puede_crear_evidencia && (
                                                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                                                            Pendiente Evidencia
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {/* Botones de acción */}
                                            <div className="flex gap-2 mb-4">
                                                {periodo.puede_crear_planeacion && (
                                                    <Button asChild size="sm" variant="default">
                                                        <Link href={route('entregas.planeacion.create', producto.id) + `?periodo_id=${periodo.id}`}>
                                                            <Plus className="h-4 w-4 mr-2" />Registrar Planeación
                                                        </Link>
                                                    </Button>
                                                )}
                                                {periodo.puede_crear_evidencia && (
                                                    <Button asChild size="sm" variant="secondary">
                                                        <Link href={route('entregas.evidencia.create', producto.id) + `?periodo_id=${periodo.id}`}>
                                                            <Plus className="h-4 w-4 mr-2" />Registrar Evidencia
                                                        </Link>
                                                    </Button>
                                                )}
                                                <Button asChild size="sm" variant="outline">
                                                    <Link href={route('periodos.detalle', [producto.id, periodo.id])}>
                                                        <Eye className="h-4 w-4 mr-2" />Ver Detalle
                                                    </Link>
                                                </Button>
                                            </div>
                                            {/* Tabla de entregas */}
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Tipo</TableHead>
                                                        <TableHead>Estado</TableHead>
                                                        <TableHead>Entregado por</TableHead>
                                                        <TableHead>Fecha</TableHead>
                                                        <TableHead>Acciones</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {periodo.planeacion && (
                                                        <TableRow>
                                                            <TableCell><Badge variant="default">Planeación</Badge></TableCell>
                                                            <TableCell><Badge variant={periodo.planeacion.estado === 'aprobada' ? 'default' : 'secondary'}>{periodo.planeacion.estado}</Badge></TableCell>
                                                            <TableCell>{periodo.planeacion.usuario.name}</TableCell>
                                                            <TableCell>{formatDate(periodo.planeacion.created_at)}</TableCell>
                                                            <TableCell>
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <Link href={route('entregas.show', periodo.planeacion.id)}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                    {periodo.evidencia && (
                                                        <TableRow>
                                                            <TableCell><Badge variant="secondary">Evidencia</Badge></TableCell>
                                                            <TableCell><Badge variant={periodo.evidencia.estado === 'aprobada' ? 'default' : 'secondary'}>{periodo.evidencia.estado}</Badge></TableCell>
                                                            <TableCell>{periodo.evidencia.usuario.name}</TableCell>
                                                            <TableCell>{formatDate(periodo.evidencia.created_at)}</TableCell>
                                                            <TableCell>
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <Link href={route('entregas.show', periodo.evidencia.id)}>
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                    {!periodo.planeacion && !periodo.evidencia && (
                                                        <TableRow>
                                                            <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                                                                {periodo.puede_crear_planeacion ? 
                                                                    'Período activo - Puede crear planeación' : 
                                                                    'No hay entregas para este período'
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 