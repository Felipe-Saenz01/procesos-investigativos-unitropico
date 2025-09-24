<?php

namespace App\Http\Controllers;

use App\Models\ActividadesPlan;
use App\Models\EvidenciaInforme;
use App\Models\InformePlanTrabajo;
use App\Models\Periodo;
use App\Models\PlanTrabajo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\PdfService;

class InformePlanTrabajoController extends Controller
{
    /**
     * Formulario para crear informe del plan de trabajo.
     */
    public function create(User $investigador, PlanTrabajo $planTrabajo)
    {
        $user = Auth::user();
        if ($user->id !== $planTrabajo->user_id && (!$user->can('revisar-planes') && !$user->hasRole('Administrador'))) {
            abort(403, 'No autorizado para crear informes de este plan.');
        }

        // Validar si se puede crear informe
        $periodo = Periodo::find($planTrabajo->periodo_id);
        $fechaActual = now();
        $enFechaValida = $periodo && $fechaActual >= $periodo->fecha_limite_planeacion && $fechaActual <= $periodo->fecha_limite_evidencias;
        
        $planTrabajo->load(['actividades.actividadInvestigacion', 'periodo']);

        return inertia('Investigadores/InformeCreate', [
            'planTrabajo' => $planTrabajo,
            'investigadorId' => $planTrabajo->user_id,
            'puedeCrear' => $planTrabajo->estado === 'Aprobado' && $enFechaValida,
            'periodo' => $periodo,
        ]);
    }

    /**
     * Crea un informe y registra evidencias asociadas a las actividades.
     */
    public function store(Request $request, User $investigador, PlanTrabajo $planTrabajo)
    {
        // return $request;
        // Autorización básica: dueño del plan o permiso de revisión
        $user = Auth::user();
        if ($user->id !== $planTrabajo->user_id && (!$user->can('revisar-planes') && !$user->hasRole('Administrador'))) {
            abort(403, 'No autorizado para crear informes de este plan.');
        }

        $validated = $request->validate([
            'evidencias' => ['required', 'array', 'min:1'],
            'evidencias.*.actividad_plan_id' => ['required', 'exists:actividades_plans,id'],
            'evidencias.*.tipo_evidencia' => ['required', Rule::in(['Archivo', 'Enlace'])],
            'evidencias.*.archivo' => ['nullable', 'file', 'max:10240'], // 10MB
            'evidencias.*.url_link' => ['nullable', 'string', 'max:2048'],
            'evidencias.*.porcentaje_progreso_nuevo' => ['required', 'integer', 'min:0', 'max:100'],
            'evidencias.*.descripcion' => ['required', 'string', 'min:10'],
        ]);

        // Solo si el plan está aprobado
        if ($planTrabajo->estado !== 'Aprobado') {
            return back()->withErrors(['plan' => 'Solo se puede generar un informe cuando el plan está Aprobado.']);
        }

        // Validar fechas del período del plan
        $periodo = Periodo::find($planTrabajo->periodo_id);
        if (!$periodo) {
            return back()->withErrors(['periodo' => 'El período del plan no existe.']);
        }

        $fechaActual = now();
            if ($fechaActual < $periodo->fecha_limite_planeacion || $fechaActual > $periodo->fecha_limite_evidencias) {
            return back()->withErrors(['periodo' => 'No se puede presentar informe fuera de las fechas del período del plan.']);
        }

        // Validar informes según vigencia
        $periodoId = $planTrabajo->periodo_id;
        if ($planTrabajo->vigencia === 'Semestral') {
            // Solo un informe en el mismo período
            $existeInforme = InformePlanTrabajo::where('plan_trabajo_id', $planTrabajo->id)
                ->where('periodo_id', $periodoId)
                ->exists();
            if ($existeInforme) {
                return back()->withErrors(['periodo' => 'Ya existe un informe para este período (plan semestral).']);
            }
        } else if ($planTrabajo->vigencia === 'Anual') {
            // Un informe en el período actual y otro en el siguiente
            $periodoSiguiente = Periodo::where('id', '>', $planTrabajo->periodo_id)
                ->orderBy('id')
                ->first();
            
            $periodosPermitidos = [$periodoId];
            if ($periodoSiguiente) {
                $periodosPermitidos[] = $periodoSiguiente->id;
            }

            $informesExistentes = InformePlanTrabajo::where('plan_trabajo_id', $planTrabajo->id)
                ->whereIn('periodo_id', $periodosPermitidos)
                ->count();

            if ($informesExistentes >= count($periodosPermitidos)) {
                return back()->withErrors(['periodo' => 'Ya se han presentado todos los informes permitidos para este plan anual.']);
            }
        }

        // Crear informe
        $informe = InformePlanTrabajo::create([
            'plan_trabajo_id' => $planTrabajo->id,
            'periodo_id' => $periodoId,
            'investigador_id' => $planTrabajo->user_id,
            'fecha_informe' => now(),
        ]);

        // Registrar evidencias y actualizar progreso
        foreach ($validated['evidencias'] as $evidenciaData) {
            
            $actividadPlan = ActividadesPlan::findOrFail($evidenciaData['actividad_plan_id']);

            // Asegurar que la actividad corresponde al plan
            if ($actividadPlan->plan_trabajo_id !== $planTrabajo->id) {
                continue; // Ignorar ajenas al plan
            }

            $progresoAnterior = (int) $actividadPlan->porcentaje_progreso;
            $progresoNuevo = (int) $evidenciaData['porcentaje_progreso_nuevo'];

            // No permitir disminuir progreso
            if ($progresoNuevo < $progresoAnterior) {
                return back()->withErrors([
                    'evidencias' => 'El progreso nuevo no puede ser menor que el progreso actual.',
                ]);
            }

            $rutaArchivo = null;
            $urlLink = null;

            // Procesar archivo si está presente
            $requestFile = $evidenciaData['archivo'] ?? null;
            if (isset($requestFile) && $requestFile) {
                $dir = 'informes/' . $planTrabajo->id . '/' . $informe->id;
                $original = $requestFile->getClientOriginalName();
                $path = $requestFile->storeAs($dir, $original, 'public');
                $rutaArchivo = $path;
            }

            // Procesar enlace si está presente
            $urlLink = $evidenciaData['url_link'] ?? null;

            EvidenciaInforme::create([
                'informe_id' => $informe->id,
                'actividad_plan_id' => $actividadPlan->id,
                'tipo_evidencia' => $evidenciaData['tipo_evidencia'],
                'ruta_archivo' => $rutaArchivo,
                'url_link' => $urlLink,
                'porcentaje_progreso_anterior' => $progresoAnterior,
                'porcentaje_progreso_nuevo' => $progresoNuevo,
                'descripcion' => $evidenciaData['descripcion'] ?? null,
            ]);

            // Actualizar progreso de la actividad
            $actividadPlan->update(['porcentaje_progreso' => $progresoNuevo]);
        }

        return to_route('investigadores.planes-trabajo', $investigador->id)->with('success', 'Informe creado correctamente.');
    }

    /**
     * Verifica si el período es válido según la vigencia del plan.
     */
    private function periodoPermitidoParaPlan(PlanTrabajo $plan, int $periodoId): bool
    {
        if ($plan->vigencia === 'Semestral') {
            return $plan->periodo_id === $periodoId;
        }

        if ($plan->vigencia === 'Anual') {
            $periodoSiguiente = Periodo::where('id', '>', $plan->periodo_id)
                ->orderBy('id')
                ->first();
            $permitidos = [$plan->periodo_id];
            if ($periodoSiguiente) {
                $permitidos[] = $periodoSiguiente->id;
            }
            return in_array($periodoId, $permitidos, true);
        }

        return false;
    }

    /**
     * Genera PDF del informe de plan de trabajo (descarga directa).
     */
    public function generarPdf(User $investigador, PlanTrabajo $planTrabajo, $informeId, PdfService $pdfService)
    {
        $user = Auth::user();
        if ($user->id !== $planTrabajo->user_id && (!$user->can('revisar-planes') && !$user->hasRole('Administrador'))) {
            abort(403, 'No autorizado para ver este informe.');
        }

        $informe = $planTrabajo->informes()
            ->with(['evidencias.actividadPlan.actividadInvestigacion', 'periodo'])
            ->findOrFail($informeId);
        
        $actividades = $planTrabajo->actividades()
            ->with('actividadInvestigacion')
            ->get();

        // Calcular progreso promedio
        $progresoPromedio = $actividades->avg('porcentaje_progreso') ?? 0;
        
        // Preparar datos para el PDF
        $data = [
            'informe' => $informe,
            'planTrabajo' => $planTrabajo,
            'investigador' => $investigador,
            'actividades' => $actividades,
            'evidencias' => $informe->evidencias,
            'fechaGeneracion' => now()->format('d/m/Y H:i'),
        ];

        $pdf = $pdfService->generateFromView('pdfs.informe-plan-trabajo', $data, 'A4', 'portrait');
        $nombreArchivo = "Informe_{$planTrabajo->nombre}_{$informe->created_at->format('Y-m-d')}.pdf";
        // Mantengo descarga directa en este endpoint
        return $pdf->download($nombreArchivo);
    }

    /**
     * Genera PDF del informe de plan de trabajo (preview en navegador).
     */
    public function previewPdf(User $investigador, PlanTrabajo $planTrabajo, $informeId, PdfService $pdfService)
    {
        $user = Auth::user();
        if ($user->id !== $planTrabajo->user_id && (!$user->can('revisar-planes') && !$user->hasRole('Administrador'))) {
            abort(403, 'No autorizado para ver este informe.');
        }

        $informe = $planTrabajo->informes()
            ->with(['evidencias.actividadPlan.actividadInvestigacion', 'periodo'])
            ->findOrFail($informeId);
        
        $actividades = $planTrabajo->actividades()
            ->with('actividadInvestigacion')
            ->get();

        // Calcular progreso promedio
        $progresoPromedio = $actividades->avg('porcentaje_progreso') ?? 0;
        
        // Preparar datos para el PDF
        $data = [
            'informe' => $informe,
            'planTrabajo' => $planTrabajo,
            'investigador' => $investigador,
            'actividades' => $actividades,
            'evidencias' => $informe->evidencias,
            'progresoPromedio' => round($progresoPromedio, 1),
            'fechaGeneracion' => now()->format('d/m/Y H:i'),
        ];

        $pdf = $pdfService->generateFromView('pdfs.informe-plan-trabajo-preview', $data, 'A4', 'portrait');
        
        return $pdf->stream("Informe_{$planTrabajo->nombre}_{$informe->created_at->format('Y-m-d')}.pdf");
    }

    /**
     * Descarga un archivo de evidencia.
     */
    public function descargarEvidencia(User $investigador, PlanTrabajo $planTrabajo, $informeId, $evidenciaId)
    {
        $user = Auth::user();
        if ($user->id !== $planTrabajo->user_id && (!$user->can('revisar-planes') && !$user->hasRole('Administrador'))) {
            abort(403, 'No autorizado para descargar esta evidencia.');
        }

        $evidencia = EvidenciaInforme::where('informe_id', $informeId)
            ->where('id', $evidenciaId)
            ->firstOrFail();

        if (!$evidencia->ruta_archivo) {
            abort(404, 'No hay archivo asociado a esta evidencia.');
        }

        $filePath = Storage::disk('public')->path($evidencia->ruta_archivo);
        if (!file_exists($filePath)) {
            abort(404, 'El archivo no existe.');
        }

        $fileName = basename($evidencia->ruta_archivo);
        return response()->download($filePath, $fileName);
    }
}


