// import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroupContent, SidebarGroupLabel, SidebarSeparator } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
// import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import { LayoutGrid, Layers2, LayoutList, LibraryBig, Users, UserCheck, SquareChartGantt, FileText, ReceiptText, UserRoundSearch } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Grupos de Investigación',
        href: route('grupo-investigacion.index'),
        icon: Users,
    },
    {
        title: 'Investigadores',
        href: route('investigadores.index'),
        icon: UserCheck,
    },
    {
        title: 'Proyectos',
        href: route('proyectos.index'),
        icon: SquareChartGantt,
    },
    {
        title: 'Productos',
        href: route('productos.index'),
        icon: FileText,
    }
];

const NavParamsItems: NavItem[] = [
    {
        title: 'Periodos',
        href: route('parametros.periodo.index'),
        icon: LayoutList,
    },
    {
        title: 'Tipos Productos',
        href: route('parametros.tipo-producto.index'),
        icon: Layers2,
    },
    {
        title: 'Subtipos Productos',
        href: route('parametros.subtipo-producto.index'),
        icon: LibraryBig,
    },
    {
        title: 'Roles',
        href: route('parametros.rol.index'),
        icon: Users,
    },
    {
        title: 'Permisos',
        href: route('parametros.permiso.index'),
        icon: UserCheck,
    },
    {
        title: 'Tipo Contrato',
        href: route('parametros.permiso.index'),
        icon: ReceiptText,
    },
    {
        title: 'Tipo de Profesor',
        href: route('parametros.permiso.index'),
        icon: UserRoundSearch,
    },
];

// const footerNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

export function AppSidebar() {
    const page = usePage();
    const user = page.props.auth?.user;
    // Permitir ver parámetros si el usuario tiene el permiso 'ver-parametros'
    const puedeVerParametros = (user?.permissions ?? []).includes('ver-parametros');
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
                <NavMain items={mainNavItems} />
                {puedeVerParametros && (
                    <>
                        <SidebarSeparator className='px-2 w-full' />
                        <SidebarGroupContent className='px-2'>
                            <SidebarGroupLabel>Parámetros</SidebarGroupLabel>
                            <SidebarMenu>
                                {NavParamsItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
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
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
