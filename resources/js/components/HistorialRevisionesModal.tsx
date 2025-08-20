import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EstadoBadge } from '@/components/EstadoBadge';
import { History, Calendar, MessageSquare } from 'lucide-react';

interface Revision {
    id: number;
    estado: string;
    comentario: string;
    created_at: string;
    revisor?: {
        name: string;
    };
}

interface HistorialRevisionesModalProps {
    isOpen: boolean;
    onClose: () => void;
    revisiones: Revision[];
    titulo?: string;
}

export function HistorialRevisionesModal({ 
    isOpen, 
    onClose, 
    revisiones,
    titulo = "Historial de Revisiones"
}: HistorialRevisionesModalProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {titulo}
                    </DialogTitle>
                    <DialogDescription>
                        Revisa el historial completo de cambios de estado y comentarios.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="mt-4">
                    {revisiones.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No hay revisiones registradas aún.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {revisiones
                                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                    .map((revision) => (
                                    <div 
                                        key={revision.id} 
                                        className={`border-l-4 pl-4 py-3 ${
                                            revision.estado === 'Aprobado' ? 'border-green-500' :
                                            revision.estado === 'Corrección' ? 'border-orange-500' :
                                            revision.estado === 'Rechazado' ? 'border-red-500' :
                                            'border-gray-300'
                                        } bg-gray-100 dark:bg-gray-950/20` }
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <EstadoBadge estado={revision.estado} size="sm" />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    por {revision.revisor?.name || 'Usuario'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mr-2">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(revision.created_at)}
                                            </div>
                                        </div>
                                        
                                        {revision.comentario && (
                                            <div className="mt-2">
                                                <div className="flex items-start gap-2">
                                                    <MessageSquare className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                        {revision.comentario}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* {index < revisiones.length - 1 && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"></div>
                                        )} */}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={onClose} variant="outline">
                        Cerrar
                    </Button>
                </div> */}
            </DialogContent>
        </Dialog>
    );
}
