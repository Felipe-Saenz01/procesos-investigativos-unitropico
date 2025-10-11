<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Plan de Trabajo - {{ $plan->nombre }}</title>
    @include('pdfs.styles')
</head>

<body>
    <div class="header">
        <h1>PLAN DE TRABAJO</h1>
        <!-- <div class="subtitle">Sistema de Investigación - Universidad</div> -->
    </div>

    <div class="info-section">
        <table class="info-table">
            <tbody>
                <tr>
                    <th>Nombre del Plan:</th>
                    <td>{{ $plan->nombre }}</td>
                </tr>
                <tr>
                    <th>Investigador:</th>
                    <td>{{ $plan->user->name }}</td>
                </tr>
                <tr>
                    <th>Vigencia:</th>
                    <td>{{ $plan->vigencia }}</td>
                </tr>
                <tr>
                    <th>Estado:</th>
                    <td>{{ $plan->estado }}</td>
                </tr>
                <tr>
                    <th>Fecha de Creación:</th>
                    <td>{{ \Carbon\Carbon::parse($plan->created_at)->format('d/m/Y') }}</td>
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
                    <th style="width: 5%;" class="center-text">Progreso</th>
                    <th style="width: 5%;" class="center-text">H/S</th>
                    <th style="width: 5%;" class="center-text">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($plan->actividades as $actividad)
                <tr>
                    <td class="bold-text">{{ $actividad->actividadInvestigacion->nombre }}</td>
                    <td class="text-cell">{{ $actividad->alcance }}</td>
                    <td class="text-cell">{{ $actividad->entregable }}</td>
                    <td class="center-text"><strong>{{ $actividad->porcentaje_progreso }}%</strong></td>
                    <td class="center-text">{{ $actividad->horas_semana }}</td>
                    <td class="center-text">{{ $actividad->total_horas }}</td>
                </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="5" style="text-align: right;"><strong>TOTAL HORAS:</strong></td>
                    <td class="center-text"><strong>{{ $plan->actividades->sum('total_horas') }}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    @if($plan->informes && $plan->informes->count() > 0)
    <div class="section">
        <h2>INFORMES DEL PLAN</h2>

        @foreach($plan->informes as $informe)
        <div class="subsection" style="margin-bottom: 10px;">
            <table class="info-table">
                <tbody>
                    <tr>
                        <th style="width: 20%">Período:</th>
                        <td style="width: 30%">{{ $informe->periodo->nombre ?? 'N/A' }}</td>
                        <th style="width: 20%">Fecha del Informe:</th>
                        <td style="width: 30%">{{ \Carbon\Carbon::parse($informe->created_at)->format('d/m/Y') }}</td>
                    </tr>
                </tbody>
            </table>

            @if($informe->evidencias && $informe->evidencias->count() > 0)
            <table class="data-table" style="margin-top: 6px;">
                <thead>
                    <tr>
                        <th style="width: 25%;">Actividad</th>
                        <th style="width: 15%;" class="center-text">Progreso</th>
                        <th style="width: 45%;">Observaciones</th>
                        <th style="width: 15%;" class="center-text">Evidencias</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($informe->evidencias as $evidencia)
                    <tr>
                        <td class="bold-text">{{ $evidencia->actividadPlan->actividadInvestigacion->nombre ?? 'Actividad N/A' }}</td>
                        <td class="center-text">
                            <div class="progress-change">
                                {{ $evidencia->porcentaje_progreso_anterior }}%
                                <img
                                    style="border-radius: solid 2px; margin-top: 10px; "
                                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDQwIDIwIiBmaWxsPSJibGFjayI+PHJlY3QgeD0iMiIgeT0iOSIgd2lkdGg9IjI4IiBoZWlnaHQ9IjIiIC8+PHBvbHlnb24gcG9pbnRzPSIzMCw2IDM4LDEwIDMwLDE0IiAvPjwvc3ZnPg=="
                                    width="25" height="19" />
                                {{ $evidencia->porcentaje_progreso_nuevo }}%
                            </div>
                        </td>
                        <td class="text-cell">{{ $evidencia->descripcion }}</td>
                        <td class="center-text">
                            @if($evidencia->ruta_archivo && $evidencia->url_link)
                            <div style="line-height: 1.2;">
                                <div style="margin-bottom: 2px;">
                                    <a href="{{ route('investigadores.planes-trabajo.informes.evidencias.descargar', [$plan->user->id, $plan->id, $informe->id, $evidencia->id]) }}" style="color: #0066cc; text-decoration: underline;">Archivo adjunto</a>
                                </div>
                                <div>
                                    <a href="{{ $evidencia->url_link }}" style="color: #0066cc; text-decoration: underline;" target="_blank">Enlace externo</a>
                                </div>
                            </div>
                            @elseif($evidencia->ruta_archivo)
                            <a href="{{ route('investigadores.planes-trabajo.informes.evidencias.descargar', [$plan->user->id, $plan->id, $informe->id, $evidencia->id]) }}" style="color: #0066cc; text-decoration: underline;">Archivo adjunto</a>
                            @elseif($evidencia->url_link)
                            <a href="{{ $evidencia->url_link }}" style="color: #0066cc; text-decoration: underline;" target="_blank">Enlace externo</a>
                            @else
                            <span style="font-size: 10px; color: #666;">Sin evidencias</span>
                            @endif
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @else
            <p class="text-muted" style="font-size: 12px; margin-top: 6px;">Este informe no registra evidencias.</p>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <div class="footer">
        <p>Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
        <!-- <p>Página <span class="pagenum"></span> de <span class="pagecount"></span></p> -->
    </div>
</body>

</html>