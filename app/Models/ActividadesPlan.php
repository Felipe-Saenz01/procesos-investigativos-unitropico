<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActividadesPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_trabajo_id',
        'actividad_investigacion_id',
        'periodo_id',
        'alcance',
        'entregable',
        'horas_semana',
        'total_horas',
        'porcentaje_progreso'
    ];

    /**
     * Relación con el plan de trabajo
     */
    public function planTrabajo(): BelongsTo
    {
        return $this->belongsTo(PlanTrabajo::class);
    }

    /**
     * Relación con la actividad de investigación
     */
    public function actividadInvestigacion(): BelongsTo
    {
        return $this->belongsTo(ActividadesInvestigacion::class);
    }

    /**
     * Relación con el período asociado a la actividad del plan
     */
    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class);
    }

    /**
     * Relación con evidencias registradas en informes
     */
    public function evidencias(): HasMany
    {
        return $this->hasMany(EvidenciaInforme::class, 'actividad_plan_id');
    }
}
