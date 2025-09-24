<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Informe de Plan de Trabajo - {{ $planTrabajo->nombre }}</title>
    @include('pdfs.styles')
</head>
<body>
    <div class="header">
        <h1>INFORME DE PLAN DE TRABAJO</h1>
        <!-- <div class="subtitle">Sistema de Investigación - Universidad</div> -->
    </div>
    
    <div class="info-section">
        <table class="info-table">
            <tbody>
                <tr>
                    <th>Nombre del Plan:</th>
                    <td>{{ $planTrabajo->nombre }}</td>
                </tr>
                <tr>
                    <th>Investigador:</th>
                    <td>{{ $investigador->name }}</td>
                </tr>
                <tr>
                    <th>Período:</th>
                    <td>{{ $informe->periodo->nombre ?? 'N/A' }}</td>
                </tr>
                <tr>
                    <th>Vigencia:</th>
                    <td>{{ $planTrabajo->vigencia }}</td>
                </tr>
                <tr>
                    <th>Fecha del Informe:</th>
                    <td>{{ $informe->created_at->format('d/m/Y') }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    
    <div class="section">
        <h2>ACTIVIDADES DEL PLAN</h2>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 20%;">Actividad</th>
                    <th style="width: 35%;">Alcance</th>
                    <th style="width: 35%;">Entregable</th>
                    <th style="width: 10%;">Progreso</th>
                </tr>
            </thead>
            <tbody>
                @foreach($actividades as $actividad)
                <tr>
                    <td class="bold-text">{{ $actividad->actividadInvestigacion->nombre ?? 'N/A' }}</td>
                    <td class="text-cell">{{ $actividad->alcance }}</td>
                    <td class="text-cell">{{ $actividad->entregable }}</td>
                    <td class="text-cell">{{ $actividad->porcentaje_progreso }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    
    @if($evidencias && count($evidencias) > 0)
    <div class="section">
        <h2>EVIDENCIAS PRESENTADAS EN ESTE INFORME</h2>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 25%;">Actividad</th>
                    <th style="width: 15%;" class="center-text">Progreso</th>
                    <th style="width: 45%;">Observaciones</th>
                    <th style="width: 15%;" class="center-text">Evidencias</th>
                </tr>
            </thead>
            <tbody>
                @foreach($evidencias as $evidencia)
                <tr>
                    <td class="bold-text">{{ $evidencia->actividadPlan->actividadInvestigacion->nombre ?? 'Actividad N/A' }}</td>
                    <td class="center-text">
                        <div class="progress-change">
                            {{ $evidencia->porcentaje_progreso_anterior }}%
                            <img
                                style="border-radius: solid 2px; "
                                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDQwIDIwIiBmaWxsPSJibGFjayI+PHJlY3QgeD0iMiIgeT0iOSIgd2lkdGg9IjI4IiBoZWlnaHQ9IjIiIC8+PHBvbHlnb24gcG9pbnRzPSIzMCw2IDM4LDEwIDMwLDE0IiAvPjwvc3ZnPg==" 
                                width="25" height="19" 
                            />



                            {{ $evidencia->porcentaje_progreso_nuevo }}%
                        </div>
                    </td>
                    <td class="text-cell">{{ $evidencia->descripcion }}</td>
                    <td class="center-text">
                        @if($evidencia->ruta_archivo && $evidencia->url_link)
                            Se entregó un archivo y enlace
                        @elseif($evidencia->ruta_archivo)
                            Se entregó un archivo
                        @elseif($evidencia->url_link)
                            Se entregó un enlace
                        @else
                            Sin evidencias
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif
    
    <div class="footer">
        <p>Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
        <!-- <p>Página <span class="pagenum"></span> de <span class="pagecount"></span></p> -->
    </div>
</body>
</html>
