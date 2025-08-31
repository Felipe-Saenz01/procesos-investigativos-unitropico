<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Convocatoria extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'estado'
    ];
    

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    // Relaciones
    public function requisitos(): HasMany
    {
        return $this->hasMany(RequisitosConvocatoria::class);
    }

    public function postulaciones(): HasMany
    {
        return $this->hasMany(Postulacion::class);
    }

    // Scopes
    public function scopeAbiertas($query)
    {
        return $query->where('estado', 'Abierta')
                    ->where('fecha_inicio', '<=', now())
                    ->where('fecha_fin', '>=', now());
    }

    public function scopeCerradas($query)
    {
        return $query->where('estado', 'Cerrada')
                    ->orWhere('fecha_fin', '<', now());
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', 'Pendiente');
    }

    // Métodos
    public function estaAbierta(): bool
    {
        return $this->estado === 'Abierta' && 
               $this->fecha_inicio <= now() && 
               $this->fecha_fin >= now();
    }

    public function estaCerrada(): bool
    {
        return $this->estado === 'Cerrada' || $this->fecha_fin < now();
    }

    public function diasRestantes(): int
    {
        if ($this->estaCerrada()) {
            return 0;
        }
        
        return Carbon::now()->diffInDays($this->fecha_fin, false);
    }

    public function puedePostularse(User $user): bool
    {
        // Solo líderes de grupo pueden postularse
        if (!$user->hasRole('Lider Grupo')) {
            return false;
        }

        // La convocatoria debe estar abierta
        if (!$this->estaAbierta()) {
            return false;
        }

        // El usuario no debe haberse postulado ya
        return !$this->postulaciones()->where('user_id', $user->id)->exists();
    }

    public function getEstadoBadgeAttribute(): string
    {
        if ($this->estaAbierta()) {
            return 'Abierta';
        } elseif ($this->estaCerrada()) {
            return 'Cerrada';
        } else {
            return $this->estado;
        }
    }
}
