# Retromatch TFG

Aplicación web de compraventa de ropa vintage con backend Spring Boot y frontend React + Vite.

---

## Requisitos previos

- Java 17
- Maven 3.x
- Node.js 18+
- MySQL 8 (local o Railway)
- IntelliJ IDEA (recomendado)

---

## Estructura del proyecto

```
Retromatch_TFG/
├── backend/
│   └── backend-spring/         # API REST con Spring Boot
├── frontend-react/             # SPA con React + Vite
└── bd/                         # Scripts SQL (si aplica)
```

---

## 1. Base de datos

### Opción A — MySQL local
```sql
CREATE DATABASE retromatch;
```

### Opción B — Railway
Crear un servicio MySQL en Railway y obtener las credenciales desde la pestaña **Connect → Public Network**.

---

## 2. Backend (Spring Boot — puerto 8080)

### Configuración de credenciales

El archivo `application.properties` usa variables de entorno. **Nunca contiene credenciales reales.**

Copia el ejemplo y rellena tus valores:
```
src/main/resources/application.properties.example  →  application.properties
```

Las variables necesarias son:
```
DB_URL=jdbc:mysql://<host>:<port>/<database>
DB_USERNAME=<usuario>
DB_PASSWORD=<contraseña>
```

### En IntelliJ — Run/Edit Configuration → Environment Variables:
```
DB_URL=jdbc:mysql://HOST:PORT/railway;DB_USERNAME=root;DB_PASSWORD=tu_password
```

### Arrancar el backend
```bash
cd backend/backend-spring
./mvnw spring-boot:run
```

O directamente desde IntelliJ ejecutando `BackendSpringApplication`.

El backend arranca en: **http://localhost:8080**

Verificación:
```bash
curl http://localhost:8080/api/productos
```

---

## 3. Frontend (React + Vite — puerto 5173)

```bash
cd frontend-react
npm install
npm run dev
```

> ⚠️ Este proyecto usa **Vite**. El comando correcto es `npm run dev`, no `npm start`.

El frontend arranca en: **http://localhost:5173**

---

## Orden de arranque

1. Base de datos (MySQL local o Railway activo)
2. Backend (`BackendSpringApplication` o `./mvnw spring-boot:run`)
3. Frontend (`npm run dev`)

---

## Endpoints de la API

### Autenticación — `/api/auth`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/registro` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Login y obtención de JWT | No |

**Ejemplo registro:**
```bash
curl -X POST http://localhost:8080/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@test.com","password":"123456"}'
```

**Ejemplo login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@test.com","password":"123456"}'
```

Respuesta login:
```json
{
  "mensaje": "Login exitoso.",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "rol": "USER",
  "email": "usuario@test.com"
}
```

---

### Productos — `/api/productos`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/productos` | Listar todos los productos | No |
| GET | `/api/productos/{id}` | Obtener producto por ID | No |
| GET | `/api/productos/{id}/stock` | Consultar stock por talla | No |
| POST | `/api/productos` | Crear producto (admin) | JWT |
| PUT | `/api/productos/{id}` | Actualizar producto (admin) | JWT |
| PUT | `/api/productos/{id}/stock` | Actualizar stock (admin) | JWT |
| DELETE | `/api/productos/{id}` | Eliminar producto (admin) | JWT |

**Ejemplo obtener productos:**
```bash
curl http://localhost:8080/api/productos
```

---

### Carrito / Reservas — `/api/reservas`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/reservas` | Ver carrito del usuario | JWT |
| POST | `/api/reservas` | Añadir artículo al carrito | JWT |
| DELETE | `/api/reservas/{reservaId}` | Eliminar artículo del carrito | JWT |
| DELETE | `/api/reservas` | Vaciar carrito | JWT |

**Ejemplo añadir al carrito:**
```bash
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"productoId":1,"talla":"M","cantidad":1}'
```

---

### Pedidos — `/api/pedidos`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/pedidos` | Ver historial de pedidos | JWT |
| POST | `/api/pedidos/checkout` | Realizar checkout | JWT |

**Ejemplo checkout:**
```bash
curl -X POST http://localhost:8080/api/pedidos/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"direccionEnvio":"Calle Mayor 1, Sevilla"}'
```

---

## Criterios de éxito cumplidos

| Criterio | Estado | Verificación |
|----------|--------|--------------|
| Backend arranca sin errores | ✅ | Log: `Started BackendSpringApplication` |
| Conexión a base de datos | ✅ | Log: `HikariPool-1 - Start completed` |
| Endpoint productos responde | ✅ | `curl /api/productos` devuelve JSON |
| Registro de usuario funciona | ✅ | POST `/api/auth/registro` devuelve 201 |
| Login devuelve JWT | ✅ | POST `/api/auth/login` devuelve token |
| Frontend arranca en Vite | ✅ | `npm run dev` → http://localhost:5173 |
| Credenciales fuera del repo | ✅ | `application.properties` usa variables de entorno |
| Tablas creadas automáticamente | ✅ | `ddl-auto=update` al arrancar |

---

## Seguridad

- Las credenciales de BD se configuran como variables de entorno, nunca en el repositorio.
- Los tokens JWT se usan para proteger los endpoints privados.
- El archivo `application.properties` está en `.gitignore`.
- Ver `application.properties.example` para saber qué variables configurar.
