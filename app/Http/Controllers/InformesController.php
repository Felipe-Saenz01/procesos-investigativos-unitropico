<?php

namespace App\Http\Controllers;

use App\Models\PlanTrabajo;
use App\Models\InformePlanTrabajo;
use App\Models\Periodo;
use App\Models\GrupoInvestigacion;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\PdfService;

class InformesController extends Controller
{
    /**
     * Dashboard de planes de trabajo
     */
    public function planesTrabajo()
    {
        $user = Auth::user();
        
        // Estadísticas de planes de trabajo
        $totalPlanesTrabajo = PlanTrabajo::count();
        $planesAprobados = PlanTrabajo::where('estado', 'Aprobado')->count();
        $planesPendientes = PlanTrabajo::where('estado', 'Pendiente')->count();
        $planesEnCorreccion = PlanTrabajo::where('estado', 'Corrección')->count();
        $planesTerminados = PlanTrabajo::where('estado', 'Terminado')->count();
        
        // Estadísticas de cumplimiento basadas en informes
        $estadisticasCumplimiento = DB::select("
            SELECT 
                COUNT(DISTINCT pt.id) as total_planes,
                COUNT(DISTINCT CASE WHEN ipt.id IS NOT NULL THEN pt.id END) as planes_con_informes,
                COUNT(DISTINCT CASE WHEN ipt.id IS NULL THEN pt.id END) as planes_sin_informes,
                ROUND(
                    (COUNT(DISTINCT CASE WHEN ipt.id IS NOT NULL THEN pt.id END) * 100.0 / COUNT(DISTINCT pt.id)), 
                    2
                ) as porcentaje_cumplimiento
            FROM plan_trabajos pt
            LEFT JOIN informes_plan_trabajo ipt ON pt.id = ipt.plan_trabajo_id
            WHERE pt.estado IN ('Aprobado', 'Terminado')
        ")[0] ?? (object)[
            'total_planes' => 0,
            'planes_con_informes' => 0,
            'planes_sin_informes' => 0,
            'porcentaje_cumplimiento' => 0
        ];
        
        // Planes de trabajo por período
        $planesPorPeriodo = Periodo::withCount(['planesTrabajo as planes_count'])
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();
        
        // ============================================
        // Cálculo unificado de rendimiento basado en informes
        // ============================================
        // Una sola consulta obtiene todos los datos necesarios para ambos gráficos
        // (rendimiento por grupo y rendimiento por investigador por grupo)
        
        // Obtener todos los períodos con los datos necesarios
        $periodosUnificados = Periodo::with(['planesTrabajo' => function($query) {
                $query->with(['user.grupo_investigacion', 'informes.evidencias']);
            }])
            ->orderBy('created_at', 'desc')
            ->limit(8)
            ->get();
        
        // Estructuras para almacenar ambos cálculos
        $rendimientoGruposPorPeriodo = [];
        $rendimientoPorInvestigator = [];
        
        // Procesar cada período una sola vez
        $periodosUnificados->each(function($periodo) use (&$rendimientoGruposPorPeriodo, &$rendimientoPorInvestigator) {
            $planes = $periodo->planesTrabajo;
            
            // Agrupar planes por grupo de investigación para el gráfico principal
            $planesPorGrupo = $planes->groupBy(function($plan) {
                return $plan->user->grupo_investigacion ? $plan->user->grupo_investigacion->nombre : 'Sin Grupo';
            });
            
            $rendimientoPorGrupo = [];
            
            // Procesar cada grupo
            $planesPorGrupo->each(function($planesGrupo, $nombreGrupo) use (&$rendimientoPorGrupo, &$rendimientoPorInvestigator, $periodo) {
                // Calcular el avance promedio basado en evidencias de informes
                $avanceTotalGrupo = 0;
                $informesCountGrupo = 0;
                
                $planesGrupo->each(function($plan) use (&$avanceTotalGrupo, &$informesCountGrupo, &$rendimientoPorInvestigator, $periodo) {
                    $user = $plan->user;
                    $grupo = $user->grupo_investigacion;
                    $grupoNombre = $grupo ? $grupo->nombre : 'Sin Grupo';
                    
                    $informes = $plan->informes;
                    $rendimiento = 0;
                    
                    if ($informes && $informes->count() > 0) {
                        $avanceTotal = 0;
                        $evidenciasCount = 0;
                        
                        $informes->each(function($informe) use (&$avanceTotal, &$evidenciasCount) {
                            if ($informe->evidencias && $informe->evidencias->count() > 0) {
                                $informe->evidencias->each(function($evidencia) use (&$avanceTotal, &$evidenciasCount) {
                                    if (isset($evidencia->porcentaje_progreso_nuevo) && is_numeric($evidencia->porcentaje_progreso_nuevo)) {
                                        $avanceTotal += $evidencia->porcentaje_progreso_nuevo;
                                        $evidenciasCount++;
                                    }
                                });
                            }
                        });
                        
                        if ($evidenciasCount > 0) {
                            $rendimiento = $avanceTotal / $evidenciasCount;
                        } else {
                            $rendimiento = 10; // Puntaje mínimo por presentar informes sin evidencias
                        }
                        
                        // Acumular para el cálculo del grupo
                        $avanceTotalGrupo += $avanceTotal;
                        $informesCountGrupo += $evidenciasCount > 0 ? $evidenciasCount : 1;
                    }
                    
                    // Inicializar estructura para el investigador si no existe
                    if (!isset($rendimientoPorInvestigator[$user->id])) {
                        $rendimientoPorInvestigator[$user->id] = [
                            'user_id' => $user->id,
                            'user_name' => $user->name,
                            'grupo' => $grupoNombre,
                            'rendimiento_por_periodo' => []
                        ];
                    }
                    
                    // Almacenar rendimiento para este período
                    $periodoIndex = $periodo->nombre;
                    
                    if (!isset($rendimientoPorInvestigator[$user->id]['rendimiento_por_periodo'][$periodoIndex])) {
                        $rendimientoPorInvestigator[$user->id]['rendimiento_por_periodo'][$periodoIndex] = $rendimiento;
                    } else {
                        // Si hay múltiples planes en el mismo período, promediar
                        $rendimientoAnterior = $rendimientoPorInvestigator[$user->id]['rendimiento_por_periodo'][$periodoIndex];
                        $rendimientoPorInvestigator[$user->id]['rendimiento_por_periodo'][$periodoIndex] = ($rendimientoAnterior + $rendimiento) / 2;
                    }
                });
                
                // Calcular rendimiento del grupo
                $rendimientoGrupo = 0;
                if ($informesCountGrupo > 0) {
                    $rendimientoGrupo = $avanceTotalGrupo / $informesCountGrupo;
                }
                
                $rendimientoPorGrupo[] = [
                    'grupo' => $nombreGrupo,
                    'rendimiento' => round($rendimientoGrupo, 2),
                ];
            });
            
            $rendimientoGruposPorPeriodo[] = [
                'periodo' => $periodo->nombre,
                'periodo_id' => $periodo->id,
                'grupos' => $rendimientoPorGrupo
            ];
        });
        
        // Preparar datos para el gráfico - períodos en X, grupos como líneas
        $datosRendimientoGruposPeriodo = [];
        $todosLosGrupos = collect();
        
        // Recopilar todos los grupos únicos
        foreach ($rendimientoGruposPorPeriodo as $periodo) {
            $grupos = $periodo['grupos'];
            if ($grupos && is_array($grupos)) {
                foreach ($grupos as $grupo) {
                    if (!$todosLosGrupos->contains('grupo', $grupo['grupo'])) {
                        $todosLosGrupos->push(['grupo' => $grupo['grupo']]);
                    }
                }
            }
        }
        
        $gruposNombresArray = $todosLosGrupos->map(function($g) { return $g['grupo']; })->filter()->toArray();
        
        // Crear estructura de datos para el gráfico - períodos como filas
        foreach ($rendimientoGruposPorPeriodo as $periodo) {
            $datosPeriodo = ['periodo' => $periodo['periodo']];
            
            $gruposPeriodo = $periodo['grupos'];
            
            $todosLosGrupos->each(function($grupoData) use (&$datosPeriodo, $gruposPeriodo) {
                $grupoNombre = $grupoData['grupo'];
                $rendimientoGrupo = 0;
                
                if ($gruposPeriodo && is_array($gruposPeriodo)) {
                    foreach ($gruposPeriodo as $grupo) {
                        if ($grupo['grupo'] === $grupoNombre) {
                            $rendimientoGrupo = $grupo['rendimiento'];
                            break;
                        }
                    }
                }
                
                $datosPeriodo[$grupoNombre] = $rendimientoGrupo;
            });
            
            $datosRendimientoGruposPeriodo[] = $datosPeriodo;
        }
        
        // Investigadores con más planes de trabajo
        $investigadoresConPlanes = User::whereHas('roles', function($query) {
                $query->where('name', 'Investigador');
            })
            ->withCount(['planesTrabajo as planes_count'])
            ->orderBy('planes_count', 'desc')
            ->limit(10)
            ->get();
        
        // Planes de trabajo recientes
        $planesRecientes = PlanTrabajo::with(['user', 'periodo'])
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();
        
        // Estadísticas de informes por período (para gráfico de área)
        $informesPorPeriodo = Periodo::withCount(['informesPlanTrabajo as informes_count'])
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();
        
        // Comparación planes vs informes por período
        $comparacionPlanesInformes = Periodo::withCount(['planesTrabajo as planes_count'])
            ->withCount(['informesPlanTrabajo as informes_count'])
            ->orderBy('created_at', 'desc')
            ->limit(12)
            ->get();
        
        // Distribución de estados de planes de trabajo
        $distribucionEstados = PlanTrabajo::selectRaw('estado, COUNT(*) as cantidad')
            ->groupBy('estado')
            ->get()
            ->map(function($item) {
                return [
                    'estado' => $item->estado,
                    'cantidad' => $item->cantidad
                ];
            });
        
        // Estadísticas de vigencia de planes
        $estadisticasVigencia = PlanTrabajo::selectRaw('vigencia, COUNT(*) as cantidad')
            ->groupBy('vigencia')
            ->get();
        
        // Estadísticas de actividades de planes de trabajo
        $estadisticasActividades = DB::select("
            SELECT 
                at.nombre as actividad_nombre,
                COUNT(ap.id) as cantidad_actividades
            FROM actividades_plans ap
            INNER JOIN actividades_investigacions at ON ap.actividad_investigacion_id = at.id
            GROUP BY at.id, at.nombre
            ORDER BY cantidad_actividades DESC
        ");
        
        // Top 10 investigadores con más actividades
        $topInvestigadoresActividades = DB::select("
            SELECT 
                u.id,
                u.name,
                COUNT(ap.id) as total_actividades,
                COUNT(DISTINCT pt.id) as total_planes
            FROM users u
            INNER JOIN plan_trabajos pt ON u.id = pt.user_id
            INNER JOIN actividades_plans ap ON pt.id = ap.plan_trabajo_id
            INNER JOIN model_has_roles mhr ON u.id = mhr.model_id
            INNER JOIN roles r ON mhr.role_id = r.id
            WHERE r.name = 'Investigador'
            GROUP BY u.id, u.name
            ORDER BY total_actividades DESC
            LIMIT 10
        ");
        
        // ============================================
        // Reestructurar cálculo: obtener TODOS los investigadores
        // ============================================
        
        // Asegurar que tenemos los períodos cargados (ya están cargados arriba en línea 65-70)
        // Obtener nombres de períodos
        $nombresPeriodos = $periodosUnificados->pluck('nombre')->reverse()->toArray();
        
        // Obtener todos los investigadores de todos los grupos
        $todosLosInvestigadores = User::whereHas('roles', function($query) {
            $query->where('name', 'Investigador');
        })
        ->with(['grupo_investigacion'])
        ->get();
        
        // Para cada investigador, calcular su rendimiento por período
        $rendimientoCompletoInvestigador = [];
        
        foreach ($todosLosInvestigadores as $investigador) {
            $grupoNombre = $investigador->grupo_investigacion ? $investigador->grupo_investigacion->nombre : 'Sin Grupo';
            $rendimientoPorPeriodo = [];
            
            // Obtener todos los planes de trabajo del investigador
            $planesInvestigador = PlanTrabajo::with(['informes.evidencias'])
                ->where('user_id', $investigador->id)
                ->get();
            
            // Para cada período, calcular el rendimiento del investigador
            foreach ($nombresPeriodos as $periodoNombre) {
                $rendimientoPeriodo = 0;
                
                // Buscar planes del investigador en este período
                $planesEnPeriodo = $planesInvestigador->filter(function($plan) use ($periodoNombre, $periodosUnificados) {
                    // Buscar el período por nombre
                    $periodo = $periodosUnificados->where('nombre', $periodoNombre)->first();
                    return $periodo && $plan->periodo_id == $periodo->id;
                });
                
                if ($planesEnPeriodo->count() > 0) {
                    // Calcular rendimiento basado en evidencias
                    $avanceTotal = 0;
                    $evidenciasCount = 0;
                    
                    foreach ($planesEnPeriodo as $plan) {
                        if ($plan->informes && $plan->informes->count() > 0) {
                            foreach ($plan->informes as $informe) {
                                if ($informe->evidencias && $informe->evidencias->count() > 0) {
                                    foreach ($informe->evidencias as $evidencia) {
                                        if (isset($evidencia->porcentaje_progreso_nuevo) && is_numeric($evidencia->porcentaje_progreso_nuevo)) {
                                            $avanceTotal += $evidencia->porcentaje_progreso_nuevo;
                                            $evidenciasCount++;
                                        }
                                    }
                                } else {
                                    // Si hay informe pero sin evidencias
                                    $avanceTotal += 10;
                                    $evidenciasCount++;
                                }
                            }
                        }
                    }
                    
                    if ($evidenciasCount > 0) {
                        $rendimientoPeriodo = $avanceTotal / $evidenciasCount;
                    }
                }
                
                $rendimientoPorPeriodo[] = round($rendimientoPeriodo, 2);
            }
            
            $rendimientoCompletoInvestigador[] = [
                'user_id' => $investigador->id,
                'user_name' => $investigador->name,
                'grupo' => $grupoNombre,
                'rendimiento_por_periodo' => $rendimientoPorPeriodo
            ];
        }
        
        // Agrupar por grupo de investigación
        $investigadoresPorGrupo = collect($rendimientoCompletoInvestigador)->groupBy('grupo');
        
        // Obtener todos los grupos de investigación
        $todosLosGrupos = GrupoInvestigacion::all();
        
        // Crear la estructura completa
        $rendimientoPorGrupoInvestigator = $todosLosGrupos->map(function($grupo) use ($investigadoresPorGrupo, $nombresPeriodos) {
            $investigadoresDelGrupo = $investigadoresPorGrupo->get($grupo->nombre, collect());
            
            $investigadores = $investigadoresDelGrupo->map(function($inv) {
                return [
                    'user_id' => $inv['user_id'],
                    'user_name' => $inv['user_name'],
                    'rendimiento_por_periodo' => $inv['rendimiento_por_periodo']
                ];
            })->values();
            
            return [
                'grupo_id' => $grupo->id,
                'grupo' => $grupo->nombre,
                'investigadores' => $investigadores,
                'periodos' => array_values($nombresPeriodos) // Asegurar que sea un array indexado
            ];
        })->values();
        
        return Inertia::render('Informes/PlanesTrabajo', [
            'estadisticas' => [
                'total_planes_trabajo' => $totalPlanesTrabajo,
                'planes_aprobados' => $planesAprobados,
                'planes_pendientes' => $planesPendientes,
                'planes_en_correccion' => $planesEnCorreccion,
                'planes_terminados' => $planesTerminados,
            ],
            'estadisticas_cumplimiento' => $estadisticasCumplimiento,
            'planes_por_periodo' => $planesPorPeriodo,
            'rendimiento_grupos_por_periodo' => $datosRendimientoGruposPeriodo,
            'periodos_nombres' => collect($rendimientoGruposPorPeriodo)->pluck('periodo')->toArray(),
            'grupos_nombres' => $gruposNombresArray,
            'investigadores_con_planes' => $investigadoresConPlanes,
            'planes_recientes' => $planesRecientes,
            'informes_por_periodo' => $informesPorPeriodo,
            'comparacion_planes_informes' => $comparacionPlanesInformes,
            'distribucion_estados' => $distribucionEstados,
            'estadisticas_vigencia' => $estadisticasVigencia,
            'estadisticas_actividades' => $estadisticasActividades,
            'top_investigadores_actividades' => $topInvestigadoresActividades,
            'rendimiento_por_grupo_investigador' => $rendimientoPorGrupoInvestigator,
        ]);
    }

    /**
     * Generar PDF de rendimiento por grupo de investigación
     */
    public function generarPdfGrupo(Request $request, $grupoId, PdfService $pdfService)
    {
        try {
            $grupo = GrupoInvestigacion::with(['usuarios' => function($query) {
                $query->whereHas('roles', function($q) {
                    $q->where('name', 'Investigador');
                });
            }])->findOrFail($grupoId);

            // Obtener todos los investigadores del grupo con sus planes e informes
            $investigadoresCompletos = [];

            foreach ($grupo->usuarios as $investigador) {
                $planesInvestigador = PlanTrabajo::with(['informes.evidencias.actividadPlan.actividadInvestigacion', 'actividades.actividadInvestigacion', 'periodo'])
                    ->where('user_id', $investigador->id)
                    ->get();

                $planesConInformes = [];

                foreach ($planesInvestigador as $plan) {
                    $informesDelPlan = $plan->informes()->with('evidencias.actividadPlan.actividadInvestigacion')->get();
                    
                    foreach ($informesDelPlan as $informe) {
                        $planesConInformes[] = [
                            'plan' => $plan,
                            'informe' => $informe,
                            'actividades' => $plan->actividades,
                            'evidencias' => $informe->evidencias
                        ];
                    }
                }

                if (!empty($planesConInformes)) {
                    $investigadoresCompletos[] = [
                        'investigador' => $investigador,
                        'planes_con_informes' => $planesConInformes
                    ];
                }
            }

            // Preparar datos para el PDF
            $data = [
                'grupo' => $grupo,
                'investigadores' => $investigadoresCompletos,
                'fecha_generacion' => now()->format('d/m/Y H:i')
            ];

            // Usar PdfService con la vista del informe
            $pdf = $pdfService->generateFromView('pdfs.rendimiento-grupo-investigadores', $data, 'A4', 'portrait');
            
            $nombreArchivo = "informe-grupo-{$grupo->nombre}.pdf";
            
            return $pdf->stream($nombreArchivo);

        } catch (\Exception $e) {
            Log::error('Error al generar PDF del grupo: ' . $e->getMessage());
            return redirect()->route('informes.planes-trabajo')->with('error', 'Error al generar el PDF: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar PDF completo del dashboard de planes de trabajo
     */
    public function generarPdfCompleto(PdfService $pdfService)
    {
        try {
            // Obtener todos los datos necesarios (similar al método planesTrabajo)
            $todosLosGrupos = GrupoInvestigacion::with(['usuarios' => function($query) {
                $query->whereHas('roles', function($q) {
                    $q->where('name', 'Investigador');
                });
            }])->get();

            $periodos = Periodo::orderBy('created_at', 'desc')->limit(8)->get();
            $nombresPeriodos = $periodos->pluck('nombre')->reverse()->toArray();

            $gruposDatos = [];

            foreach ($todosLosGrupos as $grupo) {
                $investigadoresData = [];

                foreach ($grupo->usuarios as $investigador) {
                    $rendimientoPorPeriodo = [];
                    $planesInvestigador = PlanTrabajo::with(['informes.evidencias'])
                        ->where('user_id', $investigador->id)
                        ->get();

                    foreach ($nombresPeriodos as $periodoNombre) {
                        $rendimientoPeriodo = 0;
                        $periodo = $periodos->where('nombre', $periodoNombre)->first();
                        
                        if ($periodo) {
                            $planesEnPeriodo = $planesInvestigador->filter(function($plan) use ($periodo) {
                                return $plan->periodo_id == $periodo->id;
                            });

                            if ($planesEnPeriodo->count() > 0) {
                                $avanceTotal = 0;
                                $evidenciasCount = 0;

                                foreach ($planesEnPeriodo as $plan) {
                                    if ($plan->informes && $plan->informes->count() > 0) {
                                        foreach ($plan->informes as $informe) {
                                            if ($informe->evidencias && $informe->evidencias->count() > 0) {
                                                foreach ($informe->evidencias as $evidencia) {
                                                    if (isset($evidencia->porcentaje_progreso_nuevo) && is_numeric($evidencia->porcentaje_progreso_nuevo)) {
                                                        $avanceTotal += $evidencia->porcentaje_progreso_nuevo;
                                                        $evidenciasCount++;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                if ($evidenciasCount > 0) {
                                    $rendimientoPeriodo = $avanceTotal / $evidenciasCount;
                                }
                            }
                        }

                        $rendimientoPorPeriodo[] = round($rendimientoPeriodo, 2);
                    }

                    $investigadoresData[] = [
                        'nombre' => $investigador->name,
                        'rendimiento_por_periodo' => $rendimientoPorPeriodo
                    ];
                }

                $gruposDatos[] = [
                    'grupo' => $grupo,
                    'investigadores' => $investigadoresData
                ];
            }

            // Preparar datos para el PDF
            $data = [
                'grupos' => $gruposDatos,
                'periodos' => $nombresPeriodos,
                'fecha_generacion' => now()->format('d/m/Y H:i')
            ];

            // Usar PdfService
            $pdf = $pdfService->generateFromView('pdfs.rendimiento-completo', $data, 'A4', 'portrait');
            
            return $pdf->stream("informe-rendimiento-completo.pdf");

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al generar el PDF: ' . $e->getMessage());
        }
    }
}