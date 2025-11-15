import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker, createLocalDate, formatDateToString } from '@/components/form-date-picker';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlert } from 'lucide-react';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Períodos',
        href: route('parametros.periodo.index'),
    },
    {
        title: 'Crear Nuevo Período',
        href: route('parametros.periodo.create'),
    }
];

export default function Create() {
    const { data, setData, post, errors, reset } = useForm({
        año: '',
        semestre: '',
        fecha_limite_planeacion: '',
        fecha_limite_evidencias: '',
        estado: 'Inactivo'
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('parametros.periodo.store'), {
            onSuccess: () => reset()
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo Período" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card className=''>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Crear un Nuevo Período Académico
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="año">Año</Label>
                                        <Input 
                                            id='año' 
                                            className="mt-1" 
                                            value={data.año} 
                                            onChange={(e) => setData('año', e.target.value)} 
                                            type='number' 
                                            name='año'
                                            placeholder="Ej: 2024"
                                            min="2000"
                                            max="2100"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="semestre">Semestre</Label>
                                        <Select 
                                            value={data.semestre} 
                                            onValueChange={(value) => setData('semestre', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Seleccionar semestre" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A</SelectItem>
                                                <SelectItem value="B">B</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                
                                <DatePicker
                                    value={data.fecha_limite_planeacion ? createLocalDate(data.fecha_limite_planeacion) : undefined}
                                    onValueChange={(date) => setData('fecha_limite_planeacion', date ? formatDateToString(date) : '')}
                                    label="Fecha Límite de Planeación"
                                    name="fecha_limite_planeacion"
                                    placeholder="Seleccionar fecha de planeación..."
                                    required
                                />

                                <DatePicker
                                    value={data.fecha_limite_evidencias ? createLocalDate(data.fecha_limite_evidencias) : undefined}
                                    onValueChange={(date) => setData('fecha_limite_evidencias', date ? formatDateToString(date) : '')}
                                    label="Fecha Límite de Evidencias"
                                    name="fecha_limite_evidencias"
                                    placeholder="Seleccionar fecha de evidencias..."
                                    minDate={data.fecha_limite_planeacion ? createLocalDate(data.fecha_limite_planeacion) : undefined}
                                    required
                                />

                                <div>
                                    <Label htmlFor="estado">Estado</Label>
                                    <Select 
                                        value={data.estado} 
                                        onValueChange={(value) => setData('estado', value)}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Seleccionar estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Activo">Activo</SelectItem>
                                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type='button' variant="destructive" className='mr-3'>
                                <Link href={route('parametros.periodo.index')}>Cancelar</Link>
                            </Button>
                            <Button type='submit' className='bg-primary hover:bg-primary/90'>Crear</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 