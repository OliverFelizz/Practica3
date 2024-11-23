// Importar módulos
const fs = require('fs') //manejar archivos
const path = require('path') //manejar rutas
const { Builder, By } = require('selenium-webdriver');

(async function testFiltrarProductos() {
    // Configura el navegador de uso y construye su instancia controlada por Selenium
    let driver = await new Builder().forBrowser('chrome').build();
    let reporteHTML = ''

    //agrega las entradas personalizadas al reporte en formato HTML
    const agregarAlReporte = (titulo, mensaje, tipo = 'info') => {
        const color = tipo === 'error' ? 'red' : 'green'
        reporteHTML += `<div style="color: ${color};"><strong>${titulo}:</strong> ${mensaje}</div>\n`;
    }

    //toma y guarda la captura en formato png y genera enlace HTML que permite ver captura desde el reporte
    const guardarCaptura = async (nombreArchivo) => {
        const screenshot = await driver.takeScreenshot()
        const rutaCaptura = path.join(__dirname, `./capturas/${nombreArchivo}.png`)
        fs.writeFileSync(rutaCaptura, screenshot, 'base64')
        agregarAlReporte('Captura de pantalla guardada', `<a href="./capturas/${nombreArchivo}.png">Ver captura</a>`, 'info')
    }

    try {
        //verifica que exista la carpeta capturas, si no existe la crea automaticamente
        const capturasDir = path.join(__dirname, './capturas')
        if (!fs.existsSync(capturasDir)) {
            fs.mkdirSync(capturasDir)
        }

        // Abre la página que se le hace la prueba
        await driver.get('file:///D:/Oliver Nuevo/source/repos/Visual Studio Code Proyects/Programacion Web/Practica3/index.html');
        agregarAlReporte('paso 1', 'Página cargada correctamente.')
        await guardarCaptura('pagina_cargada')
        await driver.sleep(4000);

        // Busca todos los elementos li dentro de #productosLista
        const productosIniciales = await driver.findElements(By.css('#productosLista li'));
        if (productosIniciales.length !== 4) {
            agregarAlReporte('Error', 'Los productos iniciales no se cargaron correctamente.', 'error');
            await guardarCaptura('error_productos_iniciales');
            throw new Error('Productos iniciales incorrectos.');
        }

        //toma captura del paso 2
        agregarAlReporte('paso 2', 'Los productos iniciales se cargaron correctamente.')
        await guardarCaptura('productos_iniciales')


        // Busca campo de entrada con el id precioMinimo y simula que el usuario escribe 100
        const inputPrecioMinimo = await driver.findElement(By.id('precioMinimo'));
        await inputPrecioMinimo.sendKeys('100');
        agregarAlReporte('paso 3', 'Se ingresó el precio mínimo (100).')
        await guardarCaptura('precio_minimo_ingresado')
        await driver.sleep(4000);

        // Busca el botón "Filtrar Productos" y simula el clic de usuario
        const botonFiltrar = await driver.findElement(By.xpath("//button[text()='Filtrar Productos']"));
        await botonFiltrar.click();
        agregarAlReporte('Paso 4', 'Se hizo clic en el botón "Filtrar Productos".');
        await guardarCaptura('boton_filtrar_click');


        // Busca los productos filtrados
        
        const productosFiltrados = await driver.findElements(By.css('#productosFiltradosLista li'));
        const productosEsperados = ['Producto 2 - $200', 'Producto 4 - $300'];

        // Compara los productos filtrados con los esperados
        if (productosFiltrados.length !== productosEsperados.length) {
            agregarAlReporte('Error', 'La cantidad de productos filtrados es incorrecta.', 'error');
            await guardarCaptura('error_cantidad_productos_filtrados');
            throw new Error('Cantidad incorrecta de productos filtrados.');
        }

        // Verifica que cada producto filtrado coincida con los productos esperados
        for (let i = 0; i < productosEsperados.length; i++) {
            const textoProducto = await productosFiltrados[i].getText();
            if (textoProducto !== productosEsperados[i]) {
                agregarAlReporte(
                    'Error',
                    `Producto incorrecto. Esperado: ${productosEsperados[i]}, Obtenido: ${textoProducto}`,
                    'error'
                );
                await guardarCaptura(`error_producto_incorrecto_${i}`);
                throw new Error('Producto incorrecto.');
            }
        }

        agregarAlReporte('Paso 5', 'Todos los productos filtrados son correctos.');
        await guardarCaptura('productos_filtrados_correctos');

        console.log('Prueba completada exitosamente. Los productos filtrados son correctos.');

    } catch (error) {
        console.error('Se produjo un error durante la prueba:', error);
        agregarAlReporte('Error crítico', error.message, 'error');
    } finally {
         // Guardar reporte HTML
         const rutaReporte = path.join(__dirname, './reporte.html');
         fs.writeFileSync(
             rutaReporte,
             `
             <!DOCTYPE html>
             <html lang="en">
             <head>
                 <meta charset="UTF-8">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                 <title>Reporte de Prueba</title>
             </head>
             <body>
                 <h1>Reporte de Prueba Automatizada</h1>
                 ${reporteHTML}
             </body>
             </html>
             `
         );
 
         console.log(`Reporte guardado en ${rutaReporte}`);
         console.log('Cerrando navegador...');
        await driver.sleep(10000);
        // Cerrar navegador
        await driver.quit();
    }
})();
