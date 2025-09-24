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
        Schema::create('informes_plan_trabajo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_trabajo_id')->constrained('plan_trabajos')->onDelete('cascade');
            $table->foreignId('periodo_id')->constrained('periodos');
            $table->foreignId('investigador_id')->constrained('users');
            $table->date('fecha_informe');
            $table->text('descripcion_general')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('informes_plan_trabajo');
    }
};


