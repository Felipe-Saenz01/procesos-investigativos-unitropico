<?php

use App\Http\Controllers\GrupoInvestigacionController;
use App\Http\Controllers\InvestigadorController;
use App\Http\Controllers\PeriodoController;
use App\Http\Controllers\SubTipoProductoController;
use App\Http\Controllers\TipoProductoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('parametros')->name('parametros.')->group(function (){
        Route::resource('tipo-producto', TipoProductoController::class);
        Route::resource('subtipo-producto', SubTipoProductoController::class);
        Route::resource('periodo', PeriodoController::class);
    });

    Route::resource('grupo-investigacion', GrupoInvestigacionController::class);
    
    // Rutas para Investigadores
    Route::get('investigadores', [InvestigadorController::class, 'index'])->name('investigadores.index');
    Route::get('investigadores/{investigador}/edit', [InvestigadorController::class, 'edit'])->name('investigadores.edit');
    Route::put('investigadores/{investigador}', [InvestigadorController::class, 'update'])->name('investigadores.update');
    
    // Rutas para horas de investigación
    Route::get('investigadores/{investigador}/horas', [InvestigadorController::class, 'horas'])->name('investigadores.horas');
    Route::post('investigadores/{investigador}/horas', [InvestigadorController::class, 'storeHoras'])->name('investigadores.storeHoras');
    Route::put('investigadores/{investigador}/horas/{horasInvestigacion}', [InvestigadorController::class, 'updateHoras'])->name('investigadores.updateHoras');
    Route::delete('investigadores/{investigador}/horas/{horasInvestigacion}', [InvestigadorController::class, 'destroyHoras'])->name('investigadores.destroyHoras');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
