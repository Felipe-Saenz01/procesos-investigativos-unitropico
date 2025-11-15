import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area,
    PieChart,
    Pie
} from 'recharts';
import { 
    FileText, 
    CheckCircle, 
    Activity,
    Target,
    Download
} from 'lucide-react';
import { Head, usePage } from '@inertiajs/react';
import * as React from 'react';
import { toast } from 'sonner';

interface PlanesTrabajoProps {
    estadisticas: {
        total_planes_trabajo: number;
        planes_aprobados: number;
        planes_pendientes: number;
        planes_en_correccion: number;
        planes_terminados: number;
    };
    estadisticas_cumplimiento: {
        total_planes: number;
        planes_con_informes: number;
        planes_sin_informes: number;
        porcentaje_cumplimiento: number;
    };
    planes_por_periodo: Array<{
        id: number;
        nombre: string;
        fecha_limite_planeacion: string;
        fecha_limite_evidencias: string;
        planes_count: number;
    }>;
    rendimiento_grupos_por_periodo: Array<{
        periodo: string;
        [key: string]: string | number; // Para los grupos dinámicos
    }>;
    grupos_nombres: string[];
    investigadores_con_planes: Array<{
        id: number;
        name: string;
        planes_count: number;
    }>;
    planes_recientes: Array<{
        id: number;
        nombre: string;
        estado: string;
        vigencia: string;
        created_at: string;
        user: { name: string };
        periodo_inicio?: { nombre: string } | null;
        periodo_fin?: { nombre: string } | null;
    }>;
    informes_por_periodo: Array<{
        id: number;
        nombre: string;
        informes_count: number;
    }>;
    comparacion_planes_informes: Array<{
        id: number;
        nombre: string;
        planes_count: number;
        informes_count: number;
    }>;
    distribucion_estados: Array<{
        estado: string;
        cantidad: number;
    }>;
    estadisticas_vigencia: Array<{
        vigencia: string;
        cantidad: number;
    }>;
    estadisticas_actividades: Array<{
        actividad_nombre: string;
        cantidad_actividades: number;
    }>;
    top_investigadores_actividades: Array<{
        id: number;
        name: string;
        total_actividades: number;
        total_planes: number;
    }>;
    rendimiento_por_grupo_investigador: Array<{
        grupo_id: number | null;
        grupo: string;
        investigadores: Array<{
            user_id: number;
            user_name: string;
            rendimiento_por_periodo: number[];
        }>;
        periodos?: string[];
    }>;
}

export default function PlanesTrabajo({ 
    estadisticas,
    rendimiento_grupos_por_periodo,
    grupos_nombres,
    investigadores_con_planes,
    planes_recientes,
    distribucion_estados,
    estadisticas_actividades,
    top_investigadores_actividades,
    rendimiento_por_grupo_investigador
}: PlanesTrabajoProps) {
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };
    
    // Mostrar notificaciones toast cuando hay flash messages
    React.useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);
    
    // Validar que rendimiento_por_grupo_investigador sea un array
    const gruposInvestigadorData = Array.isArray(rendimiento_por_grupo_investigador) 
        ? rendimiento_por_grupo_investigador 
        : [];
    
    // Datos para gráfico de rendimiento de grupos por período (ya vienen estructurados correctamente)
    const datosRendimientoGruposPeriodo = rendimiento_grupos_por_periodo;

    // Generar colores únicos para cada grupo
    const coloresGrupos = [
        '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];
    
    // Estado para el diálogo
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedGrupoId, setSelectedGrupoId] = React.useState<number | null>(null);
    
    // Función para generar el PDF
    const handleGenerarPdf = () => {
        if (selectedGrupoId) {
            window.open(`/informes/grupo/${selectedGrupoId}/pdf`, '_blank');
            setDialogOpen(false);
        }
    };

    return (
        <AppLayout 
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Informes', href: '/informes' },
                { title: 'Planes de Trabajo', href: '/informes/planes-trabajo' }
            ]}
        >
            <Head title="Informes Planes de Trabajo" />
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-cente comor justify-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-center">Planes de Trabajo</h1>
                    </div>
                </div>

                {/* Estadísticas principales y gráfico de rendimiento */}
                <div className="grid gap-4 lg:grid-cols-10">
                    {/* Estadísticas principales - más pequeñas */}
                    <div className="lg:col-span-3 grid gap-2 grid-cols-2 my-5">
                        <div className='p-2 border rounded-lg shadow-sm'>
                            <div className="flex flex-row items-center justify-between mb-1">
                                <h1 className="text-xs font-bold">Total Planes</h1>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col items-center justify-center mt-5 pt-5">
                                <p className="text-3xl font-bold">{estadisticas.total_planes_trabajo}</p>
                                <p className="text-xs text-muted-foreground">Registrados</p>
                            </div>
                        </div>
                        <div className='p-2 border rounded-lg shadow-sm'>
                            <div className="flex flex-row items-center justify-between mb-1">
                                <h1 className="text-xs font-bold">Aprobados</h1>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex flex-col items-center justify-center mt-5 pt-5">
                                <p className="text-3xl font-bold text-green-600">{estadisticas.planes_aprobados}</p>
                                <p className="text-xs text-muted-foreground">Aprobados</p>
                            </div>
                        </div>
                        <div className='p-2 border rounded-lg shadow-sm'>
                            <div className="flex flex-row items-center justify-between mb-1">
                                <h1 className="text-2sm font-bold">Pendientes</h1>
                                <Activity className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="flex flex-col items-center justify-center mt-5 pt-5">
                                <p className="text-3xl font-bold text-orange-600">{estadisticas.planes_pendientes}</p>
                                <p className="text-xs text-muted-foreground">Pendientes</p>
                            </div>
                        </div>
                        <div className='p-2 border rounded-lg shadow-sm'>
                            <div className="flex flex-row items-center justify-between mb-5">
                                <h1 className="text-sm font-bold">Corrección</h1>
                                <Target className="h-4 w-4 text-red-600" />
                            </div>
                            <div className="flex flex-col items-center justify-center mt-5 pt-5">
                                <p className="text-3xl font-bold text-red-600">{estadisticas.planes_en_correccion}</p>
                                <p className="text-xs text-muted-foreground">Corrección</p>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de rendimiento de grupos por período - 70% del espacio */}
                    <div className="lg:col-span-7">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rendimiento de Grupos por Período</CardTitle>
                                <CardDescription>Evolución del rendimiento de grupos de investigación a lo largo del tiempo</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={230}>
                                    <AreaChart data={datosRendimientoGruposPeriodo}>
                                        <defs>
                                            {grupos_nombres.filter(g => g).map((grupo, index) => {
                                                const uniqueId = `fill-grupo-${grupo}-${index}`;
                                                return (
                                                <linearGradient key={uniqueId} id={uniqueId} x1="0" y1="0" x2="0" y2="1">
                                                    <stop
                                                        offset="5%"
                                                        stopColor={coloresGrupos[index % coloresGrupos.length]}
                                                        stopOpacity={0.8}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor={coloresGrupos[index % coloresGrupos.length]}
                                                        stopOpacity={0.1}
                                                    />
                                                </linearGradient>
                                                );
                                            })}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="periodo" 
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                        />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip 
                                            formatter={(value: number, name: string) => [`${value}%`, name]}
                                            labelFormatter={(label) => `Período: ${label}`}
                                        />
                                        {grupos_nombres.filter(g => g).map((grupo, index) => {
                                            const uniqueId = `fill-grupo-${grupo}-${index}`;
                                            return (
                                            <Area
                                                key={grupo}
                                                type="monotone"
                                                dataKey={grupo}
                                                stroke={coloresGrupos[index % coloresGrupos.length]}
                                                fill={`url(#${uniqueId})`}
                                                strokeWidth={2}
                                                name={grupo && grupo.length > 15 ? grupo.substring(0, 15) + '...' : grupo}
                                            />
                                            );
                                        })}
                                    </AreaChart>
                                </ResponsiveContainer>
                                
                                {/* Leyenda personalizada */}
                                <div className="flex flex-wrap justify-center gap-4">
                                    {grupos_nombres.filter(g => g).map((grupo, index) => (
                                        <div key={grupo} className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: coloresGrupos[index % coloresGrupos.length] }}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {grupo && grupo.length > 20 ? grupo.substring(0, 20) + '...' : grupo}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Actividades de Planes de Trabajo */}
                <div className="grid gap-6 lg:grid-cols-20">
                    {/* Tabla de Top Investigadores - 35% del espacio */}
                    <div className="lg:col-span-7">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Investigadores con Más Actividades</CardTitle>
                                <CardDescription>Investigadores con mayor cantidad de actividades registradas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-2 text-left">#</th>
                                                <th className="p-2 text-left">Investigador</th>
                                                <th className="p-2 text-right">Actividades</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {top_investigadores_actividades?.slice(0, 10).map((investigador, index) => (
                                                <tr key={investigador.id} className="border-b hover:bg-muted/50">
                                                    <td className="p-2 font-medium">{index + 1}</td>
                                                    <td className="p-2">{investigador.name}</td>
                                                    <td className="p-2 text-right font-semibold">{investigador.total_actividades}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gráfico de Torta (Pie Chart) - 65% del espacio */}
                    <div className="lg:col-span-13">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actividades de Planes de Trabajo</CardTitle>
                                <CardDescription>Distribución de actividades por tipo</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={330}>
                                    <PieChart>
                                        <Tooltip 
                                            formatter={(value: number, name: string) => {
                                                const displayName = name && name.length > 60 ? name.substring(0, 60) + '…' : name;
                                                return [`${value}`, displayName || 'Actividad'];
                                            }} 
                                        />
                                        <Pie 
                                            data={estadisticas_actividades}
                                            dataKey="cantidad_actividades"
                                            nameKey="actividad_nombre"
                                            cx="50%" cy="50%"
                                            innerRadius={60}
                                            outerRadius={110}
                                            paddingAngle={2}
                                            label={({ name }) => (name && name.length > 20 ? name.substring(0, 20) + '…' : name)}
                                        >
                                            {estadisticas_actividades.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={coloresGrupos[index % coloresGrupos.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Rendimiento por Grupo de Investigación */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Rendimiento por Grupo de Investigación</CardTitle>
                                <CardDescription>Rendimiento individual de investigadores por grupo</CardDescription>
                            </div>
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                        <DialogTrigger asChild>
                                            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                                <Download className="w-4 h-4 mr-2" />
                                                Ver Informe de Grupo en PDF
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Seleccionar Grupo de Investigación</DialogTitle>
                                                <DialogDescription>
                                                    Seleccione el grupo de investigación para generar el informe en PDF.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Select 
                                                    value={selectedGrupoId?.toString() || ''} 
                                                    onValueChange={(value) => setSelectedGrupoId(parseInt(value))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un grupo" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {gruposInvestigadorData.map((grupoData) => (
                                                            <SelectItem 
                                                                key={grupoData.grupo_id} 
                                                                value={grupoData.grupo_id?.toString() || ''}
                                                            >
                                                                {grupoData.grupo}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <DialogFooter>
                                                <button
                                                    onClick={() => setDialogOpen(false)}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleGenerarPdf}
                                                    disabled={!selectedGrupoId}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Generar PDF
                                                </button>
                                            </DialogFooter>
                                        </DialogContent>
                            </Dialog>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {gruposInvestigadorData && gruposInvestigadorData.length > 0 && (
                            <>
                                <Tabs defaultValue={gruposInvestigadorData[0]?.grupo || ''} className="w-full">
                                    <TabsList className="flex w-full flex-wrap gap-2">
                                    {gruposInvestigadorData.map((grupoData) => (
                                        <TabsTrigger key={grupoData.grupo_id} value={grupoData.grupo} className="flex-shrink-0">
                                            {grupoData.grupo.length > 20 ? grupoData.grupo.substring(0, 20) + '...' : grupoData.grupo}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                
                                {gruposInvestigadorData.map((grupoData, grupoIndex) => {
                                    // Validar que los datos existan
                                    if (!grupoData) return null;
                                    
                                    // Preparar datos para el gráfico de área
                                    const investigadoresArray = Array.isArray(grupoData.investigadores) 
                                        ? grupoData.investigadores 
                                        : grupoData.investigadores 
                                            ? Object.values(grupoData.investigadores)
                                            : [];
                                    
                                    const investigadoresArrayTyped = investigadoresArray as Array<{
                                        user_id: number;
                                        user_name: string;
                                        rendimiento_por_periodo: number[];
                                    }>;
                                    
                                    // Validar que periodos sea un array antes de usar .map()
                                    // Si es un objeto, convertirlo a array
                                    let periodosArray: string[] = [];
                                    if (Array.isArray(grupoData.periodos)) {
                                        periodosArray = grupoData.periodos;
                                    } else if (grupoData.periodos && typeof grupoData.periodos === 'object') {
                                        // Si es un objeto, convertirlo a array
                                        periodosArray = Object.values(grupoData.periodos);
                                    }
                                    
                                    // Si no hay investigadores ni períodos, mostrar gráfico vacío
                                    if (!periodosArray.length && investigadoresArrayTyped.length === 0) {
                                        return (
                                            <TabsContent key={grupoData.grupo} value={grupoData.grupo}>
                                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                                    Sin datos de rendimiento para este grupo
                                                </div>
                                            </TabsContent>
                                        );
                                    }
                                    
                                    // Usar los períodos directamente (ya vienen del backend)
                                    const periodosParaGrafico = periodosArray.length > 0 
                                        ? periodosArray 
                                        : ['Periodo 1', 'Periodo 2', 'Periodo 3']; // Fallback si no hay períodos
                                    
                                    const datosGrafico = periodosParaGrafico.map((periodo, index) => {
                                        const datosPeriodo: { periodo: string; [key: string]: string | number } = { periodo: periodo };
                                        
                                        if (Array.isArray(investigadoresArrayTyped)) {
                                            investigadoresArrayTyped.forEach((inv: { user_name: string; rendimiento_por_periodo: number[] }) => {
                                                datosPeriodo[inv.user_name] = (inv.rendimiento_por_periodo && inv.rendimiento_por_periodo[index]) ? inv.rendimiento_por_periodo[index] : 0;
                                            });
                                        }
                                        
                                        return datosPeriodo;
                                    });
                                    
                                    return (
                                        <TabsContent key={grupoData.grupo} value={grupoData.grupo}>
                                            <ResponsiveContainer width="100%" height={400}>
                                                <AreaChart data={datosGrafico}>
                                                    <defs>
                                                        {investigadoresArrayTyped.map((investigador: { user_name: string; rendimiento_por_periodo: number[] }, index: number) => {
                                                            const uniqueId = `fill-investigador-${grupoIndex}-${index}`;
                                                            return (
                                                            <linearGradient key={uniqueId} id={uniqueId} x1="0" y1="0" x2="0" y2="1">
                                                                <stop
                                                                    offset="5%"
                                                                    stopColor={coloresGrupos[index % coloresGrupos.length]}
                                                                    stopOpacity={0.8}
                                                                />
                                                                <stop
                                                                    offset="95%"
                                                                    stopColor={coloresGrupos[index % coloresGrupos.length]}
                                                                    stopOpacity={0.1}
                                                                />
                                                            </linearGradient>
                                                            );
                                                        })}
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="periodo" />
                                                    <YAxis domain={[0, 100]} />
                                                    <Tooltip />
                                                    {investigadoresArrayTyped.map((investigador: { user_name: string; rendimiento_por_periodo: number[] }, index: number) => {
                                                        const uniqueId = `fill-investigador-${grupoIndex}-${index}`;
                                                        return (
                                                        <Area
                                                            key={investigador.user_name || `area-${grupoIndex}-${index}`}
                                                            type="monotone"
                                                            dataKey={investigador.user_name}
                                                            stroke={coloresGrupos[index % coloresGrupos.length]}
                                                            fill={`url(#${uniqueId})`}
                                                            strokeWidth={2}
                                                            name={investigador.user_name}
                                                            dot={false}
                                                            activeDot={{ r: 4 }}
                                                        />
                                                        );
                                                    })}
                                                </AreaChart>
                                            </ResponsiveContainer>
                                            
                                            {/* Leyenda personalizada */}
                                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                                {investigadoresArrayTyped.map((investigador: { user_name: string; rendimiento_por_periodo: number[] }, index: number) => {
                                                    const promedioRendimiento = investigador.rendimiento_por_periodo && investigador.rendimiento_por_periodo.length > 0 
                                                        ? (investigador.rendimiento_por_periodo.reduce((a: number, b: number) => a + b, 0) / investigador.rendimiento_por_periodo.length).toFixed(1)
                                                        : '0';
                                                    return (
                                                        <div key={investigador.user_name} className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded-full" 
                                                                style={{ backgroundColor: coloresGrupos[index % coloresGrupos.length] }}
                                                            />
                                                            <span className="text-sm text-muted-foreground">
                                                                {investigador.user_name}: {promedioRendimiento}%
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </TabsContent>
                                    );
                                })}
                            </Tabs>
                        </>
                        )}
                    </CardContent>
                </Card>

                {/* Tablas de datos */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Investigadores con más planes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Investigadores con Más Planes</CardTitle>
                            <CardDescription>Ranking de investigadores por planes de trabajo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {investigadores_con_planes.slice(0, 5).map((investigador, index) => (
                                    <div key={investigador.id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center overflow-hidden">
                                                {index + 1}
                                            </Badge>
                                            {investigador.name}
                                        </div>
                                        <Badge variant="secondary">{investigador.planes_count} planes</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Distribución de estados */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribución de Estados</CardTitle>
                            <CardDescription>Estados actuales de los planes de trabajo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {distribucion_estados.map((estado, index) => (
                                    <div key={estado.estado} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
                                                {index + 1}
                                            </Badge>
                                            <span className="font-medium">{estado.estado}</span>
                                        </div>
                                        <Badge variant="secondary">{estado.cantidad} planes</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Planes de trabajo recientes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Planes de Trabajo Recientes</CardTitle>
                        <CardDescription>Últimos planes de trabajo creados en el sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {planes_recientes.map((plan) => (
                                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <h4 className="font-medium">{plan.nombre}</h4>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                            <span>Investigador: {plan.user.name}</span>
                                            <span>
                                                Períodos: {plan.periodo_inicio?.nombre ?? 'Sin período'}
                                                {plan.vigencia === 'Anual' && (
                                                    <> → {plan.periodo_fin?.nombre ?? 'Pendiente'}</>
                                                )}
                                            </span>
                                            <span>Vigencia: {plan.vigencia}</span>
                                            <span>Creado: {new Date(plan.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <Badge 
                                        variant={plan.estado === 'Aprobado' ? 'default' : 
                                                plan.estado === 'Pendiente' ? 'secondary' : 
                                                plan.estado === 'Terminado' ? 'outline' : 'destructive'}
                                    >
                                        {plan.estado}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}