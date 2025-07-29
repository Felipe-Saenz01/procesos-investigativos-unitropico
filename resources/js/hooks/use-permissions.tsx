import { usePage } from '@inertiajs/react';
import { type User } from '@/types';

interface  authPermissions{
    auth?: {
        user: {
            permissions: string[];
        };
    };
}

export function usePermissions() {
    const {auth} = usePage().props as authPermissions;
    const user = auth?.user as User | null;

    const hasPermission = (permission: string): boolean => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!user || !user.permissions) return false;
        return permissions.some(permission => user.permissions!.includes(permission));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!user || !user.permissions) return false;
        return permissions.every(permission => user.permissions!.includes(permission));
    };

    const hasRole = (role: string): boolean => {
        if (!user || !user.roles) return false;
        return user.roles.includes(role);
    };

    const hasAnyRole = (roles: string[]): boolean => {
        if (!user || !user.roles) return false;
        return roles.some(role => user.roles!.includes(role));
    };

    return {
        user,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
    };
} 