# 🥐 Mini-ERP Delicia (Consola - Node.js)

Aplicación de consola que simula la gestión de ventas de la panadería-pastelería **"Delicia"**. El sistema maneja un carrito de compras, realiza cálculos financieros (descuentos e IGV) y genera reportes.

## ⚙️ Requisitos Cumplidos

El proyecto cumple con las siguientes características:

* **Menú con 8 opciones:** Registrar venta, listar productos, buscar producto, ver carrito (incluye eliminar y vaciar), calcular total, generar ticket, reportes y salir.
* **Catálogo:** Arreglo de objetos `{ ID, nombre, precio, categoría }` en `data/productos.js`.
* **Carrito:** Arreglo `carrito[]` que permite agregar ítems por IDy acumular cantidades.
* **Cálculos:** Subtotal, **descuento escalonado** (15% ≥ 100 ítems, 10% ≥ 50 ítems, 5% ≥ 20 ítems), **IGV 18%**, y totales con dos decimales.
* **Ticket:** Resumen alineado en columnas.
* **Chalk:** Implementado para mejorar la presentación con colores 
* **Búsqueda:** Búsqueda flexible por nombre (case-insensitive) e ID.
* **Reportes:** Top 3 más caros, Más vendidos de la sesión, Resumen del carrito (ítems y monto).
* **Código Limpio:** Código modular (3 archivos), buenas prácticas de JavaScript, uso de arrays en memoria y formateo de columnas.

***

## 📁 Estructura del Proyecto

mini-erp-delicia/ 
├── app.js 
├── data/ 
│ └── productos.js 
├── services/ 
│ └── ventas.js 
└── package.json


***

## 🚀 Ejecución

Asegúrate de tener Node.js instalado.

```bash
node app.js
Siga el menú interactivo en la consola.

📝 Notas de Uso y Validaciones
En registrar venta (Opción 1): Escriba un ID (ej., 3) o el nombre exacto (ej., pan integral). Luego ingrese la cantidad. La cantidad debe ser un número > 0.

En Ver carrito (Opción 4): Puede eliminar un ítem por Id/nombre o vaciar todo el carrito.

En Generar ticket (Opción 6): Muestra el recibo con la estadística de la sesión y los totales finales.

Los precios y totales siempre se muestran con el prefijo S/ y dos decimales.