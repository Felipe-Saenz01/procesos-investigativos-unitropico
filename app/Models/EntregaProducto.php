<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EntregaProducto extends Model
{
    /** @use HasFactory<\Database\Factories\EntregaProductoFactory> */
    use HasFactory;
    
    protected $fillable = [
        'tipo',
        'planeacion',
        'evidencia',
        'periodo_id',
        'user_id',
        'producto_investigativo_id',
        'progreso_planeacion',
        'horas_planeacion',
        'estado',
    ];

    protected $casts = [
        'planeacion' => 'array',
    ];

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class);
    }
    
    public function productoInvestigativo(): BelongsTo
    {
        return $this->belongsTo(ProductoInvestigativo::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Secciones extraídas de esta evidencia
     */
    public function secciones(): HasMany
    {
        return $this->hasMany(EvidenciaSeccion::class);
    }

    /**
     * Comparaciones donde esta evidencia es la primera
     */
    public function comparacionesComoEvidencia1(): HasMany
    {
        return $this->hasMany(ComparacionEvidencia::class, 'evidencia_1_id');
    }

    /**
     * Comparaciones donde esta evidencia es la segunda
     */
    public function comparacionesComoEvidencia2(): HasMany
    {
        return $this->hasMany(ComparacionEvidencia::class, 'evidencia_2_id');
    }
}
