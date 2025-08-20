<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActividadesPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_trabajo_id',
        'actividad_investigacion_id',
        'alcance',
        'entregable',
        'horas_semana',
        'total_horas'
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
}
