<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EscalafonProfesoral extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'horas_semanales'];

    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'escalafon_profesoral_id');
    }
}