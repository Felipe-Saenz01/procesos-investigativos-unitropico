<?php

namespace App\Http\Controllers\Parametros;

use App\Http\Controllers\Controller;
use App\Models\TipoVinculacion;
use Illuminate\Http\Request;

class TipoVinculacionController extends Controller
{
    public function index()
    {
        $tipos = TipoVinculacion::all();
        return inertia('Parametros/TipoVinculacion/Index', [
            'tipos' => $tipos,
        ]);
    }

    public function create()
    {
        return inertia('Parametros/TipoVinculacion/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'horas_semanales' => 'required|integer|min:0',
        ]);
        TipoVinculacion::create($data);
        return to_route('parametros.tipo-vinculacion.index')->with('success', 'Tipo de vinculación creado correctamente');
    }

    public function edit($id)
    {
        $tipo = TipoVinculacion::findOrFail($id);
        return inertia('Parametros/TipoVinculacion/Edit', [
            'tipo' => $tipo,
        ]);
    }

    public function update(Request $request, $id)
    {
        $tipo = TipoVinculacion::findOrFail($id);
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'horas_semanales' => 'required|integer|min:0',
        ]);
        $tipo->update($data);
        return to_route('parametros.tipo-vinculacion.index')->with('success', 'Tipo de vinculación actualizado correctamente');
    }

    public function destroy($id)
    {
        $tipo = TipoVinculacion::findOrFail($id);
        $tipo->delete();
        return to_route('parametros.tipo-vinculacion.index')->with('success', 'Tipo de vinculación eliminado correctamente');
    }
} 