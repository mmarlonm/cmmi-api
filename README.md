# CMMI5 Metrics Versioning API

Esta es la API en Node.js (Express) para gestionar las versiones e historial de los análisis de métricas e IA del proyecto Bepensa.

## Instalación y Configuración Local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar servidor en desarrollo:
   ```bash
   node server.js
   ```

## Endpoints Disponibles

* `POST /api/analysis`: Guarda un nuevo análisis (crea versiones incrementalmente).
* `GET /api/analysis/sprint/:sprintId`: Obtiene el último análisis activo de un sprint.
* `GET /api/analysis/sprint/:sprintId/versions`: Obtiene el listado de todas las versiones guardadas de un sprint.
* `GET /api/analysis/version/:sprintId/:versionNum`: Carga una versión específica.
* `POST /api/analysis/restore/:id`: Restaura una versión anterior como activa.
