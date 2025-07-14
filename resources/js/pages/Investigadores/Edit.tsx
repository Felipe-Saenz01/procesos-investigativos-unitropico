import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Investigadores',
        href: '/investigadores',
    },
    {
        title: 'Editar Investigador',
        href: '/investigadores/edit',
    }
];

interface GrupoInvestigacion {
    id: number;
    nombre: string;
}

interface Investigador {
    id: number;
    name: string;
    email: string;
    role: string;
    grupo_investigacion_id: number | null;
}

interface InvestigadorEditProps {
    investigador: Investigador;
    gruposInvestigacion: GrupoInvestigacion[];
}

export default function InvestigadorEdit({ investigador, gruposInvestigacion }: InvestigadorEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: investigador.name,
        email: investigador.email,
        role: investigador.role,
        grupo_investigacion_id: investigador.grupo_investigacion_id,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('investigadores.update', investigador.id));
    };

    const grupoOptions = gruposInvestigacion.map(grupo => ({
        value: grupo.id.toString(),
        label: grupo.nombre
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Investigador" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Editar Investigador
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
                                    <Label htmlFor="name">Nombre Completo</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ingrese el nombre completo"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Ingrese el correo electrónico"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="role">Rol</Label>
                                    <Select 
                                        value={data.role} 
                                        onValueChange={(value) => setData('role', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Investigador">Investigador</SelectItem>
                                            <SelectItem value="Lider Grupo">Líder Grupo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="grupo_investigacion_id">Grupo de Investigación</Label>
                                    <SearchSelect
                                        options={grupoOptions}
                                        value={data.grupo_investigacion_id?.toString() || ''}
                                        onValueChange={(value) => setData('grupo_investigacion_id', value ? parseInt(value) : null)}
                                        placeholder="Seleccionar grupo de investigación..."
                                        name="grupo_investigacion_id"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type='button' variant="destructive" className='mr-3'>
                                <Link href={route('investigadores.index')}>Cancelar</Link>
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