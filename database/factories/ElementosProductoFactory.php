<?php

namespace Database\Factories;

use App\Models\ElementosProducto;
use App\Models\ProductoInvestigativo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ElementosProducto>
 */
class ElementosProductoFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ElementosProducto::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'producto_investigativo_id' => ProductoInvestigativo::factory(),
            'nombre' => $this->faker->sentence(3),
            'progreso' => $this->faker->numberBetween(0, 100),
        ];
    }
} 