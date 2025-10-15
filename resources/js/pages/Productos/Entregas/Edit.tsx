import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert, Plus, Minus, ArrowLeft, FileText, Save } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    },
    {
        title: 'Editar Entrega',
        href: '/entregas/edit',
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
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
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
    periodo: Periodo;
    producto_investigativo: ProductoInvestigativo;
}

interface EntregasEditProps {
    entrega: Entrega;
}

export default function EntregasEdit({ entrega }: EntregasEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        planeacion: entrega.planeacion,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        put(route('entregas.update', entrega.id), {
            onSuccess: () => {
                // No resetear el formulario en edición
            }
        });
    };

    const addPlaneacionItem = () => {
        setData('planeacion', [...data.planeacion, { nombre: '', porcentaje: 0 }]);
    };

    const removePlaneacionItem = (index: number) => {
        if (data.planeacion.length > 1) {
            const newPlaneacion = data.planeacion.filter((_, i) => i !== index);
            setData('planeacion', newPlaneacion);
        }
    };

    const updatePlaneacionItem = (index: number, field: 'nombre' | 'porcentaje', value: string | number) => {
        const newPlaneacion = [...data.planeacion];
        newPlaneacion[index] = { ...newPlaneacion[index], [field]: value };
        setData('planeacion', newPlaneacion);
    };

    // const formatDate = (dateString: string) => {
    //     return new Date(dateString).toLocaleDateString('es-ES', {
    //         year: 'numeric',
    //         month: 'long',
    //         day: 'numeric'
    //     });
    // };

    const getTipoLabel = (tipo: string) => {
        return tipo === 'planeacion' ? 'Planeación' : 'Evidencia';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Entrega" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-4/5'>
                    <Card className=''>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className='text-2xl flex items-center gap-2'>
                                    <FileText className="h-6 w-6" />
                                    Editar Entrega
                                </CardTitle>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('productos.show', entrega.producto_investigativo.id)}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Volver al Producto
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(errors).length > 0 && 
                                <Alert variant='destructive' className='mb-3 w-full'>
                                    <CircleAlert />
                                    <AlertTitle>Por favor corrige los siguientes errores:</AlertTitle>
                                    <AlertDescription>
                                        <ul className='list-disc pl-5'>
                                            {Object.values(errors).map((error, index) => (
                                                <li key={index} className='text-red-500 text-sm'>{error}</li>
                                            ))}
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            }

                            {/* Información de la entrega */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Información de la Entrega</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Tipo:</span>
                                            <div className="mt-1">
                                                <Badge variant={entrega.tipo === 'planeacion' ? 'default' : 'secondary'}>
                                                    {getTipoLabel(entrega.tipo)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Período:</span>
                                            <p className="font-medium">{entrega.periodo.nombre}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(entrega.periodo.fecha_inicio).toLocaleDateString()} - {new Date(entrega.periodo.fecha_fin).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Producto:</span>
                                            <p className="font-medium">{entrega.producto_investigativo.titulo}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <div className="space-y-6">
                                <Separator />

                                {/* Planeación */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="text-base font-medium">
                                            {entrega.tipo === 'planeacion' ? 'Elementos de Planificación' : 'Elementos de Avance'} *
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addPlaneacionItem}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar Elemento
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {data.planeacion.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <Label htmlFor={`nombre-${index}`}>
                                                        {entrega.tipo === 'planeacion' ? 'Actividad/Elemento' : 'Avance/Elemento'}
                                                    </Label>
                                                    <Input
                                                        id={`nombre-${index}`}
                                                        type="text"
                                                        value={item.nombre}
                                                        onChange={(e) => updatePlaneacionItem(index, 'nombre', e.target.value)}
                                                        placeholder={entrega.tipo === 'planeacion' ? 'Descripción de la actividad' : 'Descripción del avance'}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <Label htmlFor={`porcentaje-${index}`}>
                                                        {entrega.tipo === 'planeacion' ? 'Porcentaje Esperado' : 'Porcentaje Completado'}
                                                    </Label>
                                                    <Input
                                                        id={`porcentaje-${index}`}
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={item.porcentaje}
                                                        onChange={(e) => updatePlaneacionItem(index, 'porcentaje', parseInt(e.target.value) || 0)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                {data.planeacion.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removePlaneacionItem(index)}
                                                        className="mt-6"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type='button' variant="destructive" className='mr-3'>
                                <Link href={route('productos.show', entrega.producto_investigativo.id)}>Cancelar</Link>
                            </Button>
                            <Button type='submit' disabled={processing} className='bg-primary hover:bg-primary/90'>
                                {processing ? 'Guardando...' : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 