import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert, ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { FormEvent, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    },
    {
        title: 'Entrega de Evidencia',
        href: '#',
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
    horas_disponibles: number;
}

interface Entrega {
    id: number;
    tipo: 'planeacion' | 'evidencia';
    created_at: string;
    periodo: Periodo;
    planeacion: { nombre: string; porcentaje: number }[];
}

interface Producto {
    id: number;
    titulo: string;
    proyecto: Proyecto;
    sub_tipo_producto: SubTipoProducto;
}

interface EvidenciaCreateProps {
    producto: Producto;
    periodo: Periodo;
    planeacion: { nombre: string; porcentaje: number }[];
    horasPlaneacion: number;
    progresoPlaneacion: number;
    entregasExistentes: Entrega[];
}

export default function EvidenciaCreate({ producto, periodo, planeacion, horasPlaneacion, progresoPlaneacion, entregasExistentes }: EvidenciaCreateProps) {
    // Solo permitir acceso si existe planeación
    const planeacionExistente = entregasExistentes.find(e => e.tipo === 'planeacion');
    const evidenciaExistente = entregasExistentes.find(e => e.tipo === 'evidencia');
    const { data, setData, post, processing, errors, reset } = useForm({
        porcentaje_completado: planeacion.map(() => 0),
        progreso_evidencia: 0,
        horas_evidencia: 0,
    });

    useEffect(() => {
        setData('porcentaje_completado', planeacion.map(() => 0));
    }, [planeacion]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('entregas.evidencia.store', producto.id), {
            onSuccess: () => {
                reset();
            }
        });
    };

    if (!planeacionExistente) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Entrega de Evidencia" />
                <div className="flex flex-col items-center justify-center h-full p-8">
                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertTitle>No existe planeación registrada para este producto.</AlertTitle>
                        <AlertDescription>
                            Debes registrar primero la planeación antes de poder entregar evidencia.
                        </AlertDescription>
                        <Button asChild className="mt-4">
                            <Link href={route('productos.show', producto.id)}>Volver al producto</Link>
                        </Button>
                    </Alert>
                </div>
            </AppLayout>
        );
    }
    if (evidenciaExistente) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Entrega de Evidencia" />
                <div className="flex flex-col items-center justify-center h-full p-8">
                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertTitle>Ya existe una entrega de evidencia para este producto.</AlertTitle>
                        <AlertDescription>
                            Solo puedes registrar una evidencia por período.
                        </AlertDescription>
                        <Button asChild className="mt-4">
                            <Link href={route('productos.show', producto.id)}>Volver al producto</Link>
                        </Button>
                    </Alert>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Entrega de Evidencia" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-4/5'>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className='text-2xl flex items-center gap-2'>
                                    <FileText className="h-6 w-6" />
                                    Entrega de Evidencia
                                </CardTitle>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('productos.show', producto.id)}>
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

                            {/* Alerta informativa */}
                            <Alert className='mb-3 w-full'>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Importante</AlertTitle>
                                <AlertDescription>
                                    Una vez enviada la entrega, no podrás modificarla. Revisa cuidadosamente toda la información antes de enviar.
                                </AlertDescription>
                            </Alert>
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Producto: {producto.titulo}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Proyecto:</span>
                                            <p className="font-medium">{producto.proyecto.titulo}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Tipo de Producto:</span>
                                            <p className="font-medium">{producto.sub_tipo_producto.nombre}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-base font-medium">Período Académico</Label>
                                    <Input value={periodo.nombre} disabled className="mt-1" />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Horas disponibles: {periodo.horas_disponibles || 0}
                                    </p>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="horas_planeacion">Horas de Planeación</Label>
                                        <Input
                                            id="horas_planeacion"
                                            type="number"
                                            value={horasPlaneacion}
                                            disabled
                                            className="mt-1 bg-gray-100"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Horas establecidas en la planeación
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="progreso_planeacion">Progreso de Planeación (%)</Label>
                                        <Input
                                            id="progreso_planeacion"
                                            type="number"
                                            value={progresoPlaneacion}
                                            disabled
                                            className="mt-1 bg-gray-100"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Porcentaje que se planeó originalmente
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="progreso_evidencia">Progreso de Evidencia (%) *</Label>
                                        <Input
                                            id="progreso_evidencia"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={data.progreso_evidencia}
                                            onChange={(e) => setData('progreso_evidencia', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            className="mt-1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Porcentaje de avance logrado en la evidencia
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <Label className="text-base font-medium">Elementos de Planeación y Avance *</Label>
                                    <div className="space-y-4 mt-4">
                                        {planeacion.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                                <div className="flex-1 ">
                                                    <Label>Actividad/Elemento</Label>
                                                    <Input
                                                        type="text"
                                                        value={item.nombre}
                                                        disabled
                                                        className="mt-1 bg-gray-100"
                                                    />
                                                </div>
                                                <div className="">
                                                    <Label>Porcentaje Planeado</Label>
                                                    <Input
                                                        type="number"
                                                        value={item.porcentaje}
                                                        disabled
                                                        className="mt-1 bg-gray-100"
                                                    />
                                                </div>
                                                <div className="">
                                                    <Label>Porcentaje Completado</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={data.porcentaje_completado[index]}
                                                        onChange={e => {
                                                            const nuevos = [...data.porcentaje_completado];
                                                            nuevos[index] = parseInt(e.target.value) || 0;
                                                            setData('porcentaje_completado', nuevos);
                                                        }}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type='button' variant="destructive" className='mr-3'>
                                <Link href={route('productos.show', producto.id)}>Cancelar</Link>
                            </Button>
                            <Button type='submit' disabled={processing} className='bg-primary hover:bg-primary/90'>
                                {processing ? 'Creando...' : 'Crear Evidencia'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 