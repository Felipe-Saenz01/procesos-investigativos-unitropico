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
use App\Models\EscalafonProfesoral;
use App\Models\PlanTrabajo;
use App\Models\ActividadesPlan;
use App\Models\ActividadesInvestigacion;
use App\Models\InformePlanTrabajo;

class InvestigadorController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('Administrador');
        $isLider = $user->hasRole('Lider Grupo');
        $isInvestigador = $user->hasRole('Investigador');

        // Si es administrador, se muestran todos los investigadores (paginado)
        if ($isAdmin) {
            $investigadores = User::query()
                ->with('grupo_investigacion:id,nombre,correo')
                ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
                ->orderBy('id', 'desc')
                ->paginate(10)
                ->withQueryString();
        // Si es líder de grupo, se muestran los investigadores de su grupo (paginado)
        } elseif ($isLider) {
            $investigadores = User::query()
                ->with('grupo_investigacion:id,nombre,correo')
                ->where('grupo_investigacion_id', $user->grupo_investigacion_id)
                ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
                ->orderBy('id', 'desc')
                ->paginate(10)
                ->withQueryString();
        } elseif ($isInvestigador) {
            return redirect()->route('investigadores.show', $user->id);
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
        $investigador->load([
            'grupo_investigacion',
            'escalafon_profesoral',
            'tipoContrato',
            'proyectosInvestigativos',
            'productosInvestigativos.subTipoProducto.tipoProducto',
            'horasInvestigacion.periodo',
            'planesTrabajo'
        ]);
        $investigador->isInvestigador = $investigador->hasRole('Investigador');


        return inertia('Investigadores/Show', [
            'investigador' => $investigador,
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
        $escalafonesProfesoral = EscalafonProfesoral::all(['id', 'nombre']);
        return inertia('Investigadores/Create', [
            'isAdmin' => $isAdmin,
            'isLider' => $isLider,
            'grupos' => $grupos,
            'grupoLider' => $grupoLider,
            'tipoContratos' => $tipoContratos,
            'escalafonesProfesoral' => $escalafonesProfesoral,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('Administrador');
        $isLider = $user->hasRole('Lider Grupo');

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'cedula' => 'required|digits_between:6,15|unique:users,cedula',
            'grupo_investigacion_id' => $isAdmin ? 'required|exists:grupo_investigacions,id' : 'nullable',
            'tipo_contrato_id' => 'required|exists:tipo_contratos,id',
            'escalafon_profesoral_id' => 'required|exists:escalafon_profesorals,id',
        ];
        if ($isAdmin) {
            $rules['tipo'] = 'required|in:Lider Grupo,Investigador';
        }
        $data = $request->validate($rules);

        if ($isAdmin) {
            $data['tipo'] = $request->input('tipo', 'Lider Grupo');
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
        $isAdmin = Auth::user()->hasRole('Administrador');
        $grupos = GrupoInvestigacion::all(['id', 'nombre']);
        $tipoContratos = TipoContrato::all(['id', 'nombre']);
        $escalafonesProfesoral = EscalafonProfesoral::all(['id', 'nombre']);
        return inertia('Investigadores/Edit', [
            'investigador' => $investigador,
            'grupos' => $grupos,
            'tipoContratos' => $tipoContratos,
            'escalafonesProfesoral' => $escalafonesProfesoral,
            'isAdmin' => $isAdmin,
        ]);
    }

    public function update(Request $request, User $investigador)
    {
        $isAdmin = Auth::user()->hasRole('Administrador');
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $investigador->id,
            'cedula' => 'required|digits_between:6,15|unique:users,cedula,' . $investigador->id,
            'grupo_investigacion_id' => 'nullable|exists:grupo_investigacions,id',
            'tipo_contrato_id' => 'required|exists:tipo_contratos,id',
            'escalafon_profesoral_id' => 'required|exists:escalafon_profesorals,id',
        ];
        if ($isAdmin) {
            $rules['tipo'] = 'required|in:Lider Grupo,Investigador';
        }
        $data = $request->validate($rules);

        // Actualizar datos base
        $investigador->update($data);

        // Si es admin y envía el tipo, sincronizar roles (elimina todos y asigna el del formulario)
        if ($isAdmin && array_key_exists('tipo', $data)) {
            $investigador->tipo = $data['tipo'];
            $investigador->save();
            $investigador->syncRoles([$data['tipo']]);
        }
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
        if (!$investigador->escalafon_profesoral) {
            return to_route('investigadores.show', $investigador->id)->with('error', 'Este investigador no tiene un escalafón profesoral asignado');
        }
        $periodos = Periodo::where('estado', 'Activo')->get(['id', 'nombre']);
        
        if ($periodos->isEmpty()) {
            return to_route('investigadores.show', $investigador->id)->with('error', 'No hay períodos activos para asignar horas de investigación');
        }

        $horas = $investigador->horasInvestigacion()->with('periodo')->get();
        $investigador->load('escalafon_profesoral');
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

        // Validar que las horas no excedan las permitidas por el escalafón profesoral
        if ($investigador->escalafonProfesoral && $investigador->escalafonProfesoral->horas_semanales) {
            if ($request->horas > $investigador->escalafonProfesoral->horas_semanales) {
                return back()->withErrors(['horas' => "Las horas exceden el límite permitido. Máximo permitido: {$investigador->escalafonProfesoral->horas_semanales} horas (escalafón: {$investigador->escalafonProfesoral->nombre})."]);
            }
        }

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

    // --- Métodos de Planes de Trabajo ---
    public function planesTrabajo(User $investigador)
    {
        $planes = $investigador->planesTrabajo()->with('actividades.actividadInvestigacion')->get();
        return inertia('Investigadores/PlanesTrabajo', [
            'investigador' => $investigador,
            'planesTrabajo' => $planes,
        ]);
    }

    public function createPlanTrabajo(User $investigador)
    {
        $periodos = Periodo::where('estado', 'Activo')->get(['id', 'nombre']);
        return inertia('Investigadores/PlanTrabajoCreate', [
            'investigador' => $investigador,
            'periodos' => $periodos,
        ]);
    }

    public function storePlanTrabajo(Request $request, User $investigador)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'vigencia' => 'required|in:Anual,Semestral',
            'periodo_id' => 'required|exists:periodos,id',
        ]);

        $investigador->planesTrabajo()->create([
            'nombre' => $request->nombre,
            'vigencia' => $request->vigencia,
            'periodo_id' => $request->periodo_id,
            'estado' => 'Creado', // Estado inicial editable
        ]);

        return to_route('investigadores.planes-trabajo', $investigador->id)->with('success', 'Plan de trabajo creado exitosamente.');
    }

    public function editPlanTrabajo(User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        $periodos = Periodo::where('estado', 'Activo')->get(['id', 'nombre']);
        return inertia('Investigadores/PlanTrabajoEdit', [
            'investigador' => $investigador,
            'planTrabajo' => $planTrabajo,
            'periodos' => $periodos,
        ]);
    }

    public function updatePlanTrabajo(Request $request, User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        $request->validate([
            'nombre' => 'required|string|max:255',
            'vigencia' => 'required|in:Anual,Semestral',
            'periodo_id' => 'required|exists:periodos,id',
        ]);

        $planTrabajo->update([
            'nombre' => $request->nombre,
            'vigencia' => $request->vigencia,
            'periodo_id' => $request->periodo_id,
            // No cambiar el estado, mantener el actual
        ]);

        return to_route('investigadores.planes-trabajo', $investigador->id)->with('success', 'Plan de trabajo actualizado exitosamente.');
    }

    public function destroyPlanTrabajo(User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        $planTrabajo->delete();
        
        return to_route('investigadores.planes-trabajo', $investigador->id)->with('success', 'Plan de trabajo eliminado exitosamente.');
    }

    /**
     * Marca un plan de trabajo como terminado manualmente
     */
    public function terminarPlanTrabajo(User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        
        // Verificar permisos: solo líderes y administradores pueden terminar planes
        $user = Auth::user();
        if (!$user->hasRole(['Administrador', 'Lider Grupo'])) {
            abort(403, 'No tienes permisos para terminar este plan de trabajo.');
        }
        
        // Verificar que el plan esté aprobado
        if ($planTrabajo->estado !== 'Aprobado') {
            return back()->withErrors(['estado' => 'Solo se pueden terminar planes de trabajo que estén aprobados.']);
        }
        
        if ($planTrabajo->marcarComoTerminado()) {
            return back()->with('success', 'Plan de trabajo marcado como terminado exitosamente.');
        }
        
        return back()->withErrors(['error' => 'No se pudo terminar el plan de trabajo.']);
    }

    public function showPlanTrabajo(User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()
            ->with(['actividades.actividadInvestigacion', 'revisiones.revisor', 'informes.evidencias.actividadPlan.actividadInvestigacion'])
            ->findOrFail($planTrabajoId);
        
        // Verificar si el plan debe ser terminado automáticamente
        if ($planTrabajo->debeSerTerminado()) {
            $planTrabajo->marcarComoTerminado();
            $planTrabajo->refresh(); // Recargar el modelo actualizado
        }
        
        $eligibility = $this->computeInformeEligibility($planTrabajo);
        
        return inertia('Investigadores/PlanTrabajoShow', [
            'investigador' => $investigador,
            'planTrabajo' => $planTrabajo,
            'informeEligibility' => $eligibility,
        ]);
    }

    /**
     * Calcula la viabilidad para presentar informe del plan de trabajo.
     * - Semestral: máximo 1 informe en el período del plan, y dentro de su ventana de fechas.
     * - Anual: hasta 2 informes. El segundo debe ser en un período activo cuya fecha_limite_planeacion esté entre
     *          [fecha_limite_evidencias del período base, fecha_limite_planeacion del período base + 1 año], y dentro de su ventana de fechas.
     */
    private function computeInformeEligibility(PlanTrabajo $planTrabajo): array
    {
        $periodoBase = Periodo::find($planTrabajo->periodo_id);
        if (!$periodoBase) {
            return [
                'canCreate' => false,
                'presentedCount' => 0,
                'allowedPeriodId' => null,
                'reason' => 'El período del plan no existe.',
                'missingNextPeriod' => false,
            ];
        }

        $hoy = now();
        $inWindowBase = $hoy->between($periodoBase->fecha_limite_planeacion, $periodoBase->fecha_limite_evidencias);

        $presentedCount = InformePlanTrabajo::where('plan_trabajo_id', $planTrabajo->id)->count();

        if ($planTrabajo->vigencia === 'Semestral') {
            if ($presentedCount >= 1) {
                return [
                    'canCreate' => false,
                    'presentedCount' => $presentedCount,
                    'allowedPeriodId' => null,
                    'reason' => 'Ya existe un informe para este período (plan semestral).',
                    'missingNextPeriod' => false,
                ];
            }
            return [
                'canCreate' => $inWindowBase,
                'presentedCount' => $presentedCount,
                'allowedPeriodId' => $inWindowBase ? $periodoBase->id : null,
                'reason' => $inWindowBase ? null : 'Fuera de las fechas del período del plan.',
                'missingNextPeriod' => false,
            ];
        }

        if ($planTrabajo->vigencia === 'Anual') {
            if ($presentedCount === 0) {
                return [
                    'canCreate' => $inWindowBase,
                    'presentedCount' => 0,
                    'allowedPeriodId' => $inWindowBase ? $periodoBase->id : null,
                    'reason' => $inWindowBase ? null : 'Fuera de las fechas del período del plan.',
                    'missingNextPeriod' => false,
                ];
            }

            if ($presentedCount >= 2) {
                return [
                    'canCreate' => false,
                    'presentedCount' => $presentedCount,
                    'allowedPeriodId' => null,
                    'reason' => 'Ya se presentaron los informes permitidos para este plan anual.',
                    'missingNextPeriod' => false,
                ];
            }

            // Segundo informe: buscar período candidato entre [evidencias_base, planeacion_base + 1 año]
            $limiteInferior = $periodoBase->fecha_limite_evidencias; // no traer periodos anteriores
            $limiteSuperior = $periodoBase->fecha_limite_planeacion->copy()->addYear();

            $periodosPosibles = Periodo::whereBetween('fecha_limite_planeacion', [$limiteInferior, $limiteSuperior])
                ->orderBy('fecha_limite_planeacion', 'asc')
                ->get();

            $periodoCandidato = $periodosPosibles->first(function ($p) use ($hoy) {
                return $hoy->between($p->fecha_limite_planeacion, $p->fecha_limite_evidencias);
            });

            if (!$periodoCandidato) {
                return [
                    'canCreate' => false,
                    'presentedCount' => $presentedCount,
                    'allowedPeriodId' => null,
                    'reason' => 'Aún no hay un período activo dentro del rango permitido para el segundo informe.',
                    'missingNextPeriod' => $periodosPosibles->isEmpty(),
                ];
            }

            $yaHayEnCandidato = InformePlanTrabajo::where('plan_trabajo_id', $planTrabajo->id)
                ->where('periodo_id', $periodoCandidato->id)
                ->exists();

            if ($yaHayEnCandidato) {
                return [
                    'canCreate' => false,
                    'presentedCount' => $presentedCount,
                    'allowedPeriodId' => null,
                    'reason' => 'Ya existe un informe en el período candidato.',
                    'missingNextPeriod' => false,
                ];
            }

            return [
                'canCreate' => true,
                'presentedCount' => $presentedCount,
                'allowedPeriodId' => $periodoCandidato->id,
                'reason' => null,
                'missingNextPeriod' => false,
            ];
        }

        return [
            'canCreate' => false,
            'presentedCount' => $presentedCount,
            'allowedPeriodId' => null,
            'reason' => 'Vigencia no soportada.',
            'missingNextPeriod' => false,
        ];
    }

    // --- Métodos de Actividades del Plan ---
    public function actividadesPlan(User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        $actividades = $planTrabajo->actividades()->with('actividadInvestigacion')->get();
        $actividadesInvestigacion = ActividadesInvestigacion::all(['id', 'nombre']);
        
        return inertia('Investigadores/ActividadesPlan', [
            'investigador' => $investigador,
            'planTrabajo' => $planTrabajo,
            'actividades' => $actividades,
            'actividadesInvestigacion' => $actividadesInvestigacion,
        ]);
    }

    public function createActividadPlan(User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        $actividadesInvestigacion = ActividadesInvestigacion::all(['id', 'nombre']);
        
        return inertia('Investigadores/ActividadPlanCreate', [
            'investigador' => $investigador,
            'planTrabajo' => $planTrabajo,
            'actividadesInvestigacion' => $actividadesInvestigacion,
        ]);
    }

    public function storeActividadPlan(Request $request, User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        
        $request->validate([
            'actividad_investigacion_id' => 'required|exists:actividades_investigacions,id',
            'alcance' => 'required|string|max:1000',
            'entregable' => 'required|string|max:1000',
            'horas_semana' => 'required|integer|min:1',
            'total_horas' => 'required|integer|min:1',
            'porcentaje_progreso' => 'required|integer|min:0|max:100',
        ]);

        $planTrabajo->actividades()->create([
            'actividad_investigacion_id' => $request->actividad_investigacion_id,
            'periodo_id' => $planTrabajo->periodo_id, // Heredar del plan de trabajo
            'alcance' => $request->alcance,
            'entregable' => $request->entregable,
            'horas_semana' => $request->horas_semana,
            'total_horas' => $request->total_horas,
            'porcentaje_progreso' => $request->porcentaje_progreso,
        ]);

        return to_route('investigadores.planes-trabajo.show', [$investigador->id, $planTrabajoId])->with('success', 'Actividad del plan creada exitosamente.');
    }

    public function editActividadPlan(User $investigador, $planTrabajoId, $actividadPlanId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        $actividad = $planTrabajo->actividades()->findOrFail($actividadPlanId);
        $actividadesInvestigacion = ActividadesInvestigacion::all(['id', 'nombre']);
        
        return inertia('Investigadores/ActividadPlanEdit', [
            'investigador' => $investigador,
            'planTrabajo' => $planTrabajo,
            'actividad' => $actividad,
            'actividadesInvestigacion' => $actividadesInvestigacion,
        ]);
    }

    public function updateActividadPlan(Request $request, User $investigador, $planTrabajoId, $actividadPlanId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        $actividad = $planTrabajo->actividades()->findOrFail($actividadPlanId);
        
        $request->validate([
            'actividad_investigacion_id' => 'required|exists:actividades_investigacions,id',
            'alcance' => 'required|string|max:1000',
            'entregable' => 'required|string|max:1000',
            'horas_semana' => 'required|integer|min:1',
            'total_horas' => 'required|integer|min:1',
            'porcentaje_progreso' => 'required|integer|min:0|max:100',
        ]);

        $actividad->update([
            'actividad_investigacion_id' => $request->actividad_investigacion_id,
            'alcance' => $request->alcance,
            'entregable' => $request->entregable,
            'horas_semana' => $request->horas_semana,
            'total_horas' => $request->total_horas,
            'porcentaje_progreso' => $request->porcentaje_progreso,
            // El periodo_id se mantiene igual (heredado del plan)
        ]);

        return to_route('investigadores.planes-trabajo.show', [$investigador->id, $planTrabajoId])->with('success', 'Actividad del plan actualizada exitosamente.');
    }

    public function destroyActividadPlan(User $investigador, $planTrabajoId, $actividadPlanId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        $actividad = $planTrabajo->actividades()->findOrFail($actividadPlanId);
        $actividad->delete();
        
        return to_route('investigadores.planes-trabajo.show', [$investigador->id, $planTrabajoId])->with('success', 'Actividad del plan eliminada exitosamente.');
    }

    // --- Método para aprobar planes de trabajo ---
    public function aprobarPlanTrabajo(User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);
        
        // Verificar que el plan tenga al menos una actividad
        if ($planTrabajo->actividades()->count() === 0) {
            return back()->withErrors(['plan' => 'No se puede aprobar un plan sin actividades.']);
        }

        $planTrabajo->update([
            'estado' => 'Aprobado'
        ]);

        return to_route('investigadores.planes-trabajo.show', [$investigador->id, $planTrabajoId])->with('success', 'Plan de trabajo aprobado exitosamente.');
    }

    // --- Método para rechazar planes de trabajo ---
    public function rechazarPlanTrabajo(User $investigador, $planTrabajoId)
    {
        $planTrabajo = $investigador->planesTrabajo()->findOrFail($planTrabajoId);

        $planTrabajo->update([
            'estado' => 'Rechazado'
        ]);

        return to_route('investigadores.planes-trabajo.show', [$investigador->id, $planTrabajoId])->with('success', 'Plan de trabajo rechazado exitosamente.');
    }

    // --- Método para enviar plan para revisión (desde rechazado a pendiente) ---
    public function enviarParaRevision(User $investigador, $planTrabajoId)
    {
        $planTrabajo = PlanTrabajo::where('user_id', $investigador->id)
            ->findOrFail($planTrabajoId);

        $planTrabajo->estado = 'Pendiente';
        $planTrabajo->save();

        return to_route('investigadores.planes-trabajo.show', [$investigador->id, $planTrabajoId])->with('success', 'Plan de trabajo enviado para revisión exitosamente.');
    }

    public function revisionPlanTrabajo(Request $request, User $investigador, PlanTrabajo $planTrabajo)
    {
        $request->validate([
            'estado' => 'required|in:Creado,Aprobado,Corrección,Rechazado',
            'comentario' => 'required|string|min:10'
        ]);

        // $planTrabajo = PlanTrabajo::where('user_id', $investigador->id)
        //     ->findOrFail($planTrabajoId);

        // Cambiar el estado del plan
        $planTrabajo->estado = $request->estado;
        $planTrabajo->save();

        // Crear la revisión para el historial
        $planTrabajo->crearRevision([
            'user_id' => Auth::id(),
            'estado' => $request->estado,
            'comentario' => $request->comentario
        ]);

        return redirect()->back()->with('success', 'Revisión realizada exitosamente');
    }
} 