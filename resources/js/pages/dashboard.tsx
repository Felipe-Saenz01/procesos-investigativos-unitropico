import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, FileText, TrendingUp, BookOpen, Calendar, Clock } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

// Datos estáticos para las gráficas
const avancesPorMes = [
    { mes: 'Ene', proyectado: 75, conseguido: 68 },
    { mes: 'Feb', proyectado: 80, conseguido: 72 },
    { mes: 'Mar', proyectado: 85, conseguido: 78 },
    { mes: 'Abr', proyectado: 90, conseguido: 85 },
    { mes: 'May', proyectado: 95, conseguido: 88 },
    { mes: 'Jun', proyectado: 100, conseguido: 92 },
];

const investigadoresPorGrupo = [
    { grupo: 'Grupo A', investigadores: 15 },
    { grupo: 'Grupo B', investigadores: 12 },
    { grupo: 'Grupo C', investigadores: 18 },
    { grupo: 'Grupo D', investigadores: 10 },
    { grupo: 'Grupo E', investigadores: 14 },
];

const productosPorTipo = [
    { name: 'Artículos', value: 45, color: '#8884d8' },
    { name: 'Libros', value: 20, color: '#82ca9d' },
    { name: 'Capítulos', value: 15, color: '#ffc658' },
    { name: 'Patentes', value: 10, color: '#ff7300' },
    { name: 'Software', value: 10, color: '#00ff00' },
];

const progresoInvestigacion = [
    { periodo: '2023-Q1', progreso: 65 },
    { periodo: '2023-Q2', progreso: 72 },
    { periodo: '2023-Q3', progreso: 78 },
    { periodo: '2023-Q4', progreso: 85 },
    { periodo: '2024-Q1', progreso: 88 },
    { periodo: '2024-Q2', progreso: 92 },
];

const chartConfig = {
    proyectado: {
        label: "Avance Proyectado (%)",
        color: "hsl(var(--chart-1))",
    },
    conseguido: {
        label: "Avance Conseguido (%)",
        color: "hsl(var(--chart-2))",
    },
    investigadores: {
        label: "Investigadores",
        color: "hsl(var(--chart-3))",
    },
    progreso: {
        label: "Progreso (%)",
        color: "hsl(var(--chart-4))",
    },
};

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Tarjetas de resumen */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                                Total Investigadores
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">127</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Productos Investigativos
                            </CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">45</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Convocatorias Abiertas
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Horas de Investigación
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1247</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficas principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Gráfica circular - Productos por tipo */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Productos por Tipo</CardTitle>
                            <CardDescription>
                                Distribución porcentual de productos investigativos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig}>
                                <PieChart>
                                    <Pie
                                        data={productosPorTipo}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {productosPorTipo.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Gráfica de barras - Avances proyectados vs conseguidos */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Avances Proyectados vs Conseguidos</CardTitle>
                            <CardDescription>
                                Comparación mensual entre avances planificados y logros reales
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <ChartContainer config={chartConfig}>
                                <BarChart data={avancesPorMes}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="proyectado" fill="var(--color-proyectado)" />
                                    <Bar dataKey="conseguido" fill="var(--color-conseguido)" />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Segunda fila de gráficas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Gráfica de líneas - Investigadores por grupo */}
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Investigadores por Grupo</CardTitle>
                            <CardDescription>
                                Distribución de investigadores en cada grupo de investigación
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig}>
                                <LineChart data={investigadoresPorGrupo}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="grupo" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="investigadores" 
                                        stroke="var(--color-investigadores)" 
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Gráfica de área - Progreso de investigación */}
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Progreso de Investigación</CardTitle>
                            <CardDescription>
                                Evolución del progreso general por trimestre
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig}>
                                <AreaChart data={progresoInvestigacion}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="periodo" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="progreso" 
                                        stroke="var(--color-progreso)" 
                                        fill="var(--color-progreso)" 
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Convocatorias Abiertas
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Postulaciones Pendientes
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Horas de Investigación
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1,247</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
