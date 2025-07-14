import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Minus, Plus } from 'lucide-react';
import { FormEvent } from 'react';
import { CircleAlert, AlertTriangle } from 'lucide-react';
import { SearchSelect } from '@/components/form-search-select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    },
    {
        title: 'Entregas',
        href: '#',
    },
    {
        title: 'Planeación',
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
    fecha_limite_planeacion: string;
    fecha_limite_evidencia: string;
}

interface Elemento {
    id: number;
    nombre: string;
    progreso: number;
}

interface Entrega {
    id: number;
    tipo: 'planeacion' | 'evidencia';
    created_at: string;
    periodo: Periodo;
}

interface Producto {
    id: number;
    titulo: string;
    proyecto: Proyecto;
    sub_tipo_producto: SubTipoProducto;
}

interface PlaneacionCreateProps {
    producto: Producto;
    periodos: Periodo[];
    elementos: Elemento[];
    entregasExistentes: Entrega[];
}

export default function PlaneacionCreate({ producto, periodos, elementos, entregasExistentes }: PlaneacionCreateProps) {
    // Si ya existe una entrega de planeación, no permitir acceso
    const planeacionExistente = entregasExistentes.find(e => e.tipo === 'planeacion');
    const { data, setData, post, processing, errors, reset } = useForm({
        periodo_id: '',
        planeacion: [{ elemento_id: '', porcentaje: 0 }],
        progreso_planeacion: 0,
        horas_planeacion: 1,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('entregas.planeacion.store', producto.id), {
            onSuccess: () => {
                reset();
            }
        });
    };

    const addPlaneacionItem = () => {
        setData('planeacion', [...data.planeacion, { elemento_id: '', porcentaje: 0 }]);
    };

    const removePlaneacionItem = (index: number) => {
        if (data.planeacion.length > 1) {
            const newPlaneacion = data.planeacion.filter((_, i) => i !== index);
            setData('planeacion', newPlaneacion);
        }
    };

    const updatePlaneacionItem = (index: number, field: 'elemento_id' | 'porcentaje', value: string | number) => {
        const newPlaneacion = [...data.planeacion];
        newPlaneacion[index] = { ...newPlaneacion[index], [field]: value };
        setData('planeacion', newPlaneacion);
    };

    // Convertir periodos a opciones para SearchSelect
    const periodoOptions = periodos.map(periodo => ({
        label: `${periodo.nombre} (${new Date(periodo.fecha_limite_planeacion).toLocaleDateString()} - ${new Date(periodo.fecha_limite_evidencia).toLocaleDateString()})`,
        value: periodo.id.toString()
    }));

    // Convertir elementos a opciones para SearchSelect
    const elementoOptions = elementos.map(elemento => ({
        label: `${elemento.nombre} (${elemento.progreso}% progreso)`,
        value: elemento.id.toString()
    }));

    // Función para obtener opciones de elementos filtradas por índice
    const getElementoOptionsForIndex = (currentIndex: number) => {
        const elementosSeleccionados = data.planeacion
            .map((item, index) => ({ elemento_id: item.elemento_id, index }))
            .filter(item => item.elemento_id && item.index !== currentIndex)
            .map(item => item.elemento_id);

        return elementoOptions.filter(option => 
            !elementosSeleccionados.includes(option.value)
        );
    };

    if (planeacionExistente) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Entrega de Planeación" />
                <div className="flex flex-col items-center justify-center h-full p-8">
                    <Alert variant="destructive">
                        <CircleAlert />
                        <AlertTitle>Ya existe una entrega de planeación para este producto.</AlertTitle>
                        <AlertDescription>
                            No puedes crear múltiples entregas de planeación para el mismo producto.
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
            <Head title="Entrega de Planeación" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-4/5'>
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className='text-2xl flex items-center gap-2'>
                                    <FileText className="h-6 w-6" />
                                    Entrega de Planeación
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
                                    <Label htmlFor="periodo">Período Académico *</Label>
                                    <SearchSelect
                                        options={periodoOptions}
                                        value={data.periodo_id}
                                        onValueChange={(value) => setData('periodo_id', String(value))}
                                        placeholder="Seleccionar período..."
                                        className="mt-1"
                                    />
                                    {data.periodo_id && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Horas disponibles: {periodos.find(p => p.id.toString() === data.periodo_id)?.horas_disponibles || 0}
                                        </p>
                                    )}
                                </div>

                                <Separator />

                                {/* Progreso y Horas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="progreso_planeacion">Progreso de Planeación (%) *</Label>
                                        <Input
                                            id="progreso_planeacion"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={data.progreso_planeacion}
                                            onChange={(e) => setData('progreso_planeacion', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            className="mt-1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Porcentaje de avance esperado en la planeación
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="horas_planeacion">
                                            Horas de Planeación * 
                                            {data.periodo_id && (
                                                <span className="text-blue-600 font-normal">
                                                    (Disponibles: {periodos.find(p => p.id.toString() === data.periodo_id)?.horas_disponibles || 0})
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            id="horas_planeacion"
                                            type="number"
                                            min="1"
                                            max={data.periodo_id ? periodos.find(p => p.id.toString() === data.periodo_id)?.horas_disponibles || 1 : undefined}
                                            value={data.horas_planeacion}
                                            onChange={(e) => setData('horas_planeacion', parseInt(e.target.value) || 1)}
                                            placeholder="1"
                                            className="mt-1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Horas a invertir en la planeación
                                            {data.periodo_id && (
                                                <span className="block text-blue-600">
                                                    Horas disponibles: {periodos.find(p => p.id.toString() === data.periodo_id)?.horas_disponibles || 0}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="text-base font-medium">
                                            Elementos de Planificación *
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
                                                    <Label htmlFor={`elemento-${index}`}>Elemento del Producto</Label>
                                                    <SearchSelect
                                                        options={getElementoOptionsForIndex(index)}
                                                        value={item.elemento_id}
                                                        onValueChange={(value) => updatePlaneacionItem(index, 'elemento_id', String(value))}
                                                        placeholder="Seleccionar elemento..."
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="">
                                                    <Label htmlFor={`porcentaje-${index}`}>Porcentaje Esperado</Label>
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
                                <Link href={route('productos.show', producto.id)}>Cancelar</Link>
                            </Button>
                            <Button type='submit' disabled={processing} className='bg-primary hover:bg-primary/90'>
                                {processing ? 'Creando...' : 'Crear Planeación'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 