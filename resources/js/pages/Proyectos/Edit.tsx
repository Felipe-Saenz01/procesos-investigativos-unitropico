import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ActividadesProyecto, { type Actividad } from '@/components/ActividadesProyecto';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert, FileText } from 'lucide-react';
import { FormEvent } from 'react';
import { MultiSelect, type Option } from '@/components/ui/multiselect-combobox';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Proyectos Investigativos',
        href: '/proyectos',
    },
    {
        title: 'Completar Formulación',
        href: '/proyectos/edit',
    }
];

interface Usuario {
    id: number;
    name: string;
    tipo: string;
}

interface ProyectoInvestigativo {
    id: number;
    titulo: string;
    eje_tematico: string;
    resumen_ejecutivo: string | null;
    planteamiento_problema: string | null;
    antecedentes: string | null;
    justificacion: string | null;
    objetivos: string | null;
    metodologia: string | null;
    resultados: string | null;
    riesgos: string | null;
    bibliografia: string | null;
    actividades: Actividad[];
    estado: string;
    usuarios: Usuario[];
}

interface ActividadUsuario {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    user_id: number;
}

interface ProyectoEditProps {
    proyecto: ProyectoInvestigativo;
    usuarios: Usuario[];
    usuariosSeleccionados: number[];
    actividadesUsuario: ActividadUsuario[];
}

export default function ProyectoEdit({ proyecto, usuarios, usuariosSeleccionados, actividadesUsuario }: ProyectoEditProps) {
    // Convertir usuarios a opciones para MultiSelect
    const usuarioOptions: Option[] = usuarios.map(u => ({ 
        label: `${u.name} (${u.tipo})`, 
        value: u.id.toString() 
    }));
    
    // Convertir actividades del usuario a formato esperado por ActividadesProyecto
    const actividadesFormateadas = actividadesUsuario.map(act => ({
        nombre: act.nombre,
        fecha_inicio: act.fecha_inicio,
        fecha_fin: act.fecha_fin
    }));
    
    const { data, setData, put, processing, errors } = useForm({
        titulo: proyecto.titulo,
        eje_tematico: proyecto.eje_tematico,
        resumen_ejecutivo: proyecto.resumen_ejecutivo || '',
        planteamiento_problema: proyecto.planteamiento_problema || '',
        antecedentes: proyecto.antecedentes || '',
        justificacion: proyecto.justificacion || '',
        objetivos: proyecto.objetivos || '',
        metodologia: proyecto.metodologia || '',
        resultados: proyecto.resultados || '',
        riesgos: proyecto.riesgos || '',
        bibliografia: proyecto.bibliografia || '',
        actividades: actividadesFormateadas,
        usuarios: usuariosSeleccionados.map(id => id.toString()),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        console.log('Actividades a enviar:', data.actividades);
        console.log('Usuarios seleccionados:', data.usuarios);
        
        // Enviar el formulario directamente
        put(route('proyectos.update', proyecto.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Completar Formulación del Proyecto" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-4/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex items-center gap-2'>
                                <FileText className="h-6 w-6" />
                                Completar Formulación del Proyecto
                            </CardTitle>
                            <p className="text-gray-600">
                                Complete toda la información del proyecto para marcarlo como "Formulado" y poder crear productos investigativos.
                            </p>
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
                                        <Label htmlFor="titulo">Título del Proyecto</Label>
                                        <Input
                                            id="titulo"
                                            type="text"
                                            value={data.titulo}
                                            onChange={(e) => setData('titulo', e.target.value)}
                                            placeholder="Ingrese el título del proyecto"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="eje_tematico">Eje Temático</Label>
                                        <Input
                                            id="eje_tematico"
                                            type="text"
                                            value={data.eje_tematico}
                                            onChange={(e) => setData('eje_tematico', e.target.value)}
                                            placeholder="Ingrese el eje temático"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                {/* Campos de formulación completa */}
                                <div>
                                    <Label htmlFor="resumen_ejecutivo">Resumen Ejecutivo</Label>
                                    <Textarea
                                        id="resumen_ejecutivo"
                                        value={data.resumen_ejecutivo}
                                        onChange={(e) => setData('resumen_ejecutivo', e.target.value)}
                                        placeholder="Ingrese el resumen ejecutivo del proyecto"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="planteamiento_problema">Planteamiento del Problema</Label>
                                    <Textarea
                                        id="planteamiento_problema"
                                        value={data.planteamiento_problema}
                                        onChange={(e) => setData('planteamiento_problema', e.target.value)}
                                        placeholder="Describa el planteamiento del problema"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="antecedentes">Antecedentes</Label>
                                    <Textarea
                                        id="antecedentes"
                                        value={data.antecedentes}
                                        onChange={(e) => setData('antecedentes', e.target.value)}
                                        placeholder="Describa los antecedentes del proyecto"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="justificacion">Justificación</Label>
                                    <Textarea
                                        id="justificacion"
                                        value={data.justificacion}
                                        onChange={(e) => setData('justificacion', e.target.value)}
                                        placeholder="Describa la justificación del proyecto"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="objetivos">Objetivos</Label>
                                    <Textarea
                                        id="objetivos"
                                        value={data.objetivos}
                                        onChange={(e) => setData('objetivos', e.target.value)}
                                        placeholder="Describa los objetivos del proyecto"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="metodologia">Metodología</Label>
                                    <Textarea
                                        id="metodologia"
                                        value={data.metodologia}
                                        onChange={(e) => setData('metodologia', e.target.value)}
                                        placeholder="Describa la metodología del proyecto"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="resultados">Resultados Esperados</Label>
                                    <Textarea
                                        id="resultados"
                                        value={data.resultados}
                                        onChange={(e) => setData('resultados', e.target.value)}
                                        placeholder="Describa los resultados esperados"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="riesgos">Riesgos</Label>
                                    <Textarea
                                        id="riesgos"
                                        value={data.riesgos}
                                        onChange={(e) => setData('riesgos', e.target.value)}
                                        placeholder="Describa los riesgos del proyecto"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="bibliografia">Bibliografía</Label>
                                    <Textarea
                                        id="bibliografia"
                                        value={data.bibliografia}
                                        onChange={(e) => setData('bibliografia', e.target.value)}
                                        placeholder="Ingrese la bibliografía del proyecto"
                                        className="mt-1"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <Label>Usuarios del Proyecto *</Label>
                                    <MultiSelect
                                        options={usuarioOptions}
                                        selected={data.usuarios}
                                        onChange={(selected) => setData('usuarios', selected)}
                                        placeholder="Seleccionar usuarios..."
                                        className="mb-4"
                                    />
                                </div>

                                {/* Componente de Actividades */}
                                <ActividadesProyecto 
                                    actividades={data.actividades}
                                    setData={setData}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type='button' variant="destructive" className='mr-3'>
                                <Link href={route('proyectos.index')}>Cancelar</Link>
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