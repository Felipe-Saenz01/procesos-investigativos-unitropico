<?php

namespace App\Http\Controllers;

use App\Models\ElementosProducto;
use App\Models\EntregaProducto;
use App\Models\HorasInvestigacion;
use App\Models\Periodo;
use App\Models\ProductoInvestigativo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EntregaProductoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return redirect()->route('dashboard');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(ProductoInvestigativo $producto)
    {
        return redirect()->route('dashboard');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, ProductoInvestigativo $producto)
    {
        return redirect()->route('dashboard');
    }

    /**
     * Display the specified resource.
     */
    public function show(EntregaProducto $entregaProducto)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$entregaProducto->productoInvestigativo->usuarios->contains(Auth::id()) and Auth::user()->hasRole('Investigador')) {
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
        if (now()->isAfter($entregaProducto->periodo->fecha_limite_evidencias)) {
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
        if (now()->isAfter($entregaProducto->periodo->fecha_limite_evidencias)) {
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

        // Si es una entrega de evidencia, verificar si se debe actualizar el estado del proyecto
        if ($entregaProducto->tipo === 'evidencia') {
            $this->verificarYActualizarEstadoProyecto($entregaProducto->productoInvestigativo);
        }

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
        if (now()->isAfter($entregaProducto->periodo->fecha_limite_evidencias)) {
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
        // Verificar que el producto tenga elementos definidos
        $elementos = $producto->elementos()->orderBy('nombre')->get();
        if ($elementos->isEmpty()) {
            return to_route('productos.show', $producto->id)->with('error', 'El producto debe tener al menos un elemento definido antes de crear entregas.');
        }
        
        // Obtener periodos activos
        $periodos = Periodo::where('estado', 'Activo')->get();
        if ($periodos->isEmpty()) {
            return to_route('productos.show', $producto->id)->with('error', 'No hay períodos activos para crear planeación.');
        }

        // Calcular horas disponibles para cada período
        $periodosConHoras = $periodos->map(function ($periodo) {
            // Obtener las horas asignadas al usuario en el período
            $horasAsignadas = HorasInvestigacion::where('user_id', Auth::id())
                ->where('periodo_id', $periodo->id)
                ->where('estado', 'Activo')
                ->sum('horas');

            // Obtener las horas ya utilizadas en entregas del usuario en el período
            $horasUtilizadas = EntregaProducto::where('user_id', Auth::id())
                ->where('tipo', 'planeacion')
                ->where('periodo_id', $periodo->id)
                ->sum('horas_planeacion');

            $horasDisponibles = $horasAsignadas - $horasUtilizadas;

            return [
                'id' => $periodo->id,
                'nombre' => $periodo->nombre,
                'fecha_limite_planeacion' => $periodo->fecha_limite_planeacion,
                'fecha_limite_evidencias' => $periodo->fecha_limite_evidencias,
                'estado' => $periodo->estado,
                'horas_disponibles' => $horasDisponibles,
            ];
        });

        $entregasExistentes = $producto->entregas()->with('periodo')->get();
        
        return Inertia::render('Productos/Entregas/PlaneacionCreate', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto']),
            'periodos' => $periodosConHoras,
            'elementos' => $elementos,
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
            'planeacion.*.elemento_id' => 'required|exists:elementos_productos,id',
            'planeacion.*.porcentaje' => 'required|numeric|min:0|max:100',
            'progreso_planeacion' => 'required|integer|min:0|max:100',
            'horas_planeacion' => 'required|integer|min:1',
        ], [
            'periodo_id.required' => 'El período es requerido.',
            'periodo_id.exists' => 'El período seleccionado no existe.',
            'planeacion.required' => 'Los elementos de planeación son requeridos.',
            'planeacion.array' => 'Los elementos deben ser una lista.',
            'planeacion.min' => 'Debe agregar al menos un elemento de planeación.',
            'planeacion.*.elemento_id.required' => 'El elemento es requerido.',
            'planeacion.*.elemento_id.exists' => 'El elemento seleccionado no existe.',
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

        // Verificar que no exista ya una entrega de planeación
        $entregasExistentes = $producto->entregas()->where('periodo_id', $request->periodo_id)->get();
        $planeacionExistente = $entregasExistentes->where('tipo', 'planeacion')->first();
        
        if ($planeacionExistente) {
            return back()->withErrors(['periodo_id' => 'Ya existe una entrega de planeación para este período.']);
        }

        // Validar horas disponibles del usuario en el período
        $horasDisponibles = $this->getHorasDisponiblesUsuario(Auth::id(), $request->periodo_id);
        
        if ($request->horas_planeacion > $horasDisponibles) {
            return back()->withErrors(['horas_planeacion' => "No tienes suficientes horas disponibles. Tienes {$horasDisponibles} horas y solicitas {$request->horas_planeacion} horas."]);
        }

        // Convertir los IDs de elementos a nombres para almacenar en la planeación
        $planeacionConNombres = collect($request->planeacion)->map(function ($item) {
            $elemento = ElementosProducto::find($item['elemento_id']);
            return [
                'nombre' => $elemento->nombre,
                'porcentaje' => $item['porcentaje']
            ];
        })->toArray();

        // Crear la entrega
        $entrega = EntregaProducto::create([
            'tipo' => 'planeacion',
            'planeacion' => $planeacionConNombres,
            'periodo_id' => $request->periodo_id,
            'user_id' => Auth::id(),
            'producto_investigativo_id' => $producto->id,
            'evidencia' => null,
            'progreso_planeacion' => $request->progreso_planeacion,
            'progreso_evidencia' => 0,
            'horas_planeacion' => $request->horas_planeacion,
            'horas_evidencia' => 0,
            'estado' => 'pendiente', // Establecer estado por defecto
        ]);

        return to_route('productos.show', $producto)->with('success', 'Planeación creada exitosamente.');
    }

    /**
     * Formulario para crear evidencia
     */
    public function createEvidencia(ProductoInvestigativo $producto)
    {
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para crear entregas para este producto.');
        }
        
        // Verificar que el producto tenga elementos definidos
        $elementos = $producto->elementos()->orderBy('nombre')->get();
        if ($elementos->isEmpty()) {
            return to_route('productos.show', $producto->id)->with('error', 'El producto debe tener al menos un elemento definido antes de crear entregas.');
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
            'fecha_limite_planeacion' => $periodo->fecha_limite_planeacion,
            'fecha_limite_evidencias' => $periodo->fecha_limite_evidencias,
            'estado' => $periodo->estado,
            'horas_disponibles' => $planeacion->horas_planeacion, // Usar las horas de planeación
        ];
        
        $entregasExistentes = $producto->entregas()->where('periodo_id', $periodo->id)->get();
        
        return Inertia::render('Productos/Entregas/EvidenciaCreate', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto']),
            'periodo' => $periodoConHoras,
            'planeacion' => $planeacion->planeacion,
            'elementos' => $elementos,
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
            'evidencia' => 'required|file|mimes:pdf,doc,docx,txt,jpg,jpeg,png,zip,rar|max:10240', // 10MB máximo
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
            'evidencia.required' => 'El archivo de evidencia es obligatorio.',
            'evidencia.file' => 'Debe subir un archivo válido.',
            'evidencia.mimes' => 'El archivo debe ser de tipo: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, ZIP, RAR.',
            'evidencia.max' => 'El archivo no puede ser mayor a 10MB.',
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
            return back()->withErrors(['general' => 'Ya existe una entrega de evidencia para este período.']);
        }

        // Crear la evidencia con los mismos elementos de la planeación
        $evidencia = $planeacion->planeacion;
        foreach ($request->porcentaje_completado as $index => $porcentaje) {
            if (isset($evidencia[$index])) {
                $evidencia[$index]['completado'] = $porcentaje;
            }
        }

        // Guardar el archivo de evidencia
        $rutaArchivo = null;
        if ($request->hasFile('evidencia')) {
            $archivo = $request->file('evidencia');
            $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
            $rutaArchivo = $archivo->storeAs('evidencias', $nombreArchivo, 'public');
        }

        // Crear la entrega de evidencia
        $entrega = EntregaProducto::create([
            'tipo' => 'evidencia',
            'planeacion' => $evidencia,
            'periodo_id' => $periodo->id,
            'user_id' => Auth::id(),
            'producto_investigativo_id' => $producto->id,
            'evidencia' => $rutaArchivo,
            'progreso_planeacion' => $request->progreso_evidencia, // Usar el mismo campo para evidencia
            'horas_planeacion' => $planeacion->horas_planeacion,
            'estado' => 'pendiente', // Establecer estado por defecto
        ]);

        // Si hay archivo, moverlo a la carpeta organizada por cédula del usuario e ID de entrega
        if ($rutaArchivo && $request->hasFile('evidencia')) {
            $archivo = $request->file('evidencia');
            $extension = $archivo->getClientOriginalExtension();
            
            // Obtener la cédula del usuario autenticado
            $usuario = Auth::user();
            $cedula = $usuario->cedula ?? 'sin_cedula';
            
            // Crear nombre de archivo con formato: evidencia_id_fecha
            $fecha = now()->format('Y-m-d');
            $nombreArchivo = "evidencia_{$entrega->id}_{$fecha}.{$extension}";
            
            // Crear carpeta con formato: cedula_id_entrega
            $carpeta = "evidencias/{$cedula}_{$entrega->id}";
            $nuevaRuta = $archivo->storeAs($carpeta, $nombreArchivo, 'public');
            
            // Actualizar la ruta en la base de datos
            $entrega->update(['evidencia' => $nuevaRuta]);
            
            // Eliminar el archivo temporal
            Storage::disk('public')->delete($rutaArchivo);
        }

        // Actualizar el progreso de los elementos del producto
        $this->actualizarProgresoElementos($producto->id, $planeacion->planeacion, $request->porcentaje_completado);

        // Actualizar el progreso general del producto
        $this->actualizarProgresoProducto($producto->id, $request->progreso_evidencia);

        // Verificar si el producto es de tipo formulación o su título empieza por "Formulación del Proyecto"
        // y actualizar el estado del proyecto asociado
        $this->verificarYActualizarEstadoProyecto($producto);

        return to_route('productos.show', $producto)->with('success', 'Evidencia creada exitosamente.');
    }

    /**
     * Obtener las horas disponibles del usuario en un período específico
     */
    public function getHorasDisponiblesUsuario($userId, $periodoId)
    {
        // Obtener las horas asignadas al usuario en el período
        $horasAsignadas = HorasInvestigacion::where('user_id', $userId)
            // ->where('periodo_id', $periodoId)
            ->where('estado', 'Activo')
            ->sum('horas');

        // Obtener las horas ya utilizadas en entregas del usuario en el período
        $horasUtilizadas = EntregaProducto::where('user_id', $userId)
            ->where('tipo', 'planeacion')
            ->where('periodo_id', $periodoId)
            ->sum('horas_planeacion');

        return $horasAsignadas - $horasUtilizadas;
    }

    /**
     * Obtener las horas disponibles para evidencia (restando las horas de planeación)
     */

    private function actualizarProgresoProducto($productoId, $nuevoProgreso)
    {
        $producto = ProductoInvestigativo::find($productoId);
        
        if (!$producto) return;
        

        if ($nuevoProgreso > $producto->progreso) {
            $producto->update([
                'progreso' => $nuevoProgreso
            ]);
        }
    }

    /**
     * Actualizar el progreso de los elementos del producto
     */
    private function actualizarProgresoElementos($productoId, $planeacion, $porcentajesCompletados)
    {
        foreach ($planeacion as $index => $item) {
            if (isset($porcentajesCompletados[$index])) {
                $elemento = ElementosProducto::where('producto_investigativo_id', $productoId)
                    ->where('nombre', $item['nombre'])
                    ->first();
                
                if ($elemento) {
                    $elemento->update([
                        'progreso' => $porcentajesCompletados[$index]
                    ]);
                }
            }
        }
    }

    /**
     * Verificar si el producto es de tipo formulación o su título empieza por "Formulación del Proyecto"
     * y actualizar el estado del proyecto asociado.
     */
    private function verificarYActualizarEstadoProyecto($producto)
    {
        // Cargar las relaciones necesarias si no están cargadas
        if (!$producto->relationLoaded('subTipoProducto')) {
            $producto->load('subTipoProducto');
        }
        if (!$producto->relationLoaded('proyecto')) {
            $producto->load('proyecto');
        }

        // Verificar si el producto es de tipo formulación
        $esProductoFormulacion = false;
        
        // Verificar por el nombre del subtipo de producto
        if ($producto->subTipoProducto && 
            (str_contains(strtolower($producto->subTipoProducto->nombre), 'formulación') || 
             str_contains(strtolower($producto->subTipoProducto->nombre), 'formulacion'))) {
            $esProductoFormulacion = true;
        }
        
        // Verificar por el título del producto
        if (str_starts_with(strtolower($producto->titulo), 'formulación del proyecto') || 
            str_starts_with(strtolower($producto->titulo), 'formulacion del proyecto')) {
            $esProductoFormulacion = true;
        }

        // Si es un producto de formulación y el proyecto está en estado "Formulación", actualizarlo a "Formulado"
        if ($esProductoFormulacion && $producto->proyecto && $producto->proyecto->estado === 'Formulación') {
            $producto->proyecto->update([
                'estado' => 'Formulado'
            ]);
        }
    }

    /**
     * Mostrar detalles de un período específico para un producto
     */
    public function detallePeriodo(ProductoInvestigativo $producto, \App\Models\Periodo $periodo)
    {
        // Verificar que el usuario tenga acceso al producto
        if (!$producto->usuarios->contains(Auth::id()) && Auth::user()->rol === 'Investigador') {
            abort(403, 'No tienes permisos para ver este producto.');
        }

        // Obtener todas las entregas del período para este producto
        $entregas = $producto->entregas()
            ->where('periodo_id', $periodo->id)
            ->with(['usuario', 'periodo'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Separar entregas por tipo
        $planeacion = $entregas->where('tipo', 'planeacion')->first();
        $evidencia = $entregas->where('tipo', 'evidencia')->first();

        // Calcular estadísticas
        $estadisticas = [
            'total_entregas' => $entregas->count(),
            'tiene_planeacion' => $planeacion ? true : false,
            'tiene_evidencia' => $evidencia ? true : false,
            'progreso_planeacion' => $planeacion ? $planeacion->progreso_planeacion : 0,
            'progreso_evidencia' => $evidencia ? $evidencia->progreso_planeacion : 0, // Usando el mismo campo
            'horas_planeacion' => $planeacion ? $planeacion->horas_planeacion : 0,
            'fecha_planeacion' => $planeacion ? $planeacion->created_at : null,
            'fecha_evidencia' => $evidencia ? $evidencia->created_at : null,
        ];

        // Calcular diferencias entre planeación y evidencia
        $comparacion = null;
        if ($planeacion && $evidencia) {
            $comparacion = [
                'diferencia_progreso' => $evidencia->progreso_planeacion - $planeacion->progreso_planeacion,
                'cumplimiento_planeacion' => $evidencia->progreso_planeacion >= $planeacion->progreso_planeacion,
                'elementos_planeacion' => $planeacion->planeacion ?? [],
                'elementos_evidencia' => $evidencia->planeacion ?? [],
            ];
        }

        return Inertia::render('Productos/Entregas/Detalle', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto', 'usuarios']),
            'periodo' => $periodo,
            'planeacion' => $planeacion,
            'evidencia' => $evidencia,
            'estadisticas' => $estadisticas,
            'comparacion' => $comparacion,
        ]);
    }
}