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
        Schema::create('revisions', function (Blueprint $table) {
            $table->id();
            
            // Relación polimórfica
            $table->string('revisable_type'); // Ej: 'App\Models\PlanTrabajo'
            $table->unsignedBigInteger('revisable_id'); // ID del modelo específico
            
            // Usuario que realiza la revisión
            $table->foreignId('user_id')->constrained('users');
            
            // Estado de la revisión
            $table->enum('estado', ['Pendiente', 'Corrección', 'Rechazado', 'Aprobado'])->default('Pendiente');
            
            // Comentario del revisor
            $table->text('comentario')->nullable();
            
            // Fecha de la revisión (cuando se cambia el estado)            
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index(['revisable_type', 'revisable_id']);
            $table->index('estado');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revisions');
    }
};
