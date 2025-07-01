import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, FileText, Users, ArrowLeft } from 'lucide-react';

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

interface ProductoInvestigativo {
    id: number;
    titulo: string;
    resumen: string;
    created_at: string;
    updated_at: string;
    proyecto: Proyecto;
    sub_tipo_producto: SubTipoProducto;
    usuarios: Usuario[];
}

interface ProductosShowProps {
    producto: ProductoInvestigativo;
}

export default function ProductosShow({ producto }: ProductosShowProps) {
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
                    <Button asChild>
                        <Link href={route('productos.edit', producto.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Detalles del producto */}
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

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-500">Creado:</span>
                                        <p className="flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(producto.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-500">Última actualización:</span>
                                        <p className="flex items-center gap-1 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(producto.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Proyecto asociado */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Proyecto Asociado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">{producto.proyecto.titulo}</h4>
                                        <p className="text-sm text-gray-500">Eje Temático: {producto.proyecto.eje_tematico}</p>
                                    </div>
                                    <Badge variant={producto.proyecto.estado === 'En Formulación' ? 'outline' : 'default'}>
                                        {producto.proyecto.estado}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panel lateral */}
                    <div className="space-y-6">
                        {/* Usuarios participantes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Participantes ({producto.usuarios.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 