import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    FileText,
    Play,
    Pause,
    SquareCheck
} from 'lucide-react';

interface EstadoBadgeProps {
    estado: string;
    size?: 'sm' | 'default';
    showIcon?: boolean;
}

export function EstadoBadge({ estado, size = 'default', showIcon = true }: EstadoBadgeProps) {
    const estados = {
        // Estados de revisión
        'Creado': { 
            variant: 'default' as const, 
            icon: FileText, 
            text: 'Creado',
            color: 'bg-blue-600'
        },
        'Pendiente': { 
            variant: 'default' as const, 
            icon: Clock, 
            text: 'Pendiente',
            color: 'bg-gray-600'
        },
        'Aprobado': { 
            variant: 'default' as const, 
            icon: CheckCircle, 
            text: 'Aprobado',
            color: 'bg-green-600'
        },
        'Corrección': { 
            variant: 'default' as const, 
            icon: AlertTriangle, 
            text: 'Corrección',
            color: 'bg-orange-500'
        },
        'Rechazado': { 
            variant: 'destructive' as const, 
            icon: XCircle, 
            text: 'Rechazado',
            color: 'bg-red-600'
        },
        
        // Estados de proyectos
        'En Formulación': { 
            variant: 'secondary' as const, 
            icon: FileText, 
            text: 'En Formulación',
            color: 'text-blue-600'
        },
        'Formulado': { 
            variant: 'default' as const, 
            icon: CheckCircle, 
            text: 'Formulado',
            color: 'text-green-600'
        },
        'En Ejecución': { 
            variant: 'default' as const, 
            icon: Play, 
            text: 'En Ejecución',
            color: 'text-blue-600'
        },
        'Pausado': { 
            variant: 'secondary' as const, 
            icon: Pause, 
            text: 'Pausado',
            color: 'text-yellow-600'
        },
        'Finalizado': { 
            variant: 'default' as const, 
            icon: SquareCheck, 
            text: 'Finalizado',
            color: 'text-gray-600'
        },
        
        // Estados de entregas
        'Activo': { 
            variant: 'default' as const, 
            icon: CheckCircle, 
            text: 'Activo',
            color: 'text-green-600'
        },
        'Inactivo': { 
            variant: 'secondary' as const, 
            icon: Pause, 
            text: 'Inactivo',
            color: 'text-gray-600'
        }
    };

    const estadoInfo = estados[estado as keyof typeof estados] || estados['Pendiente'];
    const Icon = estadoInfo.icon;

    return (
        <Badge 
            variant={estadoInfo.variant} 
            className={`${size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} ${estadoInfo.color}`}
        >
            {showIcon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />}
            {estadoInfo.text}
        </Badge>
    );
}
