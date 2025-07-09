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
        Schema::table('producto_investigativos', function (Blueprint $table) {
            $table->integer('progreso')->default(0)->after('sub_tipo_producto_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('producto_investigativos', function (Blueprint $table) {
            $table->dropColumn('progreso');
        });
    }
}; 