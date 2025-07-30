<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $entidades = [
            'usuario',
            'grupo-investigacion',
            'proyecto',
            'producto',
            'entrega',
            'parametros',
            'roles',
            'permisos',
            'actividad-investigacion',
            'tipo-contrato',
            'escalafon-profresoral',
        ];
        $acciones = [
            'ver',
            'crear',
            'editar',
            'eliminar',
            'revisar',
            'aprobar',
        ];

        foreach ($entidades as $entidad) {
            foreach ($acciones as $accion) {
                $name = $accion . '-' . $entidad;
                Permission::firstOrCreate(['name' => $name]);
            }
        }
    }
} 