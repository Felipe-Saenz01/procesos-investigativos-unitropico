<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Listado de Investigadores</title>
    @include('pdfs.styles')
</head>
<body>
    <div class="header">
        <h1>LISTADO DE INVESTIGADORES</h1>
        <!-- <div class="subtitle">Sistema de Investigación - Universidad</div> -->
    </div>
    
    <div class="info-section">
        <table class="info-table">
            <tbody>
                <tr>
                    <th>Generado por:</th>
                    <td>{{ $user->name }}</td>
                </tr>
                <tr>
                    <th>Fecha de Generación:</th>
                    <td>{{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</td>
                </tr>
                <tr>
                    <th>Total de Investigadores:</th>
                    <td>{{ $investigadores->count() }}</td>
                </tr>
                @if($user->hasRole('Lider Grupo'))
                <tr>
                    <th>Grupo de Investigación:</th>
                    <td>{{ $user->grupo_investigacion->nombre ?? 'No asignado' }}</td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>INVESTIGADORES</h2>
        
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 25%;">Nombre</th>
                    <th style="width: 20%;">Correo</th>
                    <th style="width: 10%;">Tipo</th>
                    <th style="width: 15%;">Grupo Investigación</th>
                    <th style="width: 15%;">Escalafón</th>
                    <th style="width: 20%;">Tipo Contrato</th>
                </tr>
            </thead>
            <tbody>
                @foreach($investigadores as $investigador)
                <tr>
                    <td class="bold-text">{{ $investigador->name }}</td>
                    <td>{{ $investigador->email }}</td>
                    <td>{{ $investigador->tipo }}</td>
                    <td>{{ $investigador->grupo_investigacion->nombre ?? 'No asignado' }}</td>
                    <td>{{ $investigador->escalafon_profesoral->nombre ?? 'No asignado' }}</td>
                    <td>{{ $investigador->tipoContrato->nombre ?? 'No asignado' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    
    <div class="footer">
        <p>Documento generado el {{ \Carbon\Carbon::now()->format('d/m/Y H:i:s') }}</p>
        <!-- <p>Página <span class="pagenum"></span> de <span class="pagecount"></span></p> -->
    </div>
</body>
</html>
