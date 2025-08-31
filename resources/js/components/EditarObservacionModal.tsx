import React from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivo: {
    id: number;
    nombre_original: string;
    observaciones?: string | null;
  };
  onSave: (observacion: string) => void;
}

export default function EditarObservacionModal({ open, onOpenChange, archivo, onSave }: Props) {
  const { data, setData, processing, errors } = useForm({
    observacion: archivo.observaciones || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data.observacion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Observaciones</DialogTitle>
          <DialogDescription>
            Actualiza las observaciones para el archivo "{archivo.nombre_original}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="observacion">Observaciones</Label>
              <Textarea
                id="observacion"
                placeholder="Agrega comentarios o notas sobre este documento..."
                value={data.observacion}
                onChange={(e) => setData('observacion', e.target.value)}
                rows={4}
              />
              {errors.observacion && (
                <p className="text-sm text-red-600">{errors.observacion}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Guardando...' : 'Guardar Observación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
