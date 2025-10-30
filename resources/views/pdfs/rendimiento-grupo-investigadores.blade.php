<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Informe de Grupo de Investigación - {{ $grupo->nombre }}</title>
    @include('pdfs.config')
    @include('pdfs.utilities')
    @include('pdfs.styles')
</head>
<body>
    <div class="header">
        <h1>INFORME DE GRUPO DE INVESTIGACIÓN</h1>
        <div class="subtitle">{{ $grupo->nombre }}</div>
    </div>
    
    <div class="info-section">
        <table class="info-table">
            <tbody>
                <tr>
                    <th>Nombre del Grupo:</th>
                    <td>{{ $grupo->nombre }}</td>
                </tr>
                <tr>
                    <th>Investigadores:</th>
                    <td>{{ count($investigadores) }}</td>
                </tr>
                <tr>
                    <th>Fecha del Informe:</th>
                    <td>{{ $fecha_generacion }}</td>
                </tr>
            </tbody>
        </table>
    </div>
    
    @foreach($investigadores as $index => $investigadorData)
        @if($index > 0)
            <div class="page-break"></div>
        @endif
        
        <div class="section">
            <h2>INVESTIGADOR: {{ $investigadorData['investigador']->name }}</h2>
        </div>
        
        @foreach($investigadorData['planes_con_informes'] as $planData)
            <div class="section">
                <h3 class="text-primary border-b" style="padding-bottom: 5px; margin-bottom: 15px;">
                    PLAN DE TRABAJO: {{ $planData['plan']->nombre }}
                </h3>
                
                <table class="info-table">
                    <tbody>
                        <tr>
                            <th>Período:</th>
                            <td>{{ $planData['plan']->periodo->nombre ?? 'N/A' }}</td>
                        </tr>
                        <tr>
                            <th>Vigencia:</th>
                            <td>{{ $planData['plan']->vigencia }}</td>
                        </tr>
                        <tr>
                            <th>Fecha del Informe:</th>
                            <td>{{ $planData['informe']->created_at->format('d/m/Y') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            @if($planData['evidencias']->count() > 0)
            <div class="section">
                <h2>EVIDENCIAS PRESENTADAS</h2>
                
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
                        @foreach($planData['evidencias'] as $evidencia)
                        <tr>
                            <td class="bold-text">{{ $evidencia->actividadPlan->actividadInvestigacion->nombre ?? 'Actividad N/A' }}</td>
                            <td class="center-text">
                                <div class="progress-change">
                                    {{ $evidencia->porcentaje_progreso_anterior }}%
                                    <img
                                        style="border-radius: solid 2px;"
                                        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDQwIDIwIiBmaWxsPSJibGFjayI+PHJlY3QgeD0iMiIgeT0iOSIgd2lkdGg9IjI4IiBoZWlnaHQ9IjIiIC8+PHBvbHlnb24gcG9pbnRzPSIzMCw2IDM4LDEwIDMwLDE0IiAvPjwvc3ZnPg==" 
                                        width="25" height="19"
                                    />
                                    {{ $evidencia->porcentaje_progreso_nuevo }}%
                                </div>
                            </td>
                            <td class="text-cell">{{ $evidencia->descripcion }}</td>
                            <td class="center-text">
                                @if($evidencia->ruta_archivo && $evidencia->url_link)
                                    <div style="line-height: 1.2;">
                                        <div style="margin-bottom: 2px;">
                                            <a href="{{ route('investigadores.planes-trabajo.informes.evidencias.descargar', [$planData['informe']->investigador_id, $planData['plan']->id, $planData['informe']->id, $evidencia->id]) }}" style="color: #0066cc; text-decoration: underline;">
                                                Archivo adjunto
                                            </a>
                                        </div>
                                        <div>
                                            <a href="{{ $evidencia->url_link }}" style="color: #0066cc; text-decoration: underline;" target="_blank">
                                                Enlace externo
                                            </a>
                                        </div>
                                    </div>
                                @elseif($evidencia->ruta_archivo)
                                    <a href="{{ route('investigadores.planes-trabajo.informes.evidencias.descargar', [$planData['informe']->investigador_id, $planData['plan']->id, $planData['informe']->id, $evidencia->id]) }}" style="color: #0066cc; text-decoration: underline;">
                                        Archivo adjunto
                                    </a>
                                @elseif($evidencia->url_link)
                                    <a href="{{ $evidencia->url_link }}" style="color: #0066cc; text-decoration: underline;" target="_blank">
                                        Enlace externo
                                    </a>
                                @else
                                    <span style="font-size: 10px; color: #666;">Sin evidencias</span>
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @endif
        @endforeach
    @endforeach
    
    @if(count($investigadores) == 0)
    <div class="section">
        <p style="text-align: center; color: #666; font-style: italic;">
            No hay investigadores con planes de trabajo e informes en este grupo.
        </p>
    </div>
    @endif
    
    <div class="footer">
        <p>Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>
