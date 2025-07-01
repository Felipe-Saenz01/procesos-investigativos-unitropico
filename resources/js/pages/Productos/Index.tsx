import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, Edit, Trash, Plus, FileText } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    }
];

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
}

interface ProyectoInvestigativo {
    id: number;
    titulo: string;
    estado: string;
}

interface ProductoInvestigativo {
    id: number;
    titulo: string;
    resumen: string;
    created_at: string;
    updated_at: string;
    sub_tipo_producto: SubTipoProducto;
    proyecto: ProyectoInvestigativo;
    usuarios: Usuario[];
}

interface ProductosIndexProps {
    productos: ProductoInvestigativo[];
}

export default function ProductosIndex({ productos }: ProductosIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos Investigativos" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <div className='w-full'>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-6 w-6" />
                                    Productos Investigativos
                                </CardTitle>
                                <Button asChild>
                                    <Link href={route('productos.create')}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Crear Producto
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {productos.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Título</TableHead>
                                            <TableHead>Tipo de Producto</TableHead>
                                            <TableHead>Proyecto</TableHead>
                                            <TableHead>Usuarios</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productos.map((producto) => (
                                            <TableRow key={producto.id}>
                                                <TableCell className="font-medium">
                                                    {producto.titulo}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        {producto.sub_tipo_producto.nombre}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{producto.proyecto.titulo}</p>
                                                        <Badge variant="outline" className="text-xs">
                                                            {producto.proyecto.estado}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {producto.usuarios.slice(0, 2).map((usuario) => (
                                                            <Badge key={usuario.id} variant="outline" className="text-xs">
                                                                {usuario.name}
                                                            </Badge>
                                                        ))}
                                                        {producto.usuarios.length > 2 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{producto.usuarios.length - 2} más
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={route('productos.show', producto.id)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={route('productos.edit', producto.id)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="sm" disabled>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-4">No hay productos investigativos registrados</p>
                                    <Button asChild>
                                        <Link href={route('productos.create')}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Crear Primer Producto
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 