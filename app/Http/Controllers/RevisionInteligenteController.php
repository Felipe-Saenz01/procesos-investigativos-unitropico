<?php

namespace App\Http\Controllers;

use App\Models\EntregaProducto;
use App\Models\ProductoInvestigativo;
use Illuminate\Http\Request;
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

        return Inertia::render('RevisionInteligente/SeleccionarEntregas', [
            'producto' => $producto,
            'evidencias' => $evidencias,
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


        if ($e1->producto_investigativo_id !== $producto->id || $e2->producto_investigativo_id !== $producto->id) {
            abort(403, 'Las evidencias no pertenecen al producto.');
        }

        $texto1 = null;
        $texto2 = null;
        if ($e1->evidencia) {
            $texto1 = $this->extraerTextoPdf(storage_path('app/public/' . $e1->evidencia));
        }
        if ($e2->evidencia) {
            $texto2 = $this->extraerTextoPdf(storage_path('app/public/' . $e2->evidencia));
        }


        $iaRespuesta = null;
        if ($texto1 && $texto2) {
            try {
                $prompt = "
                Compara los siguientes dos textos que provienen de documentos de evidencia de investigación.
                Determina el porcentaje de similitud y explica brevemente los principales cambios o avances.
                Devuelve la respuesta en formato JSON con las claves:
                - 'similitud' (número de porcentaje entre 0 y 100)
                - 'analisis' (texto breve explicando los cambios)

                Texto anterior:
                .$texto1.

                Texto actual:
                .$texto2.
                ";

                $messages = [
                    [
                        'role' => 'system',
                        'content' => 'Eres un asistente que analiza y compara documentos académicos.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ];

                // $client = OpenAI::client(env('OPENAI_API_KEY'));
        		$result = OpenAI::chat()->create([
                    'model' => 'gpt-5-nano',
                    'messages' => $messages,
                ]);
                $iaRespuesta = $result->choices[0]->message->content ?? null;
            } catch (\Throwable $e) {
                $iaRespuesta = null;
            }
        }
        $similitud = null;
        try {
            $embedding1 = OpenAI::embeddings()->create([
                'model' => 'text-embedding-3-small',
                'input' => $texto1,
                'encoding_format' => 'float',
            ]);
            $embedding2 = OpenAI::embeddings()->create([
                'model' => 'text-embedding-3-small',
                'input' => $texto2,
                'encoding_format' => 'float',
            ]);
            $cosineSimilarity = $this->cosineSimilarity($embedding1->embeddings[0]->embedding, $embedding2->embeddings[0]->embedding);
            $similitud = round($cosineSimilarity * 100,2);
        } catch (\Throwable $e) {
            $embedding1 = null;
            $embedding2 = null;
        }


        return Inertia::render('RevisionInteligente/Comparar', [
            'producto' => $producto->only(['id', 'titulo']),
            'e1' => [
                'id' => $e1->id,
                'usuario' => $e1->usuario?->name,
                'periodo' => $e1->periodo?->nombre,
                'texto' => $texto1,
            ],
            'e2' => [
                'id' => $e2->id,
                'usuario' => $e2->usuario?->name,
                'periodo' => $e2->periodo?->nombre,
                'texto' => $texto2,
            ],
            'ia' => json_decode($iaRespuesta),
            'similitud' => $similitud,
        ]);
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
