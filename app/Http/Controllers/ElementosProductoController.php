<?php

namespace App\Http\Controllers;

use App\Models\ElementosProducto;
use App\Models\ProductoInvestigativo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\EntregaProducto;

class ElementosProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(ProductoInvestigativo $producto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para ver los elementos de este producto.');
        }

        $elementos = $producto->elementos()->orderBy('created_at', 'asc')->get();

        return Inertia::render('Productos/Elementos/Index', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto']),
            'elementos' => $elementos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(ProductoInvestigativo $producto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para crear elementos en este producto.');
        }

        return Inertia::render('Productos/Elementos/Create', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, ProductoInvestigativo $producto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para crear elementos en este producto.');
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
        ], [
            'nombre.required' => 'El nombre del elemento es requerido.',
            'nombre.max' => 'El nombre del elemento no puede exceder 255 caracteres.',
        ]);

        $elemento = $producto->elementos()->create([
            'nombre' => $request->nombre,
            'progreso' => 0, // Siempre 0 al crear
        ]);

        return to_route('productos.elementos.index', $producto)->with('success', 'Elemento creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductoInvestigativo $producto, ElementosProducto $elemento)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para ver este elemento.');
        }

        // Verificar que el elemento pertenece al producto
        if ($elemento->producto_investigativo_id !== $producto->id) {
            abort(404, 'Elemento no encontrado.');
        }

        return Inertia::render('Productos/Elementos/Show', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto']),
            'elemento' => $elemento,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductoInvestigativo $producto, ElementosProducto $elemento)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para editar este elemento.');
        }

        // Verificar que el elemento pertenece al producto
        if ($elemento->producto_investigativo_id !== $producto->id) {
            abort(404, 'Elemento no encontrado.');
        }

        return Inertia::render('Productos/Elementos/Edit', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto']),
            'elemento' => $elemento,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductoInvestigativo $producto, ElementosProducto $elemento)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para editar este elemento.');
        }

        // Verificar que el elemento pertenece al producto
        if ($elemento->producto_investigativo_id !== $producto->id) {
            abort(404, 'Elemento no encontrado.');
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
        ], [
            'nombre.required' => 'El nombre del elemento es requerido.',
            'nombre.max' => 'El nombre del elemento no puede exceder 255 caracteres.',
        ]);

        $elemento->update([
            'nombre' => $request->nombre,
            // No actualizar el progreso - se mantiene el valor original
        ]);

        return to_route('productos.elementos.index', $producto)->with('success', 'Elemento actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductoInvestigativo $producto, ElementosProducto $elemento)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para eliminar este elemento.');
        }

        // Verificar que el elemento pertenece al producto
        if ($elemento->producto_investigativo_id !== $producto->id) {
            abort(404, 'Elemento no encontrado.');
        }

        // Verificar que no haya entregas que usen este elemento
        $entregasConElemento = EntregaProducto::where('producto_investigativo_id', $producto->id)
            ->whereJsonContains('planeacion', ['nombre' => $elemento->nombre])
            ->exists();

        if ($entregasConElemento) {
            return back()->withErrors(['general' => 'No se puede eliminar este elemento porque está siendo utilizado en entregas existentes.']);
        }

        $elemento->delete();

        return to_route('productos.elementos.index', $producto)->with('success', 'Elemento eliminado exitosamente.');
    }
} 