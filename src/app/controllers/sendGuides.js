const { chromium } = require('playwright');
const path = require('path');
const pkg = require('whatsapp-web.js');
const fs = require('fs');
require('dotenv').config();
const { MessageMedia } = pkg;
const sendGuide = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', '..', '..', 'public', 'docs');
        const browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }); // Cambiar a `false` para depuración
        const page = await browser.newPage({ timeout: 90000 });
        const formData = { ...req.body }
        console.log(formData)
        //Inicio de sesión
        await page.goto('https://portal.cargo-expreso.com/');
        await page.fill('#odcs-sign-in-username\\|input', process.env.CARGO_USER); // Puedes parametrizar las credenciales si necesario
        await page.fill('#odcs-sign-in-password\\|input', process.env.CARGO_PASSWORD);

        console.log("si si")
        console.log("HTML: ", await page.locator('#odcs-sign-in-password\\|input').innerHTML())
        await page.screenshot({ path: './public/images/error.png' });
        const button = page.locator('button[aria-labelledby="botonIniciarSesion_oj8\\|text"]');

        // Espera hasta que el botón esté habilitado
        await page.waitForTimeout(500); // Breve pausa para asegurar que la página cargue


        await button.click();

        // Esperar a que el botón esté habilitado
        await page.waitForSelector('button[aria-labelledby="botonIniciarSesion_oj8\\|text"]:not([disabled])');
        await page.click('button[aria-labelledby="botonIniciarSesion_oj8\\|text"]');


        // Ingreso al formulario
        await page.waitForSelector('button[aria-labelledby="nuevoEnvioBoton_oj9\\|text"]');
        await page.click('button[aria-labelledby="nuevoEnvioBoton_oj9\\|text"]');

        // Llenado del formulario usando datos del frontend
        await page.locator('#pobladoRemitenteId-labelled-by').click();
        await page.locator('[id="oj-searchselect-filter-pobladoRemitenteId\\|input"]').fill('Tegu');
        await page.locator('[id="_oj52_table\\:448753335_0"]').click();
        await page.locator('[id="remiDireccion\\|input"]').fill('TEGUCIGALPA D.C');
        await page.locator('#remiDireccion div').filter({ hasText: 'Dirección Exacta' }).nth(1).click();
        await page.getByLabel('Punto de Referencia').fill('TGU');
        await page.locator('[id="inputRemiNombreContacto\\|input"]').fill('CAMDEL HONDURAS');
        await page.locator('[id="inputRemiTelefonoContacto\\|input"]').fill('95775545');


        // Información del destinatario
        await page.locator('#pobladoDestinatarioId-labelled-by').click();
        await page.locator('[id="oj-searchselect-filter-pobladoDestinatarioId\\|input"]').fill(formData.recipientTown);
        await page.locator(`[id="${formData.recipientTownSelector}"]`).click();
        await page.locator('[id="destiDireccion\\|input"]').fill(formData.recipientAddress);
        await page.getByLabel('Referencia 1').fill(formData.recipientReference1);
        await page.getByLabel('Referencia 2').fill(formData.recipientReference2);
        await page.locator('[id="inputDestiNombreContacto\\|input"]').fill(formData.recipientName);
        await page.locator('[id="inputDestiTelefonoContacto\\|input"]').fill(formData.recipientPhone);

        // Información del paquete
        await page.locator('oj-option').filter({ hasText: 'Paquetes' }).click();
        await page.getByLabel('Contenido de la pieza').fill('Zapatos');
        await page.getByLabel('Peso lb').fill('15');
        await page.getByLabel('Cantidad de piezas iguales').click();
        await page.locator('#ui-id-34').getByLabel('Incrementar').click();
        await page.locator('#montoPorArticulo-labelled-by').click();
        await page.locator('#ui-id-39').getByLabel('Incrementar').click();
        await page.locator('#ui-id-39').getByLabel('Disminuir').click();
        await page.waitForTimeout(7000);
        await page.getByLabel('Agregar Paquete').click();


        await page.getByLabel('Siguiente').click();

        // await page.getByText('He leído y acepto los té').click();
        // await page.getByRole('button', { name: 'Generar Envío' }).click();
        // const downloadPromise = page.waitForEvent('download');
        // await page.getByLabel('Descargar guía').click({ timeout: 60000 });
        // const download = await downloadPromise;
        // const fileName = download.suggestedFilename(); // Nombre del archivo sugerido
        // await download.saveAs(`./public/docs/${fileName}`); // Guarda el archivo localmente
        // console.log(`Archivo descargado en: ./${fileName}`);



        // Cierra el navegador
        //await browser.close();

        const chatId = `504${formData.recipientPhone}@c.us`;
        const base64Image = fs.readFileSync(`${filePath}/${'Guías - 27-11-2024.pdf'}`, { encoding: 'base64' });
        const media = new MessageMedia('application/pdf', base64Image);
        req.client.sendMessage(chatId, media, { caption: 'Su envio se ah realizado correctamente' })
            .then((response) => {
                console.log(`Message sent to ${formData.recipientName}:`);
            }).catch(err => {
                console.error(`Error sending message to ${formData.recipientName}:`, err);
            });

        const base64Media = fs.readFileSync(`${filePath}/${'error.png'}`, { encoding: 'base64' });
        const mediaImage = new MessageMedia('image/png', base64Media);
        req.client.sendMessage(chatId, mediaImage, { caption: 'Error al enviar guia' })
            .then((response) => {
                console.log(`Message sent to ${formData.recipientName}:`);
            }).catch(err => {
                console.error(`Error sending message to ${formData.recipientName}:`, err);
            });
        // Responde al cliente
        res.status(200).send({ message: 'Formulario enviado exitosamente' });
    } catch (error) {
        const formData = { ...req.body }
        const filePath = path.join(__dirname, '..', '..', '..', 'public', 'images');
        const chatId = `504${formData.recipientPhone}@c.us`;
        console.error('Error al enviar el formulario:', error);
        const base64Image = fs.readFileSync(`${filePath}/${'error.png'}`, { encoding: 'base64' });
        const media = new MessageMedia('image/png', base64Image);
        req.client.sendMessage(chatId, media, { caption: 'Error al enviar guia' })
            .then((response) => {
                console.log(`Message sent to ${formData.recipientName}:`);
            }).catch(err => {
                console.error(`Error sending message to ${formData.recipientName}:`, err);
            });
        res.status(500).send({ error: 'Error al enviar el formulario' });
    }
};


module.exports = sendGuide