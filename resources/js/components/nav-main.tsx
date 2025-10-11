import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

// Función helper para determinar si una ruta está activa
function isRouteActive(currentUrl: string, routeHref: string): boolean {
    // Extraer solo la ruta de routeHref (remover protocolo, dominio, puerto)
    const routePath = routeHref.replace(/^https?:\/\/[^/]+/, '');
    
    // Si es exactamente la misma ruta
    if (currentUrl === routePath) {
        return true;
    }
    
    // Si la ruta actual empieza con la ruta del menú + '/'
    if (currentUrl.startsWith(routePath + '/')) {
        return true;
    }
    
    return false;
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Módulos</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isRouteActive(page.url, item.href)} tooltip={{ children: item.title }}>
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
