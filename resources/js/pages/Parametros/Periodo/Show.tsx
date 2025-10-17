import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, FileText, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Períodos',
        href: route('parametros.periodo.index'),
    },
    {
        title: 'Detalles del Período',
        href: '#',
    }
];

interface EntregaProducto {
    id: number;
    tipo: string;
    planeacion: string;
    evidencia: string;
    created_at: string;
}

interface HorasInvestigacion {
    id: number;
    horas: number;
    estado: string;
    created_at: string;
}

interface Periodo {
    id: number;
    nombre: string;
    fecha_limite_planeacion: string;
    fecha_limite_evidencias: string;
    estado: string;
    created_at: string;
    updated_at: string;
    entregas: EntregaProducto[];
    horas: HorasInvestigacion[];
}

interface ShowProps {
    periodo: Periodo;
}

export default function Show({ periodo }: ShowProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getEstadoBadge = (estado: string) => {
        if (estado === 'Activo') {
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Activo</Badge>;
        }
        return <Badge variant="secondary">Inactivo</Badge>;
    };

    const getTipoEntregaBadge = (tipo: string) => {
        if (tipo === 'planeacion') {
            return <Badge variant="outline" className="border-blue-500 text-blue-600">Planeación</Badge>;
        }
        return <Badge variant="outline" className="border-green-500 text-green-600">Evidencia</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Período: ${periodo.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={route('parametros.periodo.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold">Período: {periodo.nombre}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('parametros.periodo.edit', periodo.id)}>
                            <Button variant="outline">Editar</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estado</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{getEstadoBadge(periodo.estado)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fecha Límite Planeación</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Date(periodo.fecha_limite_planeacion).toLocaleDateString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Fecha Límite Evidencias</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Date(periodo.fecha_limite_evidencias).toLocaleDateString()}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Entregas</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{periodo.entregas.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Entregas del Período</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {periodo.entregas.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No hay entregas registradas para este período.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Fecha</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {periodo.entregas.map((entrega) => (
                                            <TableRow key={entrega.id}>
                                                <TableCell>{getTipoEntregaBadge(entrega.tipo)}</TableCell>
                                                <TableCell>{formatDate(entrega.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Horas de Investigación</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {periodo.horas.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">No hay horas de investigación registradas para este período.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Horas</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Fecha</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {periodo.horas.map((hora) => (
                                            <TableRow key={hora.id}>
                                                <TableCell>{hora.horas}</TableCell>
                                                <TableCell>{getEstadoBadge(hora.estado)}</TableCell>
                                                <TableCell>{formatDate(hora.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 