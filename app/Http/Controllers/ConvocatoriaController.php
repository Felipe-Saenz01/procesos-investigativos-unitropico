<?php

namespace App\Http\Controllers;

use App\Models\Convocatoria;
use App\Models\Postulacion;
use App\Models\RequisitosConvocatoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ConvocatoriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $paginator = Convocatoria::with(['requisitos', 'postulaciones'])
            ->orderBy('fecha_inicio', 'desc')
            ->paginate(10)
            ->withQueryString();
        $convocatorias = collect($paginator->items());
        $convocatorias_links = $paginator->toArray()['links'] ?? [];

        // Filtrar según el rol del usuario
        if ($user->hasRole('Administrador')) {
            // Administrador ve todas las convocatorias
            $convocatorias = $convocatorias->map(function ($convocatoria) {
                $convocatoria->total_postulaciones = $convocatoria->postulaciones->count();
                $convocatoria->dias_restantes = $convocatoria->diasRestantes();
                $convocatoria->postulaciones_pendientes = $convocatoria->postulaciones->where('estado', 'Pendiente')->count();
                return $convocatoria;
            });
        } elseif ($user->hasRole('Lider Grupo')) {
            // Líder ve todas las convocatorias pero con información de su postulación
            $convocatorias = $convocatorias->map(function ($convocatoria) use ($user) {
                $convocatoria->mi_postulacion = $convocatoria->postulaciones->where('user_id', $user->id)->first();
                $convocatoria->dias_restantes = $convocatoria->diasRestantes();
                $convocatoria->puede_postularse = $convocatoria->puedePostularse($user);
                return $convocatoria;
            });
        } else {
            // Otros usuarios solo ven convocatorias públicas
            $convocatorias = $convocatorias->where('estado', 'Abierta');
        }

        // return $convocatorias;


        return Inertia::render('Convocatorias/Index', [
            'convocatorias' => $convocatorias,
            'convocatorias_links' => $convocatorias_links,
            'user' => $user
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        if (!Auth::user()->can('crear-convocatorias')) {
            abort(403, 'No tienes permisos para crear convocatorias.');
        }

        return Inertia::render('Convocatorias/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::user()->can('crear-convocatorias')) {
            abort(403, 'No tienes permisos para crear convocatorias.');
        }

        // return $request;

        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'estado' => 'required|in:Abierta,Cerrada,Pendiente',
            'requisitos' => 'required|array|min:1',
            'requisitos.*.nombre' => 'required|string|max:255',
            'requisitos.*.descripcion' => 'required|string',
            'requisitos.*.tipo_archivo' => 'required|string|in:pdf,word,excel,image,any',
            'requisitos.*.obligatorio' => 'boolean'
        ]);

        $convocatoria = Convocatoria::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'estado' => $request->estado
        ]);
        
        // Crear requisitos
        if ($request->has('requisitos')) {
            foreach ($request->requisitos as $requisito) {
                $convocatoria->requisitos()->create([
                    'nombre' => $requisito['nombre'],
                    'descripcion' => $requisito['descripcion'],
                    'obligatorio' => $requisito['obligatorio'] ?? true,
                    'tipo_archivo' => $requisito['tipo_archivo'],
                ]);
            }
        }

        return redirect()->route('convocatorias.index')
            ->with('success', 'Convocatoria creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Convocatoria $convocatoria): Response
    {
        $user = Auth::user();
        
        // Verificar permisos
        if (!$user->hasRole(['Administrador', 'Lider Grupo'])) {
            abort(403, 'No tienes permisos para ver esta convocatoria.');
        }

        $convocatoria->load(['requisitos', 'postulaciones.usuario', 'postulaciones.archivos']);

        if ($user->hasRole('Lider Grupo')) {
            $convocatoria->mi_postulacion = $convocatoria->postulaciones->where('user_id', $user->id)->first();
            $convocatoria->puede_postularse = $convocatoria->puedePostularse($user);
            $convocatoria->dias_restantes = $convocatoria->diasRestantes();
            $convocatoria->esta_abierta = $convocatoria->estaAbierta();
        }

        return Inertia::render('Convocatorias/Show', [
            'convocatoria' => $convocatoria,
            'user' => $user
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Convocatoria $convocatoria): Response
    {
        if (!Auth::user()->can('editar-convocatorias')) {
            abort(403, 'No tienes permisos para editar convocatorias.');
        }

        $convocatoria->load(['requisitos']);
        $convocatoria->postulaciones_count = $convocatoria->postulaciones()->count();

        return Inertia::render('Convocatorias/Edit', [
            'convocatoria' => $convocatoria
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Convocatoria $convocatoria)
    {
        if (!Auth::user()->can('editar-convocatorias')) {
            abort(403, 'No tienes permisos para editar convocatorias.');
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio',
            'estado' => 'required|in:Abierta,Cerrada,Pendiente',
            'requisitos' => 'array',
            'requisitos.*.nombre' => 'required|string|max:255',
            'requisitos.*.descripcion' => 'required|string',
            'requisitos.*.tipo_archivo' => 'required|string|in:pdf,word,excel,image,any',
            'requisitos.*.obligatorio' => 'boolean'
        ]);

        $convocatoria->update([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'fecha_inicio' => $request->fecha_inicio,
            'fecha_fin' => $request->fecha_fin,
            'estado' => $request->estado
        ]);

        // Actualizar requisitos
        if ($request->has('requisitos')) {
            // Eliminar requisitos existentes
            $convocatoria->requisitos()->delete();
            
            // Crear nuevos requisitos
            foreach ($request->requisitos as $requisito) {
                $convocatoria->requisitos()->create([
                    'nombre' => $requisito['nombre'],
                    'descripcion' => $requisito['descripcion'],
                    'tipo_archivo' => $requisito['tipo_archivo'],
                    'obligatorio' => $requisito['obligatorio'] ?? true
                ]);
            }
        }

        return redirect()->route('convocatorias.show', $convocatoria)
            ->with('success', 'Convocatoria actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Convocatoria $convocatoria)
    {
        if (!Auth::user()->can('eliminar-convocatorias')) {
            abort(403, 'No tienes permisos para eliminar convocatorias.');
        }

        // Verificar que no haya postulaciones
        if ($convocatoria->postulaciones()->count() > 0) {
            return back()->with('error', 'No se puede eliminar una convocatoria que tiene postulaciones. Primero debes eliminar todas las postulaciones asociadas.');
        }

        // Verificar que los requisitos no estén ligados a archivos
        $requisitosConArchivos = $convocatoria->requisitos()
            ->whereHas('archivos', function($query) {
                $query->whereNotNull('id');
            })
            ->count();


        if ($requisitosConArchivos > 0) {
            return back()->with('error', 'No se puede eliminar una convocatoria que tiene requisitos con archivos asociados. Primero debes eliminar todos los archivos de las postulaciones.');
        }

        // Verificar que la convocatoria no esté en estado "Abierta" si tiene fecha futura
        if ($convocatoria->estado === 'Abierta' && $convocatoria->fecha_fin > now()) {
            return back()->with('error', 'No se puede eliminar una convocatoria que está abierta y tiene fechas futuras. Primero debes cerrarla o cambiar su estado.');
        }

        try {
            // Eliminar requisitos (cascade delete)
            $convocatoria->requisitos()->delete();

            // Eliminar la convocatoria
            $convocatoria->delete();

            return redirect()->route('convocatorias.index')
                ->with('success', 'Convocatoria eliminada exitosamente.');

        } catch (\Exception $e) {
            return back()->with('error', 'Error al eliminar la convocatoria. Por favor, inténtalo de nuevo.');
        }
    }

    /**
     * Mostrar postulaciones de una convocatoria
     */
    public function postulaciones(Convocatoria $convocatoria): Response
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole('Administrador');
        
        if ($isAdmin) {
            // Administrador ve todas las postulaciones
            if (!$user->can('ver-postulaciones')) {
                abort(403, 'No tienes permisos para ver postulaciones.');
            }
            
            $postulaciones = $convocatoria->postulaciones()
                ->with(['usuario.grupo_investigacion', 'archivos.requisitoConvocatoria'])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Usuario normal ve solo sus postulaciones
            $postulaciones = $convocatoria->postulaciones()
                ->where('user_id', $user->id)
                ->with(['usuario.grupo_investigacion', 'archivos.requisitoConvocatoria'])
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('Convocatorias/Postulaciones', [
            'convocatoria' => $convocatoria,
            'postulaciones' => $postulaciones,
            'isAdmin' => $isAdmin
        ]);
    }



    /**
     * Cambiar estado de una convocatoria
     */
    public function cambiarEstado(Request $request, Convocatoria $convocatoria)
    {
        if (!Auth::user()->can('editar-convocatorias')) {
            abort(403, 'No tienes permisos para editar convocatorias.');
        }

        $request->validate([
            'estado' => 'required|in:Abierta,Cerrada,Pendiente'
        ]);

        $convocatoria->update(['estado' => $request->estado]);

        return back()->with('success', 'Estado de la convocatoria actualizado.');
    }
}
