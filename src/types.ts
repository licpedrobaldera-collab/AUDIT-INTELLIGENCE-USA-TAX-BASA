export type UserRole =
  | 'CLIENTE'
  | 'CONTADOR'
  | 'CPE'
  | 'ABOGADO'
  | 'REPRESENTANTE_LEGAL'
  | 'FIRMA'
  | 'ADMIN'
  | 'DEV';

export type CaseStatus = 'REALIZADA' | 'EN_TRAMITE' | 'APROBADA';

// All 50 US States + District of Columbia + Puerto Rico + US Territories / International
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'RD', name: 'República Dominicana (Intl/Expat)' },
] as const;

export type USState = typeof US_STATES[number]['code'] | string;

export type ModalidadAfiliacion =
  | 'PAGO_VIRTUAL'
  | 'TRANSFERENCIA_BANCO_SISTEMA'
  | 'RETENCION_PRIMEROS_INGRESOS';

export type EstadoAfiliacion =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'FALLIDO'
  | 'AUTORIZADO_RETENCION';

export interface CuentaBancariaSistema {
  id: string;
  bancoNombre: string;
  titular: string;
  numeroCuenta: string;
  routingSwift: string;
  tipoCuenta: string;
  instrucciones: string;
  updatedAt: string;
}

export interface PagoAfiliacion {
  id: number;
  contador_id: string;
  contador_nombre: string;
  contador_email: string;
  monto: number; // default 50.00
  moneda: 'USD';
  concepto: string; // 'Cuota de afiliacion sociedad de contadores'
  modalidad: ModalidadAfiliacion;
  estado: 'PENDIENTE' | 'PAGADO' | 'FALLIDO';
  pasarela?: string;
  referencia_pasarela: string | null;
  fecha_pago: string | null;
  created_at: string;
}

export interface User {
  id: string;
  rol: UserRole;
  email: string | null;
  telefono: string | null;
  identificacion: string | null;
  claveHash: string;
  nombre: string;
  estado: USState;
  codigoCPA: string | null;
  licencia: string | null;
  ptin: string | null;
  bancoNombre: string | null;
  bancoNumero: string | null;
  bancoRouting: string | null;
  bancoTitular: string | null;
  activo: boolean;
  createdAt: string;
  // Membresía Sociedad de Contadores ($50.00 USD)
  estadoAfiliacion?: EstadoAfiliacion;
  modalidadAfiliacion?: ModalidadAfiliacion;
  montoAfiliacion?: number; // $50.00 USD
  cuentaPorCobrarSaldo?: number; // Saldo pendiente por retener de primeros ingresos ($0 - $50)
  contratoAfiliacionFirmado?: boolean;
  contratoAfiliacionFecha?: string | null;
  clausulaFormaPagoTexto?: string;
  referenciaPagoAfiliacion?: string | null;
  // Campos para CPE, Abogado y Representante Legal
  colegiaturaAbogado?: string | null;
  colegioEntidad?: string | null;
  enlaceVerificacionOficial?: string | null;
  empresaRepresentada?: string | null;
  poderRepresentacionDoc?: string | null;
  paisJurisdiccion?: string;
}

export interface SoporteDocumento {
  id: string;
  nombre: string;
  tipo: string;
  tamano: string;
  fecha: string;
  categoria: 'IDENTIFICACION' | 'W2' | '1099' | 'DEDUCCIONES' | 'ESTADO_CUENTA' | 'OTRO';
  url?: string;
  previsualizacionTexto?: string;
}

export interface HistorialItem {
  id: string;
  fecha: string;
  accion: string;
  usuario: string;
  detalle: string;
}

export interface TaxCase {
  id: string;
  casoNumero: string;
  estado: USState;
  clienteUserId?: string | null;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  clienteData: {
    ssnLast4?: string;
    tipoDeclaracion?: 'Soltero' | 'Casado conjunto' | 'Cabeza de familia';
    ingresosEstimados?: number;
    anoFiscal?: number;
    direccion?: string;
    ocupacion?: string;
    dependientes?: number;
  };
  montoCobrado: number; // default $150
  clienteFirma?: {
    dataUrl: string;
    fecha: string;
    ip?: string;
  } | null;
  cpaUserId?: string | null;
  cpaCodigo?: string | null;
  cpaNombre?: string | null;
  cpaFirma?: {
    dataUrl: string;
    fecha: string;
    declaracionLegal?: string;
  } | null;
  contratoUrl?: string | null;
  contratoStatus: 'PENDIENTE' | 'FIRMADO';
  status: CaseStatus;
  comisionStatus: 'PENDIENTE' | 'PAGADO';
  comisionMonto: number; // default $45
  carpetaPath: string; // e.g. /2024/NY/CASO-00123/
  soportes: SoporteDocumento[];
  historial: HistorialItem[];
  notasCPA?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagoComision {
  id: string;
  cpaId: string;
  cpaCodigo: string;
  cpaNombre: string;
  cpaEstado: USState;
  monto: number; // Monto neto transferido
  montoBruto?: number; // Comisiones brutas generadas ($45 * casos)
  retencionAfiliacion?: number; // Monto descontado para cubrir cuota $50 de afiliación
  casosIncluidos: string[]; // array of case numbers
  metodoPago: string;
  bancoDestino: string;
  comprobanteUrl: string;
  referenciaBHD: string;
  fechaPago: string;
  estado: 'PAGADO' | 'EN_PROCESO';
}
