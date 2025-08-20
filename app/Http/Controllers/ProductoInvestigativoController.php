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

class ProductoInvestigativoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $productos = ProductoInvestigativo::with(['proyecto', 'subTipoProducto', 'usuarios'])
            ->whereHas('usuarios', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
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
        
        $actividadesInvestigacion = ActividadesInvestigacion::all(['id', 'nombre']);
        
        return inertia('Productos/Create', [
            'proyectos' => $proyectos,
            'actividadesInvestigacion' => $actividadesInvestigacion,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'proyecto_investigativo_id' => 'required|exists:proyecto_investigativos,id',
            'sub_tipo_producto_id' => 'required|exists:sub_tipo_productos,id',
        ]);

        $producto = ProductoInvestigativo::create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'proyecto_investigativo_id' => $request->proyecto_investigativo_id,
            'sub_tipo_producto_id' => $request->sub_tipo_producto_id,
        ]);

        return to_route('productos.index')->with('success', 'Producto investigativo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductoInvestigativo $producto)
    {
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para ver este producto.');
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
            return [
                'id' => $periodo->id,
                'nombre' => $periodo->nombre,
                'fecha_limite_planeacion' => $periodo->fecha_limite_planeacion,
                'fecha_limite_evidencias' => $periodo->fecha_limite_evidencias,
                'estado' => $periodo->estado,
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
            'producto' => $producto->load(['proyecto', 'subTipoProducto', 'usuarios']),
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
        $proyecto = $producto->proyectoInvestigativo;
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
        
        $actividadesInvestigacion = ActividadesInvestigacion::all(['id', 'nombre']);
        
        // Cargar las relaciones necesarias para el filtrado
        $producto->load('subTipoProducto.tipoProducto.actividadInvestigacion');
        
        return inertia('Productos/Edit', [
            'producto' => $producto,
            'proyectos' => $proyectos,
            'actividadesInvestigacion' => $actividadesInvestigacion,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductoInvestigativo $producto)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'proyecto_investigativo_id' => 'required|exists:proyecto_investigativos,id',
            'sub_tipo_producto_id' => 'required|exists:sub_tipo_productos,id',
        ]);

        $producto->update([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'proyecto_investigativo_id' => $request->proyecto_investigativo_id,
            'sub_tipo_producto_id' => $request->sub_tipo_producto_id,
        ]);

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
