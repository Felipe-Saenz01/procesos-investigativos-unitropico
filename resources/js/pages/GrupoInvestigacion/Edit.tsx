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
        title: 'Editar Grupo',
        href: '/grupo-investigacion/edit',
    }
];

interface GrupoInvestigacion {
    id: number;
    nombre: string;
    correo: string;
    descripcion?: string;
    objetivos?: string;
    vision?: string;
    mision?: string;
    ruta_plan_trabajo?: string | null;
    nombre_archivo_plan_trabajo?: string;
}

interface GrupoInvestigacionEditProps {
    grupoInvestigacion: GrupoInvestigacion;
}

export default function GrupoInvestigacionEdit({ grupoInvestigacion }: GrupoInvestigacionEditProps) {
    const { data, setData, post, processing, errors } = useForm({
        nombre: grupoInvestigacion.nombre,
        correo: grupoInvestigacion.correo,
        descripcion: grupoInvestigacion.descripcion ?? '',
        objetivos: grupoInvestigacion.objetivos ?? '',
        vision: grupoInvestigacion.vision ?? '',
        mision: grupoInvestigacion.mision ?? '',
        plan_trabajo: null as File | null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        // Crear FormData para manejar archivos
        // const formData = new FormData();
        // formData.append('nombre', data.nombre);
        // formData.append('correo', data.correo);
        // formData.append('descripcion', data.descripcion);
        // formData.append('objetivos', data.objetivos);
        // formData.append('vision', data.vision);
        // formData.append('mision', data.mision);
        
        // if (data.plan_trabajo) {
        //     formData.append('plan_trabajo', data.plan_trabajo);
        // }
        
        // put(route('grupo-investigacion.update', grupoInvestigacion.id), formData, {
        //     forceFormData: true
        // });
        post(route('grupo-investigacion.editFile', grupoInvestigacion.id),{
            forceFormData: true
        });
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
                                    {grupoInvestigacion.ruta_plan_trabajo && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm text-gray-600 mb-2">Archivo actual:</p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(route('grupo-investigacion.descargar-plan', grupoInvestigacion.id), '_blank')}
                                                >
                                                    Descargar archivo actual
                                                </Button>
                                                <span className="text-xs text-gray-500">
                                                    {grupoInvestigacion.nombre_archivo_plan_trabajo || 'plan_trabajo.pdf'}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    (Se reemplazará si subes uno nuevo)
                                                </span>
                                            </div>
                                        </div>
                                    )}
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