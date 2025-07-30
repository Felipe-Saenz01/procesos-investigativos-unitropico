import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchSelect } from '@/components/form-search-select';
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
        title: 'Crear Nuevo Tipo Producto',
        href: route('parametros.tipo-producto.create'),
    }
];

interface ActividadInvestigacion {
    id: number;
    nombre: string;
}

interface CreateProps {
    actividadesInvestigacion: ActividadInvestigacion[];
}

export default function Create({ actividadesInvestigacion }: CreateProps) {
    const { data, setData, post, errors, reset } = useForm({
        nombre: '',
        actividad_investigacion_id: ''
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('parametros.tipo-producto.store'), {
            onSuccess: () => reset()
        });
    };

    // Convertir actividades a formato de opciones para SearchSelect
    const actividadOptions = actividadesInvestigacion.map(actividad => ({
        value: actividad.id,
        label: actividad.nombre
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Tipo Producto" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Crear un Nuevo Tipo Producto
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
                                    <Label htmlFor="nombre">Nombre del Tipo Producto</Label>
                                    <Input
                                        id='nombre'
                                        className="mt-1"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        type='text'
                                        name='nombre'
                                        placeholder="Ej: Generación de Nuevo Conocimiento"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="actividad_investigacion_id">Actividad de Investigación</Label>
                                    <SearchSelect
                                        options={actividadOptions}
                                        value={data.actividad_investigacion_id}
                                        onValueChange={(value) => setData('actividad_investigacion_id', String(value))}
                                        placeholder="Seleccionar actividad..."
                                        searchPlaceholder="Buscar actividad..."
                                        name="actividad_investigacion_id"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Link href={route('parametros.tipo-producto.index')}>
                                <Button type='button' variant="outline" className='mr-3'>
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type='submit' className='bg-primary hover:bg-primary/90'>
                                Crear Tipo Producto
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}