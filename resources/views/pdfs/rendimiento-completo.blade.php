<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Informe de Rendimiento - Todos los Grupos</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9pt;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .page-header {
            text-align: center;
            border-bottom: 3px solid #1a202c;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .main-title {
            font-size: 20pt;
            font-weight: bold;
            color: #1a202c;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 12pt;
            color: #666;
        }
        .grupo-section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .grupo-header {
            background-color: #4a5568;
            color: white;
            padding: 10px;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
            font-size: 8pt;
        }
        th {
            background-color: #edf2f7;
            color: #1a202c;
            font-weight: bold;
        }
        .periodo-header {
            text-align: center;
            font-weight: bold;
        }
        .rendimiento-cell {
            text-align: center;
            font-weight: bold;
        }
        .no-data {
            text-align: center;
            color: #999;
            font-style: italic;
        }
        .footer {
            margin-top: 40px;
            padding-top: 10px;
            border-top: 2px solid #ddd;
            text-align: center;
            font-size: 8pt;
            color: #666;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="page-header">
        <div class="main-title">Informe de Rendimiento por Grupos de Investigación</div>
        <div class="subtitle">Sistema de Gestión de Planes de Trabajo</div>
    </div>

    @foreach($grupos as $index => $grupoData)
        @if($index > 0 && $index % 2 == 0)
            <div class="page-break"></div>
        @endif

        <div class="grupo-section">
            <div class="grupo-header">
                {{ $grupoData['grupo']->nombre }}
            </div>

            @if(count($grupoData['investigadores']) > 0)
                <table>
                    <thead>
                        <tr>
                            <th>Investigador</th>
                            @foreach($periodos as $periodo)
                                <th class="periodo-header">{{ $periodo }}</th>
                            @endforeach
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($grupoData['investigadores'] as $investigador)
                            <tr>
                                <td><strong>{{ $investigador['nombre'] }}</strong></td>
                                @foreach($investigador['rendimiento_por_periodo'] as $rendimiento)
                                    <td class="rendimiento-cell">
                                        @if($rendimiento > 0)
                                            {{ number_format($rendimiento, 2) }}%
                                        @else
                                            <span class="no-data">-</span>
                                        @endif
                                    </td>
                                @endforeach
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="no-data" style="padding: 20px;">
                    No hay investigadores con datos de rendimiento en este grupo
                </div>
            @endif
        </div>
    @endforeach

    <div class="footer">
        Generado el {{ $fecha_generacion }} - Sistema de Gestión de Investigación
    </div>
</body>
</html>
