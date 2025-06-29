<?php

namespace App\Http\Controllers;

use App\Models\GrupoInvestigacion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GrupoInvestigacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $gruposInvestigacion = GrupoInvestigacion::with(['usuarios' => function($query) {
            $query->select('id', 'name', 'email', 'role', 'grupo_investigacion_id');
        }])->orderBy('created_at', 'desc')->get();

        return Inertia::render('GrupoInvestigacion/Index', [
            'gruposInvestigacion' => $gruposInvestigacion,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('GrupoInvestigacion/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'correo' => 'required|email|unique:grupo_investigacions,correo',
        ], [
            'nombre.required' => 'El nombre del grupo es requerido.',
            'correo.required' => 'El correo del grupo es requerido.',
            'correo.email' => 'El correo debe tener un formato válido.',
            'correo.unique' => 'Ya existe un grupo con este correo.',
        ]);

        GrupoInvestigacion::create([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
        ]);

        return to_route('grupo-investigacion.index')->with('success', 'Grupo de investigación creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(GrupoInvestigacion $grupoInvestigacion)
    {
        return Inertia::render('GrupoInvestigacion/Show', [
            'grupoInvestigacion' => $grupoInvestigacion->load(['usuarios', 'proyectos']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GrupoInvestigacion $grupoInvestigacion)
    {
        return Inertia::render('GrupoInvestigacion/Edit', [
            'grupoInvestigacion' => $grupoInvestigacion,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GrupoInvestigacion $grupoInvestigacion)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'correo' => 'required|email|unique:grupo_investigacions,correo,' . $grupoInvestigacion->id,
        ], [
            'nombre.required' => 'El nombre del grupo es requerido.',
            'correo.required' => 'El correo del grupo es requerido.',
            'correo.email' => 'El correo debe tener un formato válido.',
            'correo.unique' => 'Ya existe un grupo con este correo.',
        ]);

        $grupoInvestigacion->update([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
        ]);

        return to_route('grupo-investigacion.index')->with('success', 'Grupo de investigación actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GrupoInvestigacion $grupoInvestigacion)
    {
        // Verificar si el grupo tiene usuarios asociados
        if ($grupoInvestigacion->usuarios()->count() > 0) {
            return to_route('grupo-investigacion.index')->with('error', 'No se puede eliminar el grupo porque tiene investigadores asociados.');
        }

        // Verificar si el grupo tiene proyectos asociados
        if ($grupoInvestigacion->proyectos()->count() > 0) {
            return to_route('grupo-investigacion.index')->with('error', 'No se puede eliminar el grupo porque tiene proyectos asociados.');
        }

        $grupoInvestigacion->delete();
        return to_route('grupo-investigacion.index')->with('success', 'Grupo de investigación eliminado exitosamente.');
    }
}
