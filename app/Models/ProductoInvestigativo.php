<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductoInvestigativo extends Model
{
    /** @use HasFactory<\Database\Factories\ProductoInvestigativoFactory> */
    use HasFactory;

    protected $fillable = [
        'titulo',
        'resumen',
        'proyecto_investigacion_id',
        'user_id',
        'sub_tipo_producto_id',
        'progreso',
    ];

    // Relación con el usuario
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'producto_investigativo_user');
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(ProyectoInvestigativo::class, 'proyecto_investigacion_id');
    }

    // Relación con el subtipo de producto
    public function subTipoProducto(): BelongsTo
    {
        return $this->belongsTo(SubTipoProducto::class, 'sub_tipo_producto_id');
    }

    // Relación con las entregas
    public function entregas(): HasMany
    {
        return $this->hasMany(EntregaProducto::class);
    }

    // Relación con los elementos del producto
    public function elementos(): HasMany
    {
        return $this->hasMany(ElementosProducto::class, 'producto_investigativo_id');
    }
}
