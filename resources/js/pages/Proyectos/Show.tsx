import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, Edit, Calendar, Users, FileText, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Proyectos Investigativos',
        href: '/proyectos',
    },
    {
        title: 'Detalles del Proyecto',
        href: '/proyectos/show',
    }
];

interface Actividad {
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
}

interface SubTipoProducto {
    id: number;
    nombre: string;
    descripcion: string;
}

interface ProductoInvestigativo {
    id: number;
    titulo: string;
    resumen: string;
    sub_tipo_producto: SubTipoProducto;
    created_at: string;
}

interface GrupoInvestigacion {
    id: number;
    nombre: string;
    email: string;
}

interface Usuario {
    id: number;
    name: string;
    email: string;
}

interface ProyectoInvestigativo {
    id: number;
    titulo: string;
    eje_tematico: string;
    resumen_ejecutivo: string;
    planteamiento_problema: string;
    antecedentes: string;
    justificacion: string;
    objetivos: string;
    metodologia: string;
    resultados: string;
    riesgos: string;
    bibliografia: string;
    actividades: Actividad[];
    estado: string;
    created_at: string;
    updated_at: string;
    usuario: Usuario;
    grupos: GrupoInvestigacion[];
    productos: ProductoInvestigativo[];
}

interface ProyectoShowProps {
    proyecto: ProyectoInvestigativo;
}

export default function ProyectoShow({ proyecto }: ProyectoShowProps) {
    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'Formulado':
                return 'bg-green-600 ';
            case 'En Formulación':
                return 'bg-orange-600 ';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Proyecto: ${proyecto.titulo}`} />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <div className='sm:w-4/5 w-full'>
                    {/* Header del proyecto */}
                    <Card className='mb-6'>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Eye className="h-6 w-6" />
                                    <div>
                                        <CardTitle className='text-2xl'>{proyecto.titulo}</CardTitle>
                                        <p className="text-gray-600 mt-1">Creado por {proyecto.usuario.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className={getEstadoColor(proyecto.estado)}>
                                        {proyecto.estado}
                                    </Badge>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={route('proyectos.edit', proyecto.id)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    <Tabs defaultValue="informacion" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="informacion">Información General</TabsTrigger>
                            <TabsTrigger value="productos">Productos Investigativos</TabsTrigger>
                            <TabsTrigger value="actividades">Actividades</TabsTrigger>
                        </TabsList>

                        {/* Información General */}
                        <TabsContent value="informacion" className="space-y-6 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Información básica */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Información Básica
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Eje Temático</label>
                                            <p className="mt-1">{proyecto.eje_tematico}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Estado </label>
                                            <Badge className={`mt-1 ${getEstadoColor(proyecto.estado)}`}>
                                                {proyecto.estado}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Grupos de Investigación */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Grupos de Investigación
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {proyecto.grupos.length > 0 ? (
                                            <div className="space-y-2">
                                                {proyecto.grupos.map((grupo) => (
                                                    <div key={grupo.id} className="p-3 border rounded-lg">
                                                        <p className="font-medium">{grupo.nombre}</p>
                                                        <p className="text-sm text-gray-600">{grupo.email}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">No hay grupos asociados</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detalles del proyecto */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detalles del Proyecto</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Resumen Ejecutivo</label>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                            {proyecto.resumen_ejecutivo}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Planteamiento del Problema</label>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                            {proyecto.planteamiento_problema}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Antecedentes</label>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                            {proyecto.antecedentes}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Justificación</label>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                            {proyecto.justificacion}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Objetivos</label>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                            {proyecto.objetivos}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Metodología</label>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                            {proyecto.metodologia}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Resultados Esperados</label>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                            {proyecto.resultados}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Riesgos</label>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                            {proyecto.riesgos}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Bibliografía</label>
                                        <p className="mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap">
                                            {proyecto.bibliografia}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Productos Investigativos */}
                        <TabsContent value="productos" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Productos Investigativos
                                        </CardTitle>
                                        {proyecto.estado === 'Formulado' && (
                                        <Button asChild>
                                            <Link href={route('productos.create')}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Crear Producto
                                            </Link>
                                        </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {proyecto.productos.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Título</TableHead>
                                                    <TableHead>Tipo de Producto</TableHead>
                                                    <TableHead>Resumen</TableHead>
                                                    <TableHead>Fecha de Creación</TableHead>
                                                    <TableHead>Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {proyecto.productos.map((producto) => (
                                                    <TableRow key={producto.id}>
                                                        <TableCell className="font-medium">
                                                            {producto.titulo}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">
                                                                {producto.sub_tipo_producto.nombre}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="max-w-xs">
                                                            <p className="truncate" title={producto.resumen}>
                                                                {producto.resumen}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(producto.created_at).toLocaleDateString('es-ES')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button asChild variant="outline" size="sm">
                                                                <Link href={route('productos.show', producto.id)}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="text-center py-8">
                                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 mb-4">No hay productos investigativos asociados a este proyecto</p>
                                            <Button asChild>
                                                <Link href={route('productos.create', { proyecto_id: proyecto.id })}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Crear Primer Producto
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Actividades */}
                        <TabsContent value="actividades" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Actividades del Proyecto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {proyecto.actividades && proyecto.actividades.length > 0 ? (
                                        <div className="space-y-3">
                                            {proyecto.actividades.map((actividad, index) => (
                                                <div key={index} className="p-4 border rounded-lg bg-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{actividad.nombre}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {actividad.fecha_inicio} - {actividad.fecha_fin}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">No hay actividades programadas para este proyecto</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
} 