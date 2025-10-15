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
     * Estados válidos para el plan de trabajo
     */
    public const ESTADOS_VALIDOS = [
        'Creado',
        'Pendiente',
        'Corrección',
        'Aprobado',
        'Rechazado',
        'Terminado'
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

    /**
     * Verifica si el plan debe ser terminado automáticamente por tiempo
     */
    public function debeSerTerminado(): bool
    {
        if ($this->estado !== 'Aprobado') {
            return false;
        }

        $fechaCreacion = $this->created_at;
        $mesesTranscurridos = $fechaCreacion->diffInMonths(now());

        // Si es semestral (6 meses) o anual (12 meses)
        if ($this->vigencia === 'Semestral' && $mesesTranscurridos >= 6) {
            return true;
        }

        if ($this->vigencia === 'Anual' && $mesesTranscurridos >= 12) {
            return true;
        }

        return false;
    }

    /**
     * Marca el plan como terminado
     */
    public function marcarComoTerminado(): bool
    {
        if ($this->estado === 'Aprobado') {
            $this->estado = 'Terminado';
            return $this->save();
        }
        return false;
    }
}
