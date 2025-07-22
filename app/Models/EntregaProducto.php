<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'progreso_evidencia',
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
}
