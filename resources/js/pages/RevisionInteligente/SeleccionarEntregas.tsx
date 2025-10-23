import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchSelect } from '@/components/form-search-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CircleCheckBig, CircleX, FileText, Users } from 'lucide-react';

const breadcrumbs = (productoId: number): BreadcrumbItem[] => [
    { title: 'Revisión Inteligente', href: route('modulo-inteligente.index') },
    { title: 'Seleccionar Evidencias', href: route('modulo-inteligente.show', productoId) },
];

interface Usuario { id: number; name: string }
interface SubTipo { id: number; nombre: string }
interface Producto { id: number; titulo: string; sub_tipo_producto: SubTipo; usuarios: Usuario[] }
interface Evidencia { id: number; evidencia: string | null; created_at: string; usuario: Usuario; periodo: { id: number; nombre: string } }
interface ComparacionExistente { 
    id: number; 
    evidencia_1_id: number; 
    evidencia_2_id: number; 
    created_at: string;
    evidencia1: Evidencia;
    evidencia2: Evidencia;
}

interface Props {
    producto: Producto;
    evidencias: Evidencia[];
    comparaciones_existentes: ComparacionExistente[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function SeleccionarEntregas({ producto, evidencias, comparaciones_existentes }: Props) {
    const { data, setData } = useForm({ e1: '', e2: '' });
    const { flash } = usePage().props as PageProps;

    const options = evidencias.map((e) => ({
        value: e.id.toString(),
        label: `${e.periodo?.nombre} • ${new Date(e.created_at).toLocaleDateString()} • ${e.usuario?.name}`
    }));

    const filteredOptionsForSecond = options.filter(o => o.value !== data.e1);

    return (
        <AppLayout breadcrumbs={breadcrumbs(producto.id)}>
            <Head title={`Evidencias: ${producto.titulo}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('modulo-inteligente.index')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Link>
                    </Button>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert variant="default">
                        <CircleCheckBig />
                        <AlertTitle>{flash.success}</AlertTitle>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive">
                        <CircleX />
                        <AlertTitle>{flash.error}</AlertTitle>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span className="truncate" title={producto.titulo}>{producto.titulo}</span>
                            <span className="text-sm text-gray-600">Tipo: {producto.sub_tipo_producto?.nombre}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-gray-600 mb-6">
                            Usuarios: {producto.usuarios.length > 0 ? producto.usuarios.map(u => u.name).join(', ') : '—'}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                            <div>
                                <div className="text-sm font-medium mb-1">Evidencia A</div>
                                <SearchSelect
                                    options={options}
                                    value={data.e1}
                                    onValueChange={(v) => setData('e1', String(v))}
                                    placeholder="Seleccionar evidencia..."
                                />
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Evidencia B</div>
                                <SearchSelect
                                    options={filteredOptionsForSecond}
                                    value={data.e2}
                                    onValueChange={(v) => setData('e2', String(v))}
                                    placeholder="Seleccionar evidencia..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-center mt-8">
                            <Button asChild disabled={!data.e1 || !data.e2 || data.e1 === data.e2}>
                                <Link href={route('modulo-inteligente.comparar', { producto: producto.id, e1: data.e1, e2: data.e2 })}>
                                    Comparar
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Comparaciones Existentes */}
                {comparaciones_existentes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Comparaciones Existentes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {comparaciones_existentes.map((comparacion) => (
                                    <div key={comparacion.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">
                                                Comparación #{comparacion.id}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {new Date(comparacion.created_at).toLocaleDateString()}
                                                </Badge>
                                                <Button asChild size="sm">
                                                    <Link href={route('modulo-inteligente.comparacion.show', comparacion.id)}>
                                                        Ver Comparación
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span className="font-medium">Evidencia 1:</span>
                                                </div>
                                                <div className="ml-6 space-y-1">
                                                    <div><span className="text-gray-600">Autor:</span> {comparacion.evidencia1.usuario?.name}</div>
                                                    <div><span className="text-gray-600">Período:</span> {comparacion.evidencia1.periodo?.nombre}</div>
                                                    <div><span className="text-gray-600">Fecha:</span> {new Date(comparacion.evidencia1.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span className="font-medium">Evidencia 2:</span>
                                                </div>
                                                <div className="ml-6 space-y-1">
                                                    <div><span className="text-gray-600">Autor:</span> {comparacion.evidencia2.usuario?.name}</div>
                                                    <div><span className="text-gray-600">Período:</span> {comparacion.evidencia2.periodo?.nombre}</div>
                                                    <div><span className="text-gray-600">Fecha:</span> {new Date(comparacion.evidencia2.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}


