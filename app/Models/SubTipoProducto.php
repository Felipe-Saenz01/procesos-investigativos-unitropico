<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubTipoProducto extends Model
{
    /** @use HasFactory<\Database\Factories\SubTipoProductoFactory> */
    use HasFactory;

    protected $fillable = [
        'nombre',
        'tipo_producto_id',
    ];

    public function tipoProducto() {
        return $this->belongsTo(TipoProducto::class);
    }
}
