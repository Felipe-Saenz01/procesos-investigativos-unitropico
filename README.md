<h1 align="center" >Procesos Investigativos - Unitropico</h1></br>
<p align="center"><a href="https://unitropico.edu.co" target="_blank"><img src="https://i.postimg.cc/GtJMcSLD/LOGO-1024x601.png" width=50% alt="Unitropico Logo"></a><a href="https://laravel.com" target="_blank"><img width=50% src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg"  alt="Laravel Logo"></a></p></br>
<p>Este aplicativo está diseñado para realizar diferentes procesos del area de investigación, principalmente el registro y seguimiento de productos investigativos de la <strong>Universidad Internacional del Trópico Americano</strong> , incluyendo funcionalidades correspondientes al registro y administracion de Proyectos de Investigación, Grupos de Investigación, Productos de Investigación y las respectivas entregas</p>

## Requisitos

El aplicativo está desarrollado usando el framework de php Laravel en su versión 12, cuyos requisitos mínimos son:
- PHP >= 8.2
- Composer
- MySQL
- Node

## Instalación

1. Clonar repositorio:
```Git
git clone git@github.com:Felipe-Saenz01/procesos-investigativos-unitropico.git
cd procesos-investigativos-unitropico
```

2. Instalar dependencias de composer:
```
composer install
```

3. Instalar dependencias de node:
```
npm install
```

4. crear archivo .env y .env.example para la configuración del proyecto:
```
cp .env.example .env
```

5. Generar clave para la aplicacion:
```
php artisan key:generate
```

6. Migrar bases de datos. (es necesario incluir datos correspondientes de la base de datos en el archivo .env):
```
php artisan migrate
```

7. Inciar servidor local:
```
composer run dev
```