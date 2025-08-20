<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Revision extends Model
{
    protected $fillable = [
        'revisable_type',
        'revisable_id',
        'user_id',
        'estado',
        'comentario',
        'created_at',
        'updated_at'
    ];

    // Relación polimórfica con cualquier modelo (PlanTrabajo, Producto, etc.)
    public function revisable(): MorphTo
    {
        return $this->morphTo();
    }

    // Usuario que realiza la revisión
    public function revisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Scope para obtener revisiones por estado
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    // Scope para obtener revisiones por revisor
    public function scopePorRevisor($query, $revisorId)
    {
        return $query->where('user_id', $revisorId);
    }

    // Scope para obtener revisiones de un modelo específico
    public function scopeDeModelo($query, $modelo)
    {
        return $query->where('revisable_type', $modelo);
    }
}
