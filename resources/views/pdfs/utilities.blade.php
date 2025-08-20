{{-- Utilidades CSS para PDFs --}}
<style>
    /* Utilidades de texto */
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .text-justify { text-align: justify; }
    
    .font-bold { font-weight: bold; }
    .font-normal { font-weight: normal; }
    .font-light { font-weight: 300; }
    
    .text-xs { font-size: var(--font-xs); }
    .text-sm { font-size: var(--font-sm); }
    .text-base { font-size: var(--font-base); }
    .text-lg { font-size: var(--font-lg); }
    .text-xl { font-size: var(--font-xl); }
    .text-2xl { font-size: var(--font-2xl); }
    .text-3xl { font-size: var(--font-3xl); }
    .text-4xl { font-size: var(--font-4xl); }
    .text-5xl { font-size: var(--font-5xl); }
    
    /* Utilidades de espaciado */
    .p-xs { padding: var(--spacing-xs); }
    .p-sm { padding: var(--spacing-sm); }
    .p-md { padding: var(--spacing-md); }
    .p-lg { padding: var(--spacing-lg); }
    .p-xl { padding: var(--spacing-xl); }
    
    .px-xs { padding-left: var(--spacing-xs); padding-right: var(--spacing-xs); }
    .px-sm { padding-left: var(--spacing-sm); padding-right: var(--spacing-sm); }
    .px-md { padding-left: var(--spacing-md); padding-right: var(--spacing-md); }
    .px-lg { padding-left: var(--spacing-lg); padding-right: var(--spacing-lg); }
    .px-xl { padding-left: var(--spacing-xl); padding-right: var(--spacing-xl); }
    
    .py-xs { padding-top: var(--spacing-xs); padding-bottom: var(--spacing-xs); }
    .py-sm { padding-top: var(--spacing-sm); padding-bottom: var(--spacing-sm); }
    .py-md { padding-top: var(--spacing-md); padding-bottom: var(--spacing-md); }
    .py-lg { padding-top: var(--spacing-lg); padding-bottom: var(--spacing-lg); }
    .py-xl { padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl); }
    
    .m-xs { margin: var(--spacing-xs); }
    .m-sm { margin: var(--spacing-sm); }
    .m-md { margin: var(--spacing-md); }
    .m-lg { margin: var(--spacing-lg); }
    .m-xl { margin: var(--spacing-xl); }
    
    .mb-xs { margin-bottom: var(--spacing-xs); }
    .mb-sm { margin-bottom: var(--spacing-sm); }
    .mb-md { margin-bottom: var(--spacing-md); }
    .mb-lg { margin-bottom: var(--spacing-lg); }
    .mb-xl { margin-bottom: var(--spacing-xl); }
    
    /* Utilidades de color */
    .text-primary { color: var(--primary-color); }
    .text-secondary { color: var(--text-secondary); }
    .text-muted { color: var(--text-muted); }
    
    .bg-primary { background-color: var(--primary-color); }
    .bg-secondary { background-color: var(--bg-secondary); }
    .bg-accent { background-color: var(--bg-accent); }
    
    /* Utilidades de bordes */
    .border { border: var(--border-width) solid var(--border-primary); }
    .border-t { border-top: var(--border-width) solid var(--border-primary); }
    .border-b { border-bottom: var(--border-width) solid var(--border-primary); }
    .border-l { border-left: var(--border-width) solid var(--border-primary); }
    .border-r { border-right: var(--border-width) solid var(--border-primary); }
    
    .border-thick { border-width: var(--border-width-thick); }
    
    /* Utilidades de estado */
    .status-pendiente { color: var(--status-pendiente); font-weight: bold; }
    .status-aprobado { color: var(--status-aprobado); font-weight: bold; }
    .status-rechazado { color: var(--status-rechazado); font-weight: bold; }
    .status-correccion { color: var(--status-correccion); font-weight: bold; }
    .status-creado { color: var(--status-creado); font-weight: bold; }
    
    /* Utilidades de layout */
    .w-full { width: 100%; }
    .w-auto { width: auto; }
    
    .h-full { height: 100%; }
    .h-auto { height: auto; }
    
    /* Utilidades de tabla */
    .table-auto { table-layout: auto; }
    .table-fixed { table-layout: fixed; }
    
    .align-top { vertical-align: top; }
    .align-middle { vertical-align: middle; }
    .align-bottom { vertical-align: bottom; }
    
    /* Utilidades de texto */
    .break-words { word-wrap: break-word; }
    .whitespace-normal { white-space: normal; }
    .whitespace-nowrap { white-space: nowrap; }
</style>
