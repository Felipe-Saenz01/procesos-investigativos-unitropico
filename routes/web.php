<?php

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
        
    });
});




require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
