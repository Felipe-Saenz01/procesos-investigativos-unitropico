<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProyectoInvestigativo extends Model
{
    /** @use HasFactory<\Database\Factories\ProyectoInvestigativoFactory> */
    use HasFactory;

    protected $fillable = [
        'titulo',
        'user_id',
        'eje_tematico',
        'resumen_ejecutivo',
        'planteamiento_problema',
        'antecedentes',
        'justificacion',
        'objetivos',
        'metodologia',
        'resultados',
        'riesgos',
        'bibliografia',
        'actividades',
        'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'actividades' => 'array',
    ];

    public function productos(): HasMany
    {
        return $this->hasMany(ProductoInvestigativo::class, 'proyecto_investigacion_id');
    }

    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_proyecto', 'proyecto_investigativo_id', 'user_id');
    }

    public function actividades()
    {
        return $this->hasMany(ActividadesProyecto::class, 'proyecto_investigativo_id');
    }

    public function grupos(): BelongsToMany
    {
        return $this->belongsToMany(GrupoInvestigacion::class, 'proyecto_grupo', 'proyecto_investigativo_id', 'grupo_investigacion_id');
    }
}
