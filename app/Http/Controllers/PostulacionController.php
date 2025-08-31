<?php

namespace App\Http\Controllers;

use App\Models\Convocatoria;
use App\Models\Postulacion;
use App\Models\ArchivoPostulacion;
use App\Models\RequisitosConvocatoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostulacionController extends Controller
{
    /**
     * Mostrar formulario de postulación
     */
    public function create(Convocatoria $convocatoria): Response
    {
        $user = Auth::user();

        // Verificar que el usuario sea líder de grupo
        if (!$user->hasRole('Lider Grupo')) {
            abort(403, 'Solo los líderes de grupo pueden postularse.');
        }

        // Verificar que la convocatoria esté abierta
        if (!$convocatoria->estaAbierta()) {
            abort(403, 'Esta convocatoria no está abierta para postulaciones.');
        }

        // Verificar que no se haya postulado ya
        if ($convocatoria->postulaciones()->where('user_id', $user->id)->exists()) {
            abort(403, 'Ya te has postulado a esta convocatoria.');
        }

        $convocatoria->load('requisitos');
        $convocatoria->dias_restantes = $convocatoria->diasRestantes();
        $convocatoria->esta_abierta = $convocatoria->estaAbierta();

        return Inertia::render('Convocatorias/Postular', [
            'convocatoria' => $convocatoria,
            'user' => $user
        ]);
    }

    /**
     * Crear postulación y subir archivos
     */
    public function store(Request $request, Convocatoria $convocatoria)
    {
        $user = Auth::user();

        // Verificar permisos
        if (!$user->hasRole('Lider Grupo')) {
            abort(403, 'Solo los líderes de grupo pueden postularse.');
        }

        if (!$convocatoria->estaAbierta()) {
            abort(403, 'Esta convocatoria no está abierta para postulaciones.');
        }

        if ($convocatoria->postulaciones()->where('user_id', $user->id)->exists()) {
            abort(403, 'Ya te has postulado a esta convocatoria.');
        }

        // Validar archivos
        $requisitos = $convocatoria->requisitos;
        $rules = [];

        foreach ($requisitos as $requisito) {
            // Convertir tipos agrupados a extensiones específicas para validación
            $tiposArchivo = $this->convertirTiposArchivo($requisito->tipo_archivo);

            if ($requisito->obligatorio) {
                $rules["archivos.{$requisito->id}"] = "required|file|mimes:{$tiposArchivo}|max:10240"; // 10MB max
            } else {
                $rules["archivos.{$requisito->id}"] = "nullable|file|mimes:{$tiposArchivo}|max:10240";
            }
        }

        $request->validate($rules, [
            'archivos.*.required' => 'Este archivo es obligatorio.',
            'archivos.*.file' => 'Debe ser un archivo válido.',
            'archivos.*.mimes' => 'El tipo de archivo no es válido.',
            'archivos.*.max' => 'El archivo no puede ser mayor a 10MB.'
        ]);

        try {
            // Crear la postulación
            $postulacion = Postulacion::create([
                'convocatoria_id' => $convocatoria->id,
                'user_id' => $user->id,
                'estado' => 'Pendiente'
            ]);

            // Crear la carpeta para los archivos
            $carpetaArchivos = $postulacion->carpeta_archivos;
            if (!Storage::disk('public')->exists($carpetaArchivos)) {
                Storage::disk('public')->makeDirectory($carpetaArchivos);
            }

            // Procesar y guardar archivos
            foreach ($requisitos as $requisito) {
                if ($request->hasFile("archivos.{$requisito->id}")) {
                    $archivo = $request->file("archivos.{$requisito->id}");

                    // Generar nombre único para el archivo
                    $extension = $archivo->getClientOriginalExtension();
                    $nombreArchivo = Str::uuid() . '.' . $extension;
                    $rutaArchivo = $carpetaArchivos . '/' . $nombreArchivo;

                    // Guardar archivo en storage
                    Storage::disk('public')->put($rutaArchivo, file_get_contents($archivo));

                    // Crear registro en base de datos
                    ArchivoPostulacion::create([
                        'postulacion_id' => $postulacion->id,
                        'requisito_convocatoria_id' => $requisito->id,
                        'nombre_original' => $archivo->getClientOriginalName(),
                        'nombre_archivo' => $nombreArchivo,
                        'ruta_archivo' => $rutaArchivo,
                        'tipo_mime' => $archivo->getMimeType(),
                        'tamaño_bytes' => $archivo->getSize(),
                        'observaciones' => $request->input("observaciones.{$requisito->id}")
                    ]);
                }
            }

            return redirect()->route('convocatorias.show', $convocatoria)
                ->with('success', 'Postulación enviada exitosamente.');
        } catch (\Exception $e) {
            // Si algo falla, eliminar la postulación y archivos
            if (isset($postulacion)) {
                $postulacion->delete();
                if (Storage::disk('public')->exists($carpetaArchivos)) {
                    Storage::disk('public')->deleteDirectory($carpetaArchivos);
                }
            }

            return back()->with('error', 'Error al enviar la postulación. Inténtalo de nuevo.');
        }
    }

    /**
     * Mostrar postulación del usuario
     */
    public function show(Postulacion $postulacion)
    {
        $user = Auth::user();

        // Verificar permisos
        if ($postulacion->user_id !== $user->id && !$user->hasRole('Administrador')) {
            abort(403, 'No tienes permisos para ver esta postulación.');
        }

        $postulacion->load(['convocatoria.requisitos', 'archivos.requisitoConvocatoria']);
        $postulacion->usuario = $postulacion->usuario;
        $postulacion->usuario->grupo_investigacion = $postulacion->usuario->grupo_investigacion;

        // return $postulacion;

        return Inertia::render('Postulaciones/Show', [
            'postulacion' => $postulacion,
            'user' => $user
        ]);
    }

    /**
     * Descargar archivo
     */
    public function descargarArchivo(Postulacion $postulacion, $archivoId)
    {
        $user = Auth::user();

        // Buscar el archivo
        $archivo = ArchivoPostulacion::findOrFail($archivoId);

        // Verificar que el archivo pertenezca a la postulación
        if ($archivo->postulacion_id !== $postulacion->id) {
            abort(404, 'Archivo no encontrado en esta postulación.');
        }

        // Verificar permisos
        if ($archivo->postulacion->user_id !== $user->id && !$user->hasRole('Administrador')) {
            abort(403, 'No tienes permisos para descargar este archivo.');
        }

        if (!Storage::disk('public')->exists($archivo->ruta_archivo)) {
            abort(404, 'Archivo no encontrado en el servidor.');
        }

        return response()->download(
            Storage::disk('public')->path($archivo->ruta_archivo),
            $archivo->nombre_original
        );
    }

    /**
     * Actualizar observaciones de un archivo
     */
    public function actualizarObservaciones(Request $request, Postulacion $postulacion, $archivoId)
    {
        $user = Auth::user();

        // Verificar permisos - solo administradores pueden actualizar observaciones
        if (!$user->hasRole('Administrador')) {
            abort(403, 'No tienes permisos para actualizar observaciones.');
        }

        // Buscar el archivo
        $archivo = ArchivoPostulacion::findOrFail($archivoId);

        // Verificar que el archivo pertenece a la postulación
        if ($archivo->postulacion_id !== $postulacion->id) {
            abort(404, 'Archivo no encontrado en esta postulación.');
        }

        $request->validate([
            'observacion' => 'nullable|string|max:1000',
        ]);

        $archivo->update([
            'observaciones' => $request->input('observacion')
        ]);

        return back()->with('success', 'Observaciones actualizadas correctamente.');
    }

    /**
     * Eliminar postulación (solo si está pendiente)
     */
    public function destroy(Postulacion $postulacion)
    {
        $user = Auth::user();

        // Verificar permisos
        if ($postulacion->user_id !== $user->id && !$user->hasRole('Administrador')) {
            abort(403, 'No tienes permisos para eliminar esta postulación.');
        }

        // Solo se puede eliminar si está pendiente
        if ($postulacion->estado !== 'Pendiente') {
            return back()->with('error', 'Solo se pueden eliminar postulaciones pendientes.');
        }

        try {
            // Eliminar archivos físicos
            $carpetaArchivos = $postulacion->carpeta_archivos;
            if (Storage::disk('public')->exists($carpetaArchivos)) {
                Storage::disk('public')->deleteDirectory($carpetaArchivos);
            }

            // Eliminar postulación (los archivos se eliminan automáticamente por el hook)
            $postulacion->delete();

            return redirect()->route('convocatorias.index')
                ->with('success', 'Postulación eliminada exitosamente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al eliminar la postulación.');
        }
    }


    private function convertirTiposArchivo($tipos)
    {
        $tiposArray = explode(',', $tipos);
        $extensiones = [];

        foreach ($tiposArray as $tipo) {
            $tipo = trim($tipo);
            switch ($tipo) {
                case 'word':
                    $extensiones[] = 'doc,docx';
                    break;
                case 'excel':
                    $extensiones[] = 'xls,xlsx';
                    break;
                case 'image':
                    $extensiones[] = 'jpg,jpeg,png,gif,bmp';
                    break;
                case 'any':
                    break;
                default:
                    $extensiones[] = $tipo;
                    break;
            }
        }

        return implode(',', $extensiones);
    }
}
