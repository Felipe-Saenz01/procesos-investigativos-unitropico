<?php

namespace App\Http\Controllers;

use App\Models\SubTipoProducto;
use App\Models\TipoProducto;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubTipoProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $subTiposProductos = SubTipoProducto::with('tipoProducto')->get();
        return Inertia::render('Parametros/SubTipoProducto/Index', [
            'subTiposProductos' => $subTiposProductos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $tiposProductos = TipoProducto::all();
        return Inertia::render('Parametros/SubTipoProducto/Create', [
            'tiposProductos' => $tiposProductos,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo_producto_id' => 'required|exists:tipo_productos,id',
        ]);

        SubTipoProducto::create([
            'nombre' => $request->nombre,
            'tipo_producto_id' => $request->tipo_producto_id,
        ]);

        return to_route('parametros.subtipo-producto.index')->with('success', 'Subtipo de producto creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SubTipoProducto $subTipoProducto)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SubTipoProducto $subTipoProducto)
    {
        $tiposProductos = TipoProducto::all();
        return Inertia::render('Parametros/SubTipoProducto/Edit', [
            'subTipoProducto' => $subTipoProducto->load('tipoProducto'),
            'tiposProductos' => $tiposProductos,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SubTipoProducto $subTipoProducto)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo_producto_id' => 'required|exists:tipo_productos,id',
        ]);

        $subTipoProducto->update([
            'nombre' => $request->nombre,
            'tipo_producto_id' => $request->tipo_producto_id,
        ]);

        return to_route('parametros.subtipo-producto.index')->with('success', 'Subtipo de producto actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SubTipoProducto $subTipoProducto)
    {
        $subTipoProducto->delete();
        return to_route('parametros.subtipo-producto.index')->with('success', 'Subtipo de producto eliminado exitosamente.');
    }
}
