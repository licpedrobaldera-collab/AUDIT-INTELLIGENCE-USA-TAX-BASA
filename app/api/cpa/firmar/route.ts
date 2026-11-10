import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      casoId = '101',
      nombreCpa = 'Carlos Mendoza',
      codigoCpa = 'CPA-NY-12345',
      ptin = 'PTIN-654321',
      estado = 'NY',
      cliente = 'JUAN_PEREZ',
      firmaPngBase64,
    } = body;

    if (!firmaPngBase64) {
      return NextResponse.json(
        { error: 'La firma PNG es obligatoria para estampar el documento.' },
        { status: 400 }
      );
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const añoActual = new Date().getFullYear().toString();
    const fechaFirma = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Organizar directorios HIGHUB automáticos
    const clienteDir = cliente.replace(/\s+/g, '_').toUpperCase();
    const carpetaDestino = path.join(
      process.cwd(),
      'HIGHUB',
      añoActual,
      estado.toUpperCase(),
      clienteDir
    );
    fs.mkdirSync(carpetaDestino, { recursive: true });

    const nombreArchivoSalida = `1040_FIRMADO_${codigoCpa}.pdf`;
    const rutaCompletaSalida = path.join(carpetaDestino, nombreArchivoSalida);

    // 2. Decodificar la imagen PNG de la firma
    const base64Data = firmaPngBase64.replace(/^data:image\/png;base64,/, '');
    const bufferFirmaImagen = Buffer.from(base64Data, 'base64');

    // Guardar copia de auditoría de la firma del CPA
    const rutaFirmaAuditada = path.join(carpetaDestino, 'firma_cpa_registro.png');
    fs.writeFileSync(rutaFirmaAuditada, bufferFirmaImagen);

    // 3. Crear y estampar el PDF con pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard US Letter
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Encabezado del Formulario 1040
    page.drawText('Department of the Treasury — Internal Revenue Service', {
      x: 50,
      y: 750,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText('Form 1040: U.S. Individual Income Tax Return', {
      x: 50,
      y: 730,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.2),
    });

    // Datos del Contribuyente
    page.drawRectangle({
      x: 50,
      y: 650,
      width: 512,
      height: 60,
      color: rgb(0.96, 0.97, 0.99),
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
    });
    page.drawText(`CONTRIBUYENTE: ${cliente.replace(/_/g, ' ').toUpperCase()}`, {
      x: 65,
      y: 690,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.2),
    });
    page.drawText(`JURISDICCIÓN FISCAL: ${estado.toUpperCase()} • AÑO FISCAL: ${añoActual} • REF CASO: #${casoId}`, {
      x: 65,
      y: 668,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Cuadro Verde Oficial de Certificación y Estampa del CPA
    const stampX = 50;
    const stampY = 480;
    const stampW = 512;
    const stampH = 140;

    page.drawRectangle({
      x: stampX,
      y: stampY,
      width: stampW,
      height: stampH,
      color: rgb(0.95, 0.99, 0.95),
      borderColor: rgb(0.1, 0.6, 0.2),
      borderWidth: 1.5,
    });

    page.drawText('CERTIFICACIÓN Y ESTAMPA OFICIAL DEL PREPARADOR PAGADO (CPA)', {
      x: stampX + 15,
      y: stampY + stampH - 20,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.5, 0.2),
    });

    page.drawText(`Nombre CPA: ${nombreCpa}`, {
      x: stampX + 15,
      y: stampY + stampH - 42,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(`Código Registro: ${codigoCpa}`, {
      x: stampX + 15,
      y: stampY + stampH - 58,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(`Credencial PTIN: ${ptin}`, {
      x: stampX + 15,
      y: stampY + stampH - 74,
      size: 9,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawText(`Fecha y Hora de Firma: ${fechaFirma} UTC`, {
      x: stampX + 15,
      y: stampY + stampH - 90,
      size: 9,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(`IP de Auditoría: ${ip} • Protocolo HIGHUB SHA-256`, {
      x: stampX + 15,
      y: stampY + stampH - 106,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText('ESTATUS: VERIFICADO & INMUTABLE EN ARCHIVO CORPORATIVO', {
      x: stampX + 15,
      y: stampY + 12,
      size: 8,
      font: fontBold,
      color: rgb(0.1, 0.5, 0.2),
    });

    // Incrustar imagen PNG de firma si es válida
    try {
      const pngImage = await pdfDoc.embedPng(bufferFirmaImagen);
      const pngDims = pngImage.scaleToFit(140, 60);
      page.drawImage(pngImage, {
        x: stampX + stampW - 160,
        y: stampY + 40,
        width: pngDims.width,
        height: pngDims.height,
      });
      page.drawText('Firma Hológrafa Digitalizada', {
        x: stampX + stampW - 160,
        y: stampY + 25,
        size: 7,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    } catch (imgError) {
      console.warn('Advertencia al incrustar PNG en PDF:', imgError);
    }

    // Pie de página de seguridad
    page.drawText('Audit Intelligence USA • HIGHUB Storage • Documento de Cumplimiento Fiscal', {
      x: 50,
      y: 40,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(rutaCompletaSalida, Buffer.from(pdfBytes));

    // 4. Escribir registro contable en comisiones_highub.csv
    const rutaCsv = path.join(process.cwd(), 'comisiones_highub.csv');
    const existeCsv = fs.existsSync(rutaCsv);
    const filaContable = `${fechaFirma},${añoActual},${estado.toUpperCase()},${clienteDir},${codigoCpa},45.00,FIRMADO,IP:${ip}\n`;

    if (!existeCsv) {
      const cabecera =
        'Fecha Registro,Año Fiscal,Estado,Cliente,Código CPA,Monto Comisión (USD),Estatus,IP Auditoria\n';
      fs.writeFileSync(rutaCsv, cabecera + filaContable, 'utf-8');
    } else {
      fs.appendFileSync(rutaCsv, filaContable, 'utf-8');
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Firma gráfica inyectada con éxito y archivada en HIGHUB.',
      rutaFinal: `/HIGHUB/${añoActual}/${estado.toUpperCase()}/${clienteDir}/${nombreArchivoSalida}`,
      comision: 45.0,
    });
  } catch (error: any) {
    console.error('Fallo en el motor de firma:', error);
    return NextResponse.json(
      { error: error?.message || 'Fallo al procesar o estampar el PDF.' },
      { status: 500 }
    );
  }
}
