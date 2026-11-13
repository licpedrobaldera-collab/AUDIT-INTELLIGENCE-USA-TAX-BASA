export interface TaxJurisdictionRule {
  countryCode: string;
  countryName: string;
  defaultLanguage: string;
  currency: string;
  taxAuthority: string;
  officialPortal: string;
  activityStandard: 'CIIU' | 'CNAE' | 'NAICS' | 'SCIAN' | 'JSIC' | 'OKVED' | 'ISIC';
  requiredForms: {
    INDIVIDUAL: string[];
    CORPORATE: string[];
    NON_PROFIT: string[];
  };
}

export const SUPPORTED_LANGUAGES = [
  { code: 'es', label: 'Español (ES)' },
  { code: 'en', label: 'English (EN)' },
  { code: 'it', label: 'Italiano (IT)' },
  { code: 'ja', label: '日本語 (JA)' },
  { code: 'zh', label: '中文 (ZH)' },
  { code: 'ru', label: 'Русский (RU)' },
  { code: 'pt', label: 'Português (PT)' },
  { code: 'fr', label: 'Français (FR)' }
] as const;

export const GLOBAL_TAX_MATRIX: Record<string, TaxJurisdictionRule> = {
  DO: {
    countryCode: 'DO',
    countryName: 'República Dominicana',
    defaultLanguage: 'es',
    currency: 'DOP',
    taxAuthority: 'DGII (Dirección General de Impuestos Internos)',
    officialPortal: 'https://dgii.gov.do',
    activityStandard: 'CIIU',
    requiredForms: {
      INDIVIDUAL: ['IR-1', 'Anexo A/B', '606/607'],
      CORPORATE: ['IR-2', 'Anexos A-J', 'IT-1', '606/607/608'],
      NON_PROFIT: ['Declaración Jurada ISFL (Ley 122-05)', '606/607']
    }
  },
  US: {
    countryCode: 'US',
    countryName: 'Estados Unidos (USA)',
    defaultLanguage: 'en',
    currency: 'USD',
    taxAuthority: 'IRS (Internal Revenue Service)',
    officialPortal: 'https://www.irs.gov',
    activityStandard: 'NAICS',
    requiredForms: {
      INDIVIDUAL: ['Form 1040', 'Schedule C / A', 'W-2 / 1099'],
      CORPORATE: ['Form 1120 / 1120-S', 'Form 1065', 'Schedule K-1'],
      NON_PROFIT: ['Form 990', 'Schedule A (501c3)']
    }
  },
  ES: {
    countryCode: 'ES',
    countryName: 'España',
    defaultLanguage: 'es',
    currency: 'EUR',
    taxAuthority: 'AEAT (Agencia Tributaria)',
    officialPortal: 'https://sede.agenciatributaria.gob.es',
    activityStandard: 'CNAE',
    requiredForms: {
      INDIVIDUAL: ['Modelo 100 (IRPF)', 'Modelo 303 (IVA)'],
      CORPORATE: ['Modelo 200 (Impuesto Sociedades)', 'Modelo 303', 'Modelo 347'],
      NON_PROFIT: ['Modelo 200 (Régimen Ley 49/2002)', 'Modelo 182']
    }
  },
  MX: {
    countryCode: 'MX',
    countryName: 'México',
    defaultLanguage: 'es',
    currency: 'MXN',
    taxAuthority: 'SAT (Servicio de Administración Tributaria)',
    officialPortal: 'https://www.sat.gob.mx',
    activityStandard: 'SCIAN',
    requiredForms: {
      INDIVIDUAL: ['Declaración Anual Personas Físicas', 'DIOT', 'CFDI'],
      CORPORATE: ['Declaración Anual Personas Morales (F-18)', 'IVA Mensual', 'ISSIF'],
      NON_PROFIT: ['Declaración Anual Donatarias Autorizadas (F-21)']
    }
  },
  CO: {
    countryCode: 'CO',
    countryName: 'Colombia',
    defaultLanguage: 'es',
    currency: 'COP',
    taxAuthority: 'DIAN',
    officialPortal: 'https://www.dian.gov.co',
    activityStandard: 'CIIU',
    requiredForms: {
      INDIVIDUAL: ['Formulario 210 (Renta Personas Naturales)', 'Información Exógena'],
      CORPORATE: ['Formulario 110 (Renta Jurídicas)', 'Formulario 300 (IVA)', 'RUT'],
      NON_PROFIT: ['Formulario 110 (Régimen Tributario Especial RTE)', 'Memoria Económica']
    }
  },
  GT: {
    countryCode: 'GT',
    countryName: 'Guatemala',
    defaultLanguage: 'es',
    currency: 'GTQ',
    taxAuthority: 'SAT Guatemala',
    officialPortal: 'https://portal.sat.gob.gt',
    activityStandard: 'CIIU',
    requiredForms: {
      INDIVIDUAL: ['SAT-1411 (ISR Asalariado/Actividades)', 'SAT-2237 (IVA)'],
      CORPORATE: ['SAT-1411 (ISR Régimen Sobre Utilidades)', 'SAT-1608 (ISO)', 'FEL'],
      NON_PROFIT: ['SAT-1411 (Exentos Art. 11)', 'Informe Anual Donaciones']
    }
  },
  IT: {
    countryCode: 'IT',
    countryName: 'Italia',
    defaultLanguage: 'it',
    currency: 'EUR',
    taxAuthority: 'Agenzia delle Entrate',
    officialPortal: 'https://www.agenziaentrate.gov.it',
    activityStandard: 'CNAE',
    requiredForms: {
      INDIVIDUAL: ['Modello 730 / Redditi PF', 'F24'],
      CORPORATE: ['Redditi SC (IRES)', 'Dichiarazione IRAP', 'Dichiarazione IVA'],
      NON_PROFIT: ['Redditi ENC (Enti Non Commerciali)']
    }
  },
  JP: {
    countryCode: 'JP',
    countryName: 'Japón',
    defaultLanguage: 'ja',
    currency: 'JPY',
    taxAuthority: 'NTA (National Tax Agency)',
    officialPortal: 'https://www.nta.go.jp',
    activityStandard: 'JSIC',
    requiredForms: {
      INDIVIDUAL: ['Kakutei Shinkoku (Final Tax Return Form B)', 'Blue Return'],
      CORPORATE: ['Beppyo 1 (Corporate Tax Return)', 'Consumption Tax Return'],
      NON_PROFIT: ['NPO Income Return (Profit-making activities)']
    }
  },
  CN: {
    countryCode: 'CN',
    countryName: 'China',
    defaultLanguage: 'zh',
    currency: 'CNY',
    taxAuthority: 'STA (State Taxation Administration)',
    officialPortal: 'https://www.chinatax.gov.cn',
    activityStandard: 'ISIC',
    requiredForms: {
      INDIVIDUAL: ['IIT Annual Reconciliation Form', 'Golden Tax System'],
      CORPORATE: ['Annual CIT Return (Form A)', 'VAT General Taxpayer Return'],
      NON_PROFIT: ['Non-Profit Organization Tax-Exempt Verification Form']
    }
  },
  RU: {
    countryCode: 'RU',
    countryName: 'Rusia',
    defaultLanguage: 'ru',
    currency: 'RUB',
    taxAuthority: 'FNS (Federal Tax Service)',
    officialPortal: 'https://www.nalog.gov.ru',
    activityStandard: 'OKVED',
    requiredForms: {
      INDIVIDUAL: ['3-NDFL (Personal Income Tax)'],
      CORPORATE: ['KND 1151006 (Corporate Profit Tax)', 'KND 1151001 (VAT)'],
      NON_PROFIT: ['KND 1151006 (Sheet 07 - Targeted Financing)']
    }
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canadá',
    defaultLanguage: 'en',
    currency: 'CAD',
    taxAuthority: 'CRA (Canada Revenue Agency)',
    officialPortal: 'https://www.canada.ca/en/revenue-agency.html',
    activityStandard: 'NAICS',
    requiredForms: {
      INDIVIDUAL: ['T1 General Income Tax Return', 'T4 Summary'],
      CORPORATE: ['T2 Corporation Income Tax Return', 'GST/HST Return'],
      NON_PROFIT: ['T3010 Registered Charity Return']
    }
  },
  BR: {
    countryCode: 'BR',
    countryName: 'Brasil',
    defaultLanguage: 'pt',
    currency: 'BRL',
    taxAuthority: 'Receita Federal do Brasil (RFB)',
    officialPortal: 'https://www.gov.br/receitafederal',
    activityStandard: 'CIIU',
    requiredForms: {
      INDIVIDUAL: ['DIRPF (Imposto de Renda Pessoa Física)'],
      CORPORATE: ['ECF / ECD (IRPJ & CSLL)', 'EFD-Contribuições'],
      NON_PROFIT: ['ECF (Entidades Imunes/Isentas)']
    }
  },
  FR: {
    countryCode: 'FR',
    countryName: 'Francia',
    defaultLanguage: 'fr',
    currency: 'EUR',
    taxAuthority: 'DGFiP (Direction Générale des Finances Publiques)',
    officialPortal: 'https://www.impots.gouv.fr',
    activityStandard: 'CNAE',
    requiredForms: {
      INDIVIDUAL: ['Déclaration 2042 (Impôt sur le Revenu)'],
      CORPORATE: ['Liasse Fiscale 2065 (IS)', 'TVA CA3'],
      NON_PROFIT: ['Déclaration 2070 (Organismes Sans But Lucratif)']
    }
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Alemania',
    defaultLanguage: 'en',
    currency: 'EUR',
    taxAuthority: 'BZSt / Finanzamt (ELSTER)',
    officialPortal: 'https://www.elster.de',
    activityStandard: 'CNAE',
    requiredForms: {
      INDIVIDUAL: ['Einkommensteuererklärung (ESt 1 A)'],
      CORPORATE: ['Körperschaftsteuererklärung (KSt 1)', 'USt 2 A'],
      NON_PROFIT: ['Anlage Gem (Gemeinnützige Körperschaften)']
    }
  },
  GB: {
    countryCode: 'GB',
    countryName: 'Reino Unido (UK)',
    defaultLanguage: 'en',
    currency: 'GBP',
    taxAuthority: 'HMRC (HM Revenue & Customs)',
    officialPortal: 'https://www.gov.uk/government/organisations/hm-revenue-customs',
    activityStandard: 'ISIC',
    requiredForms: {
      INDIVIDUAL: ['SA100 Self Assessment Tax Return'],
      CORPORATE: ['CT600 Company Tax Return', 'VAT100'],
      NON_PROFIT: ['CT600 (Charity Exemption Supplement)']
    }
  },
  PA: {
    countryCode: 'PA',
    countryName: 'Panamá',
    defaultLanguage: 'es',
    currency: 'USD',
    taxAuthority: 'DGI Panamá (e-Tax 2.0)',
    officialPortal: 'https://dgi.mef.gob.pa',
    activityStandard: 'CIIU',
    requiredForms: {
      INDIVIDUAL: ['Formulario 21 (Renta Persona Natural)'],
      CORPORATE: ['Formulario 22 (Renta Persona Jurídica)', 'ITBMS 430'],
      NON_PROFIT: ['Declaración Informativa ONG / Sin Fines de Lucro']
    }
  },
  CR: {
    countryCode: 'CR',
    countryName: 'Costa Rica',
    defaultLanguage: 'es',
    currency: 'CRC',
    taxAuthority: 'Ministerio de Hacienda (ATV / Tribu-CR)',
    officialPortal: 'https://www.hacienda.go.cr',
    activityStandard: 'CIIU',
    requiredForms: {
      INDIVIDUAL: ['D-101 (Declaración Impuesto Sobre la Renta)', 'D-104 (IVA)'],
      CORPORATE: ['D-101 Sociedades', 'D-104 IVA', 'RTBF'],
      NON_PROFIT: ['D-101 Exento Art. 3']
    }
  },
  AR: {
    countryCode: 'AR',
    countryName: 'Argentina',
    defaultLanguage: 'es',
    currency: 'ARS',
    taxAuthority: 'ARCA (ex AFIP)',
    officialPortal: 'https://www.afip.gob.ar',
    activityStandard: 'CIIU',
    requiredForms: {
      INDIVIDUAL: ['F.711 Ganancias Personas Humanas', 'F.762 Bienes Personales'],
      CORPORATE: ['F.713 Ganancias Sociedades', 'F.2002 IVA'],
      NON_PROFIT: ['F.713 Exento Art. 26']
    }
  },
  CL: {
    countryCode: 'CL',
    countryName: 'Chile',
    defaultLanguage: 'es',
    currency: 'CLP',
    taxAuthority: 'SII (Servicio de Impuestos Internos)',
    officialPortal: 'https://www.sii.cl',
    activityStandard: 'CIIU',
    requiredForms: {
      INDIVIDUAL: ['Formulario 22 (Operación Renta Global Complementario)'],
      CORPORATE: ['Formulario 22 (Primera Categoría)', 'Formulario 29 (IVA)'],
      NON_PROFIT: ['Formulario 22 (Régimen Corporaciones/Fundaciones)']
    }
  },
  PE: {
    countryCode: 'PE',
    countryName: 'Perú',
    defaultLanguage: 'es',
    currency: 'PEN',
    taxAuthority: 'SUNAT',
    officialPortal: 'https://www.sunat.gob.pe',
    activityStandard: 'CIIU',
    requiredForms: {
      INDIVIDUAL: ['Formulario Virtual 709 (Renta Anual Personas Naturales)'],
      CORPORATE: ['Formulario Virtual 710 (Renta Anual Tercera Categoría)', 'PDT 621 IGV'],
      NON_PROFIT: ['Formulario Virtual 710 (Exoneración Art. 19)']
    }
  },
  PR: {
    countryCode: 'PR',
    countryName: 'Puerto Rico',
    defaultLanguage: 'es',
    currency: 'USD',
    taxAuthority: 'Departamento de Hacienda (SURI)',
    officialPortal: 'https://suri.hacienda.pr.gov',
    activityStandard: 'NAICS',
    requiredForms: {
      INDIVIDUAL: ['Planilla de Contribución sobre Ingresos (Modelo 482)'],
      CORPORATE: ['Planilla de Corporaciones (Modelo 480.20)', 'IVU'],
      NON_PROFIT: ['Planilla Informativa Entidades Exentas (480.70)']
    }
  }
};

export interface ProductionStepTrace {
  stepNumber: number;
  key: 'REGISTRO' | 'EVIDENCIAS' | 'CUESTIONARIO_IA' | 'AUDITORIA_100' | 'FIRMA' | 'PAGO_RESULTADOS';
  label: string;
  status: 'COMPLETADO' | 'EN_CURSO' | 'PENDIENTE';
  timestamp?: string;
}

export interface ProductionApplicationRecord {
  id: string;
  applicantName: string;
  role: string;
  email: string;
  phone?: string;
  countryCode: string;
  countryName: string;
  language: string;
  currency: string;
  entityType: EntityType;
  currentStep: number;
  totalSteps: number;
  status: 'REGISTRO_REAL_ACTIVO' | 'EN_PROGRESO' | 'AUDITADO_100' | 'COMPLETADO_PAGADO';
  isRealProduction: boolean;
  stepsTrace: ProductionStepTrace[];
  evidenceCount: number;
  questionsAnswered: number;
  totalQuestions: number;
  complianceScore: number;
  estimatedTaxAmount?: number;
  feePaid?: number;
  lastSavedAt: string;
  createdAt: string;
}

export function formatCurrencyForJurisdiction(amount: number, currency: string): string {
  const cleanCurr = (currency || 'USD').split(' ')[0].trim().toUpperCase();
  const safeVal = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: cleanCurr.length === 3 ? cleanCurr : 'USD',
      maximumFractionDigits: 2
    }).format(safeVal);
  } catch {
    return `${cleanCurr} ${safeVal.toLocaleString()}`;
  }
}

export function getJurisdictionRule(countryCode: string): TaxJurisdictionRule {
  const code = countryCode.trim().toUpperCase() || 'US';
  if (GLOBAL_TAX_MATRIX[code]) {
    return GLOBAL_TAX_MATRIX[code];
  }
  return {
    countryCode: code,
    countryName: `Jurisdicción Internacional (${code})`,
    defaultLanguage: 'en',
    currency: 'USD',
    taxAuthority: `Autoridad Tributaria Nacional (${code})`,
    officialPortal: `https://www.google.com/search?q=tax+authority+${encodeURIComponent(code)}`,
    activityStandard: 'ISIC',
    requiredForms: {
      INDIVIDUAL: [`Personal Income Tax Return (${code})`],
      CORPORATE: [`Corporate Income Tax & VAT Return (${code})`],
      NON_PROFIT: [`NGO / Non-Profit Annual Return (${code})`]
    }
  };
}

export type ProfessionalRole = 'ACCOUNTANT' | 'AUDITOR' | 'LEGAL_ADVISOR';
export type EntityType = 'INDIVIDUAL' | 'CORPORATE' | 'NON_PROFIT';

export interface CertifiedProfessional {
  id: string;
  fullName: string;
  role: ProfessionalRole;
  countryCode: string;
  licenseNumber: string;
  issuingAuthority: string;
  officialValidationUrl: string;
  evidenceFileUrl: string;
  verificationStatus: 'PENDING_VALIDATION' | 'VERIFIED' | 'REJECTED';
  commissionRate: number; // % de comisión por caso (ej. 0.40 = 40%)
  walletBalance: number;
  createdAt: string;
}

export interface CaseDocumentItem {
  name: string;
  type: 'TAX_RETURN_DRAFT' | 'AUDIT_WORKPAPER' | 'LEGAL_OPINION' | 'EVIDENCE';
  status: 'DRAFT_BY_AI' | 'REVIEWED' | 'FINAL_SIGNED';
}

export interface ClientCaseFolder {
  caseId: string;
  clientName: string;
  countryCode: string;
  taxYear: number;
  entityType: EntityType;
  sectorCode: string;
  folderPath: string;
  documents: CaseDocumentItem[];
  assignedTeam: {
    accountantId?: string;
    auditorId?: string;
    legalAdvisorId?: string;
  };
  totalFee: number;
  status: 'INITIATED' | 'AUTO_POPULATED' | 'UNDER_AUDIT' | 'READY_TO_FILE';
  createdAt: string;
  lastDistribution?: SplitPaymentRecord;
}

export interface SplitPaymentShare {
  professionalId: string;
  fullName: string;
  role: ProfessionalRole;
  rate: number;
  amount: number;
}

export interface SplitPaymentRecord {
  id: string;
  caseId: string;
  folderPath: string;
  totalFee: number;
  platformShare: number;
  platformRate: number;
  shares: SplitPaymentShare[];
  distributedAt: string;
}

const STORAGE_PROS_KEY = 'audit_global_pros_v3';
const STORAGE_CASES_KEY = 'audit_global_cases_v3';
const STORAGE_SPLITS_KEY = 'audit_global_splits_v3';

const INITIAL_PROFESSIONALS: CertifiedProfessional[] = [
  {
    id: 'PRO-ACC-101',
    fullName: 'Lic. Pedro Baldera (CPA / Contador Público)',
    role: 'ACCOUNTANT',
    countryCode: 'DO',
    licenseNumber: 'EXQ-14829-ICPARD',
    issuingAuthority: 'ICPARD / AICPA',
    officialValidationUrl: 'https://www.icpard.org',
    evidenceFileUrl: 'Exequatur_CPA_Pedro_Baldera.pdf',
    verificationStatus: 'VERIFIED',
    commissionRate: 0.40,
    walletBalance: 0,
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'PRO-AUD-202',
    fullName: 'Lic. Sofía Martínez (Auditora Forense)',
    role: 'AUDITOR',
    countryCode: 'ES',
    licenseNumber: 'ROAC-28491',
    issuingAuthority: 'ICAC / IIA Global',
    officialValidationUrl: 'https://www.icac.gob.es',
    evidenceFileUrl: 'Certificacion_ROAC_Auditoria.pdf',
    verificationStatus: 'VERIFIED',
    commissionRate: 0.20,
    walletBalance: 0,
    createdAt: '2026-01-16T11:00:00.000Z'
  },
  {
    id: 'PRO-LEG-303',
    fullName: 'Dr. Carlos Mendoza (Asesor Legal Tributario)',
    role: 'LEGAL_ADVISOR',
    countryCode: 'MX',
    licenseNumber: 'CED-9481023-SEP',
    issuingAuthority: 'Barra Mexicana / Colegio Abogados',
    officialValidationUrl: 'https://cedulaprofesional.sep.gob.mx',
    evidenceFileUrl: 'Cedula_Derecho_Tributario.pdf',
    verificationStatus: 'VERIFIED',
    commissionRate: 0.15,
    walletBalance: 0,
    createdAt: '2026-01-17T09:30:00.000Z'
  }
];

export class ProfessionalVerificationModule {
  private registry: Map<string, CertifiedProfessional> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') {
      INITIAL_PROFESSIONALS.forEach(p => this.registry.set(p.id, { ...p }));
      return;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_PROS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CertifiedProfessional[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(p => this.registry.set(p.id, p));
          return;
        }
      }
    } catch {
      // fallback to initial
    }
    INITIAL_PROFESSIONALS.forEach(p => this.registry.set(p.id, { ...p }));
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_PROS_KEY, JSON.stringify(this.listAll()));
    } catch {
      // ignore quota error
    }
  }

  registerProfessional(
    data: Omit<CertifiedProfessional, 'id' | 'verificationStatus' | 'walletBalance' | 'createdAt'>
  ): CertifiedProfessional {
    if (!data.officialValidationUrl || !data.officialValidationUrl.startsWith('https://')) {
      throw new Error('Debe incluir el enlace web oficial (https://) del colegio o entidad reguladora.');
    }
    if (!data.licenseNumber.trim()) {
      throw new Error('El número de exequátur, licencia o cédula profesional es obligatorio.');
    }

    const prefix = data.role === 'ACCOUNTANT' ? 'ACC' : data.role === 'AUDITOR' ? 'AUD' : 'LEG';
    const newPro: CertifiedProfessional = {
      ...data,
      id: `PRO-${prefix}-${Date.now().toString().slice(-5)}`,
      verificationStatus: 'PENDING_VALIDATION',
      walletBalance: 0,
      createdAt: new Date().toISOString()
    };

    this.registry.set(newPro.id, newPro);
    this.saveToStorage();
    return newPro;
  }

  verifyProfessional(id: string): CertifiedProfessional | null {
    const pro = this.registry.get(id);
    if (!pro) return null;
    pro.verificationStatus = 'VERIFIED';
    this.registry.set(id, pro);
    this.saveToStorage();
    return { ...pro };
  }

  updateCommissionRate(id: string, rate: number): CertifiedProfessional | null {
    const pro = this.registry.get(id);
    if (!pro) return null;
    pro.commissionRate = Math.max(0.01, Math.min(0.85, rate));
    this.registry.set(id, pro);
    this.saveToStorage();
    return { ...pro };
  }

  creditWallet(id: string, amount: number): CertifiedProfessional | null {
    const pro = this.registry.get(id);
    if (!pro) return null;
    pro.walletBalance = Number((pro.walletBalance + amount).toFixed(2));
    this.registry.set(id, pro);
    this.saveToStorage();
    return { ...pro };
  }

  getById(id: string): CertifiedProfessional | undefined {
    const item = this.registry.get(id);
    return item ? { ...item } : undefined;
  }

  listAll(): CertifiedProfessional[] {
    return Array.from(this.registry.values()).map(p => ({ ...p }));
  }

  getVerifiedByRole(role: ProfessionalRole): CertifiedProfessional[] {
    return this.listAll().filter(p => p.role === role && p.verificationStatus === 'VERIFIED');
  }
}

export class AutonomousCaseManager {
  private cases: Map<string, ClientCaseFolder> = new Map();
  private splitHistory: SplitPaymentRecord[] = [];
  private proModule: ProfessionalVerificationModule;

  constructor(proModule: ProfessionalVerificationModule) {
    this.proModule = proModule;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const rawCases = window.localStorage.getItem(STORAGE_CASES_KEY);
      if (rawCases) {
        const parsed = JSON.parse(rawCases) as ClientCaseFolder[];
        if (Array.isArray(parsed)) {
          parsed.forEach(c => this.cases.set(c.caseId, c));
        }
      }
      const rawSplits = window.localStorage.getItem(STORAGE_SPLITS_KEY);
      if (rawSplits) {
        const parsedSplits = JSON.parse(rawSplits) as SplitPaymentRecord[];
        if (Array.isArray(parsedSplits)) {
          this.splitHistory = parsedSplits;
        }
      }
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_CASES_KEY, JSON.stringify(this.listCases()));
      window.localStorage.setItem(STORAGE_SPLITS_KEY, JSON.stringify(this.splitHistory));
    } catch {
      // ignore
    }
  }

  createAutonomousCase(params: {
    clientName: string;
    countryCode: string;
    taxYear: number;
    entityType: EntityType;
    sectorCode: string;
    totalFee: number;
    assignedTeam?: {
      accountantId?: string;
      auditorId?: string;
      legalAdvisorId?: string;
    };
  }): ClientCaseFolder {
    const country = params.countryCode.trim().toUpperCase() || 'US';
    const year = params.taxYear || new Date().getFullYear();
    const caseId = `CASE-${country}-${year}-${Date.now().toString().slice(-5)}`;
    const cleanClient = params.clientName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'CLIENT';
    const folderPath = `/expedientes/${country}/${year}/${cleanClient}_${caseId}/`;

    const rules = getJurisdictionRule(country);
    const primaryForm = rules.requiredForms[params.entityType][0] || 'Tax_Return_Form';

    const newCase: ClientCaseFolder = {
      caseId,
      clientName: params.clientName.trim(),
      countryCode: country,
      taxYear: year,
      entityType: params.entityType,
      sectorCode: params.sectorCode.trim() || `${rules.activityStandard}-GEN`,
      folderPath,
      documents: [
        { name: `Borrador_${primaryForm.replace(/[^a-zA-Z0-9_-]/g, '_')}`, type: 'TAX_RETURN_DRAFT', status: 'DRAFT_BY_AI' },
        { name: `Papeles_de_Trabajo_Auditoria_${year}.xlsx`, type: 'AUDIT_WORKPAPER', status: 'DRAFT_BY_AI' },
        { name: `Dictamen_Cumplimiento_Normativo_${country}.pdf`, type: 'LEGAL_OPINION', status: 'DRAFT_BY_AI' }
      ],
      assignedTeam: params.assignedTeam || {},
      totalFee: Math.max(50, Number(params.totalFee) || 350),
      status: 'AUTO_POPULATED',
      createdAt: new Date().toISOString()
    };

    this.cases.set(caseId, newCase);
    this.saveToStorage();
    return { ...newCase };
  }

  approveAndDistributeCommissions(
    caseId: string,
    totalFee: number,
    teamIds: { accountantId: string; auditorId: string; legalAdvisorId: string }
  ): SplitPaymentRecord {
    const caseData = this.cases.get(caseId);
    if (!caseData) {
      throw new Error('Expediente no encontrado.');
    }

    const accountant = this.proModule.getById(teamIds.accountantId);
    const auditor = this.proModule.getById(teamIds.auditorId);
    const legal = this.proModule.getById(teamIds.legalAdvisorId);

    if (
      accountant?.verificationStatus !== 'VERIFIED' ||
      auditor?.verificationStatus !== 'VERIFIED' ||
      legal?.verificationStatus !== 'VERIFIED'
    ) {
      throw new Error('Todos los profesionales asignados (Contador, Auditor y Asesor Legal) deben estar VERIFICADOS.');
    }

    const combinedRate = accountant.commissionRate + auditor.commissionRate + legal.commissionRate;
    if (combinedRate > 0.95) {
      throw new Error('La suma de comisiones del equipo no puede exceder el 95% del honorario total.');
    }

    const accAmount = Number((totalFee * accountant.commissionRate).toFixed(2));
    const audAmount = Number((totalFee * auditor.commissionRate).toFixed(2));
    const legAmount = Number((totalFee * legal.commissionRate).toFixed(2));
    const platformShare = Number((totalFee - accAmount - audAmount - legAmount).toFixed(2));
    const platformRate = Number((1 - combinedRate).toFixed(4));

    this.proModule.creditWallet(accountant.id, accAmount);
    this.proModule.creditWallet(auditor.id, audAmount);
    this.proModule.creditWallet(legal.id, legAmount);

    const record: SplitPaymentRecord = {
      id: `SPLIT-${Date.now().toString().slice(-6)}`,
      caseId,
      folderPath: caseData.folderPath,
      totalFee,
      platformShare,
      platformRate,
      shares: [
        { professionalId: accountant.id, fullName: accountant.fullName, role: accountant.role, rate: accountant.commissionRate, amount: accAmount },
        { professionalId: auditor.id, fullName: auditor.fullName, role: auditor.role, rate: auditor.commissionRate, amount: audAmount },
        { professionalId: legal.id, fullName: legal.fullName, role: legal.role, rate: legal.commissionRate, amount: legAmount }
      ],
      distributedAt: new Date().toISOString()
    };

    caseData.assignedTeam = { ...teamIds };
    caseData.totalFee = totalFee;
    caseData.status = 'READY_TO_FILE';
    caseData.documents = caseData.documents.map(d => ({ ...d, status: 'FINAL_SIGNED' }));
    caseData.lastDistribution = record;

    this.cases.set(caseId, caseData);
    this.splitHistory.unshift(record);
    this.saveToStorage();
    return record;
  }

  listCases(): ClientCaseFolder[] {
    return Array.from(this.cases.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  listSplitHistory(): SplitPaymentRecord[] {
    return [...this.splitHistory];
  }
}
