# BIOPETS

Este proyecto contiene una aplicación .NET MAUI y una API REST desarrollada con Node.js.

## Ejecutar la API

1. Instalar las dependencias:
   ```bash
   cd API
   npm install
   ```
2. Iniciar el servidor:
   ```bash
   npm start
   ```
   El servidor se iniciará en `http://localhost:3000` por defecto.

## Configurar la aplicación MAUI

La aplicación lee la URL base de la API desde `appsettings.json` o a través de la variable de entorno `BASE_URL`.

Ejemplo de `appsettings.json`:

```json
{
    "BaseUrl": "http://localhost:3000"
}
```

Asegúrese de que la API se esté ejecutando y que la URL coincida con la configurada en la aplicación.