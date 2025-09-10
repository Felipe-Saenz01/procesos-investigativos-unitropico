import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    tipo?: string;
    cedula?: string;
    grupo_investigacion_id?: number | null;
    tipo_contrato_id?: number | null;
    escalafon_profesoral_id?: number | null;
    roles?: string[];
    permissions?: string[];
    [key: string]: unknown; // This allows for additional properties...
}

export interface GrupoInvestigacion {
    id: number;
    nombre: string;
    correo: string;
    descripcion?: string;
    objetivos?: string;
    vision?: string;
    mision?: string;
    ruta_plan_trabajo?: string;
    nombre_archivo_plan_trabajo?: string;
    created_at: string;
    updated_at: string;
    usuarios: Usuario[];
}


export interface Convocatoria {
    id: number;
    nombre: string;
    descripcion?: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    created_at: string;
    updated_at: string;
    esta_abierta?: boolean;
    dias_restantes?: number;
    mi_postulacion?: Postulacion;
    puede_postularse?: boolean;
}

export interface RequisitosConvocatoria {
    id: number;
    convocatoria_id: number;
    nombre: string;
    descripcion?: string;
    tipo_archivo: string;
    obligatorio: boolean;
    created_at: string;
    updated_at: string;
}

export interface Postulacion {
    id: number;
    convocatoria_id: number;
    user_id: number;
    estado: string;
    comentarios?: string;
    created_at: string;
    updated_at: string;
}

export interface ArchivoPostulacion {
    id: number;
    postulacion_id: number;
    requisito_convocatoria_id: number;
    nombre_original: string;
    nombre_archivo: string;
    ruta_archivo: string;
    tipo_mime: string;
    tamaño_bytes: number;
    observaciones?: string;
    created_at: string;
    updated_at: string;
}
