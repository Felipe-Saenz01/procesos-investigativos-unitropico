<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActividadesInvestigacion extends Model
{
    /** @use HasFactory<\Database\Factories\ActividadesInvestigacionFactory> */
    use HasFactory;

    protected $fillable = ['nombre', 'horas_maximas'];

    public function tiposProductos()
    {
        return $this->hasMany(TipoProducto::class);
    }
}
