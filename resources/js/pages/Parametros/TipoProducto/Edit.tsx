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
        title: 'Tipos Productos',
        href: route('parametros.tipo-producto.index'),
    },
    {
        title: 'Actualizar Tipo Producto',
        href: route('parametros.tipo-producto.create'),
    }
];

interface TipoProductoProps{
    id: number;
    nombre: string;
}

interface Props{
    tipoProducto: TipoProductoProps;
}

export default function Edit({tipoProducto}: Props) {

    const {data, setData,put, errors, reset } = useForm({id: tipoProducto.id, nombre: tipoProducto.nombre } );


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        put(route('parametros.tipo-producto.update', data.id), {
            onSuccess:() => reset()
        });
    }

 

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Tipo Producto" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
            <form onSubmit={handleSubmit} className='sm:w-2/5'>
                <Card className=''>
                    <CardHeader>
                        <CardTitle className='text-2xl flex justify-between items-center'>
                            Actualizar un Tipo Producto
                        </CardTitle>
                    </CardHeader>
                    <CardContent >
                        {Object.keys(errors).length > 0 && 
                        // <p className='text-red-500 text-sm mb-3'> Hay errores {Object.keys(errors).length}</p>
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
                        <Label htmlFor="nombre" >Nombre del Tipo Producto</Label>
                        <Input id='nombre' className="mb-3" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} type='text' name='nombre' />
                        
                    </CardContent>
                    <CardFooter className='flex justify-end'>
                        <Button type='button' variant="destructive" className='mr-3' ><Link href={route('parametros.tipo-producto.index')}>Cancelar</Link></Button>
                        <Button type='submit' className='bg-primary hover:bg-primary/90'>Actualizar</Button>
                    </CardFooter>

                </Card>
            </form>

            </div>
        </AppLayout>
    );
}