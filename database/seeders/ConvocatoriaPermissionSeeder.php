<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ConvocatoriaPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear permisos para convocatorias
        $permisosConvocatorias = [
            'ver-convocatorias',
            'crear-convocatorias',
            'editar-convocatorias',
            'eliminar-convocatorias',
            'ver-postulaciones',
            'aprobar-postulaciones',
            'rechazar-postulaciones'
        ];

        foreach ($permisosConvocatorias as $permiso) {
            Permission::firstOrCreate(['name' => $permiso]);
        }

        // Asignar permisos a roles
        $adminRole = Role::where('name', 'Administrador')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo($permisosConvocatorias);
        }

        $liderRole = Role::where('name', 'Lider Grupo')->first();
        if ($liderRole) {
            $liderRole->givePermissionTo([
                'ver-convocatorias',
                'ver-postulaciones'
            ]);
        }

        $investigadorRole = Role::where('name', 'Investigador')->first();
        if ($investigadorRole) {
            $investigadorRole->givePermissionTo([
                'ver-convocatorias'
            ]);
        }
    }
}
