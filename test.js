// Importar módulos
const { error } = require('console');
const fs = require('fs') //manejar archivos
const path = require('path') //manejar rutas
const { Builder, By, until } = require('selenium-webdriver');

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
        await guardarCaptura('error_productos_iniciales')
        throw new Error('Productos iniciales incorrectos.')
        await driver.sleep(4000);
        
        // Busca todos los elementos li dentro de #productosLista
        const productosIniciales = await driver.findElements(By.css('#productosLista li'));
        if (productosIniciales.length !== 4) {
            agregarAlReporte('Error', 'Los productos iniciales no se cargaron correctamente.', 'error');
            await guardarCaptura('error_productos_iniciales')
            throw new Error('Productos iniciales incorrectos.')
        }
        



        // Busca campo de entrada con el id precioMinimo y simula que el usuario escribe 100
        const inputPrecioMinimo = await driver.findElement(By.id('precioMinimo'));
        await inputPrecioMinimo.sendKeys('100');

        await driver.sleep(4000);

        // Busca el botón "Filtrar Productos" y simula el clic de usuario
        const botonFiltrar = await driver.findElement(By.xpath("//button[text()='Filtrar Productos']"));
        await botonFiltrar.click(); // Usar .click() en lugar de .Click()

        // Busca los productos filtrados
        const productosFiltrados = await driver.findElements(By.css('#productosFiltradosLista li'));
        const productosEsperados = ['Producto 2 - $200', 'Producto 4 - $300'];

        // Compara los productos filtrados con los esperados
        if (productosFiltrados.length !== productosEsperados.length) {
            console.error('Error: La cantidad de productos filtrados es incorrecta.');
            return;
        }

        // Verifica que cada producto filtrado coincida con los productos esperados
        for (let i = 0; i < productosEsperados.length; i++) {
            const textoProducto = await productosFiltrados[i].getText();
            if (textoProducto !== productosEsperados[i]) {
                console.error(`Error: Producto filtrado incorrecto. Esperado: ${productosEsperados[i]}, Obtenido: ${textoProducto}`);
                return;
            }
        }

        console.log('Prueba completada exitosamente. Los productos filtrados son correctos.');

    } catch (error) {
        console.error('Se produjo un error durante la prueba:', error);
    } finally {
        await driver.sleep(10000); 
        // Cerrar navegador
        await driver.quit();
    }
})();
