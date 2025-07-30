<?php

namespace App\Http\Controllers;

use App\Models\TipoProducto;
use App\Models\ActividadesInvestigacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TipoProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Parametros/TipoProducto/Index', [
            'tiposProductos' => TipoProducto::with('actividadInvestigacion')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Parametros/TipoProducto/Create', [
            'actividadesInvestigacion' => ActividadesInvestigacion::all(['id', 'nombre']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'actividad_investigacion_id' => 'required|exists:actividades_investigacions,id',
        ]);
        
        TipoProducto::create($request->all());
        
        return to_route('parametros.tipo-producto.index')->with('success', 'Tipo de producto creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TipoProducto $tipoProducto)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TipoProducto $tipoProducto)
    {
        return Inertia::render('Parametros/TipoProducto/Edit', [
            'tipoProducto' => $tipoProducto->load('actividadInvestigacion'),
            'actividadesInvestigacion' => ActividadesInvestigacion::all(['id', 'nombre']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TipoProducto $tipoProducto)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'actividad_investigacion_id' => 'required|exists:actividades_investigacions,id',
        ]);
        
        $tipoProducto->update($request->all());
        
        return to_route('parametros.tipo-producto.index')->with('success', 'Tipo de producto actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TipoProducto $tipoProducto)
    {
        // Verificar si tiene subtipos asociados
        if ($tipoProducto->subTiposProductos()->count() > 0) {
            return to_route('parametros.tipo-producto.index')
                ->with('error', 'No se puede eliminar el tipo de producto porque tiene subtipos asociados.');
        }

        $tipoProducto->delete();
        
        return to_route('parametros.tipo-producto.index')->with('success', 'Tipo de producto eliminado exitosamente.');
    }
}
