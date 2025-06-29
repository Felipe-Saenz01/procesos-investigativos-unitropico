import { SearchSelect } from '@/components/form-search-select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Subtipos Productos',
        href: route('parametros.subtipo-producto.index'),
    },
    {
        title: 'Editar Subtipo Producto',
        href: '#',
    }
];

interface TipoProducto {
    id: number;
    nombre: string;
}

interface SubTipoProducto {
    id: number;
    nombre: string;
    tipo_producto_id: number;
    tipo_producto: TipoProducto;
}

interface EditProps {
    subTipoProducto: SubTipoProducto;
    tiposProductos: TipoProducto[];
}

export default function Edit({ subTipoProducto, tiposProductos }: EditProps) {
    const { data, setData, put, errors } = useForm({
        nombre: subTipoProducto.nombre,
        tipo_producto_id: String(subTipoProducto.tipo_producto_id)
    });

    // Convertir los tipos de productos al formato requerido por SearchSelect
    const tipoProductoOptions = tiposProductos.map(tipo => ({
        value: tipo.id,
        label: tipo.nombre
    }));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('parametros.subtipo-producto.update', subTipoProducto.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Subtipo Producto" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Editar Subtipo Producto
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
                                    <Label htmlFor="nombre">Nombre del Subtipo Producto</Label>
                                    <Input 
                                        id='nombre' 
                                        className="mt-1" 
                                        value={data.nombre} 
                                        onChange={(e) => setData('nombre', e.target.value)} 
                                        type='text' 
                                        name='nombre' 
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="tipo_producto_id">Tipo de Producto</Label>
                                    <SearchSelect
                                        options={tipoProductoOptions}
                                        value={data.tipo_producto_id}
                                        onValueChange={(value) => setData('tipo_producto_id', String(value))}
                                        placeholder="Seleccionar tipo de producto..."
                                        searchPlaceholder="Buscar tipo de producto..."
                                        name="tipo_producto_id"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type='button' variant="destructive" className='mr-3'>
                                <Link href={route('parametros.subtipo-producto.index')}>Cancelar</Link>
                            </Button>
                            <Button type='submit' className='bg-primary hover:bg-primary/90'>Actualizar</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 