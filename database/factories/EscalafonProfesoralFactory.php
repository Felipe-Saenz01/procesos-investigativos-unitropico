<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EscalafonProfesoral>
 */
class EscalafonProfesoralFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->randomElement(['Auxiliar', 'Asistente', 'Asociado', 'Titular']),
            'horas_semanales' => $this->faker->randomElement([20, 30, 40]),
        ];
    }
}