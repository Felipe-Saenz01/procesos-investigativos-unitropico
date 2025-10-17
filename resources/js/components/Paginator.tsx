import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

type PaginationLinkItem = { url: string | null; label: string; active: boolean };

interface PaginatorProps {
    links?: PaginationLinkItem[];
    className?: string;
}

export default function Paginator({ links, className }: PaginatorProps) {
    if (!Array.isArray(links) || links.length === 0) return null;

    return (
        <div className={className || 'pt-4'}>
            <Pagination>
                <PaginationContent>
                    {links.map((link: PaginationLinkItem, idx: number) => {
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
    );
}


