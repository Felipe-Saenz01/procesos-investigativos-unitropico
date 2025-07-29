import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface EscalafonProfesoral {
    id: number;
    nombre: string;
    horas_semanales: number;
}

interface Props {
    escalafonProfesoral: EscalafonProfesoral;
}

const breadcrumbs = [
    { title: 'Parámetros', href: '/parametros/periodo' },
    { title: 'Escalafón Profesoral', href: route('parametros.escalafon-profesoral.index') },
    { title: 'Editar', href: '#' },
];

export default function Edit({ escalafonProfesoral }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        nombre: escalafonProfesoral.nombre,
        horas_semanales: escalafonProfesoral.horas_semanales.toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('parametros.escalafon-profesoral.update', escalafonProfesoral.id), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Escalafón Profesoral" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-2/5'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Editar Escalafón Profesoral
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="nombre">Nombre</Label>
                                    <Input
                                        id="nombre"
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        className={errors.nombre ? 'border-red-500' : ''}
                                    />
                                    {errors.nombre && <div className="text-red-500 text-sm">{errors.nombre}</div>}
                                </div>

                                <div>
                                    <Label htmlFor="horas_semanales">Horas Semanales</Label>
                                    <Input
                                        id="horas_semanales"
                                        type="number"
                                        min="1"
                                        value={data.horas_semanales}
                                        onChange={(e) => setData('horas_semanales', e.target.value)}
                                        className={errors.horas_semanales ? 'border-red-500' : ''}
                                    />
                                    {errors.horas_semanales && <div className="text-red-500 text-sm">{errors.horas_semanales}</div>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type="submit" disabled={processing}>Actualizar</Button>
                            <Button asChild variant="secondary">
                                <Link href={route('parametros.escalafon-profesoral.index')}>Cancelar</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}