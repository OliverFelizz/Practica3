// Importar módulos
const { Builder, By, until } = require('selenium-webdriver');

(async function testFiltrarProductos() {
    // Configura el navegador de uso y construye su instancia controlada por Selenium
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Abre la página que se le hace la prueba
        await driver.get('file:///D:/Oliver Nuevo/source/repos/Visual Studio Code Proyects/Programacion Web/Practica3/index.html');
        
        await driver.sleep(4000);
        
        // Busca todos los elementos li dentro de #productosLista
        const productosIniciales = await driver.findElements(By.css('#productosLista li'));
        if (productosIniciales.length !== 4) {
            console.error('Error: Los productos iniciales no se cargaron correctamente.');
            return;
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
