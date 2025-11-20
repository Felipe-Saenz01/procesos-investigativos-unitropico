<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('plan_trabajos', function (Blueprint $table) {
            $table->foreignId('periodo_inicio_id')
                ->nullable()
                ->after('user_id')
                ->constrained('periodos');

            $table->foreignId('periodo_fin_id')
                ->nullable()
                ->after('periodo_inicio_id')
                ->constrained('periodos');
        });

        // Copiar los valores existentes al nuevo rango de períodos
        DB::statement('UPDATE plan_trabajos SET periodo_inicio_id = periodo_id, periodo_fin_id = periodo_id');

        Schema::table('plan_trabajos', function (Blueprint $table) {
            $table->dropForeign(['periodo_id']);
            $table->dropColumn('periodo_id');
        });

        // Asegurar que los nuevos campos no queden nulos
        $this->setColumnNotNull('plan_trabajos', 'periodo_inicio_id');
        $this->setColumnNotNull('plan_trabajos', 'periodo_fin_id');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plan_trabajos', function (Blueprint $table) {
            $table->foreignId('periodo_id')
                ->nullable()
                ->after('user_id')
                ->constrained('periodos');
        });

        // Restaurar el valor anterior usando el período de inicio
        DB::statement('UPDATE plan_trabajos SET periodo_id = periodo_inicio_id');

        Schema::table('plan_trabajos', function (Blueprint $table) {
            $table->dropForeign(['periodo_inicio_id']);
            $table->dropForeign(['periodo_fin_id']);
            $table->dropColumn(['periodo_inicio_id', 'periodo_fin_id']);
        });

        $this->setColumnNotNull('plan_trabajos', 'periodo_id');
    }
    
    /**
     * Ajusta una columna para que no permita valores nulos considerando el motor de base de datos.
     */
    protected function setColumnNotNull(string $table, string $column): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE {$table} ALTER COLUMN {$column} SET NOT NULL");
            return;
        }

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` BIGINT UNSIGNED NOT NULL");
            return;
        }

        throw new RuntimeException("Driver de base de datos no soportado para modificar la columna {$column} en {$table}.");
    }
};

