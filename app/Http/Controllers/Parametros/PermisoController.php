<?php

namespace App\Http\Controllers\Parametros;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermisoController extends Controller
{
    const ENTIDADES = [
        'usuario',
        'grupo-investigacion',
        'proyecto',
        'producto',
        'entrega',
        'roles',
        'permisos',
        'horas-investigacion',
        'planes-trabajo',
        'parametros',
        'convocatorias',
        'postulaciones',
    ];
    // const ACCIONES = ['ver', 'crear', 'editar', 'eliminar', 'asignar', 'aprobar', 'exportar'];
    const ACCIONES = ['ver', 'crear', 'editar', 'eliminar', 'revisar', 'aprobar'];

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $permisos = Permission::with('roles')->get();
        return inertia('Parametros/Permiso/Index', [
            'permisos' => $permisos->map(function($permiso) {
                return [
                    'id' => $permiso->id,
                    'name' => $permiso->name,
                    'roles' => $permiso->roles->map(function($rol) {
                        return [
                            'id' => $rol->id,
                            'name' => $rol->name,
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
        $roles = Role::all(['id', 'name']);
        return inertia('Parametros/Permiso/Create', [
            'roles' => $roles,
            'entidades' => self::ENTIDADES,
            'acciones' => self::ACCIONES,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'entidad' => 'required|string|in:' . implode(',', self::ENTIDADES),
            'accion' => 'required|string|in:' . implode(',', self::ACCIONES),
        ]);
        $name = $data['accion'] . '-' . $data['entidad'];
        if (Permission::where('name', $name)->exists()) {
            return back()->withErrors(['entidad' => 'Ya existe un permiso con esa combinación.']);
        }
        $permiso = Permission::create(['name' => $name]);
        return to_route('parametros.permiso.index')->with('success', 'Permiso creado correctamente');
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
        $permiso = Permission::find($id);
        $roles = Role::all(['id', 'name']);
        // Separar acción y entidad
        $partes = explode('-', $permiso->name);
        $accion = $partes[0] ?? '';
        $entidad = $partes[1] ?? '';
        return inertia('Parametros/Permiso/Edit', [
            'permiso' => [
                'id' => $permiso->id,
                'accion' => $accion,
                'entidad' => $entidad,
            ],
            'roles' => $roles,
            'entidades' => self::ENTIDADES,
            'acciones' => self::ACCIONES,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $permiso = Permission::findOrFail($id);
        $data = $request->validate([
            'entidad' => 'required|string|in:' . implode(',', self::ENTIDADES),
            'accion' => 'required|string|in:' . implode(',', self::ACCIONES),
        ]);
        $name = $data['accion'] . '-' . $data['entidad'];
        if (Permission::where('name', $name)->where('id', '!=', $permiso->id)->exists()) {
            return back()->withErrors(['entidad' => 'Ya existe un permiso con esa combinación.']);
        }
        $permiso->update(['name' => $name]);
        return to_route('parametros.permiso.index')->with('success', 'Permiso actualizado correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $permiso = Permission::findOrFail($id);
        $permiso->delete();
        return to_route('parametros.permiso.index')->with('success', 'Permiso eliminado correctamente');
    }
}
