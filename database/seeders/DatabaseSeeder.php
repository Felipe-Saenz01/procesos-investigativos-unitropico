<?php

namespace Database\Seeders;

use App\Models\SubTipoProducto;
use App\Models\TipoContrato;
use App\Models\TipoProducto;
use App\Models\ActividadesInvestigacion;
use App\Models\EscalafonProfesoral;
use App\Models\User;
use Spatie\Permission\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        $actividadesInvestigacion = [
            [
                'nombre' => 'Consolidación de Productos de Investigación',
                'horas_maximas' => 8,
                'tipos_productos' => [
                    [
                        'nombre' => 'Generación de Nuevo Conocimiento',
                        'subtipos' => [
                            'Artículos de investigación A1, A2, B y C',
                            'Artículos de investigación D',
                            'Notas científicas',
                            'Libros resultados de investigación',
                            'Capítulos en libro resultado de investigación',
                            'Libros de Formación Q1',
                            'Productos tecnológicos patentados o en proceso de solicitud de patente',
                            'Variedades vegetales, nuevas razas animales y poblaciones mejoradas de razas pecuarias',
                            'Productos resultados de la creación o investigación-creación',
                        ],
                    ],
                    [
                        'nombre' => 'Desarrollo Tecnológico e Innovación',
                        'subtipos' => [
                            'Productos tecnológicos certificados o validados',
                            'Productos empresariales',
                            'Regulaciones, normas, reglamentos o legislaciones',
                            'Conceptos técnicos',
                            'Registros de Acuerdos de licencia para explotación de obras de Investigación + Creación en Artes, Arquitectura y Diseño protegidas por derechos de autor',
                        ],
                    ],
                    [
                        'nombre' => 'Apropiación Social del Conocimiento',
                        'subtipos' => [
                            'Procesos de Apropiación Social del Conocimiento',
                            'Circulación de conocimiento especializado',
                            'Divulgación Pública de la CTeI',
                            'Producción Bibliográfica',
                        ],
                    ],
                    [
                        'nombre' => 'Formación de Recurso Humano para CTel',
                        'subtipos' => [
                            'Direcciones de Tesis de doctorado',
                            'Direcciones de Trabajo de grado de maestría',
                            'Direcciones de Trabajo de pregrado',
                            'Proyectos de Investigación y Desarrollo, Investigación - Creación, e Investigación, Desarrollo e Innovación (ID+I)',
                            'Proyectos de extensión y de responsabilidad social en CTel',
                            'Apoyos a la creación de programas y cursos de formación de investigadores',
                            'Acompañamientos y asesorías de línea temática del Programa Ondas',
                        ],
                    ],
                ],
            ],
            [
                'nombre' => 'Formulación-gestión de proyectos de investigación',
                'horas_maximas' => 2,
                'tipos_productos' => [
                    [
                        'nombre' => 'Formulación-gestión de proyectos de investigación',
                        'subtipos' => [
                            'Formulación-gestión de proyectos de investigación',
                        ],
                    ],
                ],
            ],
            [
                'nombre' => 'Dirección de centros de investigación, desarrollo tecnológico o innovación',
                'horas_maximas' => 4,
                'tipos_productos' => [
                    [
                        'nombre' => 'Dirección de centros de investigación, desarrollo tecnológico o innovación',
                        'subtipos' => [
                            'Dirección de centros de investigación, desarrollo tecnológico o innovación',
                        ],
                    ],
                ],
            ],
            [
                'nombre' => 'Participación en proyectos de investigación con financiación externa o mixta',
                'horas_maximas' => 20,
                'tipos_productos' => [
                    [
                        'nombre' => 'Participación en proyectos de investigación con financiación externa o mixta',
                        'subtipos' => [
                            'Participación en proyectos de investigación con financiación externa o mixta',
                        ],
                    ],
                ],
            ],
            [
                'nombre' => 'Participación en proyectos de investigación con financiación interna',
                'horas_maximas' => 15,
                'tipos_productos' => [
                    [
                        'nombre' => 'Participación en proyectos de investigación con financiación interna',
                        'subtipos' => [
                            'Participación en proyectos de investigación con financiación interna',
                        ],
                    ],
                ],
            ],
            [
                'nombre' => 'Participación en proyectos de investigación de instituciones externas',
                'horas_maximas' => 15,
                'tipos_productos' => [
                    [
                        'nombre' => 'Participación en proyectos de investigación de instituciones externas',
                        'subtipos' => [
                            'Participación en proyectos de investigación de instituciones externas',
                        ],
                    ],
                ],
            ],
            [
                'nombre' => 'Liderazgo de Grupos de Investigación avalados',
                'horas_maximas' => 1,
                'tipos_productos' => [
                    [
                        'nombre' => 'Liderazgo de Grupos de Investigación avalados',
                        'subtipos' => [
                            'Liderazgo de Grupos de Investigación avalados',
                        ],
                    ],
                ],
            ],
            [
                'nombre' => 'Liderazgo de semillero de investigación',
                'horas_maximas' => 1,
                'tipos_productos' => [
                    [
                        'nombre' => 'Liderazgo de semillero de investigación',
                        'subtipos' => [
                            'Liderazgo de semillero de investigación',
                        ],
                    ],
                ],
            ],
            [
                'nombre' => 'Organización de eventos científicos regionales, nacionales e internacionales',
                'horas_maximas' => 1,
                'tipos_productos' => [
                    [
                        'nombre' => 'Organización de eventos científicos regionales, nacionales e internacionales',
                        'subtipos' => [
                            'Organización de eventos científicos regionales, nacionales e internacionales',
                        ],
                    ],
                ],
            ],
        ];

        // Grupos de investigación no se crean automáticamente
        // $gruposInvestigacion = [
        //     [
        //         'nombre' => 'TICTRÓPICO',
        //         'correo' => 'tictropico@unitropico.edu.co'
        //     ],
        //     [
        //         'nombre' => 'GIEROC',
        //         'correo' => 'gieroc@unitropico.edu.co'
        //     ],
        //     [
        //         'nombre' => 'GINBIO',
        //         'correo' => 'ginbio@unitropico.edu.co'
        //     ],
        // ];

        $escalafonesProfesoral = [
            [
                'nombre' => 'Profesor Auxiliar',
                'horas_semanales' => 13,
            ],
            [
                'nombre' => 'Profesor Asistente',
                'horas_semanales' => 16,
            ],
            [
                'nombre' => 'Profesor Asociado',
                'horas_semanales' => 21,
            ],
            [
                'nombre' => 'Profesor Titular',
                'horas_semanales' => 26,
            ]
        ];

        $tiposContrato = [
            [
                'nombre' => 'Provisional',
                'numero_periodos' => 2,
            ],
            [
                'nombre' => 'Ocasional Tiempo Completo',
                'numero_periodos' => 2,
            ],
            [
                'nombre' => 'Ocasional',
                'numero_periodos' => 1,
            ],
        ];

        $this->call(PermissionSeeder::class);
        $this->call(RoleSeeder::class);
        $this->call(ConvocatoriaPermissionSeeder::class);
        // $this->call(ConvocatoriaSeeder::class); // Comentado: no se ejecuta automáticamente

        // Crear actividades de investigación, tipos de productos y sus subtipos
        foreach ($actividadesInvestigacion as $actividad) {
            $actividadInvestigacion = ActividadesInvestigacion::create([
                'nombre' => $actividad['nombre'],
                'horas_maximas' => $actividad['horas_maximas'],
            ]);

            foreach ($actividad['tipos_productos'] as $tipo) {
                $tipoProducto = TipoProducto::create([
                    'nombre' => $tipo['nombre'],
                    'actividad_investigacion_id' => $actividadInvestigacion->id,
                ]);

                foreach ($tipo['subtipos'] as $subtipoNombre) {
                    SubTipoProducto::create([
                        'nombre' => $subtipoNombre,
                        'tipo_producto_id' => $tipoProducto->id,
                    ]);
                }
            }
        }

        // Grupos de investigación no se crean automáticamente
        // foreach ($gruposInvestigacion as $grupo) {
        //     GrupoInvestigacion::create([
        //         'nombre' => $grupo['nombre'],
        //         'correo' => $grupo['correo'],
        //     ]);
        // }

        foreach ($escalafonesProfesoral as $escalafonProfesoral) {
            EscalafonProfesoral::create([
                'nombre' => $escalafonProfesoral['nombre'],
                'horas_semanales' => $escalafonProfesoral['horas_semanales'],
            ]);
        }

        foreach ($tiposContrato as $tipoContrato) {
            TipoContrato::create([
                'nombre' => $tipoContrato['nombre'],
                'numero_periodos' => $tipoContrato['numero_periodos'],
            ]);
        }

        // Crear 3 usuarios administradores
        $administradores = [
            [
                'name' => 'Felipe Admin',
                'email' => 'felipe.admin@unitropico.edu.co',
                'cedula' => 1000000001,
            ],
            [
                'name' => 'Vicerectoria',
                'email' => 'vicerectoria@unitropico.edu.co',
                'cedula' => 1000000002,
            ],
            [
                'name' => 'Administrador',
                'email' => 'administrador@unitropico.edu.co',
                'cedula' => 1000000003,
            ],
        ];

        foreach ($administradores as $adminData) {
            $admin = User::firstOrCreate(
                ['email' => $adminData['email']],
                [
                    'name' => $adminData['name'],
                    'password' => bcrypt('administrador'),
                    'tipo' => 'Administrador',
                    'cedula' => $adminData['cedula'],
                    'email_verified_at' => now(),
                ]
            );
            $admin->assignRole('Administrador');
        }
    }
}
