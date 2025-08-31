<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ArchivoPostulacion extends Model
{
    use HasFactory;

    protected $fillable = [
        'postulacion_id',
        'requisito_convocatoria_id',
        'nombre_original',
        'nombre_archivo',
        'ruta_archivo',
        'tipo_mime',
        'tamaño_bytes',
        'observaciones'
    ];

    protected $table = 'archivos_postulacions';

    protected $casts = [
        'tamaño_bytes' => 'integer',
        'observaciones' => 'string',
    ];

    // Relaciones
    public function postulacion(): BelongsTo
    {
        return $this->belongsTo(Postulacion::class);
    }

    public function requisitoConvocatoria(): BelongsTo
    {
        return $this->belongsTo(RequisitosConvocatoria::class);
    }

    // Métodos
    public function getUrlAttribute(): string
    {
        return Storage::url($this->ruta_archivo);
    }

    public function getTamañoFormateadoAttribute(): string
    {
        $bytes = $this->tamaño_bytes;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getExtensionAttribute(): string
    {
        return pathinfo($this->nombre_original, PATHINFO_EXTENSION);
    }

    public function esImagen(): bool
    {
        return str_starts_with($this->tipo_mime, 'image/');
    }

    public function esPDF(): bool
    {
        return $this->tipo_mime === 'application/pdf';
    }

    public function esDocumento(): bool
    {
        return in_array($this->tipo_mime, [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]);
    }

    public function eliminarArchivo(): bool
    {
        if (Storage::exists($this->ruta_archivo)) {
            return Storage::delete($this->ruta_archivo);
        }
        return true;
    }

    // Hook para eliminar archivo físico cuando se elimina el registro
    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($archivo) {
            $archivo->eliminarArchivo();
        });
    }
}
