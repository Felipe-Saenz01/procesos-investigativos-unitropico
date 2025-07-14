<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ElementosProducto extends Model
{
    use HasFactory;

    protected $fillable = [
        'producto_investigativo_id',
        'nombre',
        'progreso',
    ];

    protected $casts = [
        'progreso' => 'integer',
    ];

    public function productoInvestigativo(): BelongsTo
    {
        return $this->belongsTo(ProductoInvestigativo::class, 'producto_investigativo_id');
    }
} 