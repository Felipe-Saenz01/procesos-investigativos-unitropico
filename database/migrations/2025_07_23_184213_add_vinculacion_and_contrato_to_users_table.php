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
            $table->foreignId('tipo_vinculacion_id')->nullable()->constrained('tipo_vinculacions');
            $table->foreignId('tipo_contrato_id')->nullable()->constrained('tipo_contratos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tipo_vinculacion_id']);
            $table->dropForeign(['tipo_contrato_id']);
            $table->dropColumn('tipo_vinculacion_id');
            $table->dropColumn('tipo_contrato_id');
        });
    }
};
