import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert, Plus, Minus, ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos Investigativos',
        href: '/productos',
    },
    {
        title: 'Crear Entrega',
        href: '/productos/entregas/create',
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
}

interface Producto {
    id: number;
    titulo: string;
    proyecto: Proyecto;
    sub_tipo_producto: SubTipoProducto;
}

interface EntregasCreateProps {
    producto: Producto;
    periodos: Periodo[];
    entregasExistentes: Entrega[];
}

export default function EntregasCreate({ producto, periodos, entregasExistentes }: EntregasCreateProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        tipo: 'planeacion' as 'planeacion' | 'evidencia',
        periodo_id: '',
        planeacion: [{ nombre: '', porcentaje: 0 }],
        progreso_planeacion: 0,
        progreso_evidencia: 0,
        horas_planeacion: 1,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        post(route('entregas.store', producto.id), {
            onSuccess: () => {
                reset();
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

    // Convertir periodos a opciones para SearchSelect
    const periodoOptions = periodos.map(periodo => ({
        label: `${periodo.nombre} (${new Date(periodo.fecha_inicio).toLocaleDateString()} - ${new Date(periodo.fecha_fin).toLocaleDateString()})`,
        value: periodo.id.toString()
    }));

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Entrega" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-4/5'>
                    <Card className=''>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className='text-2xl flex items-center gap-2'>
                                    <FileText className="h-6 w-6" />
                                    Crear Nueva Entrega
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

                            {/* Información del producto */}
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

                            {/* Entregas existentes */}
                            {entregasExistentes.length > 0 && (
                                <Card className="mb-6">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Entregas Existentes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {entregasExistentes.map((entrega) => (
                                                <div key={entrega.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={entrega.tipo === 'planeacion' ? 'default' : 'secondary'}>
                                                                {entrega.tipo === 'planeacion' ? 'Planeación' : 'Evidencia'}
                                                            </Badge>
                                                            <span className="font-medium">{entrega.periodo.nombre}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(entrega.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            
                            <div className="space-y-6">
                                {/* Tipo de entrega */}
                                <div>
                                    <Label className="text-base font-medium">Tipo de Entrega *</Label>
                                    <RadioGroup
                                        value={data.tipo}
                                        onValueChange={(value) => setData('tipo', value as 'planeacion' | 'evidencia')}
                                        className="mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="planeacion" id="planeacion" />
                                            <Label htmlFor="planeacion">Planeación</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="evidencia" id="evidencia" />
                                            <Label htmlFor="evidencia">Evidencia</Label>
                                        </div>
                                    </RadioGroup>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {data.tipo === 'planeacion' 
                                            ? 'Planificación de las actividades y porcentajes esperados'
                                            : 'Evidencia del avance realizado según la planificación'
                                        }
                                    </p>
                                </div>

                                {/* Período */}
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
                                        <Label htmlFor="horas_planeacion">Horas de Planeación *</Label>
                                        <Input
                                            id="horas_planeacion"
                                            type="number"
                                            min="1"
                                            value={data.horas_planeacion}
                                            onChange={(e) => setData('horas_planeacion', parseInt(e.target.value) || 1)}
                                            placeholder="1"
                                            className="mt-1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">
                                            Horas a invertir en la planeación
                                        </p>
                                    </div>
                                </div>

                                {data.tipo === 'evidencia' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="progreso_evidencia">Progreso de Evidencia (%)</Label>
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
                                        <div>
                                            <Label htmlFor="horas_evidencia">Horas de Evidencia</Label>
                                            <Input
                                                id="horas_evidencia"
                                                type="number"
                                                min="0"
                                                value={data.horas_evidencia}
                                                onChange={(e) => setData('horas_evidencia', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className="mt-1"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Horas invertidas en la evidencia
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                {/* Planeación */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Label className="text-base font-medium">
                                            {data.tipo === 'planeacion' ? 'Elementos de Planificación' : 'Elementos de Avance'} *
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
                                                <div className="flex-1 ">
                                                    <Label htmlFor={`nombre-${index}`}>
                                                        {data.tipo === 'planeacion' ? 'Actividad/Elemento' : 'Avance/Elemento'}
                                                    </Label>
                                                    <Input
                                                        id={`nombre-${index}`}
                                                        type="text"
                                                        value={item.nombre}
                                                        onChange={(e) => updatePlaneacionItem(index, 'nombre', e.target.value)}
                                                        placeholder={data.tipo === 'planeacion' ? 'Descripción de la actividad' : 'Descripción del avance'}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div className="">
                                                    <Label htmlFor={`porcentaje-${index}`}>
                                                        {data.tipo === 'planeacion' ? 'Porcentaje Esperado' : 'Porcentaje Completado'}
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
                                <Link href={route('productos.show', producto.id)}>Cancelar</Link>
                            </Button>
                            <Button type='submit' disabled={processing} className='bg-primary hover:bg-primary/90'>
                                {processing ? 'Creando...' : 'Crear Entrega'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 