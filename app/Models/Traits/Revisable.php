<?php

namespace App\Models\Traits;

use App\Models\Revision;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Revisable
{
    // Solo para obtener el historial de revisiones
    public function revisiones(): MorphMany
    {
        return $this->morphMany(Revision::class, 'revisable');
    }

    // Crear una nueva revisión (para el historial)
    public function crearRevision(array $datos): Revision
    {
        return $this->revisiones()->create($datos);
    }
}
