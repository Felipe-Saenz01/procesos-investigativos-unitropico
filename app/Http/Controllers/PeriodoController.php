<?php

namespace App\Http\Controllers;

use App\Models\Periodo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeriodoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $periodos = Periodo::orderBy('created_at', 'desc')->get();
        return Inertia::render('Parametros/Periodo/Index', [
            'periodos' => $periodos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Parametros/Periodo/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:periodos,nombre',
            'fecha_limite_planeacion' => 'required|date',
            'fecha_limite_evidencias' => 'required|date|after:fecha_limite_planeacion',
            'estado' => 'required|in:Activo,Inactivo',
        ], [
            'nombre.unique' => 'Ya existe un período con este nombre.',
            'fecha_limite_evidencias.after' => 'La fecha límite de evidencias debe ser posterior a la fecha de planeación.',
        ]);

        Periodo::create([
            'nombre' => $request->nombre,
            'fecha_limite_planeacion' => $request->fecha_limite_planeacion,
            'fecha_limite_evidencias' => $request->fecha_limite_evidencias,
            'estado' => $request->estado,
        ]);

        return to_route('parametros.periodo.index')->with('success', 'Período creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Periodo $periodo)
    {
        return Inertia::render('Parametros/Periodo/Show', [
            'periodo' => $periodo->load(['entregas', 'horas']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Periodo $periodo)
    {
        return Inertia::render('Parametros/Periodo/Edit', [
            'periodo' => $periodo,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Periodo $periodo)
    {
        $request->validate([
            'nombre' => 'required|string|max:255|unique:periodos,nombre,' . $periodo->id,
            'fecha_limite_planeacion' => 'required|date',
            'fecha_limite_evidencias' => 'required|date|after:fecha_limite_planeacion',
            'estado' => 'required|in:Activo,Inactivo',
        ], [
            'nombre.unique' => 'Ya existe un período con este nombre.',
            'fecha_limite_evidencias.after' => 'La fecha límite de evidencias debe ser posterior a la fecha de planeación.',
        ]);

        $periodo->update([
            'nombre' => $request->nombre,
            'fecha_limite_planeacion' => $request->fecha_limite_planeacion,
            'fecha_limite_evidencias' => $request->fecha_limite_evidencias,
            'estado' => $request->estado,
        ]);

        return to_route('parametros.periodo.index')->with('success', 'Período actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Periodo $periodo)
    {
        // Verificar si el período tiene entregas o horas asociadas
        if ($periodo->entregas()->count() > 0) {
            return to_route('parametros.periodo.index')->with('error', 'No se puede eliminar el período porque tiene entregas asociadas.');
        }

        if ($periodo->horas()->count() > 0) {
            return to_route('parametros.periodo.index')->with('error', 'No se puede eliminar el período porque tiene horas de investigación asociadas.');
        }

        $periodo->delete();
        return to_route('parametros.periodo.index')->with('success', 'Período eliminado exitosamente.');
    }
}
