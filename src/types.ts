export type UserRole = 'CLIENTE' | 'CONTADOR' | 'FIRMA' | 'ADMIN' | 'DEV';

export type CaseStatus = 'REALIZADA' | 'EN_TRAMITE' | 'APROBADA';

export type USState = 'NY' | 'FL' | 'NJ' | 'TX' | 'RD';

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
  monto: number;
  casosIncluidos: string[]; // array of case numbers
  metodoPago: string;
  bancoDestino: string;
  comprobanteUrl: string;
  referenciaBHD: string;
  fechaPago: string;
  estado: 'PAGADO' | 'EN_PROCESO';
}
