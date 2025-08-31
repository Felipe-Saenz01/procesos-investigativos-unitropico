<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CleanDatabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:clean';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Limpia la base de datos eliminando tablas problemáticas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando limpieza de la base de datos...');

        // Deshabilitar verificación de claves foráneas temporalmente
        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        // Lista de tablas a eliminar en orden correcto
        $tablesToDrop = [
            'archivos_postulacion',
            'postulaciones',
            'requisitos_convocatorias',
            'convocatorias'
        ];

        foreach ($tablesToDrop as $table) {
            if (Schema::hasTable($table)) {
                $this->info("Eliminando tabla: {$table}");
                Schema::dropIfExists($table);
            } else {
                $this->info("Tabla {$table} no existe, continuando...");
            }
        }

        // Habilitar verificación de claves foráneas
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $this->info('Limpieza completada. Ahora puedes ejecutar las migraciones nuevamente.');
    }
}

