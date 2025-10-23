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
        Schema::create('evidencia_secciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entrega_producto_id')->constrained('entrega_productos')->onDelete('cascade');
            $table->string('titulo');
            $table->longText('contenido');
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index('entrega_producto_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evidencia_secciones');
    }
};