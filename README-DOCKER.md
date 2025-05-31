# BPV - Sistema Dockerizado

Este proyecto está configurado para ser ejecutado con Docker y Docker Compose, lo que facilita su despliegue y ejecución en cualquier entorno.

## Requisitos previos

- Docker
- Docker Compose

## Estructura del proyecto

- `backend/`: Aplicación Spring Boot
- `frontend/`: Aplicación React/Vite
- `docker-compose.yml`: Configuración para orquestar todos los servicios

## Servicios

1. **Base de Datos (PostgreSQL)**
   - Puerto: 5432
   - Credenciales: Ver archivo `.env`

2. **Backend (Spring Boot)**
   - Puerto: 8080
   - API RESTful

3. **Frontend (React/Vite)**
   - Puerto: 80
   - Interfaz de usuario

## Instrucciones de uso

### Iniciar todos los servicios

```powershell
cd c:\proyectos\BPV
docker-compose up -d
```

### Ver logs de los servicios

```powershell
docker-compose logs -f
```

Para ver logs de un servicio específico:

```powershell
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Detener todos los servicios

```powershell
docker-compose down
```

### Reconstruir las imágenes (después de cambios)

```powershell
docker-compose up -d --build
```

## Acceso a la aplicación

- Frontend: http://localhost
- Backend API: http://localhost:8080
- Base de datos: localhost:5432

## Consideraciones para la impresora USB

La impresora USB conectada al equipo host no será accesible directamente desde los contenedores Docker. Para usar la impresora:

1. Utilice la Web Serial API desde el frontend para comunicarse con la impresora, como está implementado en `PrinterService.tsx`.
2. Esta funcionalidad seguirá dependiendo del navegador del cliente (Chrome/Edge) y no del contenedor Docker.

## Persistencia de datos

Los datos de PostgreSQL se guardan en un volumen Docker nombrado. Para eliminar completamente la base de datos, use:

```powershell
docker-compose down -v
```

## Solución de problemas

Si encuentra problemas al ejecutar los contenedores, puede verificar el estado con:

```powershell
docker-compose ps
```

Para ver los logs completos de un contenedor específico:

```powershell
docker logs bpv-backend
docker logs bpv-frontend
docker logs bpv-postgres
```
