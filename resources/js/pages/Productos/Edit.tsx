import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchSelect } from '@/components/form-search-select';
import { MultiSelect, type Option } from '@/components/ui/multiselect-combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { FormEvent, useState, useEffect, useCallback } from 'react';


interface Usuario {
    id: number;
    name: string;
    tipo: string;
}

interface Proyecto {
    id: number;
    titulo: string;
}

interface ActividadInvestigacion {
    id: number;
    nombre: string;
}

interface ActividadConTipos {
    id: number;
    nombre: string;
    tipos: { id: number; nombre: string; sub_tipos: { id: number; nombre: string }[] }[];
}

interface TipoProducto {
    id: number;
    nombre: string;
}

interface SubTipoProducto {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    titulo: string;
    resumen: string;
    proyecto_investigacion_id: number;
    sub_tipo_producto_id: number;
    usuarios: Usuario[];
    sub_tipo_producto: {
        id: number;
        nombre: string;
        tipo_producto: {
            id: number;
            nombre: string;
            actividad_investigacion: {
                id: number;
                nombre: string;
            };
        };
    };
}

interface EditProps {
    producto: Producto;
    proyectos: Proyecto[];
    actividadesInvestigacion: ActividadInvestigacion[];
    actividadesConTipos: ActividadConTipos[];
    usuarios: Usuario[];
    usuarioLogueado: number;
}

export default function Edit({ producto, proyectos, actividadesInvestigacion, actividadesConTipos, usuarios }: EditProps) {
    // Convertir usuarios a opciones para MultiSelect
    const usuarioOptions: Option[] = usuarios.map(u => ({ 
        label: `${u.name} (${u.tipo})`, 
        value: u.id.toString() 
    }));

    const { data, setData, put, errors, processing } = useForm({
        titulo: producto.titulo,
        resumen: producto.resumen,
        proyecto_investigacion_id: producto.proyecto_investigacion_id.toString(),
        actividad_investigacion_id: producto.sub_tipo_producto.tipo_producto.actividad_investigacion.id.toString(),
        tipo_producto_id: producto.sub_tipo_producto.tipo_producto.id.toString(),
        sub_tipo_producto_id: producto.sub_tipo_producto.id.toString(),
        usuarios: producto.usuarios.map(u => u.id.toString()),
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
            title: producto.titulo,
            href: route('productos.show', producto.id),
        },
        {
            title: 'Editar',
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

    const cargarTiposProducto = useCallback((actividadId: string, limpiarDatos = true) => {
        if (!actividadId) {
            setTiposProducto([]);
            setSubTiposProducto([]);
            if (limpiarDatos) {
                setData('tipo_producto_id', '');
                setData('sub_tipo_producto_id', '');
            }
            return;
        }
        setLoadingTipos(true);
        const actividad = actividadesConTipos.find(a => String(a.id) === String(actividadId));
        const tipos = (actividad?.tipos || []).map(t => ({ id: t.id, nombre: t.nombre }));
        setTiposProducto(tipos);
        setSubTiposProducto([]);
        if (limpiarDatos) {
            setData('tipo_producto_id', '');
            setData('sub_tipo_producto_id', '');
        }
        setLoadingTipos(false);
    }, [actividadesConTipos, setData]);

    // Función para cargar subtipos de producto cuando se selecciona un tipo
    const cargarSubTiposProducto = useCallback((tipoId: string, limpiarDatos = true) => {
        if (!tipoId) {
            setSubTiposProducto([]);
            if (limpiarDatos) {
                setData('sub_tipo_producto_id', '');
            }
            return;
        }
        setLoadingSubTipos(true);
        const actividad = actividadesConTipos.find(a => String(a.id) === String(data.actividad_investigacion_id));
        const tipo = actividad?.tipos.find(t => String(t.id) === String(tipoId));
        const subtipos = (tipo?.sub_tipos || []).map(st => ({ id: st.id, nombre: st.nombre }));
        setSubTiposProducto(subtipos);
        if (limpiarDatos) {
            setData('sub_tipo_producto_id', '');
        }
        setLoadingSubTipos(false);
    }, [actividadesConTipos, data.actividad_investigacion_id, setData]);

    // Cargar datos iniciales cuando se monta el componente
    useEffect(() => {
        // Cargar tipos para la actividad actual sin limpiar datos
        if (data.actividad_investigacion_id) {
            const actividad = actividadesConTipos.find(a => String(a.id) === String(data.actividad_investigacion_id));
            const tipos = (actividad?.tipos || []).map(t => ({ id: t.id, nombre: t.nombre }));
            setTiposProducto(tipos);
        }
        
        // Cargar subtipos para el tipo actual sin limpiar datos
        if (data.tipo_producto_id) {
            const actividad = actividadesConTipos.find(a => String(a.id) === String(data.actividad_investigacion_id));
            const tipo = actividad?.tipos.find(t => String(t.id) === String(data.tipo_producto_id));
            const subtipos = (tipo?.sub_tipos || []).map(st => ({ id: st.id, nombre: st.nombre }));
            setSubTiposProducto(subtipos);
        }
    }, [actividadesConTipos, data.actividad_investigacion_id, data.tipo_producto_id]);

    // Efecto para cargar tipos cuando cambia la actividad
    useEffect(() => {
        if (data.actividad_investigacion_id) {
            cargarTiposProducto(data.actividad_investigacion_id);
        }
    }, [data.actividad_investigacion_id, cargarTiposProducto]);

    // Efecto para cargar subtipos cuando cambia el tipo
    useEffect(() => {
        if (data.tipo_producto_id) {
            cargarSubTiposProducto(data.tipo_producto_id);
        }
    }, [data.tipo_producto_id, cargarSubTiposProducto]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('productos.update', producto.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Producto - ${producto.titulo}`} />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Editar Producto Investigativo
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
                                    <Label htmlFor="resumen">Descripción</Label>
                                    <Textarea
                                        id='resumen'
                                        className="mt-1"
                                        value={data.resumen}
                                        onChange={(e) => setData('resumen', e.target.value)}
                                        name='resumen'
                                        placeholder="Ingrese la descripción del producto"
                                        rows={4}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="proyecto_investigacion_id">Proyecto</Label>
                                    <SearchSelect
                                        options={proyectoOptions}
                                        value={data.proyecto_investigacion_id}
                                        onValueChange={(value) => setData('proyecto_investigacion_id', String(value))}
                                        placeholder="Seleccionar proyecto..."
                                        name="proyecto_investigacion_id"
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
                                <div>
                                    <Label>Usuarios del Producto *</Label>
                                    <MultiSelect
                                        options={usuarioOptions}
                                        selected={data.usuarios}
                                        onChange={(selected) => setData('usuarios', selected)}
                                        placeholder="Seleccionar usuarios..."
                                        className="mb-4"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Link href={route('productos.show', producto.id)}>
                                <Button type='button' variant="outline" className='mr-3'>
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type='submit' disabled={processing} className='bg-primary hover:bg-primary/90'>
                                Actualizar Producto
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 