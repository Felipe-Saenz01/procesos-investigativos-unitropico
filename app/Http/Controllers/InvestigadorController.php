<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\GrupoInvestigacion;
use App\Models\Periodo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use App\Models\TipoContrato;
use App\Models\TipoVinculacion;

class InvestigadorController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('Administrador');
        $isLider = $user->hasRole('Lider Grupo');

        // Si es administrador, se muestran todos los investigadores
        if ($isAdmin) {
            $investigadores = User::with('grupo_investigacion')
                ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
                ->get();
        // Si es lider de grupo, se muestran los investigadores de su grupo
        } elseif ($isLider) {
            $investigadores = User::with('grupo_investigacion')
                ->where('grupo_investigacion_id', $user->grupo_investigacion_id)
                ->get();
        // Si no es administrador ni lider de grupo, se redirige a la página de inicio
        } else {
            return redirect()->route('dashboard');
        }

        return inertia('Investigadores/Index', [
            'investigadores' => $investigadores,
        ]);
    }

    public function show(User $investigador)
    {
        return inertia('Investigadores/Show', [
            'investigador' => $investigador->load('grupo_investigacion'),
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('Administrador');
        $isLider = $user->hasRole('Lider Grupo');
        $grupos = GrupoInvestigacion::all(['id', 'nombre']);
        $grupoLider = $isLider ? $user->grupo_investigacion_id : null;
        $tipoContratos = TipoContrato::all(['id', 'nombre']);
        $tipoVinculaciones = TipoVinculacion::all(['id', 'nombre']);
        return inertia('Investigadores/Create', [
            'isAdmin' => $isAdmin,
            'isLider' => $isLider,
            'grupos' => $grupos,
            'grupoLider' => $grupoLider,
            'tipoContratos' => $tipoContratos,
            'tipoVinculaciones' => $tipoVinculaciones,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('Administrador');
        $isLider = $user->hasRole('Lider Grupo');

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'cedula' => 'required|digits_between:6,15|unique:users,cedula',
            'grupo_investigacion_id' => $isAdmin ? 'required|exists:grupo_investigacions,id' : 'nullable',
            'tipo_contrato_id' => 'required|exists:tipo_contratos,id',
            'tipo_vinculacion_id' => 'required|exists:tipo_vinculacions,id',
        ]);

        if ($isAdmin) {
            $data['tipo'] = 'Lider Grupo';
            $data['grupo_investigacion_id'] = $request->grupo_investigacion_id;
        } elseif ($isLider) {
            $data['tipo'] = 'Investigador';
            $data['grupo_investigacion_id'] = $user->grupo_investigacion_id;
        } else {
            abort(403, 'No autorizado para crear usuarios');
        }

        $data['password'] = Hash::make($data['cedula']);

        $nuevoUsuario = User::create($data);
        $nuevoUsuario->assignRole($data['tipo']);

        return to_route('investigadores.index')->with('success', 'Usuario creado correctamente');
    }

    public function edit(User $investigador)
    {
        $grupos = GrupoInvestigacion::all(['id', 'nombre']);
        $tipoContratos = TipoContrato::all(['id', 'nombre']);
        $tipoVinculaciones = TipoVinculacion::all(['id', 'nombre']);
        return inertia('Investigadores/Edit', [
            'investigador' => $investigador,
            'grupos' => $grupos,
            'tipoContratos' => $tipoContratos,
            'tipoVinculaciones' => $tipoVinculaciones,
        ]);
    }

    public function update(Request $request, User $investigador)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $investigador->id,
            'cedula' => 'required|digits_between:6,15|unique:users,cedula,' . $investigador->id,
            'grupo_investigacion_id' => 'nullable|exists:grupo_investigacions,id',
            'tipo_contrato_id' => 'required|exists:tipo_contratos,id',
            'tipo_vinculacion_id' => 'required|exists:tipo_vinculacions,id',
        ]);
        $investigador->update($data);
        return to_route('investigadores.index')->with('success', 'Investigador actualizado correctamente');
    }

    public function destroy(User $investigador)
    {
        $investigador->delete();
        return to_route('investigadores.index')->with('success', 'Investigador eliminado correctamente');
    }

    // --- Métodos de Horas de Investigación ---
    public function horas(User $investigador)
    {
        $horas = $investigador->horasInvestigacion()->with('periodo')->get();
        $periodos = \App\Models\Periodo::all(['id', 'nombre']);
        return inertia('Investigadores/Horas', [
            'investigador' => $investigador,
            'horasInvestigacion' => $horas,
            'periodos' => $periodos,
        ]);
    }

    public function createHoras(User $investigador)
    {
        $periodos = Periodo::all(['id', 'nombre']);
        return inertia('Investigadores/HorasCreate', [
            'investigador' => $investigador,
            'periodos' => $periodos,
        ]);
    }

    public function storeHoras(Request $request, User $investigador)
    {
        $request->validate([
            'periodo_id' => 'required|exists:periodos,id',
            'horas' => 'required|integer|min:0',
            'estado' => 'required|in:Activo,Inactivo',
        ]);

        // Verificar si ya existe un registro para este usuario y período
        $existingHoras = $investigador->horasInvestigacion()->where('periodo_id', $request->periodo_id)->first();
        if ($existingHoras) {
            return back()->withErrors(['periodo_id' => 'Ya existe un registro de horas para este período.']);
        }

        $investigador->horasInvestigacion()->create([
            'periodo_id' => $request->periodo_id,
            'horas' => $request->horas,
            'estado' => $request->estado,
        ]);

        return to_route('investigadores.horas', $investigador->id)->with('success', 'Horas de investigación asignadas exitosamente.');
    }

    public function editHoras(User $investigador, $horasInvestigacionId)
    {
        $horas = $investigador->horasInvestigacion()->findOrFail($horasInvestigacionId);
        $periodos = Periodo::all(['id', 'nombre']);
        return inertia('Investigadores/HorasEdit', [
            'investigador' => $investigador,
            'horas' => $horas,
            'periodos' => $periodos,
        ]);
    }

    public function updateHoras(Request $request, User $investigador, $horasInvestigacionId)
    {
        $horas = $investigador->horasInvestigacion()->findOrFail($horasInvestigacionId);
        $request->validate([
            'periodo_id' => 'required|exists:periodos,id',
            'horas' => 'required|integer|min:0',
            'estado' => 'required|in:Activo,Inactivo',
        ]);
        $horas->update([
            'periodo_id' => $request->periodo_id,
            'horas' => $request->horas,
            'estado' => $request->estado,
        ]);
        return to_route('investigadores.horas', $investigador->id)->with('success', 'Horas de investigación actualizadas exitosamente.');
    }

    public function destroyHoras(User $investigador, $horasInvestigacionId)
    {
        $horas = $investigador->horasInvestigacion()->findOrFail($horasInvestigacionId);
        $horas->delete();
        return to_route('investigadores.horas', $investigador->id)->with('success', 'Registro de horas eliminado exitosamente.');
    }
} 