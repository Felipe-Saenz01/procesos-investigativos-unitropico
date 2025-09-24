<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvidenciaInforme extends Model
{
    use HasFactory;

    protected $table = 'evidencias_informe';

    protected $fillable = [
        'informe_id',
        'actividad_plan_id',
        'tipo_evidencia',
        'ruta_archivo',
        'url_link',
        'porcentaje_progreso_anterior',
        'porcentaje_progreso_nuevo',
        'descripcion',
    ];

    public function informe(): BelongsTo
    {
        return $this->belongsTo(InformePlanTrabajo::class, 'informe_id');
    }

    public function actividadPlan(): BelongsTo
    {
        return $this->belongsTo(ActividadesPlan::class, 'actividad_plan_id');
    }
}


