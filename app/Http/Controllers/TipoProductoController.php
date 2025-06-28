<?php

namespace App\Http\Controllers;

use App\Models\TipoProducto;
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
            'tiposProductos' => TipoProducto::all(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Parametros/TipoProducto/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request = $request->validate([
            'nombre' => 'required|string|max:255',
        ]);
        TipoProducto::create($request);
        // return redirect()->route('parametros.tipo-producto.index')->with('success', 'Tipo de producto creado exitosamente.');
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
            'tipoProducto' => $tipoProducto,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TipoProducto $tipoProducto)
    {
        $request = $request->validate([
            'nombre' => 'required|string|max:255',
        ]);
        $tipoProducto->update($request);
        return to_route('parametros.tipo-producto.index')->with('success', 'Tipo de producto actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TipoProducto $tipoProducto)
    {

        $tipoProducto->delete();
        return to_route('parametros.tipo-producto.index')->with('success', 'Tipo de producto eliminado exitosamente.');
    }
}
