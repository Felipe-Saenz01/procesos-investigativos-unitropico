import React from 'react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { PermissionGuard } from '@/components/permission-guard';

export function PermissionExamples() {
    const { hasPermission, hasRole, user } = usePermissions();

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Ejemplos de uso de permisos</h2>
            
            {/* Ejemplo 1: Botón que solo aparece si tiene permiso */}
            <PermissionGuard permission="crear-usuario">
                <Button>Crear Usuario</Button>
            </PermissionGuard>

            {/* Ejemplo 2: Botón que aparece si tiene cualquiera de los permisos */}
            <PermissionGuard permissions={['editar-usuario', 'eliminar-usuario']}>
                <Button variant="outline">Gestionar Usuario</Button>
            </PermissionGuard>

            {/* Ejemplo 3: Botón que aparece solo si tiene TODOS los permisos */}
            <PermissionGuard permissions={['ver-usuario', 'crear-usuario', 'editar-usuario']} requireAll>
                <Button variant="destructive">Administrador Completo</Button>
            </PermissionGuard>

            {/* Ejemplo 4: Contenido condicional con fallback */}
            <PermissionGuard 
                permission="ver-parametros" 
                fallback={<p className="text-gray-500">No tienes permisos para ver parámetros</p>}
            >
                <div className="p-4 bg-green-100 rounded">
                    <h3>Configuración de Parámetros</h3>
                    <p>Tienes acceso a la configuración de parámetros.</p>
                </div>
            </PermissionGuard>

            {/* Ejemplo 5: Uso directo del hook */}
            <div className="p-4 bg-blue-100 rounded">
                <h3>Información del usuario</h3>
                <p>Usuario: {user?.name}</p>
                <p>Puede crear usuarios: {hasPermission('crear-usuario') ? 'Sí' : 'No'}</p>
                <p>Es administrador: {hasRole('Administrador') ? 'Sí' : 'No'}</p>
            </div>

            {/* Ejemplo 6: Renderizado condicional con múltiples permisos */}
            {hasPermission('ver-proyecto') && (
                <div className="p-4 bg-yellow-100 rounded">
                    <h3>Proyectos</h3>
                    <p>Tienes acceso a ver proyectos.</p>
                    {hasPermission('crear-proyecto') && (
                        <Button className="mt-2">Nuevo Proyecto</Button>
                    )}
                </div>
            )}
        </div>
    );
} 