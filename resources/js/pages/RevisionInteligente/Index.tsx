import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileText, Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Revisión Inteligente',
        href: route('modulo-inteligente.index'),
    },
];

interface SubTipo { id: number; nombre: string }
interface ProductoItem {
    id: number;
    titulo: string;
    usuarios: { id: number; name: string }[];
    sub_tipo_producto: SubTipo;
    evidencias_count: number;
}

interface PaginationLinkItem { url: string | null; label: string; active: boolean }
interface ProductosPage {
    data: ProductoItem[];
    links: PaginationLinkItem[];
    prev_page_url?: string | null;
    next_page_url?: string | null;
}

interface IndexProps { productos: ProductosPage }

export default function RevisionInteligenteIndex({ productos }: IndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revisión Inteligente" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight">Revisión Inteligente</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productos.data.map((p: ProductoItem) => (
                        <Card key={p.id}>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span className="truncate" title={p.titulo}>{p.titulo}</span>
                                    <span className="text-xs rounded-full bg-blue-100 text-blue-700 px-2 py-0.5">{p.evidencias_count} evidencias</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-sm text-gray-600">
                                    Usuarios: {p.usuarios && p.usuarios.length > 0 ? p.usuarios.map((u: { id: number; name: string }) => u.name).join(', ') : '—'}
                                </div>
                                <div className="text-sm text-gray-600">Tipo: {p.sub_tipo_producto?.nombre}</div>
                                <div className="pt-2">
                                    <Link href={route('modulo-inteligente.show', p.id)} className="inline-flex items-center text-blue-600 hover:underline">
                                        <Search className="h-4 w-4 mr-1" /> Seleccionar evidencias
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {productos.data.length === 0 && (
                    <div className="text-center text-gray-500 py-20">
                        <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                        No hay productos con evidencias suficientes aún.
                    </div>
                )}

                {Array.isArray(productos.links) && productos.links.length > 0 && (
                    <div className="pt-4">
                        <Pagination>
                            <PaginationContent>
                                {productos.links.map((link: PaginationLinkItem, idx: number) => {
                                    const label = String(link.label || '');
                                    const isPrev = /Anterior|Previous|«|&laquo;/.test(label);
                                    const isNext = /Siguiente|Next|»|&raquo;/.test(label);
                                    const href = link.url || '#';

                                    if (isPrev) {
                                        return (
                                            <PaginationItem key={`prev-${idx}`}>
                                                <PaginationPrevious href={href} size="sm" />
                                            </PaginationItem>
                                        );
                                    }
                                    if (isNext) {
                                        return (
                                            <PaginationItem key={`next-${idx}`}>
                                                <PaginationNext href={href} size="sm" />
                                            </PaginationItem>
                                        );
                                    }
                                    return (
                                        <PaginationItem key={`p-${idx}`}>
                                            <PaginationLink href={href} isActive={!!link.active} size="sm" dangerouslySetInnerHTML={{ __html: label }} />
                                        </PaginationItem>
                                    );
                                })}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}


