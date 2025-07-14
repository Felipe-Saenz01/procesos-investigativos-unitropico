import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    },
    {
        title: 'Elementos',
        href: '#',
    }
];

interface Elemento {
    id: number;
    nombre: string;
    progreso: number;
    created_at: string;
    updated_at: string;
}

interface Producto {
    id: number;
    titulo: string;
    resumen: string;
    proyecto: {
        id: number;
        titulo: string;
    };
    sub_tipo_producto: {
        id: number;
        nombre: string;
    };
}

interface Props {
    producto: Producto;
    elementos: Elemento[];
}

export default function ElementosIndex({ producto, elementos }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Elementos del Producto" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={`/productos/${producto.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Elementos del Producto</h1>
                            <p className="text-muted-foreground">{producto.titulo}</p>
                        </div>
                    </div>
                    <Link href={`/productos/${producto.id}/elementos/create`}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Elemento
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6">
                    {/* Información del Producto */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Producto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Título</p>
                                    <p className="text-sm">{producto.titulo}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Proyecto</p>
                                    <p className="text-sm">{producto.proyecto.titulo}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Tipo de Producto</p>
                                    <p className="text-sm">{producto.sub_tipo_producto.nombre}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Resumen</p>
                                    <p className="text-sm">{producto.resumen}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla de Elementos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Elementos del Producto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {elementos.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No hay elementos registrados para este producto.</p>
                                    <Link href={`/productos/${producto.id}/elementos/create`}>
                                        <Button className="mt-4">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Crear Primer Elemento
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Progreso</TableHead>
                                            <TableHead>Fecha Creación</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {elementos.map((elemento) => (
                                            <TableRow key={elemento.id}>
                                                <TableCell className="font-medium">
                                                    {elemento.nombre}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="bg-blue-600 h-2 rounded-full" 
                                                                style={{ width: `${elemento.progreso}%` }}
                                                            />
                                                        </div>
                                                        <Badge variant="secondary">
                                                            {elemento.progreso}%
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(elemento.created_at).toLocaleDateString('es-ES')}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Link href={`/productos/${producto.id}/elementos/${elemento.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/productos/${producto.id}/elementos/${elemento.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link 
                                                            href={`/productos/${producto.id}/elementos/${elemento.id}`}
                                                            method="delete"
                                                            as="button"
                                                            preserveScroll
                                                            onBefore={() => confirm('¿Estás seguro de que quieres eliminar este elemento?')}
                                                        >
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 