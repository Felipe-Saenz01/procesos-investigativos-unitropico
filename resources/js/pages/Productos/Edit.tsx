import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect, type Option } from '@/components/ui/multiselect-combobox';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert, FileText } from 'lucide-react';
import { FormEvent } from 'react';

interface Proyecto {
    id: number;
    titulo: string;
}

interface SubTipoProducto {
    id: number;
    nombre: string;
    descripcion: string;
}

interface Usuario {
    id: number;
    name: string;
    role: string;
}

interface ProductoInvestigativo {
    id: number;
    titulo: string;
    resumen: string;
    proyecto_investigacion_id: number;
    sub_tipo_producto_id: number;
    usuarios: Usuario[];
}

interface ProductosEditProps {
    producto: ProductoInvestigativo;
    proyectos: Proyecto[];
    subTipos: SubTipoProducto[];
    usuarios: Usuario[];
}

export default function ProductosEdit({ producto, proyectos, subTipos, usuarios }: ProductosEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Productos Investigativos',
            href: '/productos',
        },
        {
            title: 'Editar Producto',
            href: `/productos/${producto.id}/edit`,
        }
    ];

    const { data, setData, put, processing, errors } = useForm({
        titulo: producto.titulo,
        resumen: producto.resumen,
        proyecto_investigacion_id: producto.proyecto_investigacion_id?.toString() || '',
        sub_tipo_producto_id: producto.sub_tipo_producto_id?.toString() || '',
        usuarios: producto.usuarios.map(u => u.id.toString()),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        put(route('productos.update', producto.id));
    };

    // Convertir proyectos a opciones para SearchSelect
    const proyectoOptions: Option[] = proyectos.map(proyecto => ({
        label: proyecto.titulo,
        value: proyecto.id.toString()
    }));

    // Convertir subtipos a opciones para SearchSelect
    const subTipoOptions: Option[] = subTipos.map(subTipo => ({
        label: subTipo.nombre,
        value: subTipo.id.toString()
    }));

    // Convertir usuarios a opciones para MultiSelect
    const usuarioOptions: Option[] = usuarios.map(usuario => ({
        label: `${usuario.name} (${usuario.role})`,
        value: usuario.id.toString()
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Producto Investigativo" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-4/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex items-center gap-2'>
                                <FileText className="h-6 w-6" />
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
                            
                            <div className="space-y-6">
                                {/* Campos básicos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="titulo">Título del Producto *</Label>
                                        <Input
                                            id="titulo"
                                            type="text"
                                            value={data.titulo}
                                            onChange={(e) => setData('titulo', e.target.value)}
                                            placeholder="Ingrese el título del producto"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="proyecto">Proyecto Asociado *</Label>
                                        <SearchSelect
                                            options={proyectoOptions}
                                            value={data.proyecto_investigacion_id}
                                            onValueChange={(value) => setData('proyecto_investigacion_id', String(value))}
                                            placeholder="Seleccionar proyecto..."
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="sub_tipo_producto">Tipo de Producto *</Label>
                                    <SearchSelect
                                        options={subTipoOptions}
                                        value={data.sub_tipo_producto_id}
                                        onValueChange={(value) => setData('sub_tipo_producto_id', String(value))}
                                        placeholder="Seleccionar tipo de producto..."
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="usuarios">Usuarios Asociados *</Label>
                                    <MultiSelect
                                        options={usuarioOptions}
                                        selected={data.usuarios}
                                        onChange={(selected) => setData('usuarios', selected)}
                                        placeholder="Seleccionar usuarios..."
                                        className="mt-1"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Selecciona los usuarios que participarán en este producto
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="resumen">Resumen *</Label>
                                    <Textarea
                                        id="resumen"
                                        value={data.resumen}
                                        onChange={(e) => setData('resumen', e.target.value)}
                                        placeholder="Describa el resumen del producto investigativo"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type='button' variant="destructive" className='mr-3'>
                                <Link href={route('productos.index')}>Cancelar</Link>
                            </Button>
                            <Button type='submit' disabled={processing} className='bg-primary hover:bg-primary/90'>
                                {processing ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 