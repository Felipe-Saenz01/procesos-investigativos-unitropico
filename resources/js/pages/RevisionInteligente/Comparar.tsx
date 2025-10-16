import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Revisión Inteligente',
        href: route('modulo-inteligente.index'),
    },
    {
        title: 'Comparar Evidencias',
        href: '#',
    }
];
interface iaResponse {
    similitud: number;
    analisis: string;
}

interface EvidenciaCmp { 
    id: number; 
    usuario: string | null; 
    periodo: string | null; 
    texto: string | null 
}
interface Props { 
    producto: { 
        id: number; 
        titulo: string 
    }; 
    e1: EvidenciaCmp; 
    e2: EvidenciaCmp; 
    ia: iaResponse | null;
    similitud: number | null;
}

export default function Comparar({ producto, e1, e2, ia, similitud }: Props) {
    console.log(ia);
    console.log(typeof ia);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Comparar: ${producto.titulo}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('modulo-inteligente.show', producto.id)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Evidencia A · {e1.periodo || '—'} · {e1.usuario || '—'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-sm whitespace-pre-wrap break-words max-h-[70vh] overflow-auto">{e1.texto || 'No fue posible extraer el texto del PDF.'}</pre>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Evidencia B · {e2.periodo || '—'} · {e2.usuario || '—'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-sm whitespace-pre-wrap break-words max-h-[70vh] overflow-auto">{e2.texto || 'No fue posible extraer el texto del PDF.'}</pre>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Resultado de IA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none whitespace-pre-wrap break-words">
                            {ia && (
                                <>
                                    {similitud && <p className="text-sm"><strong>Similitud del Coseno:</strong> {similitud}</p>}
                                    <p className="text-sm"><strong>Similitud:</strong> {ia.similitud}</p>
                                    <p className="text-sm"><strong>Análisis:</strong> {ia.analisis}</p>
                                </>
                            )}
                            {!ia && (
                                <div className="text-sm text-gray-600">No se obtuvo respuesta del análisis o faltan textos.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}


