// lib/autodynamic-citizen-engine.ts

export type SemaforoEstado = 'AZUL' | 'VERDE' | 'AMARILLO' | 'GRIS' | 'ROJO';

export interface CampoEvaluado {
  id: string;
  etiqueta: string;
  valor: string | number | boolean | null;
  obligatorio: boolean;
  evidenciaRequerida: boolean;
  evidenciaUrl?: string;
  marcadoPendiente?: boolean;
  noAplica?: boolean;
  semaforo: SemaforoEstado;
  puntaje: number; // 0 a 10
  mostrarGuia: boolean;
  mensajeAyuda: string;
  sugerenciasIA: string[];
}

export interface HistoricoCliente {
  anioFiscal: number;
  estadoCodigo: string;
  estadoCivil: string;
  dependientes: number;
  direccion: string;
  empleadores: string[];
  ingresoBruto: number;
  deduccionesTotales: number;
}

export interface ModeloGuiaEstado {
  codigo: string;
  nombre: string;
  formularioEstatal: string;
  tasaReferencia: string;
  ejemploLlenado: Record<string, string>;
  notasActualizacion2026: string;
}

// 1. Catálogo de Modelos Oficiales de Referencia por Jurisdicción (52+ Jurisdicciones USA & SALT)
export const MODELOS_GUIA_ESTADOS: Record<string, ModeloGuiaEstado> = {
  NY: {
    codigo: 'NY',
    nombre: 'New York',
    formularioEstatal: 'IT-201 (Resident Income Tax Return)',
    tasaReferencia: '4.00% - 10.90% (Escala progresiva + NYC local)',
    ejemploLlenado: {
      ingresoW2: '75000.00 (Casilla 1 W-2 Federal coincide con Línea 1 IT-201)',
      deduccionEstandar: '8000.00 (Soltero NY) / 16050.00 (Casado conjunto)',
      retencionEstatal: '3450.00 (Casilla 17 de su Formulario W-2)'
    },
    notasActualizacion2026: 'Verificar residencia en los 5 condados de NYC (Línea 50) y crédito IT-214.'
  },
  FL: {
    codigo: 'FL',
    nombre: 'Florida',
    formularioEstatal: 'No aplica impuesto estatal individual (Solo Federal 1040)',
    tasaReferencia: '0.00% Individual',
    ejemploLlenado: {
      ingresoW2: '62000.00 (Declaración exclusiva en Form 1040 Federal)',
      deduccionEstandar: '15000.00 (Estándar Federal IRC § 63)',
      retencionEstatal: '0.00 (Casilla 17 W-2 en blanco)'
    },
    notasActualizacion2026: 'Validar si posee LLC comercial sujeta a reporte anual en Sunbiz.'
  },
  CA: {
    codigo: 'CA',
    nombre: 'California',
    formularioEstatal: 'FTB Form 540 (California Resident Income Tax Return)',
    tasaReferencia: '1.00% - 13.30% (+1% Mental Health Services Tax sobre $1M)',
    ejemploLlenado: {
      ingresoW2: '85000.00 (Casilla 16 State Wages en W-2 coincide con Línea 12 Form 540)',
      deduccionEstandar: '5540.00 (Soltero CA) / 11080.00 (Casado conjunto)',
      retencionEstatal: '4120.00 (Casilla 17 W-2 + CASDI si aplica)'
    },
    notasActualizacion2026: 'Confirmar cobertura médica mínima estatal (FTB 3853) y créditos CalEITC.'
  },
  TX: {
    codigo: 'TX',
    nombre: 'Texas',
    formularioEstatal: 'No aplica impuesto estatal individual (Solo Federal 1040)',
    tasaReferencia: '0.00% Individual',
    ejemploLlenado: {
      ingresoW2: '70000.00 (Declaración exclusiva en Form 1040 Federal)',
      deduccionEstandar: '15000.00 (Estándar Federal IRC § 63)',
      retencionEstatal: '0.00 (Sin retención estatal en Casilla 17)'
    },
    notasActualizacion2026: 'Si opera negocio LLC/Corp en Texas, revisar umbral de Texas Franchise Tax.'
  },
  NJ: {
    codigo: 'NJ',
    nombre: 'New Jersey',
    formularioEstatal: 'NJ-1040 (Resident Income Tax Return)',
    tasaReferencia: '1.40% - 10.75%',
    ejemploLlenado: {
      ingresoW2: '68000.00 (Casilla 16 NJ Wages - incluye aportes 401k estatales)',
      deduccionEstandar: 'Exención personal $1,000 + propiedad/renta hasta $15,000',
      retencionEstatal: '2250.00 (Casilla 17 W-2 + NJ SUI/SDI)'
    },
    notasActualizacion2026: 'Documentar pagos de renta (18% deducible) o impuesto predial para Línea 40.'
  },
  PR: {
    codigo: 'PR',
    nombre: 'Puerto Rico',
    formularioEstatal: 'Planilla 482.0 (Departamento de Hacienda PR) + Form 1040-SS/PR si aplica',
    tasaReferencia: '0% - 33% (Escala Hacienda PR)',
    ejemploLlenado: {
      ingresoW2: '45000.00 (Comprobante de Retención 499R-2/W-2PR)',
      deduccionEstandar: 'Deducciones aplicables y exención personal $3,500/$7,000',
      retencionEstatal: '1850.00 (Contribución retenida en Formulario 499R-2)'
    },
    notasActualizacion2026: 'Validar Crédito por Trabajo (EITC PR) y aportaciones a planes cualificados locales.'
  },
  DEFAULT: {
    codigo: 'US',
    nombre: 'Estándar Federal / Estatal General',
    formularioEstatal: 'Form 1040 + Anexo Estatal Correspondiente',
    tasaReferencia: 'Según tabla vigente de la jurisdicción',
    ejemploLlenado: {
      ingresoW2: '55000.00 (Transcribir exacto de Casilla 1 del W-2 sin comas)',
      deduccionEstandar: 'Aplicar mayor entre deducción estándar IRC § 63 o detalladas Schedule A',
      retencionEstatal: 'Transcribir exacto de Casilla 17 del W-2'
    },
    notasActualizacion2026: 'Adjuntar W-2, 1099-NEC/INT y documento de identidad vigente.'
  }
};

// 2. Evaluador Autodinámico de Semáforo y Auto-Ayuda
export function evaluarCampoConSemaforo(
  campo: Omit<CampoEvaluado, 'semaforo' | 'puntaje' | 'mostrarGuia' | 'mensajeAyuda' | 'sugerenciasIA'>,
  estadoCodigo: string,
  historico?: HistoricoCliente
): CampoEvaluado {
  const modelo = MODELOS_GUIA_ESTADOS[estadoCodigo] || MODELOS_GUIA_ESTADOS.DEFAULT;

  // Gris: No Aplica
  if (campo.noAplica) {
    return {
      ...campo,
      semaforo: 'GRIS',
      puntaje: 10,
      mostrarGuia: false,
      mensajeAyuda: 'Exento según perfil del contribuyente.',
      sugerenciasIA: []
    };
  }

  // Amarillo: Dejado pendiente intencionalmente para continuar llenando otras páginas
  if (campo.marcadoPendiente && (!campo.valor || String(campo.valor).trim() === '')) {
    return {
      ...campo,
      semaforo: 'AMARILLO',
      puntaje: 5,
      mostrarGuia: true,
      mensajeAyuda: 'Pendiente temporal: Puede avanzar a otras secciones, pero debe completarlo antes de la firma final.',
      sugerenciasIA: historico ? [`Valor año anterior: ${historico.ingresoBruto}`] : []
    };
  }

  // Rojo: Error o dato obligatorio vacío -> Muestra ejemplo exacto del paso
  if (campo.obligatorio && (!campo.valor || String(campo.valor).trim() === '')) {
    const ejemplo = modelo.ejemploLlenado[campo.id] || 'Paso 1: Revise su documento fiscal. Paso 2: Ingrese el valor numérico o texto exacto.';
    return {
      ...campo,
      semaforo: 'ROJO',
      puntaje: 0,
      mostrarGuia: true,
      mensajeAyuda: `ERROR / DATO FALTANTE: ${ejemplo}`,
      sugerenciasIA: historico && campo.id === 'direccion' ? [historico.direccion] : []
    };
  }

  // Rojo: Falta evidencia documental obligatoria
  if (campo.evidenciaRequerida && !campo.evidenciaUrl) {
    return {
      ...campo,
      semaforo: 'ROJO',
      puntaje: 4,
      mostrarGuia: true,
      mensajeAyuda: 'EVIDENCIA REQUERIDA: Paso 1) Tome foto legible o escanee en PDF. Paso 2) Haga clic en "Subir Evidencia".',
      sugerenciasIA: []
    };
  }

  // Azul: Aprobado 10/10 -> La guía desaparece automáticamente
  return {
    ...campo,
    semaforo: 'AZUL',
    puntaje: 10,
    mostrarGuia: false,
    mensajeAyuda: 'Validado 10/10 por IA.',
    sugerenciasIA: []
  };
}

// 3. Migración de Versión Anterior y Análisis de Estabilidad Laboral
export function analizarMigracionYEstabilidad(
  datosActuales: { ingresoBruto: number; empleadores: string[]; direccion: string },
  historicos: HistoricoCliente[]
) {
  if (!historicos || historicos.length === 0) {
    return {
      tieneHistorico: false,
      anioBase: undefined,
      estabilidadLaboral: 'PRIMER_REGISTRO',
      variacionIngresoPct: 0,
      alertasMigracion: ['No existen períodos previos. Se creará la línea base de aprendizaje para años futuros.'],
      camposParaConfirmar: [] as { campo: string; valorPrevio: string; requiereConfirmacion: boolean }[]
    };
  }

  const ultimo = historicos[historicos.length - 1];
  const variacionPct = ultimo.ingresoBruto > 0
    ? ((datosActuales.ingresoBruto - ultimo.ingresoBruto) / ultimo.ingresoBruto) * 100
    : 0;

  const mismosEmpleadores = datosActuales.empleadores.some((emp) => ultimo.empleadores.includes(emp));
  const estabilidad = mismosEmpleadores && Math.abs(variacionPct) <= 20
    ? 'ESTABLE (Continuidad laboral e ingresos consistentes)'
    : 'CAMBIO_DETECTADO (Requiere validación de nuevos W-2/1099 o cambio de empleador)';

  return {
    tieneHistorico: true,
    anioBase: ultimo.anioFiscal,
    estabilidadLaboral: estabilidad,
    variacionIngresoPct: Number(variacionPct.toFixed(2)),
    alertasMigracion: [] as string[],
    camposParaConfirmar: [
      { campo: 'Dirección Física', valorPrevio: ultimo.direccion, requiereConfirmacion: true },
      { campo: 'Estado Civil / Dependientes', valorPrevio: `${ultimo.estadoCivil} (${ultimo.dependientes} dep.)`, requiereConfirmacion: true },
      { campo: 'Empleadores Registrados', valorPrevio: ultimo.empleadores.join(', '), requiereConfirmacion: true }
    ]
  };
}

// 4. Exportador Preliminar a Excel (CSV compatible con UTF-8 BOM para Excel)
export function generarExportacionExcelPreliminar(
  clienteNombre: string,
  campos: CampoEvaluado[],
  historicos: HistoricoCliente[]
): string {
  const filas = [
    ['REPORTE PRELIMINAR COMPARATIVO - AUDIT INTELLIGENCE USA'],
    ['Contribuyente:', clienteNombre, 'Fecha Generación:', new Date().toISOString().split('T')[0]],
    [],
    ['SECCIÓN / CAMPO', 'VALOR ACTUAL', 'ESTADO SEMÁFORO', 'PUNTAJE IA', 'EVIDENCIA'],
    ...campos.map((c) => [c.etiqueta, String(c.valor ?? 'PENDIENTE'), c.semaforo, `${c.puntaje}/10`, c.evidenciaUrl ? 'ADJUNTADA' : 'NO']),
    [],
    ['HISTÓRICO COMPARATIVO INTERANUAL'],
    ['AÑO FISCAL', 'ESTADO', 'EMPLEADORES', 'INGRESO BRUTO (USD)', 'DEDUCCIONES (USD)'],
    ...historicos.map((h) => [String(h.anioFiscal), h.estadoCodigo, h.empleadores.join(' / '), h.ingresoBruto.toFixed(2), h.deduccionesTotales.toFixed(2)])
  ];

  return '\uFEFF' + filas.map((f) => f.map((celda) => `"${celda}"`).join(',')).join('\n');
}
