# Excel Processor Service

Servicio de procesamiento de archivos Excel con arquitectura limpia (Clean Architecture) y capacidad de procesamiento asíncrono.

## 🚀 Estado Actual del Proyecto

### Implementado

- ✅ Estructura base del proyecto siguiendo Clean Architecture
- ✅ Configuración inicial del servidor Express
- ✅ Conexión con MongoDB
- ✅ Modelo de datos para tareas de procesamiento
- ✅ Endpoint de salud (/health)
- ✅ Sistema básico de subida de archivos
- ✅ Repositorio de tareas
- ✅ Controlador básico para Excel

### En Desarrollo

- 🔄 Procesador de Excel con validaciones avanzadas
- 🔄 Sistema de caché para optimización
- 🔄 Manejo de múltiples hojas de Excel
- 🔄 Validaciones de tipos de datos extendidas

### Pendiente

- ⏳ Implementación del sistema de colas
- ⏳ Sistema de reportes de errores paginado
- ⏳ Optimizaciones de performance para grandes volúmenes
- ⏳ Tests unitarios y de integración
- ⏳ Documentación de API
- ⏳ Sistema de logs

## 📁 Estructura del Proyecto

```
excel-processor-service/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   └── value-objects/
│   ├── application/
│   │   ├── use-cases/
│   │   └── interfaces/
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   └── mongodb/
│   │   │       ├── models/
│   │   │       └── repositories/
│   │   └── excel/
│   ├── interfaces/
│   │   └── http/
│   │       ├── controllers/
│   │       ├── middlewares/
│   │       └── routes/
│   └── config/
└── tests/
    ├── unit/
    └── integration/
```

## 🛠 Requisitos

- Node.js v20.17.0 o superior
- MongoDB
- npm

## 📦 Dependencias Principales

```json
{
  "express": "Para el servidor HTTP",
  "mongoose": "Para la conexión con MongoDB",
  "multer": "Para el manejo de archivos",
  "xlsx": "Para el procesamiento de Excel",
  "node-cache": "Para el sistema de caché"
}
```

## 🚀 Instalación

1. Clonar el repositorio

```bash
git clone [url-del-repositorio]
cd excel-processor-service
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar el servidor

```bash
npm run dev
```

## 📌 Endpoints Disponibles

### Salud del Servidor

```
GET /health
```

### Procesamiento de Excel

```
POST /api/excel/upload
GET /api/excel/tasks/{taskId}/status
GET /api/excel/tasks/{taskId}/errors
```

## 🎯 Próximos Pasos

1. Completar la implementación del procesador de Excel con:

   - Validaciones avanzadas de tipos de datos
   - Soporte para múltiples hojas
   - Sistema de caché
   - Manejo de errores detallado

2. Implementar sistema de colas para procesamiento asíncrono

3. Desarrollar sistema de reportes con:

   - Paginación de errores
   - Estadísticas de procesamiento
   - Logs detallados

4. Agregar tests:

   - Unitarios para servicios y utilidades
   - Integración para endpoints
   - Performance para grandes volúmenes

5. Documentación:
   - API con Swagger/OpenAPI
   - Guía de desarrollo
   - Manual de despliegue

## 🧪 Testing

(Por implementar)

```bash
# Correr tests unitarios
npm run test:unit

# Correr tests de integración
npm run test:integration

# Correr todos los tests
npm test
```

## 📈 Performance

El servicio está diseñado para manejar:

- Archivos Excel de hasta 200,000 líneas
- Campos con hasta 5,000 números
- Procesamiento concurrente de múltiples archivos

## 📝 Licencia

[Tu licencia aquí]
