import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, FileText, Users, ArrowLeft, Plus, Eye, Trash2 } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CircleAlert } from 'lucide-react';

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
    role: string;
}

interface Entrega {
    id: number;
    tipo: 'planeacion' | 'evidencia';
    planeacion: Array<{
        nombre: string;
        porcentaje: number;
    }>;
    created_at: string;
    periodo: {
        id: number;
        nombre: string;
        fecha_limite_planeacion: string;
        fecha_limite_evidencias: string;
    };
    usuario: {
        id: number;
        name: string;
    };
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
}

interface ProductosShowProps {
    producto: ProductoInvestigativo;
    entregas: Entrega[];
}

export default function ProductosShow({ producto, entregas }: ProductosShowProps) {
    const { errors, flash } = usePage().props as any;
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'Líder de Grupo':
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
                    {/* Primera fila: Información del producto y participantes */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Información del producto */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Información del Producto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">{producto.titulo}</h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Badge variant="secondary">
                                                {producto.sub_tipo_producto.nombre}
                                            </Badge>
                                        </div>
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

                                    <Separator />

                                    {/* Proyecto asociado */}
                                    <div>
                                        <h4 className="font-medium mb-2">Proyecto Asociado</h4>
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <h5 className="font-medium">{producto.proyecto.titulo}</h5>
                                                <p className="text-sm text-gray-500">Eje Temático: {producto.proyecto.eje_tematico}</p>
                                            </div>
                                            <Badge variant={producto.proyecto.estado === 'En Formulación' ? 'outline' : 'default'}>
                                                {producto.proyecto.estado}
                                            </Badge>
                                        </div>
                                    </div>


                                </CardContent>
                            </Card>
                        </div>

                        {/* Panel lateral - Participantes */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Participantes ({producto.usuarios.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="md:h-[400px]">
                                        <div className="space-y-3 pr-4">
                                            {producto.usuarios.map((usuario) => (
                                                <div key={usuario.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{usuario.name}</p>
                                                        <p className="text-sm text-gray-500">{usuario.email}</p>
                                                    </div>
                                                    <Badge variant={getRoleBadgeVariant(usuario.role)}>
                                                        {usuario.role}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Segunda fila: Entregas ocupando todo el ancho */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Entregas ({entregas?.length || 0})
                                </CardTitle>
                                {/* Botones de acción para entregas */}
                                <div className="flex gap-2">
                                    {/* Lógica para mostrar el botón de planeación o evidencia */}
                                    {(() => {
                                        const tienePlaneacion = entregas.some(e => e.tipo === 'planeacion');
                                        const tieneEvidencia = entregas.some(e => e.tipo === 'evidencia');
                                        if (!tienePlaneacion) {
                                            return (
                                                <Button asChild size="sm" variant="default">
                                                    <Link href={route('entregas.planeacion.create', producto.id)}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Registrar Planeación
                                                    </Link>
                                                </Button>
                                            );
                                        } else if (tienePlaneacion && !tieneEvidencia) {
                                            return (
                                                <Button asChild size="sm" variant="secondary">
                                                    <Link href={route('entregas.evidencia.create', producto.id)}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Registrar Evidencia
                                                    </Link>
                                                </Button>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Agrupar entregas por periodo usando Accordion */}
                            {(() => {
                                // Agrupar entregas por periodo
                                const entregasPorPeriodo = entregas.reduce((acc, entrega) => {
                                    const periodoId = entrega.periodo.id;
                                    if (!acc[periodoId]) {
                                        acc[periodoId] = {
                                            periodo: entrega.periodo,
                                            entregas: [],
                                        };
                                    }
                                    acc[periodoId].entregas.push(entrega);
                                    return acc;
                                }, {} as Record<string, { periodo: Entrega['periodo']; entregas: Entrega[] }>);
                                const periodos = Object.values(entregasPorPeriodo);
                                if (periodos.length === 0) {
                                    // Mantener la lógica de botones vacíos
                                    const tienePlaneacion = entregas.some(e => e.tipo === 'planeacion');
                                    const tieneEvidencia = entregas.some(e => e.tipo === 'evidencia');
                                    return (
                                        <div className="text-center py-8">
                                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 mb-4">No hay entregas registradas para este producto</p>
                                            {(() => {
                                                if (!tienePlaneacion) {
                                                    return (
                                                        <Button asChild>
                                                            <Link href={route('entregas.planeacion.create', producto.id)}>
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Registrar Planeación
                                                            </Link>
                                                        </Button>
                                                    );
                                                } else if (tienePlaneacion && !tieneEvidencia) {
                                                    return (
                                                        <Button asChild variant="secondary">
                                                            <Link href={route('entregas.evidencia.create', producto.id)}>
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Registrar Evidencia
                                                            </Link>
                                                        </Button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    );
                                }
                                return (
                                    <Accordion type="multiple" className="w-full">
                                        {periodos.map(({ periodo, entregas }) => (
                                            <AccordionItem key={periodo.id} value={String(periodo.id)} className="bg-gray-100 rounded-lg p-3">
                                                <AccordionTrigger>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium">{periodo.nombre}</span> 
                                                        <span className="font-medium text-gray-500">Planeación hasta: {formatDate(periodo.fecha_limite_planeacion)} | Evidencias hasta: {formatDate(periodo.fecha_limite_evidencias)}</span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    {entregas.length > 0 ? (
                                                        <>
                                                            <Alert className="mb-4">
                                                                <AlertTriangle className="h-4 w-4" />
                                                                <AlertTitle>Importante</AlertTitle>
                                                                <AlertDescription>
                                                                    Una vez enviada, la entrega no puede ser modificada. Revisa cuidadosamente toda la información antes de enviar.
                                                                </AlertDescription>
                                                            </Alert>
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Tipo</TableHead>
                                                                        <TableHead>Entregado por</TableHead>
                                                                        <TableHead>Fecha</TableHead>
                                                                        <TableHead>Acciones</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {entregas.map((entrega) => (
                                                                        <TableRow key={entrega.id}>
                                                                            <TableCell>
                                                                                <Badge variant={entrega.tipo === 'planeacion' ? 'default' : 'secondary'}>
                                                                                    {entrega.tipo === 'planeacion' ? 'Planeación' : 'Evidencia'}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell>{entrega.usuario.name}</TableCell>
                                                                            <TableCell>{formatDate(entrega.created_at)}</TableCell>
                                                                            <TableCell>
                                                                                <div className="flex items-center gap-2">
                                                                                    <Button variant="outline" size="sm" asChild>
                                                                                        <Link href={route('entregas.show', entrega.id)}>
                                                                                            <Eye className="h-4 w-4" />
                                                                                        </Link>
                                                                                    </Button>
                                                                                </div>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </>
                                                    ) : (
                                                        <div className="text-center py-4 text-gray-500">No hay entregas para este período</div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 