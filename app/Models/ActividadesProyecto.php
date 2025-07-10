<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActividadesProyecto extends Model
{
    protected $fillable = [
        'proyecto_investigativo_id',
        'user_id',
        'nombre',
        'fecha_inicio',
        'fecha_fin',
    ];

    public function proyecto()
    {
        return $this->belongsTo(ProyectoInvestigativo::class, 'proyecto_investigativo_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
