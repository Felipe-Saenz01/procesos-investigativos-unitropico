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
        Schema::create('evidencias_informe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('informe_id')->constrained('informes_plan_trabajo')->onDelete('cascade');
            $table->foreignId('actividad_plan_id')->constrained('actividades_plans')->onDelete('cascade');
            $table->enum('tipo_evidencia', ['Archivo', 'Enlace']);
            $table->string('ruta_archivo')->nullable();
            $table->string('url_link')->nullable();
            $table->unsignedTinyInteger('porcentaje_progreso_anterior');
            $table->unsignedTinyInteger('porcentaje_progreso_nuevo');
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evidencias_informe');
    }
};


