import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

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
        title: 'Crear',
        href: '#',
    }
];

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
}

export default function ElementosCreate({ producto }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        progreso: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/productos/${producto.id}/elementos`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Elemento" />
            
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
                            <h1 className="text-2xl font-bold">Crear Nuevo Elemento</h1>
                            <p className="text-muted-foreground">Producto: {producto.titulo}</p>
                        </div>
                    </div>
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

                    {/* Formulario */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Elemento</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre del Elemento</Label>
                                    <Input
                                        id="nombre"
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        placeholder="Ingrese el nombre del elemento"
                                        className={errors.nombre ? 'border-red-500' : ''}
                                    />
                                    {errors.nombre && (
                                        <p className="text-sm text-red-500">{errors.nombre}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="progreso">Progreso Inicial</Label>
                                    <Input
                                        id="progreso"
                                        type="number"
                                        value="0"
                                        disabled
                                        className="bg-gray-100"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        El progreso se actualizará automáticamente cuando se registren entregas de evidencia.
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Link href={`/productos/${producto.id}/elementos`}>
                                        <Button type="button" variant="outline">
                                            Cancelar
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Guardando...' : 'Guardar Elemento'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 