# Proyecto de Fin de Grado: Retromatch

**Autor:** Alejandro Pérez Gras  
**Titulación:** Desarrollo de aplicaciones web  

Este repositorio contiene el prototipo mínimo funcional correspondiente al hito actual de mi Proyecto de Fin de Grado. Incluye tanto la API (Backend) como la interfaz de usuario (Frontend).

---

## 🛠 Decisiones Técnicas y Arquitectura

* **Stack elegido:** He optado por **Spring Boot** para el backend (arquitectura MVC/Capas), **React** para el frontend y **MySQL** para asegurar la consistencia relacional y transaccional. La persistencia se maneja con JPA/Hibernate y la seguridad mínima inicial mediante tokens JWT.
* **Gestión de stock por tallas:** Se modelará con una tabla intermedia (Producto-Talla-Cantidad) para llevar un control exacto del inventario según las variantes.
* **Reservas temporales:** Se gestionarán registrando un timestamp en el carrito: un proceso automático (o validación en el momento de la confirmación) liberará el stock si el pedido no se formaliza en un margen de 15 minutos.
* **Estados de pedido:** El ciclo de vida de los pedidos contará con una máquina de estados (Pendiente, Pagado, Enviado, Completado).
* **Devoluciones:** El flujo de devolución actualizará el estado del pedido a "Devuelto", desencadenando una acción transaccional que restituya el stock de los productos implicados.
* **Fuera del alcance (Hito actual):** Para esta entrega del prototipo se ha dejado fuera la integración con pasarelas de pago reales y el desarrollo del panel de administración avanzado.

---

## ✅ Criterios de Éxito (Checklist de validación)

Para dar por válido el alcance de este hito de evaluación, se establecen las siguientes comprobaciones:

- [ ] **1.** El backend levanta correctamente sin errores de compilación ni de inyección de dependencias.
- [ ] **2.** La base de datos MySQL conecta exitosamente con la aplicación mediante JPA.
- [ ] **3.** El endpoint de control de estado (`GET /health`) responde correctamente.
- [ ] **4.** El sistema permite listar los productos disponibles reflejando su stock actual.
- [ ] **5.** Un usuario puede añadir un producto (especificando su talla correspondiente) al carrito.
- [ ] **6.** El sistema genera un pedido correctamente a partir de los datos almacenados en el carrito.
- [ ] **7.** Se puede actualizar el estado de un pedido en el sistema.
- [ ] **8.** El frontend en React muestra al menos una pantalla funcional que consume y renderiza información desde la API.

---

## 🚀 Instrucciones de despliegue en local

**Requisitos previos:**
* Java 17+
* Node.js y npm
* Servidor MySQL en ejecución (Puerto 3306)

**Backend (Spring Boot):**
1. Configurar las credenciales de base de datos en `src/main/resources/application.properties` (o `.yml`).
2. Ejecutar la aplicación desde el IDE o usar la consola: `./mvnw spring-boot:run`.

**Frontend (React):**
1. Navegar al directorio del frontend.
2. Instalar dependencias: `npm install`.
3. Levantar el servidor de desarrollo: `npm start`.
