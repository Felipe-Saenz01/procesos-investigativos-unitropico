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
        Schema::create('proyecto_investigativos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            // $table->foreignId('user_id')->constrained('users');
            $table->string('eje_tematico');
            $table->text('resumen_ejecutivo');
            $table->text('planteamiento_problema');
            $table->text('antecedentes');
            $table->text('justificacion');
            $table->text('objetivos');
            $table->text('metodologia');
            $table->text('resultados');
            $table->text('riesgos');
            $table->text('bibliografia');
            $table->string('estado')->default('En formulación');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyecto_investigativos');
    }
};
