<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComparacionSeccion extends Model
{
    use HasFactory;

    protected $table = 'comparacion_secciones';

    protected $fillable = [
        'comparacion_evidencia_id',
        'seccion_1_id',
        'seccion_2_id',
        'elemento_producto_id',
        'grado_similitud',
        'resultado_similitud',
    ];

    protected $casts = [
        'grado_similitud' => 'decimal:2',
    ];

    /**
     * Comparación de evidencias a la que pertenece esta comparación de secciones
     */
    public function comparacionEvidencia(): BelongsTo
    {
        return $this->belongsTo(ComparacionEvidencia::class);
    }

    /**
     * Primera sección de la comparación
     */
    public function seccion1(): BelongsTo
    {
        return $this->belongsTo(EvidenciaSeccion::class, 'seccion_1_id');
    }

    /**
     * Segunda sección de la comparación
     */
    public function seccion2(): BelongsTo
    {
        return $this->belongsTo(EvidenciaSeccion::class, 'seccion_2_id');
    }

    /**
     * Elemento del producto al que pertenecen las secciones
     */
    public function elementoProducto(): BelongsTo
    {
        return $this->belongsTo(ElementosProducto::class, 'elemento_producto_id');
    }

    /**
     * Obtener o crear una comparación entre dos secciones
     */
    public static function obtenerOCrear(int $comparacionEvidenciaId, int $seccion1Id, int $seccion2Id, int $elementoProductoId): self
    {
        // Asegurar que siempre comparamos en el mismo orden (menor ID primero)
        if ($seccion1Id > $seccion2Id) {
            [$seccion1Id, $seccion2Id] = [$seccion2Id, $seccion1Id];
        }

        return self::firstOrCreate(
            [
                'comparacion_evidencia_id' => $comparacionEvidenciaId,
                'seccion_1_id' => $seccion1Id,
                'seccion_2_id' => $seccion2Id,
                'elemento_producto_id' => $elementoProductoId,
            ]
        );
    }
}