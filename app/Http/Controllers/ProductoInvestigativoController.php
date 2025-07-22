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
        // Obtener proyectos donde el usuario logueado está asociado
        $proyectos = ProyectoInvestigativo::where('estado', 'Formulado')
            ->whereHas('usuarios', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->get(['id', 'titulo']);

        if ($proyectos->isEmpty()) {
            return to_route('proyectos.index')->with('error', 'No tienes proyectos formulados.');
        }

        // Obtener subtipos de productos
        $subTipos = SubTipoProducto::all();

        // Obtener usuarios para el multiselect (solo usuarios que tengan proyectos)
        $usuarios = User::whereIn('role', ['Investigador', 'Lider Grupo'])->get(['id', 'name', 'role']);

        return Inertia::render('Productos/Create', [
            'proyectos' => $proyectos,
            'subTipos' => $subTipos,
            'usuarios' => $usuarios,
            'usuarioLogueado' => [
                'id' => Auth::id(),
                'name' => Auth::user()->name,
                'role' => Auth::user()->role,
            ],
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
        ], [
            'titulo.required' => 'El título es requerido.',
            'resumen.required' => 'El resumen es requerido.',
            'proyecto_investigacion_id.required' => 'Debe seleccionar un proyecto.',
            'proyecto_investigacion_id.exists' => 'El proyecto seleccionado no existe.',
            'sub_tipo_producto_id.required' => 'Debe seleccionar un tipo de producto.',
            'sub_tipo_producto_id.exists' => 'El tipo de producto seleccionado no existe.',
            'usuarios.required' => 'Debe seleccionar al menos un usuario.',
            'usuarios.min' => 'Debe seleccionar al menos un usuario.',
            'usuarios.*.exists' => 'Uno de los usuarios seleccionados no existe.',
        ]);

        // Verificar que el proyecto está asociado al usuario logueado
        $proyecto = ProyectoInvestigativo::where('id', $request->proyecto_investigacion_id)
            ->whereHas('usuarios', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->first();

        if (!$proyecto) {
            return back()->withErrors(['proyecto_investigacion_id' => 'No tienes permisos para usar este proyecto.']);
        }

        // Crear el producto
        $producto = ProductoInvestigativo::create([
            'titulo' => $request->titulo,
            'resumen' => $request->resumen,
            'proyecto_investigacion_id' => $request->proyecto_investigacion_id,
            'sub_tipo_producto_id' => $request->sub_tipo_producto_id,
            'progreso' => 0,
        ]);

        // Asociar usuarios
        $producto->usuarios()->attach($request->usuarios);

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
        // Verificar que el usuario tenga acceso al producto (está en la lista de usuarios asociados)
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para editar este producto.');
        }

        // Verificar que el proyecto no esté en estado de formulación
        if ($producto->proyecto->estado === 'Formulación') {
            abort(403, 'No se puede editar un producto cuyo proyecto está en estado de formulación.');
        }

        // Obtener proyectos donde el usuario logueado está asociado (solo proyectos formulados)
        $proyectos = ProyectoInvestigativo::where('estado', 'Formulado')
            ->whereHas('usuarios', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->get(['id', 'titulo']);

        // Obtener subtipos de productos
        $subTipos = SubTipoProducto::all();

        // Obtener usuarios para el multiselect
        $usuarios = User::whereIn('role', ['Investigador', 'Lider Grupo'])->get(['id', 'name', 'role']);

        return Inertia::render('Productos/Edit', [
            'producto' => $producto->load(['usuarios', 'proyecto', 'subTipoProducto']),
            'proyectos' => $proyectos,
            'subTipos' => $subTipos,
            'usuarios' => $usuarios,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductoInvestigativo $producto)
    {
        // Verificar que el usuario tenga acceso al producto (está en la lista de usuarios asociados)
        if (!$producto->usuarios->contains(Auth::id())) {
            abort(403, 'No tienes permisos para actualizar este producto.');
        }

        // Verificar que el proyecto no esté en estado de formulación
        if ($producto->proyecto->estado === 'Formulación') {
            abort(403, 'No se puede actualizar un producto cuyo proyecto está en estado de formulación.');
        }

        $request->validate([
            'titulo' => 'required|string|max:255',
            'resumen' => 'required|string',
            'proyecto_investigacion_id' => 'required|exists:proyecto_investigativos,id',
            'sub_tipo_producto_id' => 'required|exists:sub_tipo_productos,id',
            'usuarios' => 'required|array|min:1',
            'usuarios.*' => 'exists:users,id',
        ], [
            'titulo.required' => 'El título es requerido.',
            'resumen.required' => 'El resumen es requerido.',
            'proyecto_investigacion_id.required' => 'Debe seleccionar un proyecto.',
            'proyecto_investigacion_id.exists' => 'El proyecto seleccionado no existe.',
            'sub_tipo_producto_id.required' => 'Debe seleccionar un tipo de producto.',
            'sub_tipo_producto_id.exists' => 'El tipo de producto seleccionado no existe.',
            'usuarios.required' => 'Debe seleccionar al menos un usuario.',
            'usuarios.min' => 'Debe seleccionar al menos un usuario.',
            'usuarios.*.exists' => 'Uno de los usuarios seleccionados no existe.',
        ]);

        // Verificar que el proyecto está asociado al usuario logueado
        $proyecto = ProyectoInvestigativo::where('id', $request->proyecto_investigacion_id)
            ->whereHas('usuarios', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->first();

        if (!$proyecto) {
            return back()->withErrors(['proyecto_investigacion_id' => 'No tienes permisos para usar este proyecto.']);
        }

        // Actualizar el producto
        $producto->update([
            'titulo' => $request->titulo,
            'resumen' => $request->resumen,
            'proyecto_investigacion_id' => $request->proyecto_investigacion_id,
            'sub_tipo_producto_id' => $request->sub_tipo_producto_id,
        ]);

        // Sincronizar usuarios
        $producto->usuarios()->sync($request->usuarios);

        return to_route('productos.index')->with('success', 'Producto investigativo actualizado exitosamente.');
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
