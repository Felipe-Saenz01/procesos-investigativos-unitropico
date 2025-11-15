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
            'año' => 'required|integer|min:2000|max:2100',
            'semestre' => 'required|in:A,B',
            'fecha_limite_planeacion' => 'required|date',
            'fecha_limite_evidencias' => 'required|date|after:fecha_limite_planeacion',
            'estado' => 'required|in:Activo,Inactivo',
        ], [
            'año.required' => 'El año es requerido.',
            'año.integer' => 'El año debe ser un número entero.',
            'año.min' => 'El año debe ser mayor o igual a 2000.',
            'año.max' => 'El año debe ser menor o igual a 2100.',
            'semestre.required' => 'El semestre es requerido.',
            'semestre.in' => 'El semestre debe ser A o B.',
            'fecha_limite_evidencias.after' => 'La fecha límite de evidencias debe ser posterior a la fecha de planeación.',
        ]);

        // Concatenar año y semestre para formar el nombre
        $nombre = $request->año . '-' . $request->semestre;

        // Validar que el nombre no exista
        if (Periodo::where('nombre', $nombre)->exists()) {
            return back()->withErrors(['nombre' => 'Ya existe un período con este nombre.'])->withInput();
        }

        Periodo::create([
            'nombre' => $nombre,
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
            'año' => 'required|integer|min:2000|max:2100',
            'semestre' => 'required|in:A,B',
            'fecha_limite_planeacion' => 'required|date',
            'fecha_limite_evidencias' => 'required|date|after:fecha_limite_planeacion',
            'estado' => 'required|in:Activo,Inactivo',
        ], [
            'año.required' => 'El año es requerido.',
            'año.integer' => 'El año debe ser un número entero.',
            'año.min' => 'El año debe ser mayor o igual a 2000.',
            'año.max' => 'El año debe ser menor o igual a 2100.',
            'semestre.required' => 'El semestre es requerido.',
            'semestre.in' => 'El semestre debe ser A o B.',
            'fecha_limite_evidencias.after' => 'La fecha límite de evidencias debe ser posterior a la fecha de planeación.',
        ]);

        // Concatenar año y semestre para formar el nombre
        $nombre = $request->año . '-' . $request->semestre;

        // Validar que el nombre no exista (excepto para el período actual)
        if (Periodo::where('nombre', $nombre)->where('id', '!=', $periodo->id)->exists()) {
            return back()->withErrors(['nombre' => 'Ya existe un período con este nombre.'])->withInput();
        }

        $periodo->update([
            'nombre' => $nombre,
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
