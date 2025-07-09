<?php

namespace App\Http\Controllers;

use App\Models\EntregaProducto;
use App\Models\HorasInvestigacion;
use App\Models\Periodo;
use App\Models\ProductoInvestigativo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EntregaProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(ProductoInvestigativo $producto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para crear entregas para este producto.');
        }

        // Obtener periodos activos
        $periodos = Periodo::where('estado', 'Activo')->get();

        // Obtener entregas existentes del producto
        $entregasExistentes = $producto->entregas()
            ->with('periodo')
            ->orderBy('created_at', 'desc')
            ->get();

        // Calcular horas disponibles para cada período
        $periodosConHoras = $periodos->map(function ($periodo) {
            $horasDisponibles = $this->getHorasDisponiblesUsuario(Auth::id(), $periodo->id);
            return [
                'id' => $periodo->id,
                'nombre' => $periodo->nombre,
                'fecha_inicio' => $periodo->fecha_inicio,
                'fecha_fin' => $periodo->fecha_fin,
                'fecha_limite_planeacion' => $periodo->fecha_limite_planeacion,
                'fecha_limite_evidencias' => $periodo->fecha_limite_evidencias,
                'estado' => $periodo->estado,
                'horas_disponibles' => $horasDisponibles,
            ];
        });

        return Inertia::render('Productos/Entregas/Create', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto']),
            'periodos' => $periodosConHoras,
            'entregasExistentes' => $entregasExistentes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, ProductoInvestigativo $producto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para crear entregas para este producto.');
        }

        $request->validate([
            'tipo' => 'required|in:planeacion,evidencia',
            'periodo_id' => 'required|exists:periodos,id',
            'planeacion' => 'required|array|min:1',
            'planeacion.*.nombre' => 'required|string|max:255',
            'planeacion.*.porcentaje' => 'required|numeric|min:0|max:100',
            'progreso_planeacion' => 'required|integer|min:0|max:100',
            'progreso_evidencia' => 'nullable|integer|min:0|max:100',
            'horas_planeacion' => 'required|integer|min:1',
            'horas_evidencia' => 'nullable|integer|min:0',
        ], [
            'tipo.required' => 'El tipo de entrega es requerido.',
            'tipo.in' => 'El tipo debe ser planeación o evidencia.',
            'periodo_id.required' => 'Debe seleccionar un período.',
            'periodo_id.exists' => 'El período seleccionado no existe.',
            'planeacion.required' => 'La planificación es requerida.',
            'planeacion.array' => 'La planificación debe ser una lista.',
            'planeacion.min' => 'Debe agregar al menos un elemento de planificación.',
            'planeacion.*.nombre.required' => 'El nombre del elemento es requerido.',
            'planeacion.*.porcentaje.required' => 'El porcentaje es requerido.',
            'planeacion.*.porcentaje.numeric' => 'El porcentaje debe ser un número.',
            'planeacion.*.porcentaje.min' => 'El porcentaje no puede ser menor a 0.',
            'planeacion.*.porcentaje.max' => 'El porcentaje no puede ser mayor a 100.',
            'progreso_planeacion.required' => 'El progreso de planeación es requerido.',
            'progreso_planeacion.integer' => 'El progreso debe ser un número entero.',
            'progreso_planeacion.min' => 'El progreso no puede ser menor a 0.',
            'progreso_planeacion.max' => 'El progreso no puede ser mayor a 100.',
            'progreso_evidencia.integer' => 'El progreso de evidencia debe ser un número entero.',
            'progreso_evidencia.min' => 'El progreso de evidencia no puede ser menor a 0.',
            'progreso_evidencia.max' => 'El progreso de evidencia no puede ser mayor a 100.',
            'horas_planeacion.required' => 'Las horas de planeación son requeridas.',
            'horas_planeacion.integer' => 'Las horas deben ser un número entero.',
            'horas_planeacion.min' => 'Las horas deben ser al menos 1.',
            'horas_evidencia.integer' => 'Las horas de evidencia deben ser un número entero.',
            'horas_evidencia.min' => 'Las horas de evidencia no pueden ser menores a 0.',
        ]);

        // Obtener el período
        $periodo = Periodo::findOrFail($request->periodo_id);

        // Verificar que el período esté activo
        if ($periodo->estado !== 'Activo') {
            return back()->withErrors(['periodo_id' => 'El período seleccionado no está activo.']);
        }

        // Verificar fecha límite del período
        if ( $request->tipo === 'planeacion' && now()->isAfter($periodo->fecha_limite_planeacion)) {
            return back()->withErrors(['periodo_id' => 'El período de planeación ya ha finalizado.']);
        }

        if ( $request->tipo === 'evidencia' && now()->isAfter($periodo->fecha_limite_evidencias)) {
            return back()->withErrors(['periodo_id' => 'El período de evidencias ya ha finalizado.']);
        }

        // Verificar entregas existentes para este producto y período
        $entregasExistentes = $producto->entregas()
            ->where('periodo_id', $request->periodo_id)
            ->get();

        // Validar que no se exceda el límite de entregas por período
        if ($entregasExistentes->count() >= 2) {
            return back()->withErrors(['periodo_id' => 'Ya se han realizado las dos entregas permitidas para este período.']);
        }

        // Si es evidencia, verificar que exista una planeación previa
        if ($request->tipo === 'evidencia') {
            $planeacionExistente = $entregasExistentes
                ->where('tipo', 'planeacion')
                ->first();

            if (!$planeacionExistente) {
                return back()->withErrors(['tipo' => 'Debe realizar primero una entrega de planeación antes de entregar evidencia.']);
            }
        }

        // Si es planeación, verificar que no exista ya una planeación
        if ($request->tipo === 'planeacion') {
            $planeacionExistente = $entregasExistentes
                ->where('tipo', 'planeacion')
                ->first();

            if ($planeacionExistente) {
                return back()->withErrors(['tipo' => 'Ya existe una entrega de planeación para este período.']);
            }
        }

        // Validar horas disponibles del usuario en el período
        $horasDisponibles = $this->getHorasDisponiblesUsuario(Auth::id(), $request->periodo_id);
        $horasSolicitadas = $request->horas_planeacion + ($request->horas_evidencia ?? 0);
        
        if ($horasSolicitadas > $horasDisponibles) {
            return back()->withErrors(['horas_planeacion' => "No tienes suficientes horas disponibles. Tienes {$horasDisponibles} horas y solicitas {$horasSolicitadas} horas."]);
        }

        // Crear la entrega
        $entrega = EntregaProducto::create([
            'tipo' => $request->tipo,
            'planeacion' => $request->planeacion,
            'periodo_id' => $request->periodo_id,
            'user_id' => Auth::id(),
            'producto_investigativo_id' => $producto->id,
            'evidencia' => null, // Por ahora será null
            'progreso_planeacion' => $request->progreso_planeacion,
            'progreso_evidencia' => $request->progreso_evidencia ?? 0,
            'horas_planeacion' => $request->horas_planeacion,
            'horas_evidencia' => $request->horas_evidencia ?? 0,
        ]);

        // Si es evidencia, actualizar el progreso del producto
        if ($request->tipo === 'evidencia') {
            $this->actualizarProgresoProducto($producto->id);
        }

        return to_route('productos.show', $producto)->with('success', 'Entrega creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(EntregaProducto $entregaProducto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$entregaProducto->productoInvestigativo->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para ver esta entrega.');
        }
        return Inertia::render('Productos/Entregas/Show', [
            'entrega' => $entregaProducto->load(['productoInvestigativo.proyecto', 'productoInvestigativo.subTipoProducto', 'periodo', 'usuario']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EntregaProducto $entregaProducto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$entregaProducto->productoInvestigativo->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para editar esta entrega.');
        }

        // Verificar que el período no haya finalizado
        if (now()->isAfter($entregaProducto->periodo->fecha_fin)) {
            return back()->with('error', 'No se puede editar una entrega de un período finalizado.');
        }

        return Inertia::render('Productos/Entregas/Edit', [
            'entrega' => $entregaProducto->load(['productoInvestigativo.proyecto', 'productoInvestigativo.subTipoProducto', 'periodo']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EntregaProducto $entregaProducto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$entregaProducto->productoInvestigativo->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para editar esta entrega.');
        }

        // Verificar que el período no haya finalizado
        if (now()->isAfter($entregaProducto->periodo->fecha_fin)) {
            return back()->withErrors(['general' => 'No se puede editar una entrega de un período finalizado.']);
        }

        $request->validate([
            'planeacion' => 'required|array|min:1',
            'planeacion.*.nombre' => 'required|string|max:255',
            'planeacion.*.porcentaje' => 'required|numeric|min:0|max:100',
        ], [
            'planeacion.required' => 'La planificación es requerida.',
            'planeacion.array' => 'La planificación debe ser una lista.',
            'planeacion.min' => 'Debe agregar al menos un elemento de planificación.',
            'planeacion.*.nombre.required' => 'El nombre del elemento es requerido.',
            'planeacion.*.porcentaje.required' => 'El porcentaje es requerido.',
            'planeacion.*.porcentaje.numeric' => 'El porcentaje debe ser un número.',
            'planeacion.*.porcentaje.min' => 'El porcentaje no puede ser menor a 0.',
            'planeacion.*.porcentaje.max' => 'El porcentaje no puede ser mayor a 100.',
        ]);

        // Actualizar la entrega
        $entregaProducto->update([
            'planeacion' => $request->planeacion,
        ]);

        return to_route('productos.show', $entregaProducto->productoInvestigativo)->with('success', 'Entrega actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EntregaProducto $entregaProducto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$entregaProducto->productoInvestigativo->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para eliminar esta entrega.');
        }

        // Verificar que el período no haya finalizado
        if (now()->isAfter($entregaProducto->periodo->fecha_fin)) {
            return back()->with('error', 'No se puede eliminar una entrega de un período finalizado.');
        }

        $producto = $entregaProducto->productoInvestigativo;
        $entregaProducto->delete();

        return to_route('productos.show', $producto)->with('success', 'Entrega eliminada exitosamente.');
    }

    /**
     * Formulario para crear planeación
     */
    public function createPlaneacion(ProductoInvestigativo $producto)
    {
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para crear entregas para este producto.');
        }
        
        // Obtener periodos activos
        $periodos = Periodo::where('estado', 'Activo')->get();

        // Calcular horas disponibles para cada período
        $periodosConHoras = $periodos->map(function ($periodo) {
            // Obtener las horas asignadas al usuario en el período
            $horasAsignadas = HorasInvestigacion::where('user_id', Auth::id())
                ->where('periodo_id', $periodo->id)
                ->where('estado', 'Activo')
                ->sum('horas');

            // Obtener las horas ya utilizadas en entregas del usuario en el período
            $horasUtilizadas = EntregaProducto::where('user_id', Auth::id())
                ->where('periodo_id', $periodo->id)
                ->sum('horas_planeacion');

            $horasDisponibles = $horasAsignadas - $horasUtilizadas;

            return [
                'id' => $periodo->id,
                'nombre' => $periodo->nombre,
                'fecha_limite_planeacion' => $periodo->fecha_limite_planeacion,
                'fecha_limite_evidencia' => $periodo->fecha_limite_evidencia,
                'estado' => $periodo->estado,
                'horas_disponibles' => $horasDisponibles,
            ];
        });


        $entregasExistentes = $producto->entregas()->with('periodo')->get();
        
        return Inertia::render('Productos/Entregas/PlaneacionCreate', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto']),
            'periodos' => $periodosConHoras,
            'entregasExistentes' => $entregasExistentes,
        ]);
    }

    /**
     * Guardar planeación
     */
    public function storePlaneacion(Request $request, ProductoInvestigativo $producto)
    {
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para crear entregas para este producto.');
        }
        
        $request->validate([
            'periodo_id' => 'required|exists:periodos,id',
            'planeacion' => 'required|array|min:1',
            'planeacion.*.nombre' => 'required|string|max:255',
            'planeacion.*.porcentaje' => 'required|numeric|min:0|max:100',
            'progreso_planeacion' => 'required|integer|min:0|max:100',
            'horas_planeacion' => 'required|integer|min:1',
        ], [
            'periodo_id.required' => 'Debe seleccionar un período.',
            'periodo_id.exists' => 'El período seleccionado no existe.',
            'planeacion.required' => 'La planificación es requerida.',
            'planeacion.array' => 'La planificación debe ser una lista.',
            'planeacion.min' => 'Debe agregar al menos un elemento de planificación.',
            'planeacion.*.nombre.required' => 'El nombre del elemento es requerido.',
            'planeacion.*.porcentaje.required' => 'El porcentaje es requerido.',
            'planeacion.*.porcentaje.numeric' => 'El porcentaje debe ser un número.',
            'planeacion.*.porcentaje.min' => 'El porcentaje no puede ser menor a 0.',
            'planeacion.*.porcentaje.max' => 'El porcentaje no puede ser mayor a 100.',
            'progreso_planeacion.required' => 'El progreso de planeación es requerido.',
            'progreso_planeacion.integer' => 'El progreso debe ser un número entero.',
            'progreso_planeacion.min' => 'El progreso no puede ser menor a 0.',
            'progreso_planeacion.max' => 'El progreso no puede ser mayor a 100.',
            'horas_planeacion.required' => 'Las horas de planeación son requeridas.',
            'horas_planeacion.integer' => 'Las horas deben ser un número entero.',
            'horas_planeacion.min' => 'Las horas deben ser al menos 1.',
        ]);
        
        $periodo = Periodo::findOrFail($request->periodo_id);
        $entregasExistentes = $producto->entregas()->where('periodo_id', $request->periodo_id)->get();
        $planeacionExistente = $entregasExistentes->where('tipo', 'planeacion')->first();
        
        if ($planeacionExistente) {
            return back()->withErrors(['tipo' => 'Ya existe una entrega de planeación para este período.']);
        }

        // Validar horas disponibles del usuario en el período
        // Obtener las horas asignadas al usuario en el período
        $horasAsignadas = HorasInvestigacion::where('user_id', Auth::id())
            ->where('periodo_id', $request->periodo_id)
            ->where('estado', 'Activo')
            ->sum('horas');

        // Obtener las horas ya utilizadas en entregas del usuario en el período
        $horasUtilizadas = EntregaProducto::where('user_id', Auth::id())
            ->where('periodo_id', $request->periodo_id)
            ->sum('horas_planeacion');

        $horasDisponibles = $horasAsignadas - $horasUtilizadas;

        if ($request->horas_planeacion > $horasDisponibles) {
            return back()->withErrors(['horas_planeacion' => "No tienes suficientes horas disponibles. Tienes {$horasDisponibles} horas y solicitas {$request->horas_planeacion} horas."]);
        }

        EntregaProducto::create([
            'tipo' => 'planeacion',
            'planeacion' => $request->planeacion,
            'periodo_id' => $request->periodo_id,
            'user_id' => Auth::id(),
            'producto_investigativo_id' => $producto->id,
            'progreso_planeacion' => $request->progreso_planeacion,
            'progreso_evidencia' => 0,
            'horas_planeacion' => $request->horas_planeacion,
            'horas_evidencia' => $request->horas_planeacion,
        ]);
        
        return to_route('productos.show', $producto)->with('success', 'Planeación registrada exitosamente.');
    }

    /**
     * Formulario para crear evidencia
     */
    public function createEvidencia(ProductoInvestigativo $producto)
    {
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para crear entregas para este producto.');
        }
        
        // Buscar la planeación existente más reciente
        $planeacion = $producto->entregas()->where('tipo', 'planeacion')->latest()->first();
        if (!$planeacion) {
            return to_route('entregas.planeacion.create', $producto->id)->with('error', 'Debes registrar primero la planeación.');
        }
        
        $periodo = $planeacion->periodo;
        
        // Usar las horas de planeación directamente (no calcular horas disponibles)
        $periodoConHoras = [
            'id' => $periodo->id,
            'nombre' => $periodo->nombre,
            'fecha_inicio' => $periodo->fecha_inicio,
            'fecha_fin' => $periodo->fecha_fin,
            'estado' => $periodo->estado,
            'horas_disponibles' => $planeacion->horas_planeacion, // Usar las horas de planeación
        ];
        
        $entregasExistentes = $producto->entregas()->where('periodo_id', $periodo->id)->get();
        
        return Inertia::render('Productos/Entregas/EvidenciaCreate', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto']),
            'periodo' => $periodoConHoras,
            'planeacion' => $planeacion->planeacion,
            'horasPlaneacion' => $planeacion->horas_planeacion,
            'progresoPlaneacion' => $planeacion->progreso_planeacion,
            'entregasExistentes' => $entregasExistentes,
        ]);
    }

    /**
     * Guardar evidencia
     */
    public function storeEvidencia(Request $request, ProductoInvestigativo $producto)
    {
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para crear entregas para este producto.');
        }
        
        $request->validate([
            'porcentaje_completado' => 'required|array|min:1',
            'porcentaje_completado.*' => 'required|numeric|min:0|max:100',
            'progreso_evidencia' => 'required|integer|min:0|max:100',
        ], [
            'porcentaje_completado.required' => 'Los porcentajes de avance son requeridos.',
            'porcentaje_completado.array' => 'Los porcentajes deben ser una lista.',
            'porcentaje_completado.min' => 'Debe agregar al menos un porcentaje de avance.',
            'porcentaje_completado.*.required' => 'El porcentaje de avance es requerido.',
            'porcentaje_completado.*.numeric' => 'El porcentaje debe ser un número.',
            'porcentaje_completado.*.min' => 'El porcentaje no puede ser menor a 0.',
            'porcentaje_completado.*.max' => 'El porcentaje no puede ser mayor a 100.',
            'progreso_evidencia.required' => 'El progreso de evidencia es requerido.',
            'progreso_evidencia.integer' => 'El progreso debe ser un número entero.',
            'progreso_evidencia.min' => 'El progreso no puede ser menor a 0.',
            'progreso_evidencia.max' => 'El progreso no puede ser mayor a 100.',
        ]);

        // Buscar la planeación existente más reciente
        $planeacion = $producto->entregas()->where('tipo', 'planeacion')->latest()->first();
        if (!$planeacion) {
            return back()->withErrors(['general' => 'No existe planeación para este producto.']);
        }
        
        $periodo = $planeacion->periodo;
        $entregasExistentes = $producto->entregas()->where('periodo_id', $periodo->id)->get();
        $evidenciaExistente = $entregasExistentes->where('tipo', 'evidencia')->first();
        
        if ($evidenciaExistente) {
            return back()->withErrors(['tipo' => 'Ya existe una entrega de evidencia para este período.']);
        }

        // Guardar la evidencia usando las horas de planeación
        $entrega = EntregaProducto::create([
            'tipo' => 'evidencia',
            'planeacion' => $planeacion->planeacion,
            'evidencia' => json_encode($request->porcentaje_completado),
            'periodo_id' => $periodo->id,
            'user_id' => Auth::id(),
            'producto_investigativo_id' => $producto->id,
            'progreso_planeacion' => $planeacion->progreso_planeacion ?? 0,
            'progreso_evidencia' => $request->progreso_evidencia,
            'horas_planeacion' => $planeacion->horas_planeacion ?? 0,
            'horas_evidencia' => $planeacion->horas_planeacion ?? 0, // Usar las horas de planeación
        ]);

        // Actualizar el progreso del producto
        $this->actualizarProgresoProducto($producto->id);

        return to_route('productos.show', $producto)->with('success', 'Evidencia registrada exitosamente.');
    }

    /**
     * Obtener las horas disponibles del usuario en un período específico
     */
    public function getHorasDisponiblesUsuario($userId, $periodoId)
    {
        // Obtener las horas asignadas al usuario en el período
        $horasAsignadas = HorasInvestigacion::where('user_id', $userId)
            ->where('periodo_id', $periodoId)
            ->where('estado', 'Activo')
            ->get('horas');

        // Obtener las horas ya utilizadas en entregas del usuario en el período
        $horasUtilizadas = EntregaProducto::where('user_id', $userId)
            ->where('periodo_id', $periodoId)
            ->sum('horas_planeacion');

        return $horasAsignadas - $horasUtilizadas;
    }

    /**
     * Obtener las horas disponibles para evidencia (restando las horas de planeación)
     */

    private function actualizarProgresoProducto($productoId)
    {
        // Obtener todas las entregas de evidencia del producto
        $entregasEvidencia = EntregaProducto::where('producto_investigativo_id', $productoId)
            ->where('tipo', 'evidencia')
            ->get();

        if ($entregasEvidencia->isEmpty()) {
            return;
        }

        // Calcular el progreso promedio de todas las evidencias
        $progresoTotal = $entregasEvidencia->sum('progreso_evidencia');
        $progresoPromedio = round($progresoTotal / $entregasEvidencia->count());

        // Actualizar el progreso del producto
        ProductoInvestigativo::where('id', $productoId)->update([
            'progreso' => $progresoPromedio
        ]);
    }
}
