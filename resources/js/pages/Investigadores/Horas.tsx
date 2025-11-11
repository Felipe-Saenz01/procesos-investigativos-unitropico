import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CircleAlert, Clock, Plus, SquarePen, Trash } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';


interface Periodo {
    id: number;
    nombre: string;
}

interface HorasInvestigacion {
    id: number;
    user_id: number;
    periodo_id: number;
    horas: number;
    estado: string;
    created_at: string;
    updated_at: string;
    periodo: Periodo;
}

interface Investigador {
    id: number;
    name: string;
    email: string;
    role: string;
    escalafon_profesoral: {
        id: number;
        nombre: string;
        horas_semanales: number;
    };
}

interface HorasProps {
    investigador: Investigador;
    horasInvestigacion: HorasInvestigacion[];
    periodos: Periodo[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function HorasInvestigacion({ investigador, horasInvestigacion, periodos }: HorasProps) {
    const { flash } = usePage().props as PageProps;
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [horasIdToDelete, setHorasIdToDelete] = useState<number | null>(null);
    const { hasPermission } = usePermissions();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Investigadores',
            href: '/investigadores',
        },
        {
            title: investigador.name,
            href: route('investigadores.show', investigador.id),
        },
        {
            title: 'Horas de Investigación',
            href: '/investigadores/horas',
        }
    ];

    // Permisos
    const canCreateHoras = hasPermission('crear-horas-investigacion');
    const canEditHoras = hasPermission('editar-horas-investigacion');
    const canDeleteHoras = hasPermission('eliminar-horas-investigacion');
    const canSeeAcciones = canEditHoras || canDeleteHoras;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        periodo_id: '',
        horas: '',
        estado: 'Inactivo'
    });

    const { delete: destroy } = useForm();

    // Calcular validaciones
    const horasMaximas = investigador.escalafon_profesoral?.horas_semanales || 0;
    const horasSolicitadas = parseInt(data.horas) || 0;
    const horasExceden = horasSolicitadas > horasMaximas;
    const formularioValido = data.periodo_id && data.horas && !horasExceden;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editingId) {
            // Modo edición
            put(route('investigadores.horas.update', [investigador.id, editingId]), {
                onSuccess: () => {
                    setEditingId(null);
                    reset();
                }
            });
        } else {
            // Modo creación
            post(route('investigadores.horas.store', investigador.id), {
                onSuccess: () => {
                    reset();
                }
            });
        }
    };

    const handleEdit = (horas: HorasInvestigacion) => {
        setEditingId(horas.id);
        setData('periodo_id', horas.periodo_id.toString());
        setData('horas', horas.horas.toString());
        setData('estado', horas.estado);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const requestDelete = (horasId: number) => {
        setHorasIdToDelete(horasId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (horasIdToDelete) {
            destroy(route('investigadores.horas.destroy', [investigador.id, horasIdToDelete]));
            setHorasIdToDelete(null);
        }
    };

    const getEstadoBadge = (estado: string) => {
        if (estado === 'Activo') {
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Activo</Badge>;
        }
        return <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">Inactivo</Badge>;
    };

    const periodoOptions = periodos.map(periodo => ({
        value: periodo.id.toString(),
        label: periodo.nombre
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Horas de Investigación - ${investigador.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex flex-row items-center justify-between pt-4'>
                        <div className='flex flex-row gap-2  pl-4 '>
                            <Clock className="h-6 w-6 mt-1" />
                            <h1 className='text-2xl font-bold '>Horas de Investigación</h1>
                        </div>
                        <Link href={route('investigadores.show', investigador.id)} className='mr-5'>
                            <Button variant="outline"> <ArrowLeft className="h-4 w-4" /> Volver</Button>
                        </Link>
                    </div>

                    <div className='p-5'>
                        {flash?.success &&
                            toast.success(flash.success)
                        }
                        {flash?.error &&
                            toast.error(flash.error)
                        }

                        {/* Formulario para agregar/editar horas (según permisos) */}
                        {(canCreateHoras || canEditHoras) && (
                            <Card className='mb-6'>
                                <CardHeader>
                                    <CardTitle className='text-xl flex items-center gap-2'>
                                        <Plus className="h-5 w-5" />
                                        Asignar Horas de Investigación
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

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="periodo_id">Período</Label>
                                                <SearchSelect
                                                    options={periodoOptions}
                                                    value={data.periodo_id}
                                                    onValueChange={(value) => setData('periodo_id', value.toString())}
                                                    placeholder="Seleccionar período..."
                                                    name="periodo_id"
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="horas">Horas</Label>
                                                <Input
                                                    id="horas"
                                                    type="number"
                                                    value={data.horas}
                                                    onChange={(e) => setData('horas', e.target.value)}
                                                    placeholder="Ingrese las horas"
                                                    className={`mt-1 ${horasExceden ? 'border-red-500 focus:border-red-500' : ''}`}
                                                    min="0"
                                                />
                                                {investigador.escalafon_profesoral && (
                                                    <p className={`text-sm mt-1 ${horasExceden ? 'text-red-600' : 'text-gray-600'}`}>
                                                        Máximo permitido: {horasMaximas} horas ({investigador.escalafon_profesoral.nombre})
                                                    </p>
                                                )}
                                                {horasExceden && (
                                                    <p className="text-sm text-red-600 mt-1">
                                                        Las horas exceden el límite permitido
                                                    </p>
                                                )}
                                            </div>

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

                                        <div className="flex justify-end gap-2">
                                            {editingId && (
                                                <Button
                                                    type='button'
                                                    variant="outline"
                                                    onClick={handleCancelEdit}
                                                    disabled={processing}
                                                >
                                                    Cancelar
                                                </Button>
                                            )}
                                            <Button
                                                type='submit'
                                                disabled={processing || !formularioValido}
                                                className='bg-primary hover:bg-primary/90'
                                            >
                                                {processing ? 'Procesando...' : editingId ? 'Actualizar Horas' : 'Asignar Horas'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                        <Separator />
                        <div className='mb-3 my-5 '>

                            {horasInvestigacion.length === 0 &&
                                <p className='text-gray-400 text-center py-4'>No hay horas de investigación asignadas.</p>
                            }
                            {horasInvestigacion.length > 0 &&
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Período</TableHead>
                                            <TableHead>Horas</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Fecha Asignación</TableHead>
                                            {canSeeAcciones && (
                                                <TableHead>Acciones</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {horasInvestigacion.map((horas) => (
                                            <TableRow key={horas.id}>
                                                <TableCell className='font-medium'>{horas.periodo.nombre}</TableCell>
                                                <TableCell>{horas.horas} horas</TableCell>
                                                <TableCell>{getEstadoBadge(horas.estado)}</TableCell>
                                                <TableCell>{new Date(horas.created_at).toLocaleDateString()}</TableCell>
                                                {canSeeAcciones && (
                                                    <TableCell className='flex gap-2'>
                                                        {canEditHoras && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(horas)}
                                                                title="Editar horas"
                                                            >
                                                                <SquarePen className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {canDeleteHoras && (
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => requestDelete(horas.id)}
                                                                title="Eliminar horas"
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            }
                        </div>

                    </div>
                </div>
            </div>
            {/* Confirmación de eliminación */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Eliminar horas de investigación"
                description="Esta acción es irreversible. ¿Deseas eliminar este registro de horas?"
                confirmText="Eliminar"
                confirmVariant="destructive"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
} 