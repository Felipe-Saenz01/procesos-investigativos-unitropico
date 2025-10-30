<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rendimiento de Grupo - {{ $grupo->nombre }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10pt;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
        }
        .title {
            font-size: 18pt;
            font-weight: bold;
            color: #1a202c;
        }
        .subtitle {
            font-size: 12pt;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #4a5568;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .periodo-header {
            text-align: center;
            font-weight: bold;
            background-color: #edf2f7;
        }
        .rendimiento-cell {
            text-align: center;
            font-weight: bold;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 8pt;
            color: #666;
        }
        .no-data {
            text-align: center;
            color: #999;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">{{ $grupo->nombre }}</div>
        <div class="subtitle">Informe de Rendimiento por Investigador</div>
    </div>

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
            @forelse($investigadores as $investigador)
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
            @empty
                <tr>
                    <td colspan="{{ count($periodos) + 1 }}" class="no-data">
                        No hay investigadores con datos de rendimiento
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Generado el {{ $fecha_generacion }}
    </div>
</body>
</html>
