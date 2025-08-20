@include('pdfs.config')
@include('pdfs.utilities')

<style>
    /* Márgenes de la página y espacio para el pie */
    @page {
        margin: 0.5cm 1cm 0 1cm;
    }
    
    body {
        font-family: Arial, sans-serif;
        font-size: var(--font-lg);
        line-height: 1.4;
        color: var(--text-primary);
        margin: 0;
        padding: 18px 0;
    }
    
    .header {
        text-align: center;
        border-bottom: var(--border-width-thick) solid var(--primary-color);
        padding-bottom: 10px;
        margin-bottom: var(--spacing-xl);
    }
    
    .header h1 {
        color: var(--primary-color);
        margin: 0;
        font-size: var(--font-5xl);
        font-weight: bold;
    }
    
    .header .subtitle {
        color: var(--text-secondary);
        margin: 5px 0 0 0;
        font-size: var(--font-lg);
    }
    
    .info-section {
        margin-bottom: var(--spacing-xl);
    }
    
    /* Tabla inicial de información */
    .info-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: var(--spacing-sm);
        font-size: var(--font-lg);
    }
    
    .info-table th {
        width: 30%;
        text-align: left;
        background-color: var(--bg-secondary);
        border: var(--border-width) solid var(--border-primary);
        padding: var(--spacing-sm);
        font-weight: bold;
        white-space: nowrap;
    }
    
    .info-table td {
        border: var(--border-width) solid var(--border-primary);
        padding: var(--spacing-sm);
    }
    
    .section h2 {
        color: var(--primary-color);
        border-bottom: var(--border-width) solid var(--border-primary);
        padding-bottom: 5px;
        margin-bottom: var(--spacing-lg);
        font-size: var(--font-lg);
    }
    
    /* Tabla principal de datos */
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: var(--spacing-xl);
        font-size: var(--font-lg);
    }
    
    .data-table th {
        background-color: var(--primary-color);
        color: white;
        padding: 7px 6px;
        text-align: left;
        font-weight: bold;
        border: var(--border-width) solid var(--primary-color);
    }
    
    .data-table td {
        padding: 6px 5px;
        border: var(--border-width) solid var(--border-primary);
        vertical-align: top;
        font-size: var(--font-lg);
    }
    
    .data-table tr:nth-child(even) {
        background-color: var(--bg-accent);
    }
    
    .total-row {
        background-color: var(--bg-secondary);
        font-weight: bold;
    }
    
    .total-row td {
        border-top: var(--border-width-thick) solid var(--primary-color);
    }
    
    .footer {
        position: fixed;
        bottom: 0.6cm;
        left: 0;
        right: 0;
        text-align: left;
        border-top: var(--border-width) solid var(--border-primary);
        padding-top: 10px;
        font-size: var(--font-sm);
        color: var(--text-secondary);
    }
    
    .page-break {
        page-break-before: always;
    }
    
    .clear {
        clear: both;
    }
    
    /* Estilos específicos para diferentes tipos de contenido */
    .text-cell {
        max-width: 0;
        word-wrap: break-word;
    }
    
    .center-text {
        text-align: center;
    }
    
    .bold-text {
        font-weight: bold;
    }
    
    .small-text {
        font-size: var(--font-sm);
    }
    
    .medium-text {
        font-size: var(--font-base);
    }
    
    .large-text {
        font-size: var(--font-xl);
    }
    
    /* Colores de estado */
    .status-pendiente {
        color: #f59e0b;
        font-weight: bold;
    }
    
    .status-aprobado {
        color: #10b981;
        font-weight: bold;
    }
    
    .status-rechazado {
        color: #ef4444;
        font-weight: bold;
    }
    
    .status-correccion {
        color: #8b5cf6;
        font-weight: bold;
    }
</style>
