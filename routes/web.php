<?php

use App\Http\Controllers\ElementosProductoController;
use App\Http\Controllers\EntregaProductoController;
use App\Http\Controllers\GrupoInvestigacionController;
use App\Http\Controllers\InvestigadorController;
use App\Http\Controllers\Parametros\PermisoController;
use App\Http\Controllers\Parametros\RolController;
use App\Http\Controllers\PeriodoController;
use App\Http\Controllers\ProductoInvestigativoController;
use App\Http\Controllers\ProyectoInvestigativoController;
use App\Http\Controllers\SubTipoProductoController;
use App\Http\Controllers\TipoProductoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Ruta raíz - Login page
Route::get('/', function () {
    return Inertia::render('auth/page', [
        'canResetPassword' => Route::has('password.request'),
        'status' => session('status'),
    ]);
})->middleware('guest')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::prefix('parametros')->name('parametros.')->group(function (){
        Route::resource('tipo-producto', TipoProductoController::class);
        Route::resource('subtipo-producto', SubTipoProductoController::class);
        Route::resource('periodo', PeriodoController::class);
        Route::resource('rol', RolController::class);
        Route::resource('permiso', PermisoController::class);
        Route::get('rol/{rol}/permisos', [\App\Http\Controllers\Parametros\RolController::class, 'permisos'])->name('rol.permisos');
        Route::put('rol/{rol}/permisos', [\App\Http\Controllers\Parametros\RolController::class, 'actualizarPermisos'])->name('rol.permisos.update');
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

    // Rutas para Proyectos Investigativos
    Route::resource('proyectos', ProyectoInvestigativoController::class);

    // Rutas para Productos Investigativos
    Route::resource('productos', ProductoInvestigativoController::class);

    // Rutas para Elementos de Productos
    Route::resource('productos.elementos', ElementosProductoController::class);

    // Rutas para Entregas de Productos
    Route::get('productos/{producto}/entregas/planeacion/create', [EntregaProductoController::class, 'createPlaneacion'])->name('entregas.planeacion.create');
    Route::post('productos/{producto}/entregas/planeacion', [EntregaProductoController::class, 'storePlaneacion'])->name('entregas.planeacion.store');
    Route::get('productos/{producto}/entregas/evidencia/create', [EntregaProductoController::class, 'createEvidencia'])->name('entregas.evidencia.create');
    Route::post('productos/{producto}/entregas/evidencia', [EntregaProductoController::class, 'storeEvidencia'])->name('entregas.evidencia.store');
    Route::get('entregas/{entregaProducto}', [EntregaProductoController::class, 'show'])->name('entregas.show');
    Route::get('entregas/{entregaProducto}/edit', [EntregaProductoController::class, 'edit'])->name('entregas.edit');
    Route::put('entregas/{entregaProducto}', [EntregaProductoController::class, 'update'])->name('entregas.update');
    Route::delete('entregas/{entregaProducto}', [EntregaProductoController::class, 'destroy'])->name('entregas.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
