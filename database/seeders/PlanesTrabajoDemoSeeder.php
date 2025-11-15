<?php

namespace Database\Seeders;

use App\Models\ActividadesInvestigacion;
use App\Models\ActividadesPlan;
use App\Models\EvidenciaInforme;
use App\Models\InformePlanTrabajo;
use App\Models\Periodo;
use App\Models\PlanTrabajo;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlanesTrabajoDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::beginTransaction();
        try {
            // Crear o asegurar períodos base
            $periodosDef = [
                [
                    'nombre' => '2025-A',
                    'fecha_limite_planeacion' => now()->subMonths(18)->startOfMonth(),
                    'fecha_limite_evidencias' => now()->subMonths(12)->endOfMonth(),
                    'estado' => 'Cerrado',
                ],
                [
                    'nombre' => '2025-B',
                    'fecha_limite_planeacion' => now()->subMonths(12)->startOfMonth(),
                    'fecha_limite_evidencias' => now()->subMonths(6)->endOfMonth(),
                    'estado' => 'Cerrado',
                ],
                [
                    'nombre' => '2026-A',
                    'fecha_limite_planeacion' => now()->subMonths(6)->startOfMonth(),
                    'fecha_limite_evidencias' => now()->addMonths(1)->endOfMonth(),
                    'estado' => 'Abierto',
                ],
            ];

            $periodos = collect();
            foreach ($periodosDef as $p) {
                $periodos->push(
                    Periodo::firstOrCreate(
                        ['nombre' => $p['nombre']],
                        [
                            'fecha_limite_planeacion' => $p['fecha_limite_planeacion'],
                            'fecha_limite_evidencias' => $p['fecha_limite_evidencias'],
                            'estado' => $p['estado'],
                        ]
                    )
                );
            }

            // Obtener investigadores y líderes de grupo
            $investigadores = User::query()
                ->whereHas('roles', function ($q) {
                    $q->whereIn('name', ['Investigador', 'Lider Grupo']);
                })
                ->get();

            if ($investigadores->isEmpty()) {
                Log::info('PlanesTrabajoDemoSeeder: No hay usuarios con rol Investigador/Lider Grupo.');
            }

            // Actividad base para asociar a las actividades del plan
            $actividadInvestigacion = ActividadesInvestigacion::first();

            // Enlace común para evidencias
            $linkEvidencia = 'https://docs.google.com/document/d/1CdybPEVOZ4OHISk3wwQ13TS-Le-fzv7n/edit';

            foreach ($investigadores as $investigador) {
                foreach ($periodos as $periodo) {
                    // Crear un plan por investigador y período si no existe
                    $vigencia = in_array($periodo->nombre, ['2025-A', '2025-B']) ? 'Semestral' : 'Anual';
                    $periodoFin = $vigencia === 'Semestral'
                        ? $periodo
                        : $this->obtenerPeriodoSiguiente($periodo);

                    $plan = PlanTrabajo::updateOrCreate(
                        [
                            'user_id' => $investigador->id,
                            'periodo_inicio_id' => $periodo->id,
                            'nombre' => 'Plan de Trabajo ' . $periodo->nombre . ' - ' . $investigador->name,
                        ],
                        [
                            'vigencia' => $vigencia,
                            'estado' => 'Aprobado',
                            'periodo_fin_id' => $periodoFin->id,
                        ]
                    );

                    // Crear una actividad base en el plan (necesaria para evidencias)
                    $actividadPlan = null;
                    if ($actividadInvestigacion) {
                        $actividadPlan = ActividadesPlan::firstOrCreate(
                            [
                                'plan_trabajo_id' => $plan->id,
                                'actividad_investigacion_id' => $actividadInvestigacion->id,
                                'periodo_id' => $periodo->id,
                            ],
                            [
                                'alcance' => 'Actividad de demostración para el plan.',
                                'entregable' => 'Entregable de ejemplo.',
                                'horas_semana' => 4,
                                'total_horas' => 64,
                                'porcentaje_progreso' => 0,
                            ]
                        );
                    }

                    // Crear informe del plan
                    $informe = InformePlanTrabajo::firstOrCreate(
                        [
                            'plan_trabajo_id' => $plan->id,
                            'periodo_id' => $periodo->id,
                            'investigador_id' => $investigador->id,
                        ],
                        [
                            'fecha_informe' => now()->subDays(rand(5, 60)),
                            'descripcion_general' => 'Informe automático de demostración para ' . $periodo->nombre,
                        ]
                    );

                    // Crear evidencias (2 por informe) con el mismo link
                    if ($actividadPlan) {
                        $progresos = [
                            ['prev' => 10, 'nuevo' => 35],
                            ['prev' => 35, 'nuevo' => 60],
                        ];

                        foreach ($progresos as $p) {
                            EvidenciaInforme::firstOrCreate(
                                [
                                    'informe_id' => $informe->id,
                                    'actividad_plan_id' => $actividadPlan->id,
                                    'porcentaje_progreso_anterior' => $p['prev'],
                                    'porcentaje_progreso_nuevo' => $p['nuevo'],
                                ],
                                [
                                    'tipo_evidencia' => 'Enlace',
                                    'ruta_archivo' => null,
                                    'url_link' => $linkEvidencia,
                                    'descripcion' => 'Evidencia de avance automático.',
                                ]
                            );
                        }
                    }
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('PlanesTrabajoDemoSeeder error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            throw $e;
        }
    }

    private function obtenerPeriodoSiguiente(Periodo $periodo): Periodo
    {
        $coincidencia = [];
        if (!preg_match('/^(?P<year>\d{4})-(?P<label>A|B)$/', $periodo->nombre, $coincidencia)) {
            return $periodo;
        }

        $year = (int) $coincidencia['year'];
        $label = $coincidencia['label'];

        if ($label === 'A') {
            $targetYear = $year;
            $targetLabel = 'B';
        } else {
            $targetYear = $year + 1;
            $targetLabel = 'A';
        }

        $nombreObjetivo = sprintf('%d-%s', $targetYear, $targetLabel);

        $periodoExistente = Periodo::where('nombre', $nombreObjetivo)->first();
        if ($periodoExistente) {
            return $periodoExistente;
        }

        $planeacionBase = $periodo->fecha_limite_planeacion instanceof \Carbon\Carbon
            ? $periodo->fecha_limite_planeacion->copy()
            : ($periodo->fecha_limite_planeacion ? \Carbon\Carbon::parse($periodo->fecha_limite_planeacion) : now());

        $evidenciasBase = $periodo->fecha_limite_evidencias instanceof \Carbon\Carbon
            ? $periodo->fecha_limite_evidencias->copy()
            : ($periodo->fecha_limite_evidencias ? \Carbon\Carbon::parse($periodo->fecha_limite_evidencias) : $planeacionBase->copy()->addMonths(3));

        $planeacionNueva = $planeacionBase->copy()->addMonths(6);
        $evidenciasNueva = $evidenciasBase->copy()->addMonths(6);

        if ($evidenciasNueva->lessThanOrEqualTo($planeacionNueva)) {
            $evidenciasNueva = $planeacionNueva->copy()->addWeeks(2);
        }

        return Periodo::create([
            'nombre' => $nombreObjetivo,
            'fecha_limite_planeacion' => $planeacionNueva,
            'fecha_limite_evidencias' => $evidenciasNueva,
            'estado' => 'Activo',
        ]);
    }
}


