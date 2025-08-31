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
        Schema::create('archivos_postulacions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('postulacion_id')->constrained('postulaciones');
            $table->foreignId('requisito_convocatoria_id')->constrained('requisitos_convocatorias');
            $table->string('nombre_original');
            $table->string('nombre_archivo'); // Nombre único en el servidor
            $table->string('ruta_archivo'); // Ruta relativa en storage
            $table->string('tipo_mime');
            $table->integer('tamaño_bytes');
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            // Un requisito solo puede tener un archivo por postulación
            $table->unique(['postulacion_id', 'requisito_convocatoria_id'], 'arch_post_req_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archivos_postulacions');
    }
};
