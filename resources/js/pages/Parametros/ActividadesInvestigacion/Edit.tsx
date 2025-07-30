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
        title: 'Actividades de Investigación',
        href: route('parametros.actividades-investigacion.index'),
    },
    {
        title: 'Editar Actividad',
        href: '#',
    }
];

interface ActividadesInvestigacion {
    id: number;
    nombre: string;
    horas_maximas: number;
}

interface EditProps {
    actividadesInvestigacion: ActividadesInvestigacion;
}

export default function Edit({ actividadesInvestigacion }: EditProps) {
    const { data, setData, put, errors } = useForm({
        nombre: actividadesInvestigacion.nombre,
        horas_maximas: actividadesInvestigacion.horas_maximas
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('parametros.actividades-investigacion.update', actividadesInvestigacion.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Actividad de Investigación" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Editar Actividad de Investigación
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
                                    <Label htmlFor="nombre">Nombre de la Actividad</Label>
                                    <Input
                                        id='nombre'
                                        className="mt-1"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        type='text'
                                        name='nombre'
                                        placeholder="Ej: Consolidación de Productos de Investigación"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="horas_maximas">Horas Máximas</Label>
                                    <Input
                                        id='horas_maximas'
                                        className="mt-1"
                                        value={data.horas_maximas}
                                        onChange={(e) => setData('horas_maximas', parseInt(e.target.value) || 1)}
                                        type='number'
                                        name='horas_maximas'
                                        min="1"
                                        max="100"
                                        placeholder="8"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Link href={route('parametros.actividades-investigacion.index')}>
                                <Button type='button' variant="outline" className='mr-3'>
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type='submit' className='bg-primary hover:bg-primary/90'>
                                Actualizar Actividad
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 