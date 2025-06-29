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
        Schema::create('proyecto_grupo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proyecto_investigativo_id')->constrained('proyecto_investigativos');
            $table->foreignId('grupo_investigacion_id')->constrained('grupo_investigacions');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyecto_grupo');
    }
};
