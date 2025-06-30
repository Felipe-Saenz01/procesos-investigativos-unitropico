<?php

namespace App\Http\Controllers;

use App\Models\ProyectoInvestigativo;
use App\Models\ProductoInvestigativo;
use App\Models\SubTipoProducto;
use App\Models\TipoProducto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProyectoInvestigativoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $proyectos = ProyectoInvestigativo::with(['usuario', 'grupos', 'productos'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Proyectos/Index', [
            'proyectos' => $proyectos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Proyectos/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // return $request;
        $request->validate([
            'titulo' => 'required|string|max:255',
            'eje_tematico' => 'required|string|max:255',
            'tipo_proyecto' => 'required|in:formulado,en_formulacion',
            // Campos requeridos solo si es formulado
            'resumen_ejecutivo' => $request->tipo_proyecto === 'formulado' ? 'required|string' : 'nullable|string',
            'planteamiento_problema' => $request->tipo_proyecto === 'formulado' ? 'required|string' : 'nullable|string',
            'antecedentes' => $request->tipo_proyecto === 'formulado' ? 'required|string' : 'nullable|string',
            'justificacion' => $request->tipo_proyecto === 'formulado' ? 'required|string' : 'nullable|string',
            'objetivos' => $request->tipo_proyecto === 'formulado' ? 'required|string' : 'nullable|string',
            'metodologia' => $request->tipo_proyecto === 'formulado' ? 'required|string' : 'nullable|string',
            'resultados' => $request->tipo_proyecto === 'formulado' ? 'required|string' : 'nullable|string',
            'riesgos' => $request->tipo_proyecto === 'formulado' ? 'required|string' : 'nullable|string',
            'bibliografia' => $request->tipo_proyecto === 'formulado' ? 'required|string' : 'nullable|string',
            'actividades' => 'nullable|array',
        ], [
            'titulo.required' => 'El título es requerido.',
            'eje_tematico.required' => 'El eje temático es requerido.',
            'tipo_proyecto.required' => 'Debe seleccionar el tipo de proyecto.',
            'tipo_proyecto.in' => 'El tipo de proyecto debe ser "Formulado" o "En Formulación".',
            'resumen_ejecutivo.required' => 'El resumen ejecutivo es requerido para proyectos formulados.',
            'planteamiento_problema.required' => 'El planteamiento del problema es requerido para proyectos formulados.',
            'antecedentes.required' => 'Los antecedentes son requeridos para proyectos formulados.',
            'justificacion.required' => 'La justificación es requerida para proyectos formulados.',
            'objetivos.required' => 'Los objetivos son requeridos para proyectos formulados.',
            'metodologia.required' => 'La metodología es requerida para proyectos formulados.',
            'resultados.required' => 'Los resultados son requeridos para proyectos formulados.',
            'riesgos.required' => 'Los riesgos son requeridos para proyectos formulados.',
            'bibliografia.required' => 'La bibliografía es requerida para proyectos formulados.',
        ]);

        $estado = $request->tipo_proyecto === 'formulado' ? 'Formulado' : 'En Formulación';

        // Preparar los datos del proyecto
        $proyectoData = [
            'titulo' => $request->titulo,
            'user_id' => Auth::id(),
            'eje_tematico' => $request->eje_tematico,
            'actividades' => $request->actividades,
            'estado' => $estado,
        ];

        // Para proyectos en formulación, usar "En Formulación" para campos vacíos/null
        if ($estado === 'En Formulación') {
            $proyectoData['resumen_ejecutivo'] = $request->resumen_ejecutivo ?: 'En Formulación';
            $proyectoData['planteamiento_problema'] = $request->planteamiento_problema ?: 'En Formulación';
            $proyectoData['antecedentes'] = $request->antecedentes ?: 'En Formulación';
            $proyectoData['justificacion'] = $request->justificacion ?: 'En Formulación';
            $proyectoData['objetivos'] = $request->objetivos ?: 'En Formulación';
            $proyectoData['metodologia'] = $request->metodologia ?: 'En Formulación';
            $proyectoData['resultados'] = $request->resultados ?: 'En Formulación';
            $proyectoData['riesgos'] = $request->riesgos ?: 'En Formulación';
            $proyectoData['bibliografia'] = $request->bibliografia ?: 'En Formulación';
        } else {
            // Para proyectos formulados, usar los valores enviados
            $proyectoData['resumen_ejecutivo'] = $request->resumen_ejecutivo;
            $proyectoData['planteamiento_problema'] = $request->planteamiento_problema;
            $proyectoData['antecedentes'] = $request->antecedentes;
            $proyectoData['justificacion'] = $request->justificacion;
            $proyectoData['objetivos'] = $request->objetivos;
            $proyectoData['metodologia'] = $request->metodologia;
            $proyectoData['resultados'] = $request->resultados;
            $proyectoData['riesgos'] = $request->riesgos;
            $proyectoData['bibliografia'] = $request->bibliografia;
        }

        $proyecto = ProyectoInvestigativo::create($proyectoData);

        // Establecer la relación con el grupo de investigación del usuario
        $usuario = Auth::user();
        if ($usuario->grupo_investigacion_id) {
            $proyecto->grupos()->attach($usuario->grupo_investigacion_id);
        }

        // Si el proyecto está en formulación, crear automáticamente el producto "Formulación del Proyecto"
        if ($estado === 'En Formulación') {
            // Buscar el subtipo de producto "Formulación de Proyectos" o crear uno por defecto
            $subTipoFormulacion = SubTipoProducto::where('nombre', 'Formulación de Proyectos')->first();
            
            if (!$subTipoFormulacion) {
                // Si no existe el subtipo, buscar o crear el tipo de producto primero
                $tipoFormulacion = TipoProducto::where('nombre', 'Formulación de Proyectos')->first();
                
                if (!$tipoFormulacion) {
                    // Crear el tipo de producto si no existe
                    $tipoFormulacion = TipoProducto::create([
                        'nombre' => 'Formulación de Proyectos',
                        'descripcion' => 'Productos relacionados con la formulación de proyectos investigativos'
                    ]);
                }
                
                // Crear el subtipo de producto
                $subTipoFormulacion = SubTipoProducto::create([
                    'nombre' => 'Formulación de Proyectos',
                    'descripcion' => 'Formulación inicial de proyectos investigativos',
                    'tipo_producto_id' => $tipoFormulacion->id
                ]);
            }
            
            if ($subTipoFormulacion) {
                $producto = ProductoInvestigativo::create([
                    'titulo' => 'Formulación del Proyecto: ' . $proyecto->titulo,
                    'resumen' => 'Producto automático para la formulación del proyecto.',
                    'sub_tipo_producto_id' => $subTipoFormulacion->id,
                    'proyecto_investigacion_id' => $proyecto->id,
                ]);
                $producto->usuarios()->attach($usuario->id);
            }
        }

        $mensaje = $estado === 'Formulado' 
            ? 'Proyecto investigativo creado exitosamente.' 
            : 'Proyecto en formulación creado exitosamente. Se ha generado automáticamente el producto "Formulación del Proyecto".';

        return to_route('proyectos.index')->with('success', $mensaje);
    }

    /**
     * Display the specified resource.
     */
    public function show(ProyectoInvestigativo $proyecto)
    {
        // Verificar que el usuario solo pueda ver sus propios proyectos
        if ($proyecto->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para ver este proyecto.');
        }

        return Inertia::render('Proyectos/Show', [
            'proyecto' => $proyecto->load(['usuario', 'grupos', 'productos.subTipoProducto']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProyectoInvestigativo $proyecto)
    {
        // Verificar que el usuario solo pueda editar sus propios proyectos
        if ($proyecto->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para editar este proyecto.');
        }

        return Inertia::render('Proyectos/Edit', [
            'proyecto' => $proyecto,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProyectoInvestigativo $proyecto)
    {
        // Verificar que el usuario solo pueda actualizar sus propios proyectos
        if ($proyecto->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para actualizar este proyecto.');
        }

        $request->validate([
            'titulo' => 'required|string|max:255',
            'eje_tematico' => 'required|string|max:255',
            'resumen_ejecutivo' => 'required|string',
            'planteamiento_problema' => 'required|string',
            'antecedentes' => 'required|string',
            'justificacion' => 'required|string',
            'objetivos' => 'required|string',
            'metodologia' => 'required|string',
            'resultados' => 'required|string',
            'riesgos' => 'required|string',
            'bibliografia' => 'required|string',
            'actividades' => 'nullable|array',
        ], [
            'titulo.required' => 'El título es requerido.',
            'eje_tematico.required' => 'El eje temático es requerido.',
            'resumen_ejecutivo.required' => 'El resumen ejecutivo es requerido.',
            'planteamiento_problema.required' => 'El planteamiento del problema es requerido.',
            'antecedentes.required' => 'Los antecedentes son requeridos.',
            'justificacion.required' => 'La justificación es requerida.',
            'objetivos.required' => 'Los objetivos son requeridos.',
            'metodologia.required' => 'La metodología es requerida.',
            'resultados.required' => 'Los resultados son requeridos.',
            'riesgos.required' => 'Los riesgos son requeridos.',
            'bibliografia.required' => 'La bibliografía es requerida.',
        ]);

        $proyecto->update([
            'titulo' => $request->titulo,
            'eje_tematico' => $request->eje_tematico,
            'resumen_ejecutivo' => $request->resumen_ejecutivo,
            'planteamiento_problema' => $request->planteamiento_problema,
            'antecedentes' => $request->antecedentes,
            'justificacion' => $request->justificacion,
            'objetivos' => $request->objetivos,
            'metodologia' => $request->metodologia,
            'resultados' => $request->resultados,
            'riesgos' => $request->riesgos,
            'bibliografia' => $request->bibliografia,
            'actividades' => $request->actividades,
            'estado' => 'Formulado',
        ]);

        // Asegurar que la relación con el grupo de investigación se mantenga
        $usuario = Auth::user();
        if ($usuario->grupo_investigacion_id && !$proyecto->grupos()->where('grupo_investigacion_id', $usuario->grupo_investigacion_id)->exists()) {
            $proyecto->grupos()->attach($usuario->grupo_investigacion_id);
        }

        return to_route('proyectos.index')->with('success', 'Proyecto investigativo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProyectoInvestigativo $proyecto)
    {
        // Verificar que el usuario solo pueda eliminar sus propios proyectos
        if ($proyecto->user_id !== Auth::id()) {
            abort(403, 'No tienes permisos para eliminar este proyecto.');
        }
        
        // Verificar si el proyecto tiene productos asociados usando la relación
        if ($proyecto->productos()->count() > 0) {
            return to_route('proyectos.index')->with('error', 'No se puede eliminar el proyecto porque tiene productos investigativos asociados.');
        }
        // Borrar la relacion del proyecto con los grupos de investigacion
        $proyecto->grupos()->detach();

        $proyecto->delete();
        return to_route('proyectos.index')->with('success', 'Proyecto investigativo eliminado exitosamente.');
    }
}
