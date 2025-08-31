<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Postulacion extends Model
{
    use HasFactory;

    protected $fillable = [
        'convocatoria_id',
        'user_id',
        'estado',
        'created_at',
        'updated_at'
    ];

    protected $table = 'postulaciones';

    // Estados posibles
    const ESTADO_PENDIENTE = 'Pendiente';
    const ESTADO_EN_REVISION = 'En Revisión';
    const ESTADO_APROBADA = 'Aprobada';
    const ESTADO_RECHAZADA = 'Rechazada';

    // Relaciones
    public function convocatoria(): BelongsTo
    {
        return $this->belongsTo(Convocatoria::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(ArchivoPostulacion::class);
    }

    // Scopes
    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    public function scopeEnRevision($query)
    {
        return $query->where('estado', self::ESTADO_EN_REVISION);
    }

    public function scopeAprobadas($query)
    {
        return $query->where('estado', self::ESTADO_APROBADA);
    }

    public function scopeRechazadas($query)
    {
        return $query->where('estado', self::ESTADO_RECHAZADA);
    }

    // Métodos
    public function puedeRevisar(): bool
    {
        return in_array($this->estado, [self::ESTADO_PENDIENTE, self::ESTADO_EN_REVISION]);
    }

    public function puedeAprobar(): bool
    {
        return $this->estado === self::ESTADO_EN_REVISION;
    }

    public function puedeRechazar(): bool
    {
        return in_array($this->estado, [self::ESTADO_PENDIENTE, self::ESTADO_EN_REVISION]);
    }

    public function marcarEnRevision(): void
    {
        $this->update(['estado' => self::ESTADO_EN_REVISION]);
    }

    public function aprobar(): void
    {
        $this->update(['estado' => self::ESTADO_APROBADA]);
    }

    public function rechazar(): void
    {
        $this->update(['estado' => self::ESTADO_RECHAZADA]);
    }

    public function getEstadoBadgeAttribute(): string
    {
        return $this->estado;
    }

    // Método para obtener la ruta de la carpeta de archivos
    public function getCarpetaArchivosAttribute(): string
    {
        return "convocatorias/{$this->id}";
    }
}
