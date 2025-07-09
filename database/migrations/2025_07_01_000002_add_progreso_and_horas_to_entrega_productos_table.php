<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('entrega_productos', function (Blueprint $table) {
            $table->integer('progreso_planeacion')->default(0)->after('planeacion');
            $table->integer('progreso_evidencia')->default(0)->after('evidencia');
            $table->integer('horas_planeacion')->default(0)->after('progreso_evidencia');
            $table->integer('horas_evidencia')->default(0)->after('horas_planeacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entrega_productos', function (Blueprint $table) {
            $table->dropColumn(['progreso_planeacion', 'progreso_evidencia', 'horas_planeacion', 'horas_evidencia']);
        });
    }
}; 