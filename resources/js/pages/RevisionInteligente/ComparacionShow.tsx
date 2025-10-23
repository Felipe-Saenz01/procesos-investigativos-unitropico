import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchSelect } from '@/components/form-search-select';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, CircleCheckBig, CircleX, FileText, Users, Calendar, GitCompare, RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Módulo Inteligente',
        href: '/modulo-inteligente',
    },
    {
        title: 'Comparación de Evidencias',
        href: '#',
    }
];

interface Seccion {
    id: number;
    titulo: string;
    contenido: string;
    created_at: string;
}

interface Evidencia {
    id: number;
    usuario: string;
    periodo: string;
    secciones: Seccion[];
}

interface ComparacionSeccion {
    id: number;
    seccion_1_id: number;
    seccion_2_id: number;
    elemento_producto_id: number;
    grado_similitud: number | null;
    resultado_similitud: string | null;
    seccion1: Seccion;
    seccion2: Seccion;
    elementoProducto: {
        id: number;
        nombre: string;
    };
}

interface ComparacionEvidencia {
    id: number;
    evidencia_1_id: number;
    evidencia_2_id: number;
    grado_similitud: number | null;
    resultado_similitud: string | null;
    created_at: string;
}

interface Producto {
    id: number;
    titulo: string;
    sub_tipo_producto: {
        id: number;
        nombre: string;
    };
}

interface ComparacionShowProps {
    comparacion: ComparacionEvidencia;
    producto: Producto;
    evidencia1: Evidencia;
    evidencia2: Evidencia;
    comparaciones_secciones: ComparacionSeccion[];
    elementos_producto: Array<{
        id: number;
        nombre: string;
    }>;
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function ComparacionShow({ 
    comparacion, 
    producto,
    evidencia1, 
    evidencia2, 
    comparaciones_secciones,
    elementos_producto
}: ComparacionShowProps) {
    const { flash } = usePage().props as PageProps;
    const { data, setData, processing } = useForm({ seccion1: '', seccion2: '', elemento_producto_id: '' });
    const [recalcularDialogOpen, setRecalcularDialogOpen] = useState(false);
    const [recalculando, setRecalculando] = useState(false);

    const compararSecciones = () => {
        if (!data.seccion1 || !data.seccion2 || !data.elemento_producto_id) return;

        router.post(route('modulo-inteligente.comparacion.secciones', comparacion.id), {
            seccion1_id: parseInt(data.seccion1),
            seccion2_id: parseInt(data.seccion2),
            elemento_producto_id: parseInt(data.elemento_producto_id),
        }, {
            onSuccess: () => {
                // La página se recargará automáticamente con el flash message
            },
            onError: (errors: Record<string, string>) => {
                console.error('Error al comparar secciones:', errors);
            }
        });
    };

    const recalcularSecciones = () => {
        setRecalculando(true);
        
        router.post(route('modulo-inteligente.comparacion.recalcular-secciones', comparacion.id), {
            confirmar: true,
        }, {
            onSuccess: () => {
                setRecalcularDialogOpen(false);
                setRecalculando(false);
                // La página se recargará automáticamente con el flash message
            },
            onError: (errors: Record<string, string>) => {
                console.error('Error al recalcular secciones:', errors);
                setRecalculando(false);
            }
        });
    };

    // Opciones: primer select solo secciones de Evidencia 1; segundo solo de Evidencia 2
    const opcionesSeccionesE1 = evidencia1.secciones.map(seccion => ({
        value: String(seccion.id),
        label: seccion.titulo,
    }));
    const opcionesSeccionesE2 = evidencia2.secciones.map(seccion => ({
        value: String(seccion.id),
        label: seccion.titulo,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Comparación de Evidencias" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('modulo-inteligente.show', producto.id)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a Seleccionar Evidencias
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setRecalcularDialogOpen(true)}
                            disabled={recalculando}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${recalculando ? 'animate-spin' : ''}`} />
                            {recalculando ? 'Recalculando...' : 'Recalcular Secciones'}
                        </Button>
                    </div>
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

                {/* Información Consolidada del Producto y Evidencias */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Información de la Comparación
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Información del Producto */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold text-lg mb-3">Producto Investigativo</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Título:</span>
                                    <p className="font-semibold">{producto.titulo}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Tipo de Producto:</span>
                                    <p className="font-medium">{producto.sub_tipo_producto.nombre}</p>
                                </div>
                            </div>
                        </div>

                        {/* Información de las Evidencias */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Evidencia 1 */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Evidencia 1</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm font-medium">Usuario:</span>
                                        <span>{evidencia1.usuario}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-medium">Período:</span>
                                        <span>{evidencia1.periodo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm font-medium">Secciones:</span>
                                        <Badge variant="outline">{evidencia1.secciones.length}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Evidencia 2 */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Evidencia 2</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm font-medium">Usuario:</span>
                                        <span>{evidencia2.usuario}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-medium">Período:</span>
                                        <span>{evidencia2.periodo}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="text-sm font-medium">Secciones:</span>
                                        <Badge variant="outline">{evidencia2.secciones.length}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Secciones de las Evidencias */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Secciones de las Evidencias
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Secciones de Evidencia 1 */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">
                                    Evidencia 1 - {evidencia1.usuario}
                                </h3>
                                <ScrollArea className="h-[600px] pr-4">
                                    <div className="space-y-4">
                                        {evidencia1.secciones.map((seccion) => (
                                            <div key={seccion.id} className="border rounded-lg p-4">
                                                <h4 className="font-semibold mb-2 text-blue-600">
                                                    {seccion.titulo}
                                                </h4>
                                                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                                    {seccion.contenido}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Secciones de Evidencia 2 */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">
                                    Evidencia 2 - {evidencia2.usuario}
                                </h3>
                                <ScrollArea className="h-[600px] pr-4">
                                    <div className="space-y-4">
                                        {evidencia2.secciones.map((seccion) => (
                                            <div key={seccion.id} className="border rounded-lg p-4">
                                                <h4 className="font-semibold mb-2 text-green-600">
                                                    {seccion.titulo}
                                                </h4>
                                                <div className="text-sm text-gray-600 whitespace-pre-wrap">
                                                    {seccion.contenido}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Seleccionar Secciones para Comparar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GitCompare className="h-5 w-5" />
                            Comparar Secciones Específicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <div>
                                <div className="text-sm font-medium mb-1">Sección A (Evidencia 1)</div>
                                <SearchSelect
                                    options={opcionesSeccionesE1}
                                    value={data.seccion1}
                                    side="top"
                                    onValueChange={(v) => setData('seccion1', String(v))}
                                    placeholder="Seleccionar sección de Evidencia 1..."
                                />
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Sección B (Evidencia 2)</div>
                                <SearchSelect
                                    options={opcionesSeccionesE2}
                                    value={data.seccion2}
                                    side="top"
                                    onValueChange={(v) => setData('seccion2', String(v))}
                                    placeholder="Seleccionar sección de Evidencia 2..."
                                />
                            </div>
                            <div>
                                <div className="text-sm font-medium mb-1">Elemento del Producto</div>
                                <SearchSelect
                                    options={elementos_producto.map(elemento => ({
                                        value: String(elemento.id),
                                        label: elemento.nombre,
                                    }))}
                                    value={data.elemento_producto_id}
                                    side="top"
                                    onValueChange={(v) => setData('elemento_producto_id', String(v))}
                                    placeholder="Seleccionar elemento..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-center mt-6">
                            <Button 
                                disabled={!data.seccion1 || !data.seccion2 || !data.elemento_producto_id || data.seccion1 === data.seccion2 || processing}
                                onClick={compararSecciones}
                            >
                                <GitCompare className="h-4 w-4 mr-2" />
                                {processing ? 'Comparando...' : 'Comparar Secciones'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Resultados de Comparaciones de Secciones */}
                {comparaciones_secciones.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Resultados de Comparaciones de Secciones
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {comparaciones_secciones.map((comparacionSeccion) => (
                                    <div key={comparacionSeccion.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-lg">
                                        {comparacionSeccion.seccion1.titulo} vs {comparacionSeccion.seccion2.titulo}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        {comparacionSeccion.elementoProducto && (
                                            <Badge variant="outline" className="text-sm">
                                                {comparacionSeccion.elementoProducto.nombre}
                                            </Badge>
                                        )}
                                        {comparacionSeccion.grado_similitud && (
                                            <Badge variant="outline" className="text-sm">
                                                {comparacionSeccion.grado_similitud}% similitud
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-blue-600">Sección A</h5>
                                                <div className="text-sm text-gray-600">
                                                    <div className="font-semibold">{comparacionSeccion.seccion1.titulo}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Período: {evidencia1.periodo}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-green-600">Sección B</h5>
                                                <div className="text-sm text-gray-600">
                                                    <div className="font-semibold">{comparacionSeccion.seccion2.titulo}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Período: {evidencia2.periodo}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {comparacionSeccion.resultado_similitud && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                <h6 className="font-medium mb-2">Análisis de IA:</h6>
                                                <p className="text-sm text-gray-700">
                                                    {comparacionSeccion.resultado_similitud}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                    </div>
                </CardContent>
            </Card>
        )}
            </div>

            {/* Dialog de confirmación para recalcular secciones */}
            <ConfirmDialog
                open={recalcularDialogOpen}
                onOpenChange={setRecalcularDialogOpen}
                title="Recalcular Secciones de Evidencias"
                description="¿Estás seguro de que deseas recalcular las secciones de las evidencias? Esta acción eliminará todas las secciones existentes y las comparaciones realizadas, y generará nuevas secciones basadas en el contenido actual de los archivos PDF."
                confirmText="Sí, Recalcular"
                cancelText="Cancelar"
                onConfirm={recalcularSecciones}
            />
        </AppLayout>
    );
}
