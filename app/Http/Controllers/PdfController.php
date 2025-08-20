<?php

namespace App\Http\Controllers;

use App\Models\PlanTrabajo;
use App\Models\User;
use App\Services\PdfService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PdfController extends Controller
{
    protected $pdfService;

    public function __construct(PdfService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Descarga el PDF del plan de trabajo
     */
    public function planTrabajo(PlanTrabajo $planTrabajo)
    {
        // Verificar permisos - solo el propietario o revisores pueden descargar
        if (!Auth::user() || (Auth::user()->id !== $planTrabajo->user_id && !Auth::user()->hasRole(['Administrador', 'Lider Grupo']))) {
            abort(403, 'No tienes permisos para acceder a este plan de trabajo.');
        }
        // return $planTrabajo->user->name;
        
        $pdf = $this->pdfService->generatePlanTrabajoPdf($planTrabajo);
        
        $filename = "{$planTrabajo->nombre}-" . now()->format('Y-m-d') . ".pdf";
        
        return $pdf->download($filename);
    }

    /**
     * Muestra una vista previa del PDF (opcional)
     */
    public function preview(PlanTrabajo $planTrabajo)
    {
        // Verificar permisos
        if (!Auth::user() || (Auth::user()->id !== $planTrabajo->user_id && !Auth::user()->hasRole(['Administrador', 'Lider Grupo']))) {
            abort(403, 'No tienes permisos para acceder a este plan de trabajo.');
        }
        
        $pdf = $this->pdfService->generatePlanTrabajoPdf($planTrabajo);
        
        return $pdf->stream("plan-trabajo-{$planTrabajo->nombre}.pdf");
    }

    /**
     * Genera PDF con listado de investigadores
     */
    public function investigadores()
    {
        $user = Auth::user();
        
        if (!$user) {
            abort(403, 'No tienes permisos para acceder a este reporte.');
        }
        
        // Filtrar investigadores según el rol del usuario
        if ($user->hasRole('Administrador')) {
            // Administrador ve todos los investigadores y líderes
            $investigadores = User::with(['grupo_investigacion', 'escalafonProfesoral', 'tipoContrato'])
                ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
                ->orderBy('grupo_investigacion_id')
                ->orderBy('name')
                ->get();
        } elseif ($user->hasRole('Lider Grupo')) {
            // Líder ve solo los de su grupo
            $investigadores = User::with(['grupo_investigacion', 'escalafonProfesoral', 'tipoContrato'])
                ->where('grupo_investigacion_id', $user->grupo_investigacion_id)
                ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
                ->orderBy('name')
                ->get();
        } else {
            abort(403, 'No tienes permisos para acceder a este reporte.');
        }
        
        $pdf = $this->pdfService->generateInvestigadoresPdf($investigadores, $user);
        
        $filename = "investigadores-" . now()->format('Y-m-d') . ".pdf";
        
        return $pdf->download($filename);
    }

    /**
     * Vista previa del PDF de investigadores
     */
    public function previewInvestigadores()
    {
        $user = Auth::user();
        
        if (!$user) {
            abort(403, 'No tienes permisos para acceder a este reporte.');
        }
        
        // Filtrar investigadores según el rol del usuario
        if ($user->hasRole('Administrador')) {
            $investigadores = User::with(['grupo_investigacion', 'escalafon_profesoral', 'tipoContrato'])
                ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
                ->orderBy('grupo_investigacion_id')
                ->orderBy('name')
                ->get();
        } elseif ($user->hasRole('Lider Grupo')) {
            $investigadores = User::with(['grupo_investigacion', 'escalafon_profesoral', 'tipoContrato'])
                ->where('grupo_investigacion_id', $user->grupo_investigacion_id)
                ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
                ->orderBy('name')
                ->get();
        } else {
            abort(403, 'No tienes permisos para acceder a este reporte.');
        }
        
        $pdf = $this->pdfService->generateInvestigadoresPdf($investigadores, $user);
        
        return $pdf->stream("investigadores.pdf");
    }
}
