<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoContrato extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'numero_periodos',
    ];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'tipo_contrato_id');
    }
}
