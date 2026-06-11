#!/usr/bin/env node
/**
 * Script para convertir HTML a PDF usando Puppeteer
 * Proyecto: Restaurante Señor Hornado - Sistema POS
 */

const fs = require('fs');
const path = require('path');

async function convertHtmlToPdf() {
    try {
        // Intentar usar puppeteer si está disponible
        let puppeteer;
        try {
            puppeteer = require('puppeteer');
        } catch (e) {
            console.log('[*] Puppeteer no disponible, intentando alternativa...');
            console.log('[*] Abra el archivo HTML en un navegador y guarde como PDF manualmente:');
            console.log('    - Archivo: Evidencia_GA2_220501093_AA3_EV01_Validacion_Documentos.html');
            console.log('    - Presione Ctrl+P o use "Archivo > Imprimir > Guardar como PDF"');
            return false;
        }

        const htmlFile = path.join(__dirname, '..', 'Evidencia_GA2_220501093_AA3_EV01_Validacion_Documentos.html');
        const outputPdf = path.join(__dirname, '..', 'Evidencia_GA2_220501093_AA3_EV01_Validacion_Documentos.pdf');

        console.log('[*] Leyendo archivo HTML...');
        if (!fs.existsSync(htmlFile)) {
            console.error('[!] Error: Archivo no encontrado:', htmlFile);
            return false;
        }

        console.log('[*] Inicializando navegador...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });

        console.log('[*] Generando PDF...');
        await page.pdf({
            path: outputPdf,
            format: 'A4',
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center; color: #999;">Evidencia GA2-220501093-AA3-EV01: Validación de Documentos</div>',
            footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: right; color: #999;">Página <span class="pageNumber"></span></div>'
        });

        await browser.close();

        const fileSize = fs.statSync(outputPdf).size / 1024;
        console.log('[+] PDF creado exitosamente');
        console.log('[*] Ubicacion: ' + outputPdf);
        console.log('[*] Tamaño: ' + fileSize.toFixed(2) + ' KB');
        return true;

    } catch (error) {
        console.error('[!] Error:', error.message);
        return false;
    }
}

convertHtmlToPdf().then(success => {
    process.exit(success ? 0 : 1);
});
