<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

use Database\Seeders\PlanesTrabajoDemoSeeder;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Seed de demostración para Planes de Trabajo (se ejecuta solo a demanda)
Artisan::command('seed:planes-demo', function () {
    $this->info('Sembrando datos de demostración de Planes de Trabajo...');
    try {
        $this->call(PlanesTrabajoDemoSeeder::class);
        $this->info('Datos de demostración creados correctamente.');
    } catch (\Throwable $e) {
        Log::error('Error ejecutando seed:planes-demo: ' . $e->getMessage());
        $this->error('Error: ' . $e->getMessage());
    }
})->purpose('Crea datos de prueba de planes de trabajo e informes por período');
