<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Periodo extends Model
{
    /** @use HasFactory<\Database\Factories\PeriodoFactory> */
    use HasFactory;

    protected $fillable = [
        'nombre', 
        'fecha_limite_planeacion', 
        'fecha_limite_evidencias',
        'estado'
    ];
    
    protected $casts = [
            'fecha_limite_planeacion' => 'date',
            'fecha_limite_evidencias' => 'date',
        ];

    public function entregas(): HasMany
    {
        return $this->hasMany(EntregaProducto::class);
    }

    public function horas(): HasMany
    {
        return $this->hasMany(HorasInvestigacion::class);
    }

    public function planesTrabajo(): HasMany
    {
        return $this->hasMany(PlanTrabajo::class, 'periodo_inicio_id');
    }

    public function planesTrabajoFin(): HasMany
    {
        return $this->hasMany(PlanTrabajo::class, 'periodo_fin_id');
    }

    public function informesPlanTrabajo(): HasMany
    {
        return $this->hasMany(InformePlanTrabajo::class);
    }
}
