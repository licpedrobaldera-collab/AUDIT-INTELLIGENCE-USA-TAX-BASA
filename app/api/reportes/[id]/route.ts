import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const role = request.headers.get('x-user-role') || 'ADMIN';

  // Regla de negocio confidencial:
  // CLIENTE solo puede ver el reporte después de la firma del CPA y pago verificado
  if (role === 'CLIENTE') {
    return NextResponse.json(
      {
        error:
          'Informe preliminar confidencial. Solo disponible después de firma CPA y pago.',
        status: 'BLOQUEADO',
      },
      { status: 403 }
    );
  }

  // CPA_AFILIADO, ADMIN, SOCIO tienen acceso al expediente
  return NextResponse.json({
    id,
    cliente: 'Juan Perez',
    anioFiscal: 2023,
    estado: 'NY',
    formulario: '1040',
    estatus: 'FIRMADO',
    reporteUrl: `/HIGHUB/2026/NY/JUAN_PEREZ/1040_FIRMADO_CPA-NY-12345.pdf`,
    accesoConcedido: true,
  });
}
