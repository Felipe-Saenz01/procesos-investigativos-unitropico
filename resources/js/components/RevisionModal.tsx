import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface RevisionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { estado: string; comentario: string }) => void;
    route: string; // Ruta para enviar la revisión
}

export function RevisionModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    route
}: RevisionModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        estado: '',
        comentario: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validar que se haya seleccionado un estado
        if (!data.estado || data.estado === '') {
            alert('Debes seleccionar un estado');
            return;
        }

        // Validar que se haya escrito un comentario
        if (!data.comentario.trim()) {
            alert('Debes escribir un comentario');
            return;
        }

        // Enviar la revisión usando useForm
        post(route, {
            onSuccess: () => {
                // Llamar al callback del padre
                onSubmit(data);
                // Limpiar el formulario
                reset();
                // Cerrar el modal
                onClose();
            },
            onError: () => {
                // Los errores se mostrarán automáticamente
            }
        });
    };

    const handleClose = () => {
        // Limpiar el formulario al cerrar
        reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Realizar Revisión</DialogTitle>
                    <DialogDescription>
                        Selecciona el nuevo estado y proporciona un comentario explicando tu decisión.
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="estado">Nuevo Estado</Label>
                        <Select 
                            value={data.estado} 
                            onValueChange={(value) => setData('estado', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Aprobado">Aprobado</SelectItem>
                                <SelectItem value="Corrección">Corrección</SelectItem>
                                <SelectItem value="Rechazado">Rechazado</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.estado && (
                            <p className="text-sm text-red-600">{errors.estado}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comentario">Comentario</Label>
                        <Textarea
                            id="comentario"
                            placeholder="Escribe tu comentario sobre la revisión..."
                            value={data.comentario}
                            onChange={(e) => setData('comentario', e.target.value)}
                            rows={4}
                            required
                        />
                        {errors.comentario && (
                            <p className="text-sm text-red-600">{errors.comentario}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || !data.estado || !data.comentario.trim()}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                'Realizar Revisión'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
