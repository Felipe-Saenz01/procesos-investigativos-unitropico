<?php

namespace App\Http\Controllers;

use App\Models\EntregaProducto;
use App\Models\ProductoInvestigativo;
use App\Models\EvidenciaSeccion;
use App\Models\ComparacionEvidencia;
use App\Models\ComparacionSeccion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use OpenAI\Laravel\Facades\OpenAI;
use Smalot\PdfParser\Parser;

class RevisionInteligenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Listar productos que tengan al menos 2 entregas de tipo evidencia
        $productos = ProductoInvestigativo::query()
            // Filtro: productos con al menos 2 entregas de tipo evidencia (compatible con Postgres)
            ->whereRaw(
                "(select count(*) from entrega_productos ep where ep.producto_investigativo_id = producto_investigativos.id and ep.tipo = ?) >= 2",
                ['evidencia']
            )
            // Traer conteo para orden y visualización
            ->withCount([
                'entregas as evidencias_count' => function ($q) {
                    $q->where('tipo', 'evidencia');
                },
            ])
            ->with(['subTipoProducto:id,nombre', 'usuarios:id,name'])
            ->orderByDesc('evidencias_count')
            ->paginate(12)
            ->withQueryString();


        return Inertia::render('RevisionInteligente/Index', [
            'productos' => $productos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        // Interpretar $id como ID de producto
        $producto = ProductoInvestigativo::with(['subTipoProducto:id,nombre', 'usuarios:id,name'])
            ->findOrFail($id);

        // Traer entregas de evidencia del producto con usuario y periodo
        $evidencias = $producto->entregas()
            ->where('tipo', 'evidencia')
            ->with(['usuario:id,name', 'periodo:id,nombre'])
            ->orderByDesc('created_at')
            ->get(['id', 'producto_investigativo_id', 'user_id', 'periodo_id', 'evidencia', 'created_at']);

        // Traer comparaciones existentes entre estas evidencias
        $evidenciaIds = $evidencias->pluck('id')->toArray();
        $comparacionesExistentes = ComparacionEvidencia::whereIn('evidencia_1_id', $evidenciaIds)
            ->orWhereIn('evidencia_2_id', $evidenciaIds)
            ->with([
                'evidencia1.usuario:id,name',
                'evidencia1.periodo:id,nombre',
                'evidencia2.usuario:id,name',
                'evidencia2.periodo:id,nombre'
            ])
            ->orderByDesc('created_at')
            ->get();


        return Inertia::render('RevisionInteligente/SeleccionarEntregas', [
            'producto' => $producto,
            'evidencias' => $evidencias,
            'comparaciones_existentes' => $comparacionesExistentes,
        ]);
    }

    /**
     * Comparar dos evidencias y mostrar su contenido extraído
     */
    public function comparar(Request $request, int $productoId)
    {
        $request->validate([
            'e1' => 'required|integer|exists:entrega_productos,id',
            'e2' => 'required|integer|exists:entrega_productos,id|different:e1',
        ]);

        $producto = ProductoInvestigativo::findOrFail($productoId);

        $e1 = EntregaProducto::with('usuario:id,name', 'periodo:id,nombre')->findOrFail($request->integer('e1'));
        $e2 = EntregaProducto::with('usuario:id,name', 'periodo:id,nombre')->findOrFail($request->integer('e2'));

        // Verificar que las evidencias pertenezcan al producto
        if ($e1->producto_investigativo_id !== $producto->id || $e2->producto_investigativo_id !== $producto->id) {
            abort(403, 'Las evidencias no pertenecen al producto.');
        }

        // 1. Asegurar que existan secciones para ambas evidencias
        $this->asegurarSeccionesExisten($e1);
        $this->asegurarSeccionesExisten($e2);

        // 2. Verificar si ya existe una comparación entre estas dos evidencias
        $comparacionExistente = ComparacionEvidencia::obtenerOCrear($e1->id, $e2->id);

        // Si ya existe una comparación, redirigir con alerta
        if ($comparacionExistente->wasRecentlyCreated === false) {
            return redirect()->route('modulo-inteligente.show', $productoId)
                ->with('error', 'Ya existe una comparación entre estas dos evidencias.');
        }

        // 3. Redirigir a la vista de comparación
        return redirect()->route('modulo-inteligente.comparacion.show', $comparacionExistente->id);
    }

    /**
     * Mostrar la vista de comparación con las secciones de ambas evidencias
     */
    public function mostrarComparacion(int $comparacionId)
    {
        $comparacion = ComparacionEvidencia::with([
            'evidencia1.usuario:id,name',
            'evidencia1.periodo:id,nombre',
            'evidencia1.secciones',
            'evidencia1.productoInvestigativo.subTipoProducto:id,nombre',
            'evidencia2.usuario:id,name', 
            'evidencia2.periodo:id,nombre',
            'evidencia2.secciones',
            'comparacionesSecciones.seccion1',
            'comparacionesSecciones.seccion2',
            'comparacionesSecciones.elementoProducto'
        ])->findOrFail($comparacionId);

        // Obtener información del producto (ambas evidencias pertenecen al mismo producto)
        $producto = $comparacion->evidencia1->productoInvestigativo;
        
        // Obtener elementos del producto para el select
        $elementosProducto = $producto->elementos()->get(['id', 'nombre']);

        return Inertia::render('RevisionInteligente/ComparacionShow', [
            'comparacion' => $comparacion,
            'producto' => [
                'id' => $producto->id,
                'titulo' => $producto->titulo,
                'sub_tipo_producto' => $producto->subTipoProducto,
            ],
            'evidencia1' => [
                'id' => $comparacion->evidencia1->id,
                'usuario' => $comparacion->evidencia1->usuario?->name,
                'periodo' => $comparacion->evidencia1->periodo?->nombre,
                'secciones' => $comparacion->evidencia1->secciones,
            ],
            'evidencia2' => [
                'id' => $comparacion->evidencia2->id,
                'usuario' => $comparacion->evidencia2->usuario?->name,
                'periodo' => $comparacion->evidencia2->periodo?->nombre,
                'secciones' => $comparacion->evidencia2->secciones,
            ],
            'comparaciones_secciones' => $comparacion->comparacionesSecciones,
            'elementos_producto' => $elementosProducto,
        ]);
    }

    /**
     * Comparar dos secciones específicas usando OpenAI
     */
    public function compararSecciones(Request $request, int $comparacionId)
    {
        $request->validate([
            'seccion1_id' => 'required|integer|exists:evidencia_secciones,id',
            'seccion2_id' => 'required|integer|exists:evidencia_secciones,id',
            'elemento_producto_id' => 'required|integer|exists:elementos_productos,id',
        ]);

        $comparacion = ComparacionEvidencia::findOrFail($comparacionId);
        $seccion1 = EvidenciaSeccion::findOrFail($request->seccion1_id);
        $seccion2 = EvidenciaSeccion::findOrFail($request->seccion2_id);

        // Verificar que las secciones pertenezcan a las evidencias de esta comparación
        $evidenciaIds = [$comparacion->evidencia_1_id, $comparacion->evidencia_2_id];
        if (!in_array($seccion1->entrega_producto_id, $evidenciaIds) || 
            !in_array($seccion2->entrega_producto_id, $evidenciaIds)) {
            abort(403, 'Las secciones no pertenecen a esta comparación.');
        }

        // Verificar si ya existe una comparación entre estas secciones
        $comparacionExistente = ComparacionSeccion::obtenerOCrear(
            $comparacionId, 
            $seccion1->id, 
            $seccion2->id, 
            $request->elemento_producto_id
        );

        // Si ya existe y tiene resultados, devolver los existentes
        if ($comparacionExistente->wasRecentlyCreated === false && 
            $comparacionExistente->grado_similitud !== null && 
            $comparacionExistente->resultado_similitud !== null) {
            return redirect()->route('modulo-inteligente.comparacion.show', $comparacionId)
                ->with('info', 'Esta comparación ya existe y ha sido realizada anteriormente');
        }

        try {
            // Calcular similitud usando embeddings
            $embedding1 = OpenAI::embeddings()->create([
                'model' => 'text-embedding-3-small',
                'input' => $seccion1->contenido,
                'encoding_format' => 'float',
            ]);
            
            $embedding2 = OpenAI::embeddings()->create([
                'model' => 'text-embedding-3-small',
                'input' => $seccion2->contenido,
                'encoding_format' => 'float',
            ]);

            $cosineSimilarity = $this->cosineSimilarity(
                $embedding1->embeddings[0]->embedding, 
                $embedding2->embeddings[0]->embedding
            );
            $gradoSimilitud = round($cosineSimilarity * 100, 2);

            // Obtener análisis usando chat completion con contexto de progreso
            $progresoE1 = $comparacion->evidencia1->progreso_planeacion ?? 0;
            $progresoE2 = $comparacion->evidencia2->progreso_planeacion ?? 0;
            
            $prompt = "
            Analiza estas dos secciones de evidencias de investigación y evalúa si el progreso reportado se cumple realmente.

            CONTEXTO DE PROGRESO:
            - Evidencia 1: {$progresoE1}% de progreso reportado
            - Evidencia 2: {$progresoE2}% de progreso reportado

            SECCIONES A COMPARAR:
            Sección 1: {$seccion1->titulo}
            Contenido: {$seccion1->contenido}

            Sección 2: {$seccion2->titulo}
            Contenido: {$seccion2->contenido}

            Responde en máximo de 350 caracteres, evaluando:
            Si es coherente el progreso reportado de la seccion 2 con el contenido de la seccion 1
            y cuales son las principales diferencias o avances entre las secciones
            
            ";

            $messages = [
                [
                    'role' => 'system',
                    'content' => 'Eres un evaluador de progreso académico. Proporciona análisis concisos y precisos sobre el cumplimiento de objetivos de investigación.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ];

            $result = OpenAI::chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => $messages,
                'max_tokens' => 200,
                'temperature' => 0.3,
            ]);

            $analisis = $result->choices[0]->message->content ?? 'No se pudo generar el análisis.';

            // Guardar los resultados
            $comparacionExistente->update([
                'grado_similitud' => $gradoSimilitud,
                'resultado_similitud' => $analisis,
            ]);

            return redirect()->route('modulo-inteligente.comparacion.show', $comparacionId)
                ->with('success', 'Comparación de secciones realizada exitosamente');

        } catch (\Throwable $e) {
            return redirect()->route('modulo-inteligente.comparacion.show', $comparacionId)
                ->with('error', 'Error al realizar la comparación: ' . $e->getMessage());
        }
    }

    /**
     * Recalcular secciones de las evidencias de una comparación
     */
    public function recalcularSecciones(Request $request, int $comparacionId)
    {
        $request->validate([
            'confirmar' => 'required|boolean|accepted',
        ]);

        $comparacion = ComparacionEvidencia::with(['evidencia1', 'evidencia2'])->findOrFail($comparacionId);

        try {
            DB::beginTransaction();

            // Eliminar todas las comparaciones de secciones existentes
            ComparacionSeccion::where('comparacion_evidencia_id', $comparacionId)->delete();

            // Eliminar todas las secciones de ambas evidencias
            EvidenciaSeccion::where('entrega_producto_id', $comparacion->evidencia_1_id)->delete();
            EvidenciaSeccion::where('entrega_producto_id', $comparacion->evidencia_2_id)->delete();

            // Regenerar secciones para ambas evidencias
            $this->asegurarSeccionesExisten($comparacion->evidencia1);
            $this->asegurarSeccionesExisten($comparacion->evidencia2);

            DB::commit();

            return redirect()->route('modulo-inteligente.comparacion.show', $comparacionId)
                ->with('success', 'Secciones recalculadas exitosamente');

        } catch (\Throwable $e) {
            DB::rollBack();
            return redirect()->route('modulo-inteligente.comparacion.show', $comparacionId)
                ->with('error', 'Error al recalcular secciones: ' . $e->getMessage());
        }
    }

    private function extraerTextoPdf(string $rutaAbsoluta): ?string
    {
        if (!file_exists($rutaAbsoluta)) {
            return null;
        }
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($rutaAbsoluta);
            return trim($pdf->getText());
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function obtenerSeccionesTexto(string $texto): array
    {
        // Normalizar saltos de línea
        $texto = preg_replace('/\r\n|\r|\n/', "\n", $texto);
        
        // Patrón para identificar secciones (similar al anterior pero mejorado)
        $patron = '/(?=\n\d+\.|\n[A-ZÁÉÍÓÚÑ ]{3,}\n)/';
        $seccionesBrutas = preg_split($patron, $texto, -1, PREG_SPLIT_NO_EMPTY);

        $secciones = [];
        foreach ($seccionesBrutas as $index => $textoSeccion) {
            $textoSeccion = preg_replace("/^\s+/", '', $textoSeccion);
            $textoSeccion = preg_replace("/\n{2,}/", "\n", $textoSeccion);
            $textoSeccion = preg_replace("/([a-záéíóúñ])-\n([a-záéíóúñ])/i", "$1$2", $textoSeccion);

            // Extraer título del primer fragmento (antes del primer salto de línea)
            $lineas = explode("\n", trim($textoSeccion));
            $titulo = '';
            
            if (!empty($lineas)) {
                $primeraLinea = trim($lineas[0]);
                
                // Si la primera línea parece un título (empieza con número o mayúsculas)
                if (preg_match('/^\d+\./', $primeraLinea) || preg_match('/^[A-ZÁÉÍÓÚÑ]/', $primeraLinea)) {
                    // Limpiar el título
                    $titulo = preg_replace('/^\d+\.\s*/', '', $primeraLinea); // Quitar numeración
                    $titulo = trim($titulo);
                    
                    // Si el título está vacío después de limpiar, usar la línea original
                    if (empty($titulo)) {
                        $titulo = $primeraLinea;
                    }
                    
                    // Limitar el título a 200 caracteres para evitar el error de base de datos
                    $titulo = substr($titulo, 0, 200);
                }
            }
            
            // Si no se encontró un título válido, usar fallback
            if (empty($titulo)) {
                $titulo = "Sección " . ($index + 1);
            }

            $secciones[] = [
                'titulo' => $titulo,
                'texto' => trim($textoSeccion),
            ];
        }

        return $secciones;
    }

    private function cosineSimilarity(array $embedding1, array $embedding2): float
    {
        $dot = 0.0;
        $magA = 0.0;
        $magB = 0.0;
        $len = min(count($embedding1), count($embedding2));
        for ($i = 0; $i < $len; $i++) {
            $dot += $embedding1[$i] * $embedding2[$i];
            $magA += $embedding1[$i] ** 2;
            $magB += $embedding2[$i] ** 2;
        }
        return ($magA && $magB) ? $dot / (sqrt($magA) * sqrt($magB)) : 0.0;
    }

    /**
     * Extraer y guardar secciones de una evidencia si no existen
     */
    private function asegurarSeccionesExisten(EntregaProducto $evidencia): void
    {
        // Verificar si ya existen secciones para esta evidencia
        if ($evidencia->secciones()->exists()) {
            return; // Ya existen secciones, no hacer nada
        }

        // Si no hay archivo de evidencia, no se pueden extraer secciones
        if (!$evidencia->evidencia) {
            return;
        }

        // Extraer texto del PDF
        $rutaArchivo = storage_path('app/public/' . $evidencia->evidencia);
        $texto = $this->extraerTextoPdf($rutaArchivo);

        if (!$texto) {
            return; // No se pudo extraer texto
        }

        // Obtener secciones del texto
        $secciones = $this->obtenerSeccionesTexto($texto);

        // Guardar secciones en la base de datos
        foreach ($secciones as $index => $seccion) {
            EvidenciaSeccion::create([
                'entrega_producto_id' => $evidencia->id,
                'titulo' => $seccion['titulo'] ?: "Sección " . ($index + 1),
                'contenido' => $seccion['texto'],
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(int $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        //
    }
}
