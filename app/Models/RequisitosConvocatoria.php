<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RequisitosConvocatoria extends Model
{
    //

    protected $fillable = [
        'nombre',
        'descripcion',
        'obligatorio',
        'tipo_archivo',
        'convocatoria_id',
        'created_at',
        'updated_at'
    ];

    public function convocatoria(): BelongsTo
    {
        return $this->belongsTo(Convocatoria::class);
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(ArchivoPostulacion::class, 'requisito_convocatoria_id');
    }
}
