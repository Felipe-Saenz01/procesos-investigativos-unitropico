<?php

namespace App\Http\Controllers\Parametros;

use App\Http\Controllers\Controller;
use App\Models\EscalafonProfesoral;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EscalafonProfesoralController extends Controller
{
    public function index()
    {
        $escalafones = EscalafonProfesoral::all();
        return inertia('Parametros/EscalafonProfesoral/Index', [
            'escalafones' => $escalafones,
        ]);
    }

    public function create()
    {
        return inertia('Parametros/EscalafonProfesoral/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'horas_semanales' => 'required|integer|min:1',
        ]);

        EscalafonProfesoral::create($request->all());

        return to_route('parametros.escalafon-profesoral.index')->with('success', 'Escalafón Profesoral creado exitosamente.');
    }

    public function edit(EscalafonProfesoral $escalafonProfesoral)
    {
        return inertia('Parametros/EscalafonProfesoral/Edit', [
            'escalafonProfesoral' => $escalafonProfesoral,
        ]);
    }

    public function update(Request $request, EscalafonProfesoral $escalafonProfesoral)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'horas_semanales' => 'required|integer|min:1',
        ]);

        $escalafonProfesoral->update($request->all());

        return to_route('parametros.escalafon-profesoral.index')->with('success', 'Escalafón Profesoral actualizado exitosamente.');
    }

    public function destroy(EscalafonProfesoral $escalafonProfesoral)
    {
        $escalafonProfesoral->delete();

        return to_route('parametros.escalafon-profesoral.index')->with('success', 'Escalafón Profesoral eliminado exitosamente.');
    }
}