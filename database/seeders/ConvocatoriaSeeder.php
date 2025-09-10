<?php

namespace Database\Seeders;

use App\Models\Convocatoria;
use App\Models\RequisitosConvocatoria;
use Illuminate\Database\Seeder;

class ConvocatoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Convocatoria 1: Fomento a la Investigación
        $convocatoria1 = Convocatoria::create([
            'nombre' => 'Fomento a la Investigación 2025',
            'descripcion' => 'Convocatoria para el fomento de proyectos de investigación en áreas estratégicas de la universidad.',
            'fecha_inicio' => now(),
            'fecha_fin' => now()->addMonths(3),
            'estado' => 'Abierta'
        ]);

        $convocatoria1->requisitos()->createMany([
            [
                'nombre' => 'Proyecto de Investigación',
                'descripcion' => 'Documento que describa el proyecto de investigación a desarrollar',
                'tipo_archivo' => 'pdf',
                'obligatorio' => true
            ],
            [
                'nombre' => 'CV del Investigador',
                'descripcion' => 'Currículum vitae actualizado del investigador principal',
                'tipo_archivo' => 'pdf',
                'obligatorio' => true
            ],
            [
                'nombre' => 'Cronograma de Actividades',
                'descripcion' => 'Cronograma detallado de las actividades del proyecto',
                'tipo_archivo' => 'pdf',
                'obligatorio' => true
            ],
            [
                'nombre' => 'Presupuesto Detallado',
                'descripcion' => 'Presupuesto desglosado del proyecto',
                'tipo_archivo' => 'pdf',
                'obligatorio' => true
            ],
            [
                'nombre' => 'Carta de Compromiso',
                'descripcion' => 'Carta de compromiso del grupo de investigación',
                'tipo_archivo' => 'pdf',
                'obligatorio' => false
            ]
        ]);

        // Convocatoria 2: Innovación Tecnológica
        $convocatoria2 = Convocatoria::create([
            'nombre' => 'Innovación Tecnológica y Desarrollo Sostenible',
            'descripcion' => 'Convocatoria para proyectos de innovación tecnológica que promuevan el desarrollo sostenible.',
            'fecha_inicio' => now()->addDays(30),
            'fecha_fin' => now()->addMonths(4),
            'estado' => 'Pendiente'
        ]);

        $convocatoria2->requisitos()->createMany([
            [
                'nombre' => 'Propuesta de Innovación',
                'descripcion' => 'Documento que describa la propuesta de innovación tecnológica',
                'tipo_archivo' => 'pdf',
                'obligatorio' => true
            ],
            [
                'nombre' => 'Análisis de Impacto Ambiental',
                'descripcion' => 'Análisis del impacto ambiental del proyecto',
                'tipo_archivo' => 'pdf',
                'obligatorio' => true
            ],
            [
                'nombre' => 'Plan de Comercialización',
                'descripcion' => 'Plan de comercialización de la innovación',
                'tipo_archivo' => 'pdf',
                'obligatorio' => false
            ]
        ]);

        // Convocatoria 3: Convocatoria Cerrada
        $convocatoria3 = Convocatoria::create([
            'nombre' => 'Investigación en Ciencias Sociales 2024',
            'descripcion' => 'Convocatoria para proyectos de investigación en ciencias sociales y humanidades.',
            'fecha_inicio' => now()->subMonths(6),
            'fecha_fin' => now()->subMonths(3),
            'estado' => 'Cerrada'
        ]);

        $convocatoria3->requisitos()->createMany([
            [
                'nombre' => 'Proyecto de Investigación',
                'descripcion' => 'Documento que describa el proyecto de investigación en ciencias sociales',
                'tipo_archivo' => 'pdf',
                'obligatorio' => true
            ],
            [
                'nombre' => 'Marco Teórico',
                'descripcion' => 'Marco teórico de la investigación',
                'tipo_archivo' => 'pdf',
                'obligatorio' => true
            ],
            [
                'nombre' => 'Metodología',
                'descripcion' => 'Documento que describa la metodología de la investigación',
                'tipo_archivo' => 'pdf',
                'obligatorio' => true
            ]
        ]);
    }
}
