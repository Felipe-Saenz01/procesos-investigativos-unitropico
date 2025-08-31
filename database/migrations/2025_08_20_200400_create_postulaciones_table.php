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
        Schema::create('postulaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convocatoria_id')->constrained('convocatorias');
            $table->foreignId('user_id')->constrained('users');
            $table->string('estado')->default('Pendiente'); // Pendiente, En Revisión, Aprobada, Rechazada
            $table->timestamps();
            
            // Un usuario solo puede postularse una vez por convocatoria
            $table->unique(['convocatoria_id', 'user_id'], 'post_conv_user_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('postulaciones');
    }
};
