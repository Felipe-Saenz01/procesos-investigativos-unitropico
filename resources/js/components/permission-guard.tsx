import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGuardProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export function PermissionGuard({ 
    permission, 
    permissions, 
    requireAll = false, 
    fallback = null, 
    children 
}: PermissionGuardProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
        if (requireAll) {
            hasAccess = hasAllPermissions(permissions);
        } else {
            hasAccess = hasAnyPermission(permissions);
        }
    } else {
        // Si no se especifica ningún permiso, mostrar el contenido
        hasAccess = true;
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
} 