<?php

namespace App\Http\Controllers\Parametros;

use App\Http\Controllers\Controller;
use App\Models\ActividadesInvestigacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActividadesInvestigacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Parametros/ActividadesInvestigacion/Index', [
            'actividadesInvestigacion' => ActividadesInvestigacion::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Parametros/ActividadesInvestigacion/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'horas_maximas' => 'required|integer|min:1|max:100',
        ]);

        ActividadesInvestigacion::create($request->all());
        
        return to_route('parametros.actividades-investigacion.index')
            ->with('success', 'Actividad de investigación creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ActividadesInvestigacion $actividadesInvestigacion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ActividadesInvestigacion $actividadesInvestigacion)
    {
        return Inertia::render('Parametros/ActividadesInvestigacion/Edit', [
            'actividadesInvestigacion' => $actividadesInvestigacion,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ActividadesInvestigacion $actividadesInvestigacion)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'horas_maximas' => 'required|integer|min:1|max:100',
        ]);

        $actividadesInvestigacion->update($request->all());
        
        return to_route('parametros.actividades-investigacion.index')
            ->with('success', 'Actividad de investigación actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ActividadesInvestigacion $actividadesInvestigacion)
    {
        // Verificar si tiene tipos de productos asociados
        if ($actividadesInvestigacion->tiposProductos()->count() > 0) {
            return to_route('parametros.actividades-investigacion.index')
                ->with('error', 'No se puede eliminar la actividad porque tiene tipos de productos asociados.');
        }

        $actividadesInvestigacion->delete();
        
        return to_route('parametros.actividades-investigacion.index')
            ->with('success', 'Actividad de investigación eliminada exitosamente.');
    }
}
