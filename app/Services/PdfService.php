<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\PlanTrabajo;

class PdfService
{
    /**
     * Genera un PDF genérico desde una vista con opciones unificadas.
     * Retorna la instancia Pdf para permitir stream() o download().
     */
    public function generateFromView(string $view, array $data = [], string $paper = 'A4', string $orientation = 'portrait', array $extraOptions = [])
    {
        $html = view($view, $data)->render();
        
        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper($paper, $orientation);
        
        $defaultOptions = [
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => false,
            'isRemoteEnabled' => false,
            'defaultFont' => 'Arial',
            'chroot' => public_path(),
            'enable_font_subsetting' => false,
            'pdf_backend' => 'CPDF',
            'default_media_type' => 'screen',
            'default_paper_size' => strtolower($paper),
            'default_font_size' => '11',
            'default_font' => 'Arial',
            'margin_left' => 15,
            'margin_right' => 15,
            'margin_top' => 15,
            'margin_bottom' => 15,
            'margin_header' => 5,
            'margin_footer' => 5,
            'orientation' => strtolower($orientation),
            'dpi' => 150,
            'font_height_ratio' => 0.9,
        ];
        
        $pdf->setOptions(array_merge($defaultOptions, $extraOptions));
        
        return $pdf;
    }

    /**
     * Genera un PDF del plan de trabajo
     */
    public function generatePlanTrabajoPdf(PlanTrabajo $plan)
    {
        // Cargar las relaciones necesarias
        $plan->load(['user', 'actividades.actividadInvestigacion']);
        
        $html = view('pdfs.plan-trabajo', compact('plan'))->render();
        
        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');
        
        // Configuraciones adicionales para mejor compatibilidad
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => false,
            'isRemoteEnabled' => false,
            'defaultFont' => 'Arial',
            'chroot' => public_path(),
            'enable_font_subsetting' => false,
            'pdf_backend' => 'CPDF',
            'default_media_type' => 'screen',
            'default_paper_size' => 'a4',
            'default_font_size' => '11',
            'default_font' => 'Arial',
            'margin_left' => 15,
            'margin_right' => 15,
            'margin_top' => 15,
            'margin_bottom' => 15,
            'margin_header' => 5,
            'margin_footer' => 5,
            'orientation' => 'portrait',
            'dpi' => 150,
            'font_height_ratio' => 0.9,
        ]);
        
        return $pdf;
    }

    /**
     * Genera un PDF con el listado de investigadores
     */
    public function generateInvestigadoresPdf($investigadores, $user)
    {
        $html = view('pdfs.investigadores', compact('investigadores', 'user'))->render();
        
        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'landscape'); // Horizontal para más columnas
        
        // Configuraciones adicionales para mejor compatibilidad
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => false,
            'isRemoteEnabled' => false,
            'defaultFont' => 'Arial',
            'chroot' => public_path(),
            'enable_font_subsetting' => false,
            'pdf_backend' => 'CPDF',
            'default_media_type' => 'screen',
            'default_paper_size' => 'a4',
            'default_font_size' => '11',
            'default_font' => 'Arial',
            'margin_left' => 15,
            'margin_right' => 15,
            'margin_top' => 15,
            'margin_bottom' => 15,
            'margin_header' => 5,
            'margin_footer' => 5,
            'orientation' => 'landscape',
            'dpi' => 150,
            'font_height_ratio' => 0.9,
        ]);
        
        return $pdf;
    }
}
