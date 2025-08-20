import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import axios from 'axios';

interface Proyecto {
    id: number;
    titulo: string;
}

interface ActividadInvestigacion {
    id: number;
    nombre: string;
}

interface TipoProducto {
    id: number;
    nombre: string;
}

interface SubTipoProducto {
    id: number;
    nombre: string;
}

interface CreateProps {
    proyectos: Proyecto[];
    actividadesInvestigacion: ActividadInvestigacion[];
}

export default function Create({ proyectos, actividadesInvestigacion }: CreateProps) {
    const { data, setData, post, errors, processing, reset } = useForm({
        titulo: '',
        descripcion: '',
        proyecto_investigativo_id: '',
        actividad_investigacion_id: '',
        tipo_producto_id: '',
        sub_tipo_producto_id: '',
    });

    const [tiposProducto, setTiposProducto] = useState<TipoProducto[]>([]);
    const [subTiposProducto, setSubTiposProducto] = useState<SubTipoProducto[]>([]);
    const [loadingTipos, setLoadingTipos] = useState(false);
    const [loadingSubTipos, setLoadingSubTipos] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Productos',
            href: route('productos.index'),
        },
        {
            title: 'Crear Producto',
            href: '#',
        }
    ];

    const proyectoOptions = proyectos.map(proyecto => ({
        value: proyecto.id,
        label: proyecto.titulo
    }));

    const actividadOptions = actividadesInvestigacion.map(actividad => ({
        value: actividad.id,
        label: actividad.nombre
    }));

    const tipoOptions = tiposProducto.map(tipo => ({
        value: tipo.id,
        label: tipo.nombre
    }));

    const subTipoOptions = subTiposProducto.map(subTipo => ({
        value: subTipo.id,
        label: subTipo.nombre
    }));

    // Función para cargar tipos de producto cuando se selecciona una actividad
    const cargarTiposProducto = async (actividadId: string) => {
        if (!actividadId) {
            setTiposProducto([]);
            setSubTiposProducto([]);
            setData('tipo_producto_id', '');
            setData('sub_tipo_producto_id', '');
            return;
        }

        setLoadingTipos(true);
        try {
            const response = await axios.get(route('productos.tipos-por-actividad'), {
                params: { actividad_investigacion_id: actividadId }
            });
            setTiposProducto(response.data);
            setSubTiposProducto([]);
            setData('tipo_producto_id', '');
            setData('sub_tipo_producto_id', '');
        } catch (error) {
            console.error('Error al cargar tipos de producto:', error);
        } finally {
            setLoadingTipos(false);
        }
    };

    // Función para cargar subtipos de producto cuando se selecciona un tipo
    const cargarSubTiposProducto = async (tipoId: string) => {
        if (!tipoId) {
            setSubTiposProducto([]);
            setData('sub_tipo_producto_id', '');
            return;
        }

        setLoadingSubTipos(true);
        try {
            const response = await axios.get(route('productos.subtipos-por-tipo'), {
                params: { tipo_producto_id: tipoId }
            });
            setSubTiposProducto(response.data);
            setData('sub_tipo_producto_id', '');
        } catch (error) {
            console.error('Error al cargar subtipos de producto:', error);
        } finally {
            setLoadingSubTipos(false);
        }
    };

    // Efecto para cargar tipos cuando cambia la actividad
    useEffect(() => {
        if (data.actividad_investigacion_id) {
            cargarTiposProducto(data.actividad_investigacion_id);
        }
    }, [data.actividad_investigacion_id]);

    // Efecto para cargar subtipos cuando cambia el tipo
    useEffect(() => {
        if (data.tipo_producto_id) {
            cargarSubTiposProducto(data.tipo_producto_id);
        }
    }, [data.tipo_producto_id]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('productos.store'), {
            onSuccess: () => reset()
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Producto Investigativo" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Crear Producto Investigativo
                            </CardTitle>
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
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="titulo">Título</Label>
                                    <Input
                                        id='titulo'
                                        className="mt-1"
                                        value={data.titulo}
                                        onChange={(e) => setData('titulo', e.target.value)}
                                        name='titulo'
                                        placeholder="Ingrese el título del producto"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="descripcion">Descripción</Label>
                                    <Textarea
                                        id='descripcion'
                                        className="mt-1"
                                        value={data.descripcion}
                                        onChange={(e) => setData('descripcion', e.target.value)}
                                        name='descripcion'
                                        placeholder="Ingrese la descripción del producto"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="proyecto_investigativo_id">Proyecto</Label>
                                    <SearchSelect
                                        options={proyectoOptions}
                                        value={data.proyecto_investigativo_id}
                                        onValueChange={(value) => setData('proyecto_investigativo_id', String(value))}
                                        placeholder="Seleccionar proyecto..."
                                        name="proyecto_investigativo_id"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="actividad_investigacion_id">Actividad de Investigación</Label>
                                    <SearchSelect
                                        options={actividadOptions}
                                        value={data.actividad_investigacion_id}
                                        onValueChange={(value) => setData('actividad_investigacion_id', String(value))}
                                        placeholder="Seleccionar actividad de investigación..."
                                        name="actividad_investigacion_id"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="tipo_producto_id">Tipo de Producto</Label>
                                    <SearchSelect
                                        options={tipoOptions}
                                        value={data.tipo_producto_id}
                                        onValueChange={(value) => setData('tipo_producto_id', String(value))}
                                        placeholder={loadingTipos ? "Cargando tipos..." : "Seleccionar tipo de producto..."}
                                        name="tipo_producto_id"
                                        disabled={loadingTipos || !data.actividad_investigacion_id}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sub_tipo_producto_id">Subtipo de Producto</Label>
                                    <SearchSelect
                                        options={subTipoOptions}
                                        value={data.sub_tipo_producto_id}
                                        onValueChange={(value) => setData('sub_tipo_producto_id', String(value))}
                                        placeholder={loadingSubTipos ? "Cargando subtipos..." : "Seleccionar subtipo de producto..."}
                                        name="sub_tipo_producto_id"
                                        disabled={loadingSubTipos || !data.tipo_producto_id}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Link href={route('productos.index')}>
                                <Button type='button' variant="outline" className='mr-3'>
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type='submit' disabled={processing} className='bg-primary hover:bg-primary/90'>
                                Crear Producto
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 