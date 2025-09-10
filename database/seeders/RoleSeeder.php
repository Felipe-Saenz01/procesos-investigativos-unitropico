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
                    // Usuarios
                    'ver-usuario',
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
                    'editar-grupo-investigacion', 'ver-grupo-investigacion',
                    // Proyectos y entregas
                    'ver-proyecto', 'revisar-proyecto', 'aprobar-proyecto',
                    'ver-entrega', 'revisar-entrega', 'aprobar-entrega',
                    // Convocatorias
                    'ver-convocatorias',
                    'ver-postulaciones', 'crear-postulaciones',
                ];
                $role->syncPermissions(Permission::whereIn('name', $permisos)->get());
            }
            if ($roleName === 'Administrador') {
                $permisos = [
                    // Usuarios
                    'ver-usuario', 'crear-usuario', 'editar-usuario',
                    // Grupos de investigación
                    'ver-grupo-investigacion', 'crear-grupo-investigacion', 'editar-grupo-investigacion',

         
                    // Proyecto
                    'ver-proyecto', 'crear-proyecto', 'editar-proyecto',
                    //Producto
                    'ver-producto', 'crear-producto', 'editar-producto',
                    // Proyectos y entregas
                    'ver-proyecto', 'revisar-proyecto', 'aprobar-proyecto',
                    'ver-entrega', 'revisar-entrega', 'aprobar-entrega',

                    // Parámetros
                    'ver-parametros','crear-parametros', 'editar-parametros',
                    // Roles
                    'ver-roles', 'crear-roles', 'editar-roles',
                    // Permisos
                    'ver-permisos', 'crear-permisos', 'editar-permisos',
                    // Convocatorias
                    'ver-convocatorias', 'crear-convocatorias', 'editar-convocatorias',
                    // Postulaciones
                    'ver-postulaciones', 'revisar-postulaciones', 'aprobar-postulaciones', 'rechazar-postulaciones',

                ];
                $role->syncPermissions(Permission::whereIn('name', $permisos)->get());
            }
        }
    }
} 