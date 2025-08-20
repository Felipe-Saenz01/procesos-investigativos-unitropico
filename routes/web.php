<?php

use App\Http\Controllers\ElementosProductoController;
use App\Http\Controllers\EntregaProductoController;
use App\Http\Controllers\GrupoInvestigacionController;
use App\Http\Controllers\InvestigadorController;
use App\Http\Controllers\Parametros\PermisoController;
use App\Http\Controllers\Parametros\RolController;
use App\Http\Controllers\Parametros\EscalafonProfesoralController;
use App\Http\Controllers\Parametros\ActividadesInvestigacionController;
use App\Http\Controllers\PdfController;
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
        Route::resource('escalafon-profesoral', EscalafonProfesoralController::class);
        Route::resource('tipo-contrato', \App\Http\Controllers\Parametros\TipoContratoController::class);
        Route::resource('actividades-investigacion', ActividadesInvestigacionController::class);
        Route::get('rol/{rol}/permisos', [\App\Http\Controllers\Parametros\RolController::class, 'permisos'])->name('rol.permisos');
        Route::put('rol/{rol}/permisos', [\App\Http\Controllers\Parametros\RolController::class, 'actualizarPermisos'])->name('rol.permisos.update');
    });

    Route::resource('grupo-investigacion', GrupoInvestigacionController::class);
    
    // Rutas para Investigadores
    Route::get('investigadores', [InvestigadorController::class, 'index'])->name('investigadores.index');
    Route::get('investigadores/create', [InvestigadorController::class, 'create'])->name('investigadores.create');
    Route::post('investigadores', [InvestigadorController::class, 'store'])->name('investigadores.store');
    Route::get('investigadores/{investigador}/edit', [InvestigadorController::class, 'edit'])->name('investigadores.edit');
    Route::put('investigadores/{investigador}', [InvestigadorController::class, 'update'])->name('investigadores.update');
    Route::delete('investigadores/{investigador}', [InvestigadorController::class, 'destroy'])->name('investigadores.destroy');
    
    // Rutas para horas de investigación
    Route::get('investigadores/{investigador}/horas', [ InvestigadorController::class, 'horas'])->name('investigadores.horas');
    Route::get('investigadores/{investigador}/horas/create', [InvestigadorController::class, 'createHoras'])->name('investigadores.horas.create');
    Route::post('investigadores/{investigador}/horas', [InvestigadorController::class, 'storeHoras'])->name('investigadores.horas.store');
    Route::get('investigadores/{investigador}/horas/{horasInvestigacion}/edit', [InvestigadorController::class, 'editHoras'])->name('investigadores.horas.edit');
    Route::put('investigadores/{investigador}/horas/{horasInvestigacion}', [InvestigadorController::class, 'updateHoras'])->name('investigadores.horas.update');
    Route::delete('investigadores/{investigador}/horas/{horasInvestigacion}', [InvestigadorController::class, 'destroyHoras'])->name('investigadores.horas.destroy');

    // Rutas para planes de trabajo
    Route::get('investigadores/{investigador}/planes-trabajo', [InvestigadorController::class, 'planesTrabajo'])->name('investigadores.planes-trabajo');
    Route::get('investigadores/{investigador}/planes-trabajo/create', [InvestigadorController::class, 'createPlanTrabajo'])->name('investigadores.planes-trabajo.create');
    Route::post('investigadores/{investigador}/planes-trabajo', [InvestigadorController::class, 'storePlanTrabajo'])->name('investigadores.planes-trabajo.store');
    Route::get('investigadores/{investigador}/planes-trabajo/{planTrabajo}', [InvestigadorController::class, 'showPlanTrabajo'])->name('investigadores.planes-trabajo.show');
    Route::get('investigadores/{investigador}/planes-trabajo/{planTrabajo}/edit', [InvestigadorController::class, 'editPlanTrabajo'])->name('investigadores.planes-trabajo.edit');
    Route::put('investigadores/{investigador}/planes-trabajo/{planTrabajo}', [InvestigadorController::class, 'updatePlanTrabajo'])->name('investigadores.planes-trabajo.update');
    Route::delete('investigadores/{investigador}/planes-trabajo/{planTrabajo}', [InvestigadorController::class, 'destroyPlanTrabajo'])->name('investigadores.planes-trabajo.destroy');
    Route::put('investigadores/{investigador}/planes-trabajo/{planTrabajo}/aprobar', [InvestigadorController::class, 'aprobarPlanTrabajo'])->name('investigadores.planes-trabajo.aprobar');
    Route::put('investigadores/{investigador}/planes-trabajo/{planTrabajo}/rechazar', [InvestigadorController::class, 'rechazarPlanTrabajo'])->name('investigadores.planes-trabajo.rechazar');
    Route::put('investigadores/{investigador}/planes-trabajo/{planTrabajo}/enviar-revision', [InvestigadorController::class, 'enviarParaRevision'])->name('investigadores.planes-trabajo.enviar-revision');

    // Rutas para actividades del plan de trabajo
    Route::get('investigadores/{investigador}/planes-trabajo/{planTrabajo}/actividades', [InvestigadorController::class, 'actividadesPlan'])->name('investigadores.actividades-plan');
    Route::get('investigadores/{investigador}/planes-trabajo/{planTrabajo}/actividades/create', [InvestigadorController::class, 'createActividadPlan'])->name('investigadores.actividades-plan.create');
    Route::post('investigadores/{investigador}/planes-trabajo/{planTrabajo}/actividades', [InvestigadorController::class, 'storeActividadPlan'])->name('investigadores.actividades-plan.store');
    Route::get('investigadores/{investigador}/planes-trabajo/{planTrabajo}/actividades/{actividadPlan}/edit', [InvestigadorController::class, 'editActividadPlan'])->name('investigadores.actividades-plan.edit');
    Route::put('investigadores/{investigador}/planes-trabajo/{planTrabajo}/actividades/{actividadPlan}', [InvestigadorController::class, 'updateActividadPlan'])->name('investigadores.actividades-plan.update');
    Route::delete('investigadores/{investigador}/planes-trabajo/{planTrabajo}/actividades/{actividadPlan}', [InvestigadorController::class, 'destroyActividadPlan'])->name('investigadores.actividades-plan.destroy');

    // Rutas para Proyectos Investigativos
    Route::resource('proyectos', ProyectoInvestigativoController::class);

    // Rutas para Productos Investigativos
    Route::resource('productos', ProductoInvestigativoController::class);
    Route::get('productos/tipos-por-actividad', [ProductoInvestigativoController::class, 'getTiposPorActividad'])->name('productos.tipos-por-actividad');
    Route::get('productos/subtipos-por-tipo', [ProductoInvestigativoController::class, 'getSubTiposPorTipo'])->name('productos.subtipos-por-tipo');

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

// Ruta para realizar revisión del plan de trabajo
Route::post('/investigadores/{investigador}/planes-trabajo/{planTrabajo}/revision', [InvestigadorController::class, 'revisionPlanTrabajo'])
    ->name('planes-trabajo.revision');

// Rutas para PDFs
Route::prefix('pdf')->name('pdf.')->group(function () {
    Route::get('plan-trabajo/{planTrabajo}', [\App\Http\Controllers\PdfController::class, 'planTrabajo'])->name('plan-trabajo');
    Route::get('plan-trabajo/{planTrabajo}/preview', [\App\Http\Controllers\PdfController::class, 'preview'])->name('plan-trabajo.preview');
    Route::get('investigadores', [\App\Http\Controllers\PdfController::class, 'investigadores'])->name('investigadores');
    Route::get('investigadores/preview', [\App\Http\Controllers\PdfController::class, 'previewInvestigadores'])->name('investigadores.preview');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
