import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import ActividadesProyecto, { type Actividad } from '@/components/ActividadesProyecto';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert, Plus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { MultiSelect, type Option } from '@/components/ui/multiselect-combobox';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Proyectos Investigativos',
        href: '/proyectos',
    },
    {
        title: 'Crear Nuevo Proyecto',
        href: '/proyectos/create',
    }
];

interface Usuario {
    id: number;
    name: string;
    tipo: string;
}

interface CreateProps {
    usuarios: Usuario[];
    usuarioLogueado: number;
}

export default function ProyectosCreate({ usuarios = [], usuarioLogueado }: CreateProps) {
    // Convertir usuarios a opciones para MultiSelect
    const usuarioOptions: Option[] = usuarios.map(u => ({ 
        label: `${u.name} (${u.tipo})`, 
        value: u.id.toString() 
    }));
    const [tipoProyecto, setTipoProyecto] = useState<string>('en_formulacion');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        titulo: '',
        eje_tematico: '',
        tipo_proyecto: 'en_formulacion',
        resumen_ejecutivo: '',
        planteamiento_problema: '',
        antecedentes: '',
        justificacion: '',
        objetivos: '',
        metodologia: '',
        resultados: '',
        riesgos: '',
        bibliografia: '',
        actividades: [] as Actividad[],
        usuarios: [usuarioLogueado.toString()] as string[],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        console.log('Actividades a enviar:', data.actividades);
        console.log('Usuarios seleccionados:', data.usuarios);
        console.log('Datos del formulario:', data);
        
        // Enviar el formulario directamente
        post(route('proyectos.store'), {
            onSuccess: () => {  
                reset();
                setTipoProyecto('en_formulacion');
            }
        });
    };

    const handleTipoChange = (value: string) => {
        setTipoProyecto(value);
        setData('tipo_proyecto', value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Proyecto Investigativo" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-4/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex items-center gap-2'>
                                <Plus className="h-6 w-6" />
                                Crear Nuevo Proyecto Investigativo
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
                            
                            <Tabs value={tipoProyecto} onValueChange={handleTipoChange} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="en_formulacion">En Formulación</TabsTrigger>
                                    <TabsTrigger value="formulado">Formulado</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="en_formulacion" className="space-y-6 mt-6">
                                    <div className="p-4 border rounded-lg bg-blue-50">
                                        <h3 className="font-semibold text-blue-800 mb-2">Proyecto en Formulación</h3>
                                        <p className="text-blue-700 text-sm">
                                            Proyecto básico que se completará posteriormente. Se creará automáticamente el producto "Formulación del Proyecto".
                                        </p>
                                    </div>

                                    {/* Campos básicos */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="titulo">Título del Proyecto *</Label>
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
                                            <Label htmlFor="eje_tematico">Eje Temático *</Label>
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
                                </TabsContent>

                                <TabsContent value="formulado" className="space-y-6 mt-6">
                                    <div className="p-4 border rounded-lg bg-green-50">
                                        <h3 className="font-semibold text-green-800 mb-2">Proyecto Formulado</h3>
                                        <p className="text-green-700 text-sm">
                                            Proyecto con toda la información completa. Permite crear productos investigativos.
                                        </p>
                                    </div>

                                    {/* Campos básicos */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="titulo_formulado">Título del Proyecto *</Label>
                                            <Input
                                                id="titulo_formulado"
                                                type="text"
                                                value={data.titulo}
                                                onChange={(e) => setData('titulo', e.target.value)}
                                                placeholder="Ingrese el título del proyecto"
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="eje_tematico_formulado">Eje Temático *</Label>
                                            <Input
                                                id="eje_tematico_formulado"
                                                type="text"
                                                value={data.eje_tematico}
                                                onChange={(e) => setData('eje_tematico', e.target.value)}
                                                placeholder="Ingrese el eje temático"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Campos adicionales para proyectos formulados */}
                                    <div>
                                        <Label htmlFor="resumen_ejecutivo">Resumen Ejecutivo *</Label>
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
                                        <Label htmlFor="planteamiento_problema">Planteamiento del Problema *</Label>
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
                                        <Label htmlFor="antecedentes">Antecedentes *</Label>
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
                                        <Label htmlFor="justificacion">Justificación *</Label>
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
                                        <Label htmlFor="objetivos">Objetivos *</Label>
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
                                        <Label htmlFor="metodologia">Metodología *</Label>
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
                                        <Label htmlFor="resultados">Resultados Esperados *</Label>
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
                                        <Label htmlFor="riesgos">Riesgos *</Label>
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
                                        <Label htmlFor="bibliografia">Bibliografía *</Label>
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
                                        <Label>Participantes del Proyecto *</Label>
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
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type='button' variant="destructive" className='mr-3'>
                                <Link href={route('proyectos.index')}>Cancelar</Link>
                            </Button>
                            <Button type='submit' disabled={processing} className='bg-primary hover:bg-primary/90'>
                                {processing ? 'Creando...' : 'Crear Proyecto'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 