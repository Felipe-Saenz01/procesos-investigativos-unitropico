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

    // Alias con nombre más simple por consistencia en controladores
    public function tipos()
    {
        return $this->hasMany(TipoProducto::class, 'actividad_investigacion_id');
    }
}
