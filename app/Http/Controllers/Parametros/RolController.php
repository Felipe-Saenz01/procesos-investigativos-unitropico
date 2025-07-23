<?php

namespace App\Http\Controllers\Parametros;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return inertia('Parametros/Rol/Index', [
            'roles' => $roles->map(function($rol) {
                return [
                    'id' => $rol->id,
                    'name' => $rol->name,
                    'permissions' => $rol->permissions->map(function($permiso) {
                        return [
                            'id' => $permiso->id,
                            'name' => $permiso->name,
                        ];
                    }),
                ];
            })
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permisos = Permission::all(['id', 'name']);
        return inertia('Parametros/Rol/Create', [
            'permisos' => $permisos,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);
        $rol = Role::create(['name' => $data['name']]);
        if (!empty($data['permissions'])) {
            $rol->syncPermissions($data['permissions']);
        }
        return to_route('parametros.rol.index')->with('success', 'Rol creado correctamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        $rol = Role::with('permissions')->findOrFail($id);
        $permisos = Permission::all(['id', 'name']);
        return inertia('Parametros/Rol/Edit', [
            'rol' => [
                'id' => $rol->id,
                'name' => $rol->name,
                'permissions' => $rol->permissions->pluck('id'),
            ],
            'permisos' => $permisos,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $rol = Role::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $rol->id,
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);
        $rol->update(['name' => $data['name']]);
        $rol->syncPermissions($data['permissions'] ?? []);
        return to_route('parametros.rol.index')->with('success', 'Rol actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $rol = Role::findOrFail($id);
        $rol->delete();
        return to_route('parametros.rol.index')->with('success', 'Rol eliminado correctamente');
    }

    public function permisos($rolId)
    {
        $rol = Role::with('permissions')->findOrFail($rolId);
        $permisos = Permission::all(['id', 'name']);
        return inertia('Parametros/Rol/Permisos', [
            'rol' => [
                'id' => $rol->id,
                'name' => $rol->name,
                'permissions' => $rol->permissions->pluck('id'),
            ],
            'permisos' => $permisos,
        ]);
    }

    public function actualizarPermisos(Request $request, $rolId)
    {
        $rol = Role::findOrFail($rolId);
        $data = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);
        $rol->syncPermissions($data['permissions'] ?? []);
        return to_route('parametros.rol.index')->with('success', 'Permisos actualizados correctamente');
    }
}
