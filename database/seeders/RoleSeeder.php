<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'Administrador',
            'Lider Grupo',
            'Investigador',
        ];

        foreach ($roles as $roleName) {
            $role = Role::firstOrCreate(['name' => $roleName]);

            // Asignar permisos base según el rol
            if ($roleName === 'Investigador') {
                $permisos = [
                    // Proyectos
                    'ver-proyecto', 'crear-proyecto', 'editar-proyecto',
                    // Productos
                    'ver-producto', 'crear-producto', 'editar-producto',
                    // Entregas
                    'ver-entrega', 'crear-entrega', 'editar-entrega',
                ];
                $role->syncPermissions(Permission::whereIn('name', $permisos)->get());
            }
            if ($roleName === 'Lider Grupo') {
                $permisos = [
                    // Usuarios
                    'crear-usuario', 'editar-usuario',
                    // Grupos de investigación
                    'editar-grupo-investigacion',
                    // Proyectos y entregas
                    'ver-proyecto', 'revisar-proyecto', 'aprobar-proyecto',
                    'ver-entrega', 'revisar-entrega', 'aprobar-entrega',
                ];
                $role->syncPermissions(Permission::whereIn('name', $permisos)->get());
            }
            if ($roleName === 'Administrador') {
                $permisos = [
                    // Usuarios
                    'crear-usuario', 'editar-usuario',
                    // Grupos de investigación
                    'crear-grupo-investigacion', 'editar-grupo-investigacion',
                    // Parámetros
                    'crear-tipo-producto', 'editar-tipo-producto',
                    'crear-subtipo-producto', 'editar-subtipo-producto',
                    'crear-periodo', 'editar-periodo',
                    'crear-rol', 'editar-rol',
                    'crear-permiso', 'editar-permiso',
                ];
                $role->syncPermissions(Permission::whereIn('name', $permisos)->get());
            }
        }
    }
} 