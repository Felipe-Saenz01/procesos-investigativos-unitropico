<?php

namespace App\Http\Controllers\Parametros;

use App\Http\Controllers\Controller;
use App\Models\TipoContrato;
use Illuminate\Http\Request;

class TipoContratoController extends Controller
{
    public function index()
    {
        $tipos = TipoContrato::all();
        return inertia('Parametros/TipoContrato/Index', [
            'tipos' => $tipos,
        ]);
    }

    public function create()
    {
        return inertia('Parametros/TipoContrato/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'numero_periodos' => 'required|integer|min:0',
        ]);
        TipoContrato::create($data);
        return to_route('parametros.tipo-contrato.index')->with('success', 'Tipo de contrato creado correctamente');
    }

    public function edit($id)
    {
        $tipo = TipoContrato::findOrFail($id);
        return inertia('Parametros/TipoContrato/Edit', [
            'tipo' => $tipo,
        ]);
    }

    public function update(Request $request, $id)
    {
        $tipo = TipoContrato::findOrFail($id);
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'numero_periodos' => 'required|integer|min:0',
        ]);
        $tipo->update($data);
        return to_route('parametros.tipo-contrato.index')->with('success', 'Tipo de contrato actualizado correctamente');
    }

    public function destroy($id)
    {
        $tipo = TipoContrato::findOrFail($id);
        $tipo->delete();
        return to_route('parametros.tipo-contrato.index')->with('success', 'Tipo de contrato eliminado correctamente');
    }
} 