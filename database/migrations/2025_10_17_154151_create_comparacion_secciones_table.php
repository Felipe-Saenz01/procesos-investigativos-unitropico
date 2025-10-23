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
        Schema::create('comparacion_secciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comparacion_evidencia_id')->constrained('comparacion_evidencias')->onDelete('cascade');
            $table->foreignId('seccion_1_id')->constrained('evidencia_secciones')->onDelete('cascade');
            $table->foreignId('seccion_2_id')->constrained('evidencia_secciones')->onDelete('cascade');
            $table->foreignId('elemento_producto_id')->constrained('elementos_productos')->onDelete('cascade');
            $table->decimal('grado_similitud', 5, 2)->nullable(); // 0.00 a 100.00
            $table->longText('resultado_similitud')->nullable();
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index('comparacion_evidencia_id');
            $table->index('seccion_1_id');
            $table->index('seccion_2_id');
            $table->index('elemento_producto_id');
            
            // Evitar comparaciones duplicadas de secciones
            $table->unique(['seccion_1_id', 'seccion_2_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comparacion_secciones');
    }
};