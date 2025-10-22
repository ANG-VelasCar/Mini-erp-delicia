// app.js
const readline = require('readline');
const chalk = require('chalk');
const ventasService = require('./services/ventas');

// Configuramos la interfaz de lectura de consola
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const MENU = `
${chalk.yellow('===========================================')}
${chalk.green.bold('     BIENVENIDO AL SISTEMA DELICIA ')}
${chalk.yellow('===========================================')}
${chalk.cyan('1.')} ${chalk.white('Registrar venta (Agregar)')}
${chalk.cyan('2.')} ${chalk.white('Listar productos (Catálogo)')}
${chalk.cyan('3.')} ${chalk.white('Buscar producto (ID)')}
${chalk.cyan('4.')} ${chalk.white('Ver carrito')}
${chalk.cyan('5.')} ${chalk.white('Calcular total')}
${chalk.cyan('6.')} ${chalk.white('Generar ticket')}
${chalk.cyan('7.')} ${chalk.white('Reportes')}
${chalk.cyan('8.')} ${chalk.red.bold('Salir')}
${chalk.yellow('===========================================')}
`;



function listarProductos() {
    console.log(chalk.blue('\n===  CATÁLOGO DE PRODUCTOS ==='));
    ventasService.catalogo.forEach(p => {
        console.log(`ID: ${p.id.toString().padEnd(3)} | ${p.nombre.padEnd(25)} | Precio: S/${p.precio.toFixed(2).padEnd(6)} | Categoría: ${p.categoria}`);
    });
    console.log('='.repeat(40));
    mostrarMenu();
}

function buscarProductoConsola() {
    rl.question(chalk.yellow('\n Ingrese ID del producto a buscar (1-10): '), (busqueda) => {
        const busquedaLimpia = busqueda.trim();

        // Validar campo vacío
        if (!busquedaLimpia) {
            console.log(chalk.red(' La búsqueda no puede estar vacía.'));
            return mostrarMenu();
        }

        // Validar que sea un número entre 1 y 10
        const id = parseInt(busquedaLimpia);
        if (isNaN(id) || id < 1 || id > 10) {
            console.log(chalk.red(' Error: Ingrese un número válido del 1 al 10.'));
            return mostrarMenu();
        }

        const producto = ventasService.buscarProducto(id);

        if (producto) {
            console.log(chalk.green('\n Producto Encontrado:'));
            console.log(`   Nombre: ${chalk.white.bold(producto.nombre)}`);
            console.log(`   Precio: ${chalk.white.bold('S/' + producto.precio.toFixed(2))}`);
            console.log(`   Categoría: ${chalk.white.bold(producto.categoria)}`);
        } else {
            console.log(chalk.red(' Producto no encontrado en el catálogo.'));
        }

        mostrarMenu();
    });
}


function registrarVenta() {
    console.log(chalk.magenta('\n--- INICIO DE REGISTRO DE VENTA ---'));
    
    const preguntarProducto = () => {
        rl.question(chalk.yellow(' Ingrese el ID de producto (1-10) o "fin" para terminar: '), (busqueda) => {
            const busquedaLimpia = busqueda.trim();

            // Permitir salir escribiendo "fin"
            if (busquedaLimpia.toLowerCase() === 'fin') {
                console.log(chalk.magenta('\n--- FIN DE REGISTRO ---'));
                return mostrarMenu();
            }

            // Validar entrada vacía
            if (!busquedaLimpia) {
                console.log(chalk.red(' Entrada vacía. Intente de nuevo.'));
                return preguntarProducto();
            }

            // Convertir a número y validar rango (1-10)
            const id = parseInt(busquedaLimpia);
            if (isNaN(id) || id < 1 || id > 10) {
                console.log(chalk.red(' Error: Ingrese un ID válido del 1 al 10.'));
                return preguntarProducto();
            }

            const producto = ventasService.buscarProducto(id);

            if (!producto) {
                console.log(chalk.red(' Producto no encontrado.'));
                return preguntarProducto();
            }

            rl.question(chalk.yellow(`\n Cantidad de ${producto.nombre}: `), (cantidadStr) => {
                const cantidad = parseFloat(cantidadStr.trim());

                if (isNaN(cantidad) || cantidad <= 0) {
                    console.log(chalk.red(' Cantidad no válida. Debe ser un número > 0.'));
                    return preguntarProducto();
                }

                ventasService.agregarACarrito(producto, cantidad);
                
          
                // Confirmar si desea agregar más productos
             
                const preguntarContinuar = () => {
                    rl.question(chalk.cyan('\n¿Agregar otro producto? (s/n): '), (continuar) => {
                        const respuestaLimpia = continuar.trim().toLowerCase();

                        if (respuestaLimpia === 's') {
                            preguntarProducto();
                        } else if (respuestaLimpia === 'n') {
                            console.log(chalk.magenta('\n--- FIN DE REGISTRO ---'));
                            mostrarMenu();
                        } else {
                            console.log(chalk.red(' Error: Ingrese solo "s" (sí) o "n" (no).'));
                            preguntarContinuar();
                        }
                    });
                };
                
                preguntarContinuar();
            });
        });
    };

    preguntarProducto();
}


function menuGestionCarrito() {
    rl.question(chalk.yellow(`
    --- GESTIÓN DEL CARRITO ---
    A. Agregar producto (ir a Registrar venta)
    E. Eliminar un ítem
    V. Vaciar carrito
    R. Regresar al Menú Principal
    
    Seleccione una opción: `), (opcion) => {
        const opcionLimpia = opcion.trim().toUpperCase();

        switch (opcionLimpia) {
            case 'A':
                registrarVenta(); 
                break;
            case 'E':
                rl.question(chalk.yellow('\n Ingrese ID o Nombre del producto a ELIMINAR del carrito: '), (busqueda) => {
                    if (!busqueda.trim()) {
                        console.log(chalk.red(' Entrada vacía.'));
                        ventasService.verCarrito();
                        return menuGestionCarrito();
                    }
                    ventasService.eliminarItemCarrito(busqueda.trim());
                    ventasService.verCarrito();
                    menuGestionCarrito();
                });
                break;
            case 'V':
                ventasService.vaciarCarrito();
                mostrarMenu();
                break;
            case 'R': 
                mostrarMenu();
                break;
            default:
                console.log(chalk.red(' Opción no válida. Ingrese A, E, V o R.'));
                menuGestionCarrito();
                break;
        }
    });
}


function mostrarCalculos() {
    const resultados = ventasService.calcularTotales();

    if (resultados.totalItems === 0) {
        console.log(chalk.yellow('\nEl carrito está vacío. No hay totales que calcular.'));
        return mostrarMenu();
    }
    
    const descuentoPorcentaje = resultados.descuentoPorcentaje;
    
    console.log(chalk.yellow('\n--- DETALLE DE CÁLCULO DE TOTALES ---'));
    console.log(`Items en Carrito: ${chalk.cyan(resultados.totalItems)}`);
    console.log(`Subtotal (Bruto): ${chalk.yellow('S/' + resultados.subtotal.toFixed(2))}`);
    console.log(`Descuento Aplicado (${descuentoPorcentaje.toFixed(0)}%): ${chalk.yellow('S/' + resultados.descuento.toFixed(2))}`);
    console.log(`Subtotal con Descuento: ${chalk.yellow('S/' + (resultados.subtotal - resultados.descuento).toFixed(2))}`);
    console.log(`IGV (18%): ${chalk.yellow('S/' + resultados.igv.toFixed(2))}`);
    console.log(`TOTAL A PAGAR: ${chalk.red.bold('S/' + resultados.total.toFixed(2))}`);
    console.log('='.repeat(40));
    
    mostrarMenu();
}


function menuReportes() {
    rl.question(chalk.yellow(`
    --- OPCIONES DE REPORTES ---
    1. Top 3 productos más caros (Catálogo)
    2. Productos más vendidos (Sesión)
    3. Resumen del Carrito Actual
    4. Regresar al Menú Principal
    
    Seleccione una opción: `), (opcion) => {
        const opcionNum = parseInt(opcion.trim());

        switch (opcionNum) {
            case 1:
                ventasService.reportesTopCaros();
                menuReportes();
                break;
            case 2:
                ventasService.reportesMasVendidos();
                menuReportes();
                break;
            case 3:
                ventasService.verCarrito(); 
                menuReportes();
                break;
            case 4:
                mostrarMenu();
                break;
            default:
                console.log(chalk.red(' Opción no válida. Ingrese del 1 al 4'));
                menuReportes();
                break;
        }
    });
}


// FUNCIÓN PRINCIPAL DEL MENÚ


function mostrarMenu() {
    console.log(MENU);
    rl.question(chalk.white.bold(' Seleccione una opción: '), (opcion) => {
        const opcionNum = parseInt(opcion.trim());

        if (isNaN(opcionNum)) {
            console.log(chalk.red(' Opción no válida, por favor intente nuevamente.'));
            return mostrarMenu();
        }

        switch (opcionNum) {
            case 1:
                registrarVenta();
                break;
            case 2:
                listarProductos();
                break;
            case 3:
                buscarProductoConsola();
                break;
            case 4:
                ventasService.verCarrito();
                menuGestionCarrito();
                break;
            case 5:
                mostrarCalculos();
                break;
            case 6:
                ventasService.generarTicket();
                mostrarMenu();
                break;
            case 7:
                menuReportes();
                break;
            case 8:
                console.log(chalk.red.bold('\n Gracias por usar el sistema Delicia. ¡Hasta pronto!'));
                rl.close();
                break;
            default:
                console.log(chalk.red(' Opción no válida, por favor intente nuevamente.'));
                mostrarMenu();
                break;
        }
    });
}

// Iniciar la aplicación
mostrarMenu();