<?php

namespace App\Http\Controllers;

use App\Models\EntregaProducto;
use App\Models\ProductoInvestigativo;
use App\Models\ProyectoInvestigativo;
use App\Models\SubTipoProducto;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\ActividadesInvestigacion;
use App\Models\TipoProducto;
use App\Models\ActividadesPlan;
use App\Models\PlanTrabajo;

class ProductoInvestigativoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Lógica de permisos por rol
        if ($user->hasRole('Administrador')) {
            // Administrador ve todos los productos
            $paginator = ProductoInvestigativo::with(['proyecto', 'subTipoProducto.tipoProducto', 'usuarios'])
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString();
            $productos = collect($paginator->items());
            $productos_links = $paginator->toArray()['links'] ?? [];
        } elseif ($user->hasRole('Lider Grupo')) {
            // Líder ve productos de investigadores de su grupo
            $paginator = ProductoInvestigativo::with(['proyecto', 'subTipoProducto.tipoProducto', 'usuarios'])
                ->whereHas('usuarios', function ($query) use ($user) {
                    $query->whereHas('grupoInvestigacion', function ($q) use ($user) {
                        $q->where('id', $user->grupo_investigacion_id);
                    });
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString();
            $productos = collect($paginator->items());
            $productos_links = $paginator->toArray()['links'] ?? [];
        } else {
            // Investigador ve solo sus productos
            $paginator = ProductoInvestigativo::with(['proyecto', 'subTipoProducto.tipoProducto', 'usuarios'])
                ->whereHas('usuarios', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString();
            $productos = collect($paginator->items());
            $productos_links = $paginator->toArray()['links'] ?? [];
        }

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'productos_links' => $productos_links ?? [],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();
        $proyectos = ProyectoInvestigativo::whereHas('usuarios', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->where('estado', '!=', 'Formulación')->get(['id', 'titulo']);
        
        // Actividades de investigación permitidas: asociadas a actividades de planes Aprobados del investigador
        $actividadIds = ActividadesPlan::whereHas('planTrabajo', function ($q) use ($user) {
                $q->where('user_id', $user->id)->where('estado', 'Aprobado');
            })
            ->pluck('actividad_investigacion_id')
            ->unique()
            ->filter()
            ->values();

        $actividadesInvestigacion = ActividadesInvestigacion::whereIn('id', $actividadIds)->get(['id', 'nombre']);

        // Pre-cargar tipos y subtipos por actividad para evitar llamadas adicionales desde el front
        $tipos = TipoProducto::whereIn('actividad_investigacion_id', $actividadIds)
            ->with(['subTipos' => function($q) { $q->select('id','nombre','tipo_producto_id'); }])
            ->get(['id','nombre','actividad_investigacion_id']);

        $actividadesConTipos = $actividadesInvestigacion->map(function($act) use ($tipos) {
            $tiposDeActividad = $tipos->where('actividad_investigacion_id', $act->id)
                ->values()
                ->map(function($t){
                    return [
                        'id' => $t->id,
                        'nombre' => $t->nombre,
                        'sub_tipos' => $t->subTipos->map(function($st){
                            return [ 'id' => $st->id, 'nombre' => $st->nombre ];
                        })->values(),
                    ];
                });
            return [
                'id' => $act->id,
                'nombre' => $act->nombre,
                'tipos' => $tiposDeActividad,
            ];
        })->values();

        // Obtener usuarios disponibles para el multi-select (solo Investigadores y Líderes)
        $usuarios = User::select('id', 'name', 'tipo')
            ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
            ->get();

        return inertia('Productos/Create', [
            'proyectos' => $proyectos,
            'actividadesInvestigacion' => $actividadesInvestigacion,
            'actividadesConTipos' => $actividadesConTipos,
            'usuarios' => $usuarios,
            'usuarioLogueado' => $user->id,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'resumen' => 'required|string',
            'proyecto_investigacion_id' => 'required|exists:proyecto_investigativos,id',
            'sub_tipo_producto_id' => 'required|exists:sub_tipo_productos,id',
            'usuarios' => 'required|array|min:1',
            'usuarios.*' => 'exists:users,id',
        ]);

        // Validación de consistencia de actividad permitida (plan aprobado)
        $user = Auth::user();
        $subTipo = SubTipoProducto::with('tipoProducto')->findOrFail($request->sub_tipo_producto_id);
        $tipo = $subTipo->tipoProducto;
        if (!$tipo) {
            return back()->withErrors(['sub_tipo_producto_id' => 'El subtipo no pertenece a un tipo válido.']);
        }
        $actividadTipoId = $tipo->actividad_investigacion_id;
        $actividadPermitida = ActividadesPlan::where('actividad_investigacion_id', $actividadTipoId)
            ->whereHas('planTrabajo', function ($q) use ($user) {
                $q->where('user_id', $user->id)->where('estado', 'Aprobado');
            })
            ->exists();
        if (!$actividadPermitida) {
            return back()->withErrors(['sub_tipo_producto_id' => 'El subtipo seleccionado no corresponde a una actividad permitida de un plan aprobado.']);
        }

        $producto = ProductoInvestigativo::create([
            'titulo' => $request->titulo,
            'resumen' => $request->resumen,
            'proyecto_investigacion_id' => $request->proyecto_investigacion_id,
            'sub_tipo_producto_id' => $request->sub_tipo_producto_id,
        ]);

        // Asociar el producto a los usuarios seleccionados
        $producto->usuarios()->attach($request->usuarios);

        return to_route('productos.index')->with('success', 'Producto investigativo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductoInvestigativo $producto)
    {
        $user = Auth::user();
        if ($user->hasRole('Investigador') && !$producto->usuarios->contains($user->id)) {
            return to_route('productos.index')->with('error', 'No tienes permisos para ver este producto.');
        }

        // Traer todos los periodos activos y los periodos en los que ya hay entregas para el producto
        $periodosConEntregas = \App\Models\Periodo::where('estado', 'Activo')
            ->orWhereHas('entregas', function ($q) use ($producto) {
                $q->where('producto_investigativo_id', $producto->id);
            })
            ->orderBy('fecha_limite_planeacion', 'desc')
            ->get();

        $periodos = $periodosConEntregas->map(function ($periodo) use ($producto) {
            $entregas = $periodo->entregas()->where('producto_investigativo_id', $producto->id)->with('usuario')->get();
            $planeacion = $entregas->where('tipo', 'planeacion')->first();
            $evidencia = $entregas->where('tipo', 'evidencia')->first();
            
            // Verificar si las fechas límite están vigentes
            $now = now();
            $puedeCrearPlaneacion = !$planeacion && 
                                   $periodo->estado === 'Activo' && 
                                   $now->lte($periodo->fecha_limite_planeacion);
            
            $puedeCrearEvidencia = $planeacion && 
                                  !$evidencia && 
                                  $periodo->estado === 'Activo' && 
                                  $now->lte($periodo->fecha_limite_evidencias);
            
            return [
                'id' => $periodo->id,
                'nombre' => $periodo->nombre,
                'fecha_limite_planeacion' => $periodo->fecha_limite_planeacion,
                'fecha_limite_evidencias' => $periodo->fecha_limite_evidencias,
                'estado' => $periodo->estado,
                'puede_crear_planeacion' => $puedeCrearPlaneacion,
                'puede_crear_evidencia' => $puedeCrearEvidencia,
                'planeacion' => $planeacion ? [
                    'id' => $planeacion->id,
                    'estado' => $planeacion->estado,
                    'usuario' => $planeacion->usuario->only(['id', 'name']),
                    'created_at' => $planeacion->created_at,
                ] : null,
                'evidencia' => $evidencia ? [
                    'id' => $evidencia->id,
                    'estado' => $evidencia->estado,
                    'usuario' => $evidencia->usuario->only(['id', 'name']),
                    'created_at' => $evidencia->created_at,
                ] : null,
            ];
        })->values();

        return Inertia::render('Productos/Show', [
            'producto' => $producto->load(['proyecto', 'subTipoProducto', 'usuarios', 'elementos']),
            'periodos' => $periodos,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductoInvestigativo $producto)
    {
        $user = Auth::user();
        
        // Verificar que el usuario tenga acceso al proyecto del producto
        $proyecto = $producto->proyecto;
        
        if (!$proyecto->usuarios()->where('user_id', $user->id)->exists()) {
            abort(403, 'No tienes acceso a este producto.');
        }

        // Verificar que el proyecto no esté en formulación
        if ($proyecto->estado === 'Formulación') {
            abort(403, 'No se puede editar productos de proyectos en formulación.');
        }

        $proyectos = ProyectoInvestigativo::whereHas('usuarios', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->where('estado', '!=', 'Formulación')->get(['id', 'titulo']);
        
        
        // Actividades permitidas por planes Aprobados del investigador
        $actividadIds = ActividadesPlan::whereHas('planTrabajo', function ($q) use ($user) {
                $q->where('user_id', $user->id)->where('estado', 'Aprobado');
            })
            ->pluck('actividad_investigacion_id')
            ->unique()
            ->filter()
            ->values();

        // Asegurar incluir la actividad ligada al producto actual para no romper el formulario
        $producto->load('subTipoProducto.tipoProducto.actividadInvestigacion');
        $actividadActualId = optional(optional($producto->subTipoProducto)->tipoProducto)->actividad_investigacion_id;
        if ($actividadActualId && !$actividadIds->contains($actividadActualId)) {
            $actividadIds->push($actividadActualId);
        }

        $actividadesInvestigacion = ActividadesInvestigacion::whereIn('id', $actividadIds)->get(['id', 'nombre']);
        
        // Cargar las relaciones necesarias para el filtrado
        $producto->load(['subTipoProducto.tipoProducto.actividadInvestigacion', 'usuarios']);
        
        // Pre-cargar tipos y subtipos por actividad para evitar llamadas adicionales desde el front
        $tipos = TipoProducto::whereIn('actividad_investigacion_id', $actividadIds)
            ->with(['subTipos' => function($q) { $q->select('id','nombre','tipo_producto_id'); }])
            ->get(['id','nombre','actividad_investigacion_id']);

        $actividadesConTipos = $actividadesInvestigacion->map(function($act) use ($tipos) {
            $tiposDeActividad = $tipos->where('actividad_investigacion_id', $act->id)
                ->values()
                ->map(function($t){
                    return [
                        'id' => $t->id,
                        'nombre' => $t->nombre,
                        'sub_tipos' => $t->subTipos->map(function($st){
                            return [ 'id' => $st->id, 'nombre' => $st->nombre ];
                        })->values(),
                    ];
                });
            return [
                'id' => $act->id,
                'nombre' => $act->nombre,
                'tipos' => $tiposDeActividad,
            ];
        })->values();

        // Obtener usuarios disponibles para el multi-select (solo Investigadores y Líderes)
        $usuarios = User::select('id', 'name', 'tipo')
            ->whereIn('tipo', ['Investigador', 'Lider Grupo'])
            ->get();

        return inertia('Productos/Edit', [
            'producto' => $producto,
            'proyectos' => $proyectos,
            'actividadesInvestigacion' => $actividadesInvestigacion,
            'actividadesConTipos' => $actividadesConTipos,
            'usuarios' => $usuarios,
            'usuarioLogueado' => $user->id,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductoInvestigativo $producto)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'resumen' => 'required|string',
            'proyecto_investigacion_id' => 'required|exists:proyecto_investigativos,id',
            'sub_tipo_producto_id' => 'required|exists:sub_tipo_productos,id',
            'usuarios' => 'required|array|min:1',
            'usuarios.*' => 'exists:users,id',
        ]);

        // Validación de consistencia de actividad permitida (plan aprobado)
        $user = Auth::user();
        $subTipo = SubTipoProducto::with('tipoProducto')->findOrFail($request->sub_tipo_producto_id);
        $tipo = $subTipo->tipoProducto;
        if (!$tipo) {
            return back()->withErrors(['sub_tipo_producto_id' => 'El subtipo no pertenece a un tipo válido.']);
        }
        $actividadTipoId = $tipo->actividad_investigacion_id;
        $actividadPermitida = ActividadesPlan::where('actividad_investigacion_id', $actividadTipoId)
            ->whereHas('planTrabajo', function ($q) use ($user) {
                $q->where('user_id', $user->id)->where('estado', 'Aprobado');
            })
            ->exists();
        if (!$actividadPermitida) {
            return back()->withErrors(['sub_tipo_producto_id' => 'El subtipo seleccionado no corresponde a una actividad permitida de un plan aprobado.']);
        }

        $producto->update([
            'titulo' => $request->titulo,
            'resumen' => $request->resumen,
            'proyecto_investigacion_id' => $request->proyecto_investigacion_id,
            'sub_tipo_producto_id' => $request->sub_tipo_producto_id,
        ]);

        // Sincronizar usuarios del producto
        $producto->usuarios()->sync($request->usuarios);

        return to_route('productos.index')->with('success', 'Producto investigativo actualizado exitosamente.');
    }

    // Método para obtener tipos de producto filtrados por actividad de investigación
    public function getTiposPorActividad(Request $request)
    {
        $request->validate([
            'actividad_investigacion_id' => 'required|exists:actividades_investigacions,id'
        ]);

        $tipos = TipoProducto::where('actividad_investigacion_id', $request->actividad_investigacion_id)
            ->get(['id', 'nombre']);

        return response()->json($tipos);
    }

    // Método para obtener subtipos de producto filtrados por tipo de producto
    public function getSubTiposPorTipo(Request $request)
    {
        $request->validate([
            'tipo_producto_id' => 'required|exists:tipo_productos,id'
        ]);

        $subTipos = SubTipoProducto::where('tipo_producto_id', $request->tipo_producto_id)
            ->get(['id', 'nombre']);

        return response()->json($subTipos);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductoInvestigativo $producto)
    {
        // Verificar que el usuario tenga acceso al producto (está en la lista de usuarios asociados)
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para eliminar este producto.');
        }

        // Verificar que el proyecto no esté en estado de formulación
        if ($producto->proyecto->estado === 'Formulación') {
            abort(403, 'No se puede eliminar un producto cuyo proyecto está en estado de formulación.');
        }

        // Verificar si el producto tiene entregas asociadas
        if ($producto->entregas()->count() > 0) {
            return to_route('productos.index')->with('error', 'No se puede eliminar el producto porque tiene entregas asociadas.');
        }

        // Eliminar relaciones con usuarios
        $producto->usuarios()->detach();

        $producto->delete();
        return to_route('productos.index')->with('success', 'Producto investigativo eliminado exitosamente.');
    }
}
