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
        Schema::table('users', function (Blueprint $table) {
            // Agregar el campo 'role' (tipo de usuario)
            $table->string('tipo')->default('Investigador'); // Valores: administrador, lider, investigador
            // Agregar la clave foránea 'grupo_investigacion_id'
            $table->foreignId('grupo_investigacion_id')
                  ->nullable() // Permite valores nulos
                  ->constrained('grupo_investigacions'); // Referencia a la tabla 'grupo_investigacions'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            /// Eliminar la clave foránea 'grupo_investigacion_id'
            $table->dropForeign(['grupo_investigacion_id']); // Eliminar la restricción de clave foránea
            $table->dropColumn('grupo_investigacion_id'); // Eliminar la columna

            // Eliminar el campo 'tipo'
            $table->dropColumn('tipo');
        });
    }
};
