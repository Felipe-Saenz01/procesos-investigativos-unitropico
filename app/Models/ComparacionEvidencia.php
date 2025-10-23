<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ComparacionEvidencia extends Model
{
    use HasFactory;

    protected $table = 'comparacion_evidencias';

    protected $fillable = [
        'evidencia_1_id',
        'evidencia_2_id',
        'grado_similitud',
        'resultado_similitud',
    ];

    protected $casts = [
        'grado_similitud' => 'decimal:2',
    ];

    /**
     * Primera evidencia de la comparación
     */
    public function evidencia1(): BelongsTo
    {
        return $this->belongsTo(EntregaProducto::class, 'evidencia_1_id');
    }

    /**
     * Segunda evidencia de la comparación
     */
    public function evidencia2(): BelongsTo
    {
        return $this->belongsTo(EntregaProducto::class, 'evidencia_2_id');
    }

    /**
     * Comparaciones de secciones dentro de esta comparación de evidencias
     */
    public function comparacionesSecciones(): HasMany
    {
        return $this->hasMany(ComparacionSeccion::class);
    }

    /**
     * Obtener o crear una comparación entre dos evidencias
     */
    public static function obtenerOCrear(int $evidencia1Id, int $evidencia2Id): self
    {
        // Asegurar que siempre comparamos en el mismo orden (menor ID primero)
        if ($evidencia1Id > $evidencia2Id) {
            [$evidencia1Id, $evidencia2Id] = [$evidencia2Id, $evidencia1Id];
        }

        return self::firstOrCreate(
            [
                'evidencia_1_id' => $evidencia1Id,
                'evidencia_2_id' => $evidencia2Id,
            ]
        );
    }
}