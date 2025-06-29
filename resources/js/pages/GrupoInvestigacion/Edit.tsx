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
        title: 'Grupos de Investigación',
        href: '/grupo-investigacion',
    },
    {
        title: 'Editar Grupo',
        href: '/grupo-investigacion/edit',
    }
];

interface GrupoInvestigacion {
    id: number;
    nombre: string;
    correo: string;
}

interface GrupoInvestigacionEditProps {
    grupoInvestigacion: GrupoInvestigacion;
}

export default function GrupoInvestigacionEdit({ grupoInvestigacion }: GrupoInvestigacionEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        nombre: grupoInvestigacion.nombre,
        correo: grupoInvestigacion.correo,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('grupo-investigacion.update', grupoInvestigacion.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Grupo de Investigación" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Editar Grupo de Investigación
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
                                    <Label htmlFor="nombre">Nombre del Grupo</Label>
                                    <Input
                                        id="nombre"
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        placeholder="Ingrese el nombre del grupo de investigación"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="correo">Correo Electrónico</Label>
                                    <Input
                                        id="correo"
                                        type="email"
                                        value={data.correo}
                                        onChange={(e) => setData('correo', e.target.value)}
                                        placeholder="Ingrese el correo electrónico del grupo"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type='button' variant="destructive" className='mr-3'>
                                <Link href={route('grupo-investigacion.index')}>Cancelar</Link>
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