<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\GrupoInvestigacion;
use App\Models\HorasInvestigacion;
use App\Models\Periodo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvestigadorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $investigadores = User::with(['grupo_investigacion'])
            ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Investigadores/Index', [
            'investigadores' => $investigadores,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $investigador)
    {
        $gruposInvestigacion = GrupoInvestigacion::orderBy('nombre')->get();
        
        return Inertia::render('Investigadores/Edit', [
            'investigador' => $investigador,
            'gruposInvestigacion' => $gruposInvestigacion,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $investigador)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $investigador->id,
            'tipo' => 'required|in:Investigador,Lider Grupo',
            'grupo_investigacion_id' => 'nullable|exists:grupo_investigacions,id',
        ], [
            'name.required' => 'El nombre es requerido.',
            'email.required' => 'El correo es requerido.',
            'email.email' => 'El correo debe tener un formato válido.',
            'email.unique' => 'Ya existe un usuario con este correo.',
            'tipo.required' => 'El rol es requerido.',
            'tipo.in' => 'El rol debe ser Investigador o Líder Grupo.',
            'grupo_investigacion_id.exists' => 'El grupo de investigación seleccionado no existe.',
        ]);

        $investigador->update([
            'name' => $request->name,
            'email' => $request->email,
            'tipo' => $request->tipo,
            'grupo_investigacion_id' => $request->grupo_investigacion_id,
        ]);

        return to_route('investigadores.index')->with('success', 'Investigador actualizado exitosamente.');
    }

    /**
     * Show the horas de investigación for a specific user.
     */
    public function horas(User $investigador)
    {
        $horasInvestigacion = HorasInvestigacion::with(['periodo'])
            ->where('user_id', $investigador->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $periodos = Periodo::orderBy('nombre')->get();

        return Inertia::render('Investigadores/Horas', [
            'investigador' => $investigador,
            'horasInvestigacion' => $horasInvestigacion,
            'periodos' => $periodos,
        ]);
    }

    /**
     * Store horas de investigación for a specific user.
     */
    public function storeHoras(Request $request, User $investigador)
    {
        $request->validate([
            'periodo_id' => 'required|exists:periodos,id',
            'horas' => 'required|integer|min:0',
            'estado' => 'required|in:Activo,Inactivo',
        ], [
            'periodo_id.required' => 'El período es requerido.',
            'periodo_id.exists' => 'El período seleccionado no existe.',
            'horas.required' => 'Las horas son requeridas.',
            'horas.integer' => 'Las horas deben ser un número entero.',
            'horas.min' => 'Las horas no pueden ser negativas.',
            'estado.required' => 'El estado es requerido.',
            'estado.in' => 'El estado debe ser Activo o Inactivo.',
        ]);

        // Verificar si ya existe un registro para este usuario y período
        $existingHoras = HorasInvestigacion::where('user_id', $investigador->id)
            ->where('periodo_id', $request->periodo_id)
            ->first();

        if ($existingHoras) {
            return back()->withErrors(['periodo_id' => 'Ya existe un registro de horas para este período.']);
        }

        HorasInvestigacion::create([
            'user_id' => $investigador->id,
            'periodo_id' => $request->periodo_id,
            'horas' => $request->horas,
            'estado' => $request->estado,
        ]);

        return to_route('investigadores.horas', $investigador->id)->with('success', 'Horas de investigación asignadas exitosamente.');
    }

    /**
     * Update horas de investigación for a specific user.
     */
    public function updateHoras(Request $request, User $investigador, HorasInvestigacion $horasInvestigacion)
    {
        $request->validate([
            'horas' => 'required|integer|min:0',
            'estado' => 'required|in:Activo,Inactivo',
        ], [
            'horas.required' => 'Las horas son requeridas.',
            'horas.integer' => 'Las horas deben ser un número entero.',
            'horas.min' => 'Las horas no pueden ser negativas.',
            'estado.required' => 'El estado es requerido.',
            'estado.in' => 'El estado debe ser Activo o Inactivo.',
        ]);

        $horasInvestigacion->update([
            'horas' => $request->horas,
            'estado' => $request->estado,
        ]);

        return to_route('investigadores.horas', $investigador->id)->with('success', 'Horas de investigación actualizadas exitosamente.');
    }

    /**
     * Remove horas de investigación for a specific user.
     */
    public function destroyHoras(User $investigador, HorasInvestigacion $horasInvestigacion)
    {
        $horasInvestigacion->delete();
        return to_route('investigadores.horas', $investigador->id)->with('success', 'Horas de investigación eliminadas exitosamente.');
    }
} 