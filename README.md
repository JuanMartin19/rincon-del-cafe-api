# Rincón del Café — API

Backend REST que sirve **tanto** al sitio web (React) **como** al widget wearable (Flutter).

## 1. Requisitos previos

- Node.js 18+ instalado
- PostgreSQL instalado y corriendo localmente

## 2. Crear la base de datos

Abre `psql` (o pgAdmin) y crea la base de datos vacía:

```sql
CREATE DATABASE rincon_del_cafe;
```

Luego carga el esquema y los datos de ejemplo:

```
psql -U postgres -d rincon_del_cafe -f db/schema.sql
```

## 3. Configurar variables de entorno

```
cp .env.example .env
```

Edita `.env` y ajusta `DATABASE_URL` con tu usuario/contraseña reales de PostgreSQL, y cambia `JWT_SECRET` por cualquier cadena larga y aleatoria.

## 4. Instalar dependencias y correr

```
npm install
npm run dev
```

Deberías ver:

```
Rincón del Café API corriendo en http://localhost:4000
```

Prueba rápida en el navegador: abre `http://localhost:4000` y deberías ver `{"status":"ok", ...}`.

## 5. Endpoints disponibles

| Método | Ruta                        | Descripción                                  | Usado por  |
|--------|-----------------------------|-----------------------------------------------|------------|
| POST   | `/api/auth/register`        | Crear cuenta (`nombre, email, password`)      | Web        |
| POST   | `/api/auth/login`           | Login con contraseña (`email, password`)      | Web        |
| POST   | `/api/auth/login-pin`       | Login con PIN de 4 dígitos (`email, pin`)      | Wearable   |
| PUT    | `/api/auth/pin`             | Configurar el PIN (requiere token)            | Web        |
| GET    | `/api/productos`            | Listar productos (`?category=Caliente`)       | Web        |
| GET    | `/api/productos/destacados` | Solo los productos marcados como destacados   | Wearable   |
| POST   | `/api/contacto`             | Enviar mensaje de contacto                    | Web        |

## 6. Conectar el sitio web (React)

En tu proyecto React, define la URL base del API (por ejemplo en un archivo `src/config.js`):

```js
export const API_URL = "http://localhost:4000/api";
```

Y reemplaza los `mockProducts`, el `alert('Ingreso exitoso')` de `Login.jsx`, etc. por llamadas `fetch` reales a estos endpoints.

## 7. Conectar el widget wearable (Flutter)

**Importante:** el emulador de Android (incluido el de Wear OS) **no puede usar `localhost`** para hablar con tu propia PC — desde el punto de vista del emulador, `localhost` es el emulador mismo, no tu máquina. Android reserva la IP especial `10.0.2.2` para referirse a la PC anfitriona.

Entonces, en `lib/main.dart` y `lib/screens/login_screen.dart` del proyecto `rincon_del_cafe_widget`, la URL base debe ser:

```dart
const String apiBaseUrl = "http://10.0.2.2:4000/api";
```

(En vez de `localhost:4000`). Si más adelante pruebas en un reloj físico conectado por WiFi, ahí sí necesitarás la IP real de tu PC en la red local (ej. `192.168.1.X`), no `10.0.2.2`.

## 8. Siguiente paso sugerido

Una vez que confirmes que el servidor corre bien y responde en el navegador, avísame y seguimos con:
1. Reemplazar los mocks del frontend web por llamadas reales al API.
2. Reemplazar los `TODO` que dejamos en el widget Flutter por las llamadas `http` reales a `/api/auth/login-pin` y `/api/productos/destacados`.
