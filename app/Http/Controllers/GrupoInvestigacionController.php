<?php

namespace App\Http\Controllers;

use App\Models\GrupoInvestigacion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class GrupoInvestigacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        if ($user->hasRole('Lider Grupo') || $user->hasRole('Investigador')) {
            if ($user->grupo_investigacion_id) {
                return to_route('grupo-investigacion.show', $user->grupo_investigacion_id);
            }
            return to_route('dashboard')->with('error', 'No perteneces a un grupo de investigación.');
        }

        $gruposInvestigacion = GrupoInvestigacion::with(['usuarios' => function($query) {
            $query->select('id', 'name', 'email', 'tipo', 'grupo_investigacion_id');
        }])->orderBy('created_at', 'desc')->get();

        return Inertia::render('GrupoInvestigacion/Index', [
            'gruposInvestigacion' => $gruposInvestigacion,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('GrupoInvestigacion/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'correo' => 'required|email|unique:grupo_investigacions,correo',
            'descripcion' => 'nullable|string',
            'objetivos' => 'nullable|string',
            'vision' => 'nullable|string',
            'mision' => 'nullable|string',
            'plan_trabajo' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:10240',
        ], [
            'nombre.required' => 'El nombre del grupo es requerido.',
            'correo.required' => 'El correo del grupo es requerido.',
            'correo.email' => 'El correo debe tener un formato válido.',
            'correo.unique' => 'Ya existe un grupo con este correo.',
            'plan_trabajo.mimes' => 'El plan de trabajo debe ser un archivo PDF, Word o Excel.',
            'plan_trabajo.max' => 'El plan de trabajo no debe superar los 10MB.',
        ]);

        $rutaPlan = null;
        $nombreArchivo = null;
        
        if ($request->hasFile('plan_trabajo')) {
            $archivo = $request->file('plan_trabajo');
            $nombreArchivo = $archivo->getClientOriginalName();
            $rutaPlan = $archivo->store('grupos/temp', 'public');
        }

        $grupoInvestigacion = GrupoInvestigacion::create([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
            'descripcion' => $request->descripcion,
            'objetivos' => $request->objetivos,
            'vision' => $request->vision,
            'mision' => $request->mision,
            'ruta_plan_trabajo' => $rutaPlan,
            'nombre_archivo_plan_trabajo' => $nombreArchivo,
        ]);

        // Si se subió un archivo, moverlo a la carpeta específica del grupo
        if ($rutaPlan) {
            $nuevaRuta = "grupos/{$grupoInvestigacion->id}/plan_trabajo." . pathinfo($nombreArchivo, PATHINFO_EXTENSION);
            $rutaCompleta = Storage::disk('public')->move($rutaPlan, $nuevaRuta);
            
            // Actualizar la ruta en la base de datos
            $grupoInvestigacion->update(['ruta_plan_trabajo' => $nuevaRuta]);
        }

        return to_route('grupo-investigacion.index')->with('success', 'Grupo de investigación creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(GrupoInvestigacion $grupoInvestigacion)
    {
        return Inertia::render('GrupoInvestigacion/Show', [
            'grupoInvestigacion' => $grupoInvestigacion->load(['usuarios', 'proyectos']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(GrupoInvestigacion $grupoInvestigacion)
    {
        return Inertia::render('GrupoInvestigacion/Edit', [
            'grupoInvestigacion' => $grupoInvestigacion,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GrupoInvestigacion $grupoInvestigacion)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'correo' => 'required|email|unique:grupo_investigacions,correo,' . $grupoInvestigacion->id,
            'descripcion' => 'nullable|string',
            'objetivos' => 'nullable|string',
            'vision' => 'nullable|string',
            'mision' => 'nullable|string',
            'plan_trabajo' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx|max:10240',
        ], [
            'nombre.required' => 'El nombre del grupo es requerido.',
            'correo.required' => 'El correo del grupo es requerido.',
            'correo.email' => 'El correo debe tener un formato válido.',
            'correo.unique' => 'Ya existe un grupo con este correo.',
            'plan_trabajo.mimes' => 'El plan de trabajo debe ser un archivo PDF, Word o Excel.',
            'plan_trabajo.max' => 'El plan de trabajo no debe superar los 10MB.',
        ]);

        $rutaPlan = $grupoInvestigacion->ruta_plan_trabajo;
        $nombreArchivo = $grupoInvestigacion->nombre_archivo_plan_trabajo;
        
        // Si se está subiendo un nuevo archivo
        if ($request->hasFile('plan_trabajo')) {
            // Eliminar el archivo anterior si existe
            if ($grupoInvestigacion->ruta_plan_trabajo && Storage::disk('public')->exists($grupoInvestigacion->ruta_plan_trabajo)) {
                Storage::disk('public')->delete($grupoInvestigacion->ruta_plan_trabajo);
            }
            
            // Guardar el nuevo archivo
            $archivo = $request->file('plan_trabajo');
            $nombreArchivo = $archivo->getClientOriginalName();
            $extension = pathinfo($nombreArchivo, PATHINFO_EXTENSION);
            $rutaPlan = $archivo->storeAs("grupos/{$grupoInvestigacion->id}", "plan_trabajo.{$extension}", 'public');
        }

        $grupoInvestigacion->update([
            'nombre' => $request->nombre,
            'correo' => $request->correo,
            'descripcion' => $request->descripcion,
            'objetivos' => $request->objetivos,
            'vision' => $request->vision,
            'mision' => $request->mision,
            'ruta_plan_trabajo' => $rutaPlan,
            'nombre_archivo_plan_trabajo' => $nombreArchivo,
        ]);

        return to_route('grupo-investigacion.index')->with('success', 'Grupo de investigación actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GrupoInvestigacion $grupoInvestigacion)
    {
        // Verificar si el grupo tiene usuarios asociados
        if ($grupoInvestigacion->usuarios()->count() > 0) {
            return to_route('grupo-investigacion.index')->with('error', 'No se puede eliminar el grupo porque tiene investigadores asociados.');
        }

        // Verificar si el grupo tiene proyectos asociados
        if ($grupoInvestigacion->proyectos()->count() > 0) {
            return to_route('grupo-investigacion.index')->with('error', 'No se puede eliminar el grupo porque tiene proyectos asociados.');
        }

        // Eliminar toda la carpeta del grupo si existe
        $carpetaGrupo = "grupos/{$grupoInvestigacion->id}";
        if (Storage::disk('public')->exists($carpetaGrupo)) {
            Storage::disk('public')->deleteDirectory($carpetaGrupo);
        }

        $grupoInvestigacion->delete();
        return to_route('grupo-investigacion.index')->with('success', 'Grupo de investigación eliminado exitosamente.');
    }

    public function descargarPlanTrabajo(GrupoInvestigacion $grupoInvestigacion)
    {
        if (!$grupoInvestigacion->ruta_plan_trabajo) {
            return back()->with('error', 'No hay un plan de trabajo disponible para descargar.');
        }

        if (!Storage::disk('public')->exists($grupoInvestigacion->ruta_plan_trabajo)) {
            return back()->with('error', 'El archivo del plan de trabajo no se encuentra.');
        }

        $nombreArchivo = $grupoInvestigacion->nombre_archivo_plan_trabajo ?? 'plan_trabajo.pdf';
        return response()->download(Storage::disk('public')->path($grupoInvestigacion->ruta_plan_trabajo), $nombreArchivo);
    }
}
