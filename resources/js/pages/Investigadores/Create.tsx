import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';

interface TipoContrato {
    id: number;
    nombre: string;
}

interface GrupoInvestigacion {
    id: number;
    nombre: string;
}

interface EscalafonProfesoral {
    id: number;
    nombre: string;
}

interface Props {
    isAdmin: boolean;
    grupos: GrupoInvestigacion[];
    grupoLider: number | null;
    tipoContratos: TipoContrato[];
    escalafonesProfesoral: EscalafonProfesoral[];
}

const breadcrumbs = [
    { title: 'Investigadores', href: '/investigadores' },
    { title: 'Crear Investigador', href: '/investigadores/create' },
];

export default function Create({ isAdmin, grupos, grupoLider, tipoContratos, escalafonesProfesoral }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        cedula: '',
        'grupo_investigacion_id': isAdmin ? '' : grupoLider?.toString() || '',
        'tipo_contrato_id': '',
        'escalafon_profesoral_id': '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('investigadores.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Investigador" />
            <div className="flex h-full flex-1 flex-col items-center gap-4 rounded-xl p-4 overflow-x-auto">
                <form onSubmit={handleSubmit} className='sm:w-4/5'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='text-2xl flex justify-between items-center'>
                                Nuevo Investigador
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="cedula">Cédula</Label>
                                    <Input
                                        id="cedula"
                                        type="text"
                                        value={data.cedula}
                                        onChange={(e) => setData('cedula', e.target.value)}
                                        className={errors.cedula ? 'border-red-500' : ''}
                                    />
                                    {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="grupo_investigacion_id">Grupo de Investigación</Label>
                                    {isAdmin ? (
                                        <SearchSelect
                                            value={data.grupo_investigacion_id}
                                            onValueChange={(value) => setData('grupo_investigacion_id', String(value))}
                                            options={grupos.map(g => ({ value: g.id.toString(), label: g.nombre }))}
                                            placeholder="Seleccionar grupo"
                                            className={errors.grupo_investigacion_id ? 'border-red-500' : ''}
                                        />
                                    ) : (
                                        <Input
                                            id="grupo_investigacion_id"
                                            type="text"
                                            value={grupos.find(g => g.id === grupoLider)?.nombre || ''}
                                            disabled
                                        />
                                    )}
                                    {errors.grupo_investigacion_id && <p className="text-red-500 text-xs mt-1">{errors.grupo_investigacion_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="tipo_contrato_id">Tipo de Contrato</Label>
                                    <SearchSelect
                                        value={data.tipo_contrato_id}
                                        onValueChange={(value) => setData('tipo_contrato_id', String(value))}
                                        options={tipoContratos.map(tc => ({ value: tc.id.toString(), label: tc.nombre }))}
                                        placeholder="Seleccionar tipo de contrato"
                                        className={errors.tipo_contrato_id ? 'border-red-500' : ''}
                                    />
                                    {errors.tipo_contrato_id && <p className="text-red-500 text-xs mt-1">{errors.tipo_contrato_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="escalafon_profesoral_id">Escalafón Profesoral</Label>
                                    <SearchSelect
                                        value={data.escalafon_profesoral_id}
                                        onValueChange={(value) => setData('escalafon_profesoral_id', String(value))}
                                        options={escalafonesProfesoral.map(ep => ({ value: ep.id.toString(), label: ep.nombre }))}
                                        placeholder="Seleccionar escalafón"
                                        className={errors.escalafon_profesoral_id ? 'border-red-500' : ''}
                                    />
                                    {errors.escalafon_profesoral_id && <p className="text-red-500 text-xs mt-1">{errors.escalafon_profesoral_id}</p>}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex justify-end'>
                            <Button type="submit" disabled={processing}>Crear</Button>
                            <Button asChild variant="secondary">
                                <Link href={route('investigadores.index')}>Cancelar</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
} 