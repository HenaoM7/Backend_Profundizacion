# PlataformaIUSH Backend

## 📋 Descripción del Proyecto

Sistema backend para la plataforma IUSH desarrollado con Node.js y Express, siguiendo el patrón de arquitectura MVC (Modelo-Vista-Controlador). Este proyecto proporciona una estructura inicial escalable para el desarrollo de APIs REST.

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL
- **Documentación API**: Swagger/OpenAPI
- **Gestor de Procesos (Dev)**: Nodemon
- **Variables de Entorno**: Dotenv
- **CORS**: Habilitado

## 📁 Estructura del Proyecto

```
PlataformaIUSH/
├── src/
│   ├── app.js                    # Configuración principal de Express
│   ├── config/
│   │   └── swagger.js            # Configuración de Swagger/OpenAPI
│   ├── controllers/              # Controladores (lógica de negocio)
│   ├── database/                 # Configuración de base de datos
│   ├── middleware/
│   │   └── errorHandler.js       # Middleware de manejo de errores
│   ├── models/                   # Modelos de datos
│   ├── routes/                   # Definición de rutas API
│   └── views/                    # Formateo de respuestas
├── package.json                  # Dependencias del proyecto
├── package-lock.json             # Lock file de dependencias
├── README.md                      # Este archivo
└── server.js                      # Punto de entrada principal
```

## 🚀 Instalación y Configuración

### Requisitos Previos

- Node.js v18 o superior
- npm v9 o superior
- Git

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/plataformaiush/PlataformaIUSH-Backend.git
cd PlataformaIUSH-Backend
```

### Paso 2: Instalar Dependencias

Instalar las dependencias principales:

```bash
npm install express dotenv cors
```

Instalar las dependencias de desarrollo:

```bash
npm install --save-dev nodemon swagger-jsdoc swagger-ui-express
```

O instalar todas las dependencias simultáneamente:

```bash
npm install
npm install --save-dev nodemon swagger-jsdoc swagger-ui-express
```

### Paso 3: Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```bash
# .env
PORT=3000
NODE_ENV=development
```

### Paso 4: Ejecutar el Proyecto

**Modo Desarrollo** (con recarga automática):

```bash
npm run dev
```

**Modo Producción**:

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 Acceso a Documentación API

Una vez que el servidor esté ejecutándose, acceder a la documentación interactiva de Swagger en:

```
http://localhost:3000/api-docs
```

## 📦 Dependencias del Proyecto

### Dependencias Principales

| Paquete | Versión | Descripción |
|---------|---------|-------------|
| express | ^4.18.2 | Framework web para Node.js |
| dotenv | ^16.0.3 | Manejo de variables de entorno |
| cors | ^2.8.5 | Middleware CORS para Express |
| swagger-jsdoc | ^6.2.8 | Generación de especificación OpenAPI |
| swagger-ui-express | ^5.0.0 | Interfaz UI para Swagger |

### Dependencias de Desarrollo

| Paquete | Versión | Descripción |
|---------|---------|-------------|
| nodemon | ^3.0.1 | Monitoreo automático de cambios |

## 🔀 Flujo de Trabajo Git

### Estrategia de Ramas

- **main**: Rama de producción. Solo contiene versiones estables y liberadas.
- **develop**: Rama de desarrollo. Integración de features completadas.
- **feature/**: Ramas de características. Formato: `feature/nombre-funcionalidad`

### Procedimiento de Desarrollo

1. **Crear rama desde develop**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-funcionalidad
   ```

2. **Realizar cambios y commits**:
   ```bash
   git add .
   git commit -m "feat: descripción clara del cambio"
   ```

3. **Subir rama y crear Pull Request**:
   ```bash
   git push origin feature/nombre-funcionalidad
   ```
   - Crear Pull Request hacia `develop` en GitHub
   - Esperar revisión de código
   - Resolver conflictos si aplica

4. **Mergear a develop**:
   - Luego de aprobación, mergear a `develop`
   - Eliminar rama de feature

5. **Release a main**:
   ```bash
   git checkout main
   git merge develop
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin main --tags
   ```

## 🔧 Scripts Disponibles

En el archivo `package.json` están disponibles los siguientes scripts:

```bash
# Iniciar en modo desarrollo (recarga automática)
npm run dev

# Iniciar en modo producción
npm start
```

## 📝 Archivo package.json

```json
{
  "name": "plataforma-iush",
  "version": "1.0.0",
  "description": "Backend para PlataformaIUSH",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## 🏗️ Arquitectura MVC

Este proyecto implementa el patrón **Modelo-Vista-Controlador** (MVC):

- **Models**: Definen la estructura de datos y la lógica de negocio
- **Views**: Formatean las respuestas para presentar al cliente
- **Controllers**: Orquestan la lógica entre modelos y vistas
- **Routes**: Definen los endpoints de la API

## ✅ Checklist de Configuración Inicial

- [ ] Clonar repositorio
- [ ] Instalar dependencias: `npm install`
- [ ] Crear archivo `.env` con configuración
- [ ] Ejecutar en desarrollo: `npm run dev`
- [ ] Verificar servidor en `http://localhost:3000`
- [ ] Acceder a Swagger en `http://localhost:3000/api-docs`

---

**Última actualización**: Abril 2026