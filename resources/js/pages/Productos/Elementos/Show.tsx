import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    },
    {
        title: 'Elementos',
        href: '#',
    },
    {
        title: 'Detalles',
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
    elemento: Elemento;
}

export default function ElementosShow({ producto, elemento }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalles del Elemento" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={`/productos/${producto.id}/elementos`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Detalles del Elemento</h1>
                            <p className="text-muted-foreground">Producto: {producto.titulo}</p>
                        </div>
                    </div>
                    <Link href={`/productos/${producto.id}/elementos/${elemento.id}/edit`}>
                        <Button>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
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

                    {/* Detalles del Elemento */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Elemento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                    <p className="text-lg font-semibold">{elemento.nombre}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Progreso</p>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                                                    style={{ width: `${elemento.progreso}%` }}
                                                />
                                            </div>
                                            <Badge variant="secondary" className="min-w-[60px] text-center">
                                                {elemento.progreso}%
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {elemento.progreso === 0 && 'No iniciado'}
                                            {elemento.progreso > 0 && elemento.progreso < 25 && 'En progreso inicial'}
                                            {elemento.progreso >= 25 && elemento.progreso < 50 && 'En progreso'}
                                            {elemento.progreso >= 50 && elemento.progreso < 75 && 'Avanzado'}
                                            {elemento.progreso >= 75 && elemento.progreso < 100 && 'Casi completado'}
                                            {elemento.progreso === 100 && 'Completado'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Fecha de Creación</p>
                                        <p className="text-sm">{new Date(elemento.created_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
                                        <p className="text-sm">{new Date(elemento.updated_at).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 