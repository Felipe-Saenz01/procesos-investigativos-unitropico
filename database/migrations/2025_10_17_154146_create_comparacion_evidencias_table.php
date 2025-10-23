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
        Schema::create('comparacion_evidencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evidencia_1_id')->constrained('entrega_productos')->onDelete('cascade');
            $table->foreignId('evidencia_2_id')->constrained('entrega_productos')->onDelete('cascade');
            $table->decimal('grado_similitud', 5, 2)->nullable(); // 0.00 a 100.00
            $table->longText('resultado_similitud')->nullable();
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index('evidencia_1_id');
            $table->index('evidencia_2_id');
            
            // Evitar comparaciones duplicadas (A vs B y B vs A)
            $table->unique(['evidencia_1_id', 'evidencia_2_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comparacion_evidencias');
    }
};