// services/ventas.js
const chalk = require('chalk');
const { catalogo } = require('../data/productos');

// -----------------------------------------------------
// Datos en memoria
// -----------------------------------------------------
let carrito = [];
// Simula el registro histórico de ventas para el reporte de más vendidos
let registroVentas = [
    { producto: 'Pan Baguette', cantidad: 10 },
    { producto: 'Queso Fresco', cantidad: 5 },
    { producto: 'Torta de Chocolate', cantidad: 2 }
];


// -----------------------------------------------------
// BÚSQUEDA Y GESTIÓN DE CARRITO (Sin cambios)
// -----------------------------------------------------

function buscarProducto(busqueda) {
    const busquedaLimpia = busqueda.toString().trim().toLowerCase();
    const idBusqueda = parseInt(busquedaLimpia);
    if (!isNaN(idBusqueda)) {
        const encontradoId = catalogo.find(p => p.id === idBusqueda);
        if (encontradoId) return encontradoId;
    }
    const encontradoNombre = catalogo.find(p => p.nombre.toLowerCase().includes(busquedaLimpia));
    return encontradoNombre || null;
}

function agregarACarrito(producto, cantidad) {
    const cantidadNum = parseFloat(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
        console.log(chalk.red('\ Error: La cantidad debe ser un número mayor a 0.'));
        return;
    }

    const itemExistente = carrito.find(item => item.id === producto.id);
    if (itemExistente) {
        itemExistente.cantidad += cantidadNum;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidadNum,
        });
    }

    const registroExistente = registroVentas.find(r => r.producto === producto.nombre);
    if (registroExistente) {
        registroExistente.cantidad += cantidadNum;
    } else {
        registroVentas.push({ producto: producto.nombre, cantidad: cantidadNum });
    }

    const subtotal = (producto.precio * cantidadNum).toFixed(2);
    console.log(chalk.green(`\ ${producto.nombre} agregado (${cantidadNum} x S/${producto.precio.toFixed(2)} = S/${subtotal})`));
}

function eliminarItemCarrito(busqueda) {
    const busquedaLimpia = busqueda.toString().trim().toLowerCase();
    const idBusqueda = parseInt(busquedaLimpia);
    
    const indice = carrito.findIndex(item => 
        item.id === idBusqueda || item.nombre.toLowerCase().includes(busquedaLimpia)
    );

    if (indice !== -1) {
        const nombreEliminado = carrito[indice].nombre;
        carrito.splice(indice, 1);
        console.log(chalk.green(`\ Producto ${nombreEliminado} eliminado del carrito.`));
    } else {
        console.log(chalk.red('\ Producto no encontrado en el carrito.'));
    }
}

function vaciarCarrito() {
    carrito = [];
    console.log(chalk.green('\ Carrito vaciado completamente.'));
}

// -----------------------------------------------------
// CÁLCULO DE TOTALES (CORREGIDO)
// -----------------------------------------------------

/**
 * Calcula el total del carrito aplicando descuentos e IGV.
 * La lógica del descuento escalonado fue ajustada para cumplir con los requisitos.
 * @returns {object} Objeto con subtotal, descuento, IGV, y total.
 */
function calcularTotales() {
    let subtotal = 0;
    let totalItems = 0;

    if (carrito.length === 0) {
        return { subtotal: 0, descuento: 0, igv: 0, total: 0, totalItems: 0, descuentoPorcentaje: 0 };
    }

    // 1. Calcular Subtotal y Total de Items
    carrito.forEach(item => {
        subtotal += item.precio * item.cantidad;
        totalItems += item.cantidad;
    });

    // 2. Determinar Descuento escalonado (Implementación exacta del requisito)
    let porcentajeDescuento = 0;
    
    if (subtotal >= 100) {
        porcentajeDescuento = 0.15; // 100 o más  -> 15%
    } else if (subtotal >= 50) {
        porcentajeDescuento = 0.10; // 50 a 99 -> 10%
    } else if (subtotal >= 20) {
        porcentajeDescuento = 0.05; // 20 a 49  -> 5%
    } 
    // Menos de 20  -> 0% (porcentajeDescuento = 0)

    const descuento = subtotal * porcentajeDescuento;
    const subtotalConDescuento = subtotal - descuento;

    // 3. Aplicar IGV (18%) aplicado DESPUÉS del descuento
    const IGV_RATE = 0.18;
    const igv = subtotalConDescuento * IGV_RATE;

    // 4. Calcular Total General
    const total = subtotalConDescuento + igv;
    // Total = (Subtotal - Descuento) + IGV

    return {
        subtotal: subtotal,
        descuento: descuento,
        igv: igv,
        total: total,
        totalItems: totalItems,
        descuentoPorcentaje: porcentajeDescuento * 100
    };
}


// -----------------------------------------------------
// REPORTE Y FORMATO (Sin cambios)
// -----------------------------------------------------

function generarTicket() {
    if (carrito.length === 0) {
        console.log(chalk.red('\ No hay productos en el carrito para generar el ticket.'));
        return;
    }

    const resultados = calcularTotales();
    
    console.log(chalk.blue('\n' + '='.repeat(40)));
    console.log(chalk.white.bold('           RESUMEN DE COMPRA - DELICIA'));
    console.log(chalk.blue('-'.repeat(40)));
    console.log(chalk.yellow('Producto'.padEnd(20) + 'Cant.'.padEnd(7) + 'Precio'.padEnd(7) + 'Subtotal'));
    console.log(chalk.blue('-'.repeat(40)));

    carrito.forEach(item => {
        const lineaSubtotal = (item.precio * item.cantidad).toFixed(2);
        console.log(
            item.nombre.substring(0, 18).padEnd(20) + 
            item.cantidad.toString().padEnd(7) +
            item.precio.toFixed(2).padEnd(7) +
            lineaSubtotal
        );
    });

    console.log(chalk.blue('-'.repeat(40)));
    console.log(chalk.yellow(`Subtotal: ${'S/'.padEnd(3) + resultados.subtotal.toFixed(2).padStart(30)}`));
    console.log(chalk.yellow(`Descuento (${resultados.descuentoPorcentaje.toFixed(0)}%): ${'S/'.padEnd(3) + resultados.descuento.toFixed(2).padStart(29)}`)); 
    console.log(chalk.yellow(`IGV (18%): ${'S/'.padEnd(3) + resultados.igv.toFixed(2).padStart(29)}`));
    console.log(chalk.white.bold(`TOTAL FINAL: ${'S/'.padEnd(3) + resultados.total.toFixed(2).padStart(27)}`));
    console.log(chalk.blue('='.repeat(40)));
    console.log(chalk.green('        ¡Gracias por su compra! Vuelva pronto.'));
    console.log(chalk.blue('='.repeat(40)));
}

function verCarrito() {
    if (carrito.length === 0) {
        console.log(chalk.yellow('\ El carrito está vacío.'));
        return;
    }

    const resultados = calcularTotales();

    console.log(chalk.magenta('\n===  CARRITO DE COMPRAS ACTUAL ==='));
    console.log(chalk.yellow('Ítem'.padEnd(4) + 'Producto'.padEnd(20) + 'Cant.'.padEnd(7) + 'Subtotal'));
    console.log(chalk.magenta('-'.repeat(40)));

    carrito.forEach((item, index) => {
        const subtotalItem = (item.precio * item.cantidad).toFixed(2);
        console.log(
            `${(index + 1).toString().padEnd(4)}` +
            item.nombre.substring(0, 18).padEnd(20) + 
            item.cantidad.toString().padEnd(7) +
            subtotalItem
        );
    });

    console.log(chalk.magenta('-'.repeat(40)));
    console.log(chalk.yellow(`Cantidad Total de Ítems: ${resultados.totalItems}`));
    console.log(chalk.yellow(`Monto Acumulado: S/${resultados.subtotal.toFixed(2)}`));
    console.log(chalk.magenta('===================================\n'));
}

function reportesTopCaros() {
    const topCaros = [...catalogo] 
        .sort((a, b) => b.precio - a.precio)
        .slice(0, 3);
    
    console.log(chalk.cyan('\n===  TOP 3 PRODUCTOS MÁS CAROS ==='));
    topCaros.forEach(p => {
        console.log(`- ${p.nombre.padEnd(25)} S/${p.precio.toFixed(2)} (${p.categoria})`);
    });
    console.log('='.repeat(40));
}

function reportesMasVendidos() {
    const masVendidos = [...registroVentas]
        .sort((a, b) => b.cantidad - a.cantidad);
    
    console.log(chalk.cyan('\n===  PRODUCTOS MÁS VENDIDOS (Sesión) ==='));
    if (masVendidos.length === 0) {
        console.log(chalk.yellow("No hay ventas registradas aún."));
        return;
    }

    masVendidos.forEach(r => {
        console.log(`- ${r.producto.padEnd(25)}: ${r.cantidad} unidades`);
    });
    console.log('='.repeat(40));
}


module.exports = {
    catalogo,
    carrito,
    buscarProducto,
    agregarACarrito,
    eliminarItemCarrito,
    vaciarCarrito,
    calcularTotales,
    generarTicket,
    verCarrito,
    reportesTopCaros,
    reportesMasVendidos,
};