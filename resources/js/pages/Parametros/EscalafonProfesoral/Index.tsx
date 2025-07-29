import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';

interface EscalafonProfesoral {
    id: number;
    nombre: string;
    horas_semanales: number;
}

interface Props {
    escalafones: EscalafonProfesoral[];
}

const breadcrumbs = [
    { title: 'Parámetros', href: '/parametros/periodo' },
    { title: 'Escalafón Profesoral', href: route('parametros.escalafon-profesoral.index') },
];

export default function Index({ escalafones }: Props) {
    const { delete: destroy, processing } = useForm();
    
    const handleDelete = (id: number) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este escalafón profesoral?')) {
            destroy(route('parametros.escalafon-profesoral.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Escalafones Profesoral" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between p-5'>
                        <h1 className='text-2xl font-bold'>Escalafones Profesoral</h1>
                        <Link href={route('parametros.escalafon-profesoral.create')} prefetch>
                            <Button><Plus className="h-4 w-4 mr-1" />Nuevo Escalafón</Button>
                        </Link>
                    </div>
                    <div className='p-5'>
                        <Card>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Horas Semanales</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {escalafones.map((escalafon) => (
                                            <TableRow key={escalafon.id}>
                                                <TableCell>{escalafon.nombre}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{escalafon.horas_semanales} horas</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button asChild size="sm" variant="outline">
                                                            <Link href={route('parametros.escalafon-profesoral.edit', escalafon.id)}>
                                                                <Edit className="h-4 w-4 mr-1" />
                                                            </Link>
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(escalafon.id)} disabled={processing}>
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}