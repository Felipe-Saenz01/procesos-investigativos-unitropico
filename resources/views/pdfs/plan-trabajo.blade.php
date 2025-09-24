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
    
    <div class="footer">
        <p>Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
        <!-- <p>Página <span class="pagenum"></span> de <span class="pagecount"></span></p> -->
    </div>
</body>
</html>
