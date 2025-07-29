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
            $table->foreignId('escalafon_profesoral_id')->nullable()->constrained('escalafon_profesorals');
            $table->foreignId('tipo_contrato_id')->nullable()->constrained('tipo_contratos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['escalafon_profesoral_id']);
            $table->dropForeign(['tipo_contrato_id']);
            $table->dropColumn('escalafon_profesoral_id');
            $table->dropColumn('tipo_contrato_id');
        });
    }
};
