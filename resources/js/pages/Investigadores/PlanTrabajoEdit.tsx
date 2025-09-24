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

interface Investigador {
    id: number;
    name: string;
    email: string;
    tipo: string;
}

interface Periodo {
    id: number;
    nombre: string;
}

interface PlanTrabajo {
    id: number;
    nombre: string;
    vigencia: string;
    estado: string;
    periodo_id?: number;
}

interface EditProps {
    investigador: Investigador;
    planTrabajo: PlanTrabajo;
    periodos: Periodo[];
}

export default function PlanTrabajoEdit({ investigador, planTrabajo, periodos }: EditProps) {
    const { data, setData, put, errors } = useForm({
        id: planTrabajo.id,
        nombre: planTrabajo.nombre,
        vigencia: planTrabajo.vigencia,
        periodo_id: planTrabajo.periodo_id?.toString() || '',
        estado: 'Pendiente' // Estado fijo al editar
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('investigadores.planes-trabajo.update', [investigador.id, data.id]));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Investigadores',
            href: route('investigadores.index'),
        },
        {
            title: investigador.name,
            href: '#',
        },
        {
            title: 'Planes de Trabajo',
            href: route('investigadores.planes-trabajo', investigador.id),
        },
        {
            title: 'Editar Plan',
            href: '#',
        }
    ];

    const vigenciaOptions = [
        { value: 'Anual', label: 'Anual' },
        { value: 'Semestral', label: 'Semestral' }
    ];

    const periodoOptions = periodos.map(periodo => ({
        value: periodo.id.toString(),
        label: periodo.nombre
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Plan de Trabajo" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Editar Plan de Trabajo
                            </CardTitle>
                            <p className="text-gray-600">Investigador: {investigador.name}</p>
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
                                    <Label htmlFor="nombre">Nombre del Plan</Label>
                                    <Input
                                        id='nombre'
                                        className="mt-1"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        type='text'
                                        name='nombre'
                                        placeholder="Ej: Plan de Investigación 2024"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="vigencia">Vigencia</Label>
                                    <SearchSelect
                                        options={vigenciaOptions}
                                        value={data.vigencia}
                                        onValueChange={(value) => setData('vigencia', String(value))}
                                        placeholder="Seleccionar vigencia..."
                                        name="vigencia"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="periodo_id">Período Activo</Label>
                                    <SearchSelect
                                        options={periodoOptions}
                                        value={data.periodo_id}
                                        onValueChange={(value) => setData('periodo_id', String(value))}
                                        placeholder="Seleccionar período..."
                                        name="periodo_id"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="estado">Estado</Label>
                                    <Input
                                        id='estado'
                                        className="mt-1 bg-gray-100"
                                        value={data.estado}
                                        type='text'
                                        name='estado'
                                        disabled
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        El estado se establecerá automáticamente como "Pendiente"
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Link href={route('investigadores.planes-trabajo', investigador.id)}>
                                <Button type='button' variant="outline" className='mr-3'>
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type='submit' className='bg-primary hover:bg-primary/90'>
                                Actualizar Plan de Trabajo
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 