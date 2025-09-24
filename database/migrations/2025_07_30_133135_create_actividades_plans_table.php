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
        Schema::create('actividades_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_trabajo_id')->constrained('plan_trabajos')->onDelete('cascade');
            $table->foreignId('actividad_investigacion_id')->constrained('actividades_investigacions');
            $table->foreignId('periodo_id')->constrained('periodos');
            $table->string('alcance');
            $table->text('entregable');
            $table->integer('horas_semana');
            $table->integer('total_horas');
            $table->unsignedTinyInteger('porcentaje_progreso')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('actividades_plans');
    }
};
