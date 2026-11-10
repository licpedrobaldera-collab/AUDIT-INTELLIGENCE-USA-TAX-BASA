import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const csvPath = path.join(process.cwd(), 'comisiones_highub.csv');

    // Inicializar con datos de ejemplo si el archivo no existe
    if (!fs.existsSync(csvPath)) {
      const cabecera =
        'Fecha Registro,Año Fiscal,Estado,Cliente,Código CPA,Monto Comisión (USD),Estatus,IP Auditoria\n';
      const registrosEjemplo = [
        '2026-03-10 10:20:00,2026,NY,JUAN_PEREZ,CPA-NY-12345,45.00,FIRMADO,IP:127.0.0.1\n',
        '2026-03-11 11:30:00,2026,NY,MARIA_LOPEZ,CPA-NY-12345,45.00,FIRMADO,IP:127.0.0.1\n',
        '2026-03-12 14:15:00,2026,FL,ROBERT_DIAZ,CPA-FL-88214,45.00,FIRMADO,IP:127.0.0.1\n',
        '2026-03-14 09:45:00,2026,CA,SARAH_CONNER,CPA-CA-55109,45.00,FIRMADO,IP:127.0.0.1\n',
        '2026-03-15 16:50:00,2026,NY,ALICE_SMITH,CPA-NY-12345,45.00,FIRMADO,IP:127.0.0.1\n',
      ].join('');
      fs.writeFileSync(csvPath, cabecera + registrosEjemplo, 'utf-8');
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lineas = fileContent.split('\n').filter(linea => linea.trim() !== '');

    // Ignorar la cabecera
    const cuerpo = lineas.slice(1);

    // Agrupar datos por CPA para consolidar el Histórico
    const mapeoCPAs: Record<string, { licencia: string; estado: string; casos: number }> = {};

    cuerpo.forEach(linea => {
      const columnas = linea.split(',');
      if (columnas.length >= 5) {
        const estado = columnas[2]?.trim() || 'NY';
        const codigoCpa = columnas[4]?.trim() || '';

        if (codigoCpa) {
          if (!mapeoCPAs[codigoCpa]) {
            mapeoCPAs[codigoCpa] = {
              licencia: codigoCpa,
              estado: estado,
              casos: 0,
            };
          }
          mapeoCPAs[codigoCpa].casos += 1;
        }
      }
    });

    // Mapeo final adaptado para la interfaz
    const resultado = Object.values(mapeoCPAs).map((cpa, index) => {
      const partes = cpa.licencia.split('-');
      const estadoLicencia = partes[1] || cpa.estado;
      return {
        id: String(index + 1),
        nombre: `CPA Profesional (${estadoLicencia})`,
        licencia: cpa.licencia,
        estado: cpa.estado,
        casosFirmados: cpa.casos,
        ptin: `PTIN-${100000 + index * 1234}`,
        aprobado: true,
      };
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error leyendo el CSV:', error);
    return NextResponse.json({ error: 'No se pudo procesar el archivo contable' }, { status: 500 });
  }
}
