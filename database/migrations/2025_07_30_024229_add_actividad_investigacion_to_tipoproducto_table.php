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
        Schema::table('tipo_productos', function (Blueprint $table) {
            $table->foreignId('actividad_investigacion_id')->constrained('actividades_investigacions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tipo_productos', function (Blueprint $table) {
            $table->dropForeign(['actividad_investigacion_id']);
            $table->dropColumn('actividad_investigacion_id');
        });
    }
};
