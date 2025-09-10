import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
        title: 'Crear Nuevo Grupo',
        href: '/grupo-investigacion/create',
    }
];

export default function GrupoInvestigacionCreate() {
    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        correo: '',
        descripcion: '',
        objetivos: '',
        vision: '',
        mision: '',
        plan_trabajo: null as File | null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('grupo-investigacion.store'), {
            forceFormData: true,
            onSuccess: () => reset()
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Grupo de Investigación" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Crear un Nuevo Grupo de Investigación
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

                                <div>
                                    <Label htmlFor="descripcion">Descripción</Label>
                                    <Textarea
                                        id="descripcion"
                                        value={data.descripcion}
                                        onChange={(e) => setData('descripcion', e.target.value)}
                                        placeholder="Describe el grupo de investigación"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="objetivos">Objetivos</Label>
                                    <Textarea
                                        id="objetivos"
                                        value={data.objetivos}
                                        onChange={(e) => setData('objetivos', e.target.value)}
                                        placeholder="Objetivos del grupo"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="vision">Visión</Label>
                                    <Textarea
                                        id="vision"
                                        value={data.vision}
                                        onChange={(e) => setData('vision', e.target.value)}
                                        placeholder="Visión del grupo"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="mision">Misión</Label>
                                    <Textarea
                                        id="mision"
                                        value={data.mision}
                                        onChange={(e) => setData('mision', e.target.value)}
                                        placeholder="Misión del grupo"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="plan_trabajo">Plan de Trabajo (PDF, Word o Excel)</Label>
                                    <Input
                                        id="plan_trabajo"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                                        onChange={(e) => setData('plan_trabajo', e.target.files?.[0] ?? null)}
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
                                {processing ? 'Creando...' : 'Crear'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 