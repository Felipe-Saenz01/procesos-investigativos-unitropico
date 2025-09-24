<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InformePlanTrabajo extends Model
{
    use HasFactory;

    protected $table = 'informes_plan_trabajo';

    protected $fillable = [
        'plan_trabajo_id',
        'periodo_id',
        'investigador_id',
        'fecha_informe',
        'descripcion_general',
    ];

    public function planTrabajo(): BelongsTo
    {
        return $this->belongsTo(PlanTrabajo::class);
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class);
    }

    public function investigador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'investigador_id');
    }

    public function evidencias(): HasMany
    {
        return $this->hasMany(EvidenciaInforme::class, 'informe_id');
    }
}


