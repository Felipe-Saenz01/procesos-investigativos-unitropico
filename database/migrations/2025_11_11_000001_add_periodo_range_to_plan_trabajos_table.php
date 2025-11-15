<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
        DB::statement('ALTER TABLE plan_trabajos ALTER COLUMN periodo_inicio_id SET NOT NULL');
        DB::statement('ALTER TABLE plan_trabajos ALTER COLUMN periodo_fin_id SET NOT NULL');
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

        DB::statement('ALTER TABLE plan_trabajos ALTER COLUMN periodo_id SET NOT NULL');
    }
};

