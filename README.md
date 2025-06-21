# Dovakin - Aplicación de Planificación de Comidas

Esta es una aplicación full-stack para la planificación de comidas, gestión de recetas e ingredientes, y generación de listas de la compra.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

-   `backend/`: (Directorio raíz del proyecto) Un servidor Node.js/Express que maneja la lógica de negocio y la API.
-   `frontend/`: Una aplicación de React creada con Vite que consume la API del backend.

## Requisitos Previos

-   [Node.js](https://nodejs.org/) (versión 16 o superior recomendada)
-   `npm` (normalmente se instala con Node.js)

## Instalación

Sigue estos pasos para configurar el entorno de desarrollo local.

### 1. Configurar el Backend

Desde el directorio raíz del proyecto (`Dovakin/`):

```bash
# Instalar las dependencias del backend
npm install
```

### 2. Configurar el Frontend

Navega al directorio del frontend y, una vez allí, instala sus dependencias:

```bash
# Ir a la carpeta del frontend
cd frontend

# Instalar las dependencias del frontend
npm install
```

## Ejecución

Para ejecutar la aplicación, ahora solo necesitas **una terminal**.

Desde el **directorio raíz** del proyecto, ejecuta el siguiente comando:

```bash
npm run dev
```

Este comando hará lo siguiente:
1.  Iniciará el servidor del backend (`node src/app.js`).
2.  Iniciará el servidor de desarrollo del frontend (`vite`).
3.  Mostrará la salida de ambos procesos en la misma terminal.

La aplicación de React se abrirá automáticamente en tu navegador, generalmente en `http://localhost:5173`.

Para detener ambos servidores, simplemente presiona `Ctrl + C` en la terminal.

---

## Despliegue en Render

Esta aplicación está preparada para ser desplegada como un **Servicio Web** en [Render](https://render.com/).

Sigue estos pasos para desplegarla:

1.  **Crea una cuenta en Render** y conecta tu repositorio de GitHub.
2.  **Crea un nuevo "Web Service"** y selecciona tu repositorio.
3.  **Configura el servicio** con los siguientes valores:
    -   **Entorno (Environment)**: `Node`
    -   **Comando de Build (Build Command)**: `npm run build`
    -   **Comando de Inicio (Start Command)**: `npm start`

4.  ¡Haz clic en "Create Web Service" y espera a que el despliegue finalice!

### Nota sobre la Base de Datos

Este proyecto utiliza **SQLite** como base de datos. En plataformas como Render, el sistema de archivos es efímero, lo que significa que **la base de datos se reiniciará con cada despliegue**.

Para una solución persistente, se recomienda migrar a un servicio de base de datos como **PostgreSQL**, que Render ofrece.

¡Y eso es todo! Ahora deberías poder usar la aplicación localmente. 