<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvidenciaSeccion extends Model
{
    use HasFactory;

    protected $table = 'evidencia_secciones';

    protected $fillable = [
        'entrega_producto_id',
        'titulo',
        'contenido',
    ];

    /**
     * Relación con la entrega de producto (evidencia)
     */
    public function entregaProducto(): BelongsTo
    {
        return $this->belongsTo(EntregaProducto::class);
    }

    /**
     * Comparaciones donde esta sección es la primera
     */
    public function comparacionesComoSeccion1(): HasMany
    {
        return $this->hasMany(ComparacionSeccion::class, 'seccion_1_id');
    }

    /**
     * Comparaciones donde esta sección es la segunda
     */
    public function comparacionesComoSeccion2(): HasMany
    {
        return $this->hasMany(ComparacionSeccion::class, 'seccion_2_id');
    }

    /**
     * Todas las comparaciones de esta sección (como sección 1 o 2)
     */
    public function todasLasComparaciones()
    {
        return ComparacionSeccion::where('seccion_1_id', $this->id)
            ->orWhere('seccion_2_id', $this->id);
    }
}