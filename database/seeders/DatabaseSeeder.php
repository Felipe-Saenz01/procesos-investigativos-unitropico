<?php

namespace Database\Seeders;

use App\Models\GrupoInvestigacion;
use App\Models\SubTipoProducto;
use App\Models\TipoContrato;
use App\Models\TipoProducto;
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
        $tiposProducto = [
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
            [
                'nombre' => 'Formulación de Proyectos de Investigación',
                'subtipos' => [
                    'Formulación de Proyectos de Investigación',
                ]
            ]
        ];

        $gruposInvestigacion = [
            [
                'nombre' => 'TICTRÓPICO',
                'correo' => 'tictropico@unitropico.edu.co' 
            ],
            [
                'nombre' => 'GIEROC',
                'correo' => 'gieroc@unitropico.edu.co' 
            ],
            [
                'nombre' => 'GINBIO',
                'correo' => 'ginbio@unitropico.edu.co' 
            ],

        ];

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
                'nombre' => 'Provicional',
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

        // Crear tipos de productos y sus subtipos
        foreach ($tiposProducto as $tipo) {
            $tipoProducto = TipoProducto::create(['nombre' => $tipo['nombre']]);

            foreach ($tipo['subtipos'] as $subtipoNombre) {
                SubTipoProducto::create([
                    'nombre' => $subtipoNombre,
                    'tipo_producto_id' => $tipoProducto->id,
                ]);
            }
        }

        foreach ($gruposInvestigacion as $grupo) {
            GrupoInvestigacion::create([
                'nombre' => $grupo['nombre'],
                'correo' => $grupo['correo'],
            ]);
        }

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

        $grupos = GrupoInvestigacion::all();
        $roles_users = ['Investigador', 'Lider Grupo'];

        $users = User::factory()->count(10)->create([
            'tipo' => function () use ($roles_users) {
                return $roles_users[array_rand($roles_users)]; // Asignar un rol aleatorio
            },
            'grupo_investigacion_id' => function () use ($grupos) {
                return $grupos->random()->id; // Asignar a un grupo aleatorio
            },
            'password' => bcrypt('password'),
        ]);

        // Asignar rol según el tipo
        foreach ($users as $user) {
            if ($user->tipo === 'Investigador') {
                $user->assignRole('Investigador');
            } elseif ($user->tipo === 'Lider Grupo') {
                $user->assignRole('Lider Grupo');
            }
        }

        // Crear usuario administrador
        $admin = User::firstOrCreate([
            'email' => 'administrador@gmail.com',
        ], [
            'name' => 'Administrador',
            'password' => bcrypt('administrador'),
            'tipo'=> 'Administrador',
            'cedula'=> 1234567890,
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('Administrador');

        
    }
}
