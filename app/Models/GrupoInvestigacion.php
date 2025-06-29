<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GrupoInvestigacion extends Model
{
    /** @use HasFactory<\Database\Factories\GrupoInvestigacionFactory> */
    use HasFactory;

    protected $fillable = ['nombre', 'correo'];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function proyectos(): BelongsToMany
    {
        return $this->belongsToMany(ProyectoInvestigativo::class, 'proyecto_grupo');
    }
}
