<?php

namespace App\Models;

use App\Models\Traits\Revisable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PlanTrabajo extends Model
{
    use HasFactory, Revisable;

    protected $fillable = [
        'user_id',
        'periodo_id',
        'nombre',
        'vigencia',
        'estado'
    ];

    /**
     * Relación con el usuario propietario del plan
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el período asociado al plan
     */
    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class);
    }

    /**
     * Relación con las actividades del plan
     */
    public function actividades(): HasMany
    {
        return $this->hasMany(ActividadesPlan::class);
    }

    /**
     * Relación con los informes del plan
     */
    public function informes(): HasMany
    {
        return $this->hasMany(InformePlanTrabajo::class);
    }
}
