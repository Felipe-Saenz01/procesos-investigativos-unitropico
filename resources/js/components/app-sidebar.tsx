// import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupContent, SidebarGroupLabel, SidebarSeparator } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
// import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import { BookOpen, LayoutGrid, Layers2, LayoutList, LibraryBig, Users, UserCheck, SquareChartGantt, FileText, Activity, Megaphone, BrainCircuit, BarChart3 } from 'lucide-react';
import AppLogo from './app-logo';
import { NavFooter } from './nav-footer';

// Extender NavItem para incluir permisos requeridos
interface NavItemWithPermissions extends NavItem {
    requiredPermission?: string;
}

const mainNavItems: NavItemWithPermissions[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Grupos de Investigación',
        href: route('grupo-investigacion.index'),
        icon: Users,
        requiredPermission: 'ver-grupo-investigacion',
    },
    {
        title: 'Investigadores',
        href: route('investigadores.index'),
        icon: UserCheck,
        requiredPermission: 'ver-usuario',
    },
    {
        title: 'Proyectos',
        href: route('proyectos.index'),
        icon: SquareChartGantt,
        requiredPermission: 'ver-proyecto',
    },
    {
        title: 'Productos',
        href: route('productos.index'),
        icon: FileText,
        requiredPermission: 'ver-producto',
    },
    {
        title: 'Convocatorias',
        href: route('convocatorias.index'),
        icon: Megaphone,
        requiredPermission: 'ver-convocatorias',
    },
    {
        title: 'Revision Inteligente',
        href: route('modulo-inteligente.index'),
        icon: BrainCircuit,
        // requiredPermission: 'ver-revision-inteligente',
    }
];

const NavInformesItems: NavItemWithPermissions[] = [
    {
        title: 'Planes de Trabajo',
        href: route('informes.planes-trabajo'),
        icon: BarChart3,
        // requiredPermission: 'ver-informes',
    }
];

const NavParamsItems: NavItemWithPermissions[] = [
    {
        title: 'Periodos',
        href: route('parametros.periodo.index'),
        icon: LayoutList,
        requiredPermission: 'ver-parametros',
    },
    {
        title: 'Actividades de Investigación',
        href: route('parametros.actividades-investigacion.index'),
        icon: Activity,
        requiredPermission: 'ver-parametros',
    },
    {
        title: 'Tipos Productos',
        href: route('parametros.tipo-producto.index'),
        icon: Layers2,
        requiredPermission: 'ver-parametros',
    },
    {
        title: 'Subtipos Productos',
        href: route('parametros.subtipo-producto.index'),
        icon: LibraryBig,
        requiredPermission: 'ver-parametros',
    },
    {
        title: 'Roles',
        href: route('parametros.rol.index'),
        icon: Users,
        requiredPermission: 'ver-roles',
    },
    {
        title: 'Permisos',
        href: route('parametros.permiso.index'),
        icon: UserCheck,
        requiredPermission: 'ver-permisos',
    },
    {
        title: 'Escalafón Profesoral',
        href: route('parametros.escalafon-profesoral.index'),
        icon: Layers2,
        requiredPermission: 'ver-parametros',
    },
    {
        title: 'Tipo de Contrato',
        href: route('parametros.tipo-contrato.index'),
        icon: LibraryBig,
        requiredPermission: 'ver-parametros',
    },

];

const footerNavItems: NavItem[] = [
    {
        title: 'Manual de Usuario',
        href: 'https://felipe-saenz01.github.io/manual_usuario_investigacion/',
        icon: BookOpen,
    },
];

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

// Función para filtrar elementos según permisos
const filterItemsByPermission = (items: NavItemWithPermissions[], hasPermission: (permission: string) => boolean): NavItem[] => {
    return items.filter(item => {
        if (!item.requiredPermission) return true;
        return hasPermission(item.requiredPermission);
    });
};

export function AppSidebar() {
    const page = usePage();
    const { hasPermission } = usePermissions();
    
    // Filtrar elementos según permisos
    const filteredMainItems = filterItemsByPermission(mainNavItems, hasPermission);
    const filteredInformesItems = filterItemsByPermission(NavInformesItems, hasPermission);
    const filteredParamItems = filterItemsByPermission(NavParamsItems, hasPermission);
    
    // Permitir ver informes si el usuario tiene al menos un permiso de informes
    const puedeVerInformes = filteredInformesItems.length > 0;
    
    // Permitir ver parámetros si el usuario tiene al menos un permiso de parámetros
    const puedeVerParametros = filteredParamItems.length > 0;
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild >
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredMainItems} />
                {puedeVerInformes && (
                    <>
                        <SidebarSeparator className='px-2 w-full' />
                        <SidebarGroupContent className='px-2'>
                            <SidebarGroupLabel>Informes</SidebarGroupLabel>
                            <SidebarMenu>
                                {filteredInformesItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isRouteActive(page.url, item.href)} tooltip={{ children: item.title }}>
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span> {item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </>
                )}
                {puedeVerParametros && (
                    <>
                        <SidebarSeparator className='px-2 w-full' />
                        <SidebarGroupContent className='px-2'>
                            <SidebarGroupLabel>Parámetros</SidebarGroupLabel>
                            <SidebarMenu>
                                {filteredParamItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isRouteActive(page.url, item.href)} tooltip={{ children: item.title }}>
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span> {item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
