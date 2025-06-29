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
        Schema::create('entrega_productos', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo', ['planeacion', 'evidencia']);
            $table->json('planeacion')->nullable();
            $table->foreignId('periodo_id')->constrained('periodos');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('producto_investigativo_id')->constrained('producto_investigativos');
            $table->string('evidencia')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entrega_productos');
    }
};
