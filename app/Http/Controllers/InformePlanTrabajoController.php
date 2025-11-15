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

        $planTrabajo->load([
            'actividades.actividadInvestigacion',
            'periodoInicio',
            'periodoFin',
            'informes',
        ]);

        $periodoElegible = $this->obtenerPeriodoElegibleParaInforme($planTrabajo);

        return inertia('Investigadores/InformeCreate', [
            'planTrabajo' => $planTrabajo,
            'investigadorId' => $planTrabajo->user_id,
            'puedeCrear' => $planTrabajo->estado === 'Aprobado' && $periodoElegible !== null,
            'periodo' => $periodoElegible,
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

        $planTrabajo->loadMissing(['periodoInicio', 'periodoFin', 'informes']);
        $periodoElegible = $this->obtenerPeriodoElegibleParaInforme($planTrabajo);

        if (!$periodoElegible) {
            return back()->withErrors(['periodo' => 'No hay períodos disponibles (activos y sin informes previos) para registrar un nuevo informe.']);
        }

        $periodoId = $periodoElegible->id;

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
     * Obtiene el período (inicio o fin) disponible para registrar un informe.
     */
    private function obtenerPeriodoElegibleParaInforme(PlanTrabajo $planTrabajo): ?Periodo
    {
        $planTrabajo->loadMissing(['periodoInicio', 'periodoFin', 'informes']);

        $periodos = collect([
            $planTrabajo->periodoInicio,
            $planTrabajo->vigencia === 'Anual' ? $planTrabajo->periodoFin : null,
        ])->filter()->unique(fn ($periodo) => $periodo->id)->values();

        if ($periodos->isEmpty()) {
            return null;
        }

        $periodosUsados = $planTrabajo->informes
            ->pluck('periodo_id')
            ->filter()
            ->unique()
            ->values();

        $fechaActual = now();

        return $periodos->first(function (?Periodo $periodo) use ($periodosUsados, $fechaActual) {
            if (!$periodo) {
                return false;
            }

            if ($periodo->estado !== 'Activo') {
                return false;
            }

            if ($periodo->fecha_limite_planeacion && $fechaActual->lt($periodo->fecha_limite_planeacion)) {
                return false;
            }

            if ($periodo->fecha_limite_evidencias && $fechaActual->gt($periodo->fecha_limite_evidencias)) {
                return false;
            }

            if ($periodosUsados->contains($periodo->id)) {
                return false;
            }

            return true;
        });
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

        // Unificar para usar la vista de preview (mejor soporte de SVG y estilos)
        $pdf = $pdfService->generateFromView('pdfs.informe-plan-trabajo-preview', $data, 'A4', 'portrait');
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


