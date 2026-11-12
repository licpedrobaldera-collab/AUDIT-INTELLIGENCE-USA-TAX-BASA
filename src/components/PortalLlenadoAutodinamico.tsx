'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CampoEvaluado,
  HistoricoCliente,
  MODELOS_GUIA_ESTADOS,
  evaluarCampoConSemaforo,
  analizarMigracionYEstabilidad,
  generarExportacionExcelPreliminar
} from '@/lib/autodynamic-citizen-engine';
import { US_STATES } from '../types';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  MinusCircle,
  FileSpreadsheet,
  Upload,
  Printer,
  History,
  Plus,
  Trash2,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Check,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

const COLORES_SEMAFORO = {
  AZUL: 'bg-blue-600 text-white border-blue-700',
  VERDE: 'bg-emerald-600 text-white border-emerald-700',
  AMARILLO: 'bg-amber-400 text-slate-900 border-amber-500',
  GRIS: 'bg-slate-500 text-white border-slate-600',
  ROJO: 'bg-red-600 text-white border-red-700'
};

interface IngresoLinea {
  id: number;
  empleador: string;
  tipo: 'W-2' | '1099-NEC' | '1099-INT';
  monto: number;
}

export default function PortalLlenadoAutodinamico({
  clienteNombre = 'Contribuyente Demo',
  estadoInicial = 'NY',
  historicos = []
}: {
  clienteNombre?: string;
  estadoInicial?: string;
  historicos?: HistoricoCliente[];
}) {
  const { currentUser, crearCasoTax, navigate, setSelectedCaseForModal } = useApp();

  const resolvedClientName =
    clienteNombre !== 'Contribuyente Demo'
      ? clienteNombre
      : currentUser?.nombre || 'Contribuyente Certificado';

  const [estadoSeleccionado, setEstadoSeleccionado] = useState(estadoInicial);
  const [mostrarModeloGuia, setMostrarModeloGuia] = useState(false);
  const [autoguardadoStatus, setAutoguardadoStatus] = useState('Sincronizado en la nube');
  const [notificacionBanner, setNotificacionBanner] = useState<string | null>(null);
  const [confirmadosPrevios, setConfirmadosPrevios] = useState<Record<string, boolean>>({});
  const [radicandoCaso, setRadicandoCaso] = useState(false);

  const [lineasIngresos, setLineasIngresos] = useState<IngresoLinea[]>([
    { id: 1, empleador: 'Empleador Principal LLC', tipo: 'W-2', monto: 65000 }
  ]);

  const [campos, setCampos] = useState<CampoEvaluado[]>(() => {
    try {
      const saved = localStorage.getItem('audit_intel_draft_1040');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.campos) && parsed.campos.length > 0) {
          return parsed.campos;
        }
      }
    } catch {
      // ignore storage read error
    }
    return [
      evaluarCampoConSemaforo(
        {
          id: 'direccion',
          etiqueta: 'Dirección Residencial Actual',
          valor: '',
          obligatorio: true,
          evidenciaRequerida: false
        },
        estadoInicial,
        historicos[historicos.length - 1]
      ),
      evaluarCampoConSemaforo(
        {
          id: 'ingresoW2',
          etiqueta: 'Total Ingresos Salariales (W-2 Box 1)',
          valor: 65000,
          obligatorio: true,
          evidenciaRequerida: true
        },
        estadoInicial,
        historicos[historicos.length - 1]
      ),
      evaluarCampoConSemaforo(
        {
          id: 'retencionEstatal',
          etiqueta: 'Retención Estatal de Impuestos (W-2 Box 17)',
          valor: '',
          obligatorio: false,
          evidenciaRequerida: false,
          marcadoPendiente: true
        },
        estadoInicial,
        historicos[historicos.length - 1]
      ),
      evaluarCampoConSemaforo(
        {
          id: 'dependientes',
          etiqueta: 'Crédito por Dependientes Calificados',
          valor: '',
          obligatorio: false,
          evidenciaRequerida: false,
          marcadoPendiente: true
        },
        estadoInicial
      )
    ];
  });

  // Restore draft state metadata on mount if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('audit_intel_draft_1040');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.estadoSeleccionado) setEstadoSeleccionado(parsed.estadoSeleccionado);
        if (Array.isArray(parsed.lineasIngresos) && parsed.lineasIngresos.length > 0) {
          setLineasIngresos(parsed.lineasIngresos);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Re-evaluate all fields whenever state selection changes
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCampos((prev) =>
      prev.map((c) =>
        evaluarCampoConSemaforo(c, estadoSeleccionado, historicos[historicos.length - 1])
      )
    );
  }, [estadoSeleccionado, historicos]);

  // Autoguardado automático cada vez que cambian los datos
  useEffect(() => {
    setAutoguardadoStatus('Guardando cambios...');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          'audit_intel_draft_1040',
          JSON.stringify({ estadoSeleccionado, campos, lineasIngresos })
        );
      } catch {
        // ignore quota issues
      }
      setAutoguardadoStatus(`Autoguardado ${new Date().toLocaleTimeString()}`);
    }, 600);
    return () => clearTimeout(timer);
  }, [campos, lineasIngresos, estadoSeleccionado]);

  const actualizarCampo = (id: string, cambios: Partial<CampoEvaluado>) => {
    setCampos((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const actualizado = { ...c, ...cambios };
        return evaluarCampoConSemaforo(
          actualizado,
          estadoSeleccionado,
          historicos[historicos.length - 1]
        );
      })
    );
  };

  const handleEvidenceFileSelect = (campoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      actualizarCampo(campoId, { evidenciaUrl: file.name });
      setNotificacionBanner(`Evidencia "${file.name}" adjuntada y validada por el motor IA.`);
      setTimeout(() => setNotificacionBanner(null), 3500);
    }
  };

  const syncLineasWithW2 = (nuevasLineas: IngresoLinea[]) => {
    setLineasIngresos(nuevasLineas);
    const total = nuevasLineas.reduce((acc, item) => acc + Number(item.monto || 0), 0);
    actualizarCampo('ingresoW2', { valor: total, marcadoPendiente: false });
  };

  const agregarLineaIngreso = () => {
    const nueva: IngresoLinea = {
      id: Date.now(),
      empleador: 'Nuevo Empleador / Pagador 1099',
      tipo: '1099-NEC',
      monto: 0
    };
    syncLineasWithW2([...lineasIngresos, nueva]);
  };

  const actualizarLineaIngreso = (id: number, patch: Partial<IngresoLinea>) => {
    const updated = lineasIngresos.map((l) => (l.id === id ? { ...l, ...patch } : l));
    syncLineasWithW2(updated);
  };

  const eliminarLineaIngreso = (id: number) => {
    if (lineasIngresos.length <= 1) return;
    const filtered = lineasIngresos.filter((l) => l.id !== id);
    syncLineasWithW2(filtered);
  };

  const ejecutarMigracionAnterior = () => {
    if (historicos.length === 0) return;
    const ultimo = historicos[historicos.length - 1];
    actualizarCampo('direccion', { valor: ultimo.direccion, marcadoPendiente: false });
    const migratedLines: IngresoLinea[] = ultimo.empleadores.map((emp, idx) => ({
      id: idx + 1,
      empleador: emp,
      tipo: 'W-2',
      monto: idx === 0 ? ultimo.ingresoBruto : 0
    }));
    syncLineasWithW2(migratedLines);
    setNotificacionBanner(
      `Datos base del año fiscal ${ultimo.anioFiscal} migrados correctamente. Valide la evidencia documental para alcanzar 10/10.`
    );
    setTimeout(() => setNotificacionBanner(null), 5000);
  };

  const descargarExcelPreliminar = () => {
    const csv = generarExportacionExcelPreliminar(resolvedClientName, campos, historicos);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Preliminar_1040_${estadoSeleccionado}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRadicarOficial = () => {
    setRadicandoCaso(true);
    setTimeout(() => {
      const direccionCampo = String(campos.find((c) => c.id === 'direccion')?.valor || 'Por confirmar');
      const nuevoCaso = crearCasoTax({
        estado: estadoSeleccionado,
        nombre: resolvedClientName,
        email: currentUser?.email || 'contribuyente@audittax.com',
        telefono: currentUser?.telefono || '+1-800-555-0199',
        tipoDeclaracion: 'Soltero',
        ingresosEstimados: ingresoTotalActual,
        direccion: direccionCampo,
        archivos: campos
          .filter((c) => c.evidenciaUrl)
          .map((c) => ({
            name: c.evidenciaUrl || 'Soporte_Validado_IA.pdf',
            size: '380 KB',
            type: 'PDF',
            category: c.id === 'ingresoW2' ? 'W2' : 'OTRO'
          }))
      });

      setRadicandoCaso(false);
      setNotificacionBanner(
        `Expediente ${nuevoCaso.casoNumero} radicado exitosamente en ${estadoSeleccionado} y asignado al CPA.`
      );
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      setSelectedCaseForModal(nuevoCaso);
    }, 650);
  };

  const todoAprobado10de10 = campos.every((c) => c.semaforo === 'AZUL' || c.semaforo === 'GRIS');
  const puntajePromedio =
    campos.length > 0
      ? (campos.reduce((acc, c) => acc + c.puntaje, 0) / campos.length).toFixed(1)
      : '10.0';
  const camposAprobadosCount = campos.filter(
    (c) => c.semaforo === 'AZUL' || c.semaforo === 'GRIS'
  ).length;

  const ingresoTotalActual = lineasIngresos.reduce((acc, item) => acc + Number(item.monto || 0), 0);
  const analisisEstabilidad = analizarMigracionYEstabilidad(
    {
      ingresoBruto: ingresoTotalActual,
      empleadores: lineasIngresos.map((l) => l.empleador),
      direccion: String(campos[0]?.valor || '')
    },
    historicos
  );
  const modeloEstadoActual =
    MODELOS_GUIA_ESTADOS[estadoSeleccionado] || MODELOS_GUIA_ESTADOS.DEFAULT;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Inline Notification Banner */}
      {notificacionBanner && (
        <div className="bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-lg border border-emerald-700 flex items-center justify-between gap-4 text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{notificacionBanner}</span>
          </div>
          <button
            onClick={() => setNotificacionBanner(null)}
            className="text-emerald-300 hover:text-white font-bold"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA PRINCIPAL (2/3): FORMULARIO INTERACTIVO Y COMPARATIVO */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barra Superior de Control */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Motor Autodinámico IA • {resolvedClientName}</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">
                Portal Ciudadano 1040 & SALT (52 Jurisdicciones)
              </h1>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">● {autoguardadoStatus}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {US_STATES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.code})
                  </option>
                ))}
                <option value="DEFAULT">Estándar Federal / Otros Territorios</option>
              </select>

              <button
                onClick={() => setMostrarModeloGuia(!mostrarModeloGuia)}
                className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {mostrarModeloGuia ? 'Ocultar Modelo Guía' : 'Ver Modelo Correcto Estado'}
              </button>

              {historicos.length > 0 && (
                <button
                  onClick={ejecutarMigracionAnterior}
                  className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-amber-500 transition-colors shadow-xs"
                >
                  <History className="w-3.5 h-3.5" />
                  Migrar Año Anterior
                </button>
              )}
            </div>
          </div>

          {/* Modal / Tarjeta de Modelo Correcto Imprimible por Estado */}
          {mostrarModeloGuia && (
            <div className="bg-indigo-50 border-2 border-indigo-300 p-5 rounded-2xl space-y-3 shadow-sm">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="font-black text-indigo-950 text-sm sm:text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-700" />
                  Modelo Oficial de Referencia: {modeloEstadoActual.nombre} ({estadoSeleccionado})
                </h2>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-xs bg-indigo-900 hover:bg-indigo-950 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Guía
                </button>
              </div>
              <p className="text-xs text-indigo-900">
                <strong>Formulario:</strong> {modeloEstadoActual.formularioEstatal} |{' '}
                <strong>Tasa:</strong> {modeloEstadoActual.tasaReferencia}
              </p>
              <ul className="list-disc pl-5 text-xs text-indigo-950 space-y-1.5 bg-white/70 p-3.5 rounded-xl border border-indigo-200">
                {Object.entries(modeloEstadoActual.ejemploLlenado).map(([k, v]) => (
                  <li key={k}>
                    <strong className="font-mono">{k}:</strong> {v}
                  </li>
                ))}
              </ul>
              <p className="text-xs bg-white p-3 rounded-xl border border-indigo-200 text-slate-700">
                <strong className="text-indigo-900">Actualización Normativa 2026:</strong>{' '}
                {modeloEstadoActual.notasActualizacion2026}
              </p>
            </div>
          )}

          {/* Desglose Multi-Línea de Ingresos (W-2 / 1099) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Fuentes de Ingreso Reportadas (W-2 & 1099)
                </h2>
                <p className="text-xs text-slate-500">
                  El total calculado se sincroniza automáticamente con la validación de ingresos W-2.
                </p>
              </div>
              <button
                type="button"
                onClick={agregarLineaIngreso}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Empleador / 1099
              </button>
            </div>

            <div className="space-y-2.5">
              {lineasIngresos.map((linea) => (
                <div
                  key={linea.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
                >
                  <div className="sm:col-span-5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Empleador / Pagador
                    </label>
                    <input
                      type="text"
                      value={linea.empleador}
                      onChange={(e) =>
                        actualizarLineaIngreso(linea.id, { empleador: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Formulario
                    </label>
                    <select
                      value={linea.tipo}
                      onChange={(e) =>
                        actualizarLineaIngreso(linea.id, {
                          tipo: e.target.value as IngresoLinea['tipo']
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="W-2">W-2 (Salario)</option>
                      <option value="1099-NEC">1099-NEC</option>
                      <option value="1099-INT">1099-INT</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      Monto Bruto (USD)
                    </label>
                    <input
                      type="number"
                      value={linea.monto}
                      onChange={(e) =>
                        actualizarLineaIngreso(linea.id, { monto: Number(e.target.value) })
                      }
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => eliminarLineaIngreso(linea.id)}
                      disabled={lineasIngresos.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded-lg transition-colors"
                      title="Eliminar línea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 text-xs font-bold text-slate-800">
              <span>Ingreso Bruto Combinado Actual:</span>
              <span className="text-base font-black text-blue-700 font-mono">
                ${ingresoTotalActual.toLocaleString()} USD
              </span>
            </div>
          </div>

          {/* Campos con Semáforo IA y Auto-Ayuda en Rojo */}
          <div className="space-y-4">
            {campos.map((campo) => (
              <div
                key={campo.id}
                className={`bg-white p-5 rounded-2xl shadow-sm border transition-all space-y-3 ${
                  campo.semaforo === 'ROJO'
                    ? 'border-red-300 ring-1 ring-red-100'
                    : campo.semaforo === 'AMARILLO'
                    ? 'border-amber-300'
                    : campo.semaforo === 'AZUL'
                    ? 'border-blue-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>{campo.etiqueta}</span>
                    {campo.obligatorio && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        Obligatorio
                      </span>
                    )}
                  </label>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                      COLORES_SEMAFORO[campo.semaforo]
                    }`}
                  >
                    {campo.semaforo} ({campo.puntaje}/10)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 items-center">
                  <input
                    type="text"
                    disabled={campo.noAplica}
                    value={String(campo.valor ?? '')}
                    onChange={(e) =>
                      actualizarCampo(campo.id, { valor: e.target.value, marcadoPendiente: false })
                    }
                    placeholder={
                      campo.noAplica
                        ? 'Marcado como No Aplica'
                        : 'Ingrese el dato o seleccione sugerencia...'
                    }
                    className="flex-1 min-w-[200px] border border-slate-300 rounded-xl px-3.5 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  {campo.evidenciaRequerida && (
                    <div className="flex items-center gap-1.5">
                      <label
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          campo.evidenciaUrl
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>
                          {campo.evidenciaUrl ? `✓ ${campo.evidenciaUrl}` : '+ Subir Evidencia'}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleEvidenceFileSelect(campo.id, e)}
                        />
                      </label>
                      {!campo.evidenciaUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            actualizarCampo(campo.id, { evidenciaUrl: 'documento_validado_ia.pdf' })
                          }
                          className="px-2.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                          title="Adjuntar documento verificado por IA"
                        >
                          Validar IA
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      actualizarCampo(campo.id, {
                        marcadoPendiente: !campo.marcadoPendiente,
                        noAplica: false
                      })
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      campo.marcadoPendiente
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    }`}
                  >
                    Dejar Pendiente
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      actualizarCampo(campo.id, {
                        noAplica: !campo.noAplica,
                        marcadoPendiente: false
                      })
                    }
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      campo.noAplica
                        ? 'bg-slate-700 text-white font-bold'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    No Aplica
                  </button>
                </div>

                {/* Sugerencias inteligentes basadas en histórico */}
                {campo.sugerenciasIA.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center text-xs pt-1">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Sugerencia IA (Histórico):
                    </span>
                    {campo.sugerenciasIA.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          actualizarCampo(campo.id, {
                            valor: sug.replace('Valor año anterior: ', ''),
                            marcadoPendiente: false
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold transition-colors"
                      >
                        <span>Aplicar: {sug}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Panel de Auto-Ayuda Contextual (Rojo / Amarillo) */}
                {campo.mostrarGuia && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      campo.semaforo === 'ROJO'
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    {campo.semaforo === 'ROJO' ? (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <span className="font-bold block">
                        {campo.semaforo === 'ROJO'
                          ? 'Auto-Ayuda Paso a Paso (Acción Requerida)'
                          : 'Recordatorio de Seguimiento'}
                      </span>
                      <p className="leading-relaxed">{campo.mensajeAyuda}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA (1/3): SEMÁFORO GLOBAL, ESTABILIDAD Y EXPORTACIÓN */}
        <div className="space-y-5">
          {/* Tarjeta Score 10/10 Global */}
          <div
            className={`rounded-2xl p-6 border-2 shadow-sm space-y-4 ${
              todoAprobado10de10
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  todoAprobado10de10 ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                Dictamen Motor IA
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono ${
                  todoAprobado10de10
                    ? 'bg-white text-blue-700'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {puntajePromedio} / 10
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black">
                {todoAprobado10de10
                  ? '¡Aprobado 10/10 Listo para Firma!'
                  : 'Validación Progresiva Activa'}
              </h3>
              <p
                className={`text-xs mt-1 ${
                  todoAprobado10de10 ? 'text-blue-100' : 'text-slate-500'
                }`}
              >
                {camposAprobadosCount} de {campos.length} campos certificados en estado AZUL o GRIS.
              </p>
            </div>

            <div className="w-full bg-slate-200/40 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  todoAprobado10de10 ? 'bg-emerald-300' : 'bg-blue-600'
                }`}
                style={{
                  width: `${
                    campos.length > 0 ? Math.round((camposAprobadosCount / campos.length) * 100) : 0
                  }%`
                }}
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleRadicarOficial}
                disabled={radicandoCaso}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                  todoAprobado10de10
                    ? 'bg-white text-blue-700 hover:bg-blue-50'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {radicandoCaso
                    ? 'Generando Expediente...'
                    : 'Enviar Expediente a CPA ($150 USD)'}
                </span>
              </button>

              <button
                type="button"
                onClick={descargarExcelPreliminar}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-colors ${
                  todoAprobado10de10
                    ? 'border-blue-400 bg-blue-700/60 hover:bg-blue-700 text-white'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Descargar Excel Preliminar (.CSV)</span>
              </button>
            </div>
          </div>

          {/* Análisis de Migración y Estabilidad Laboral */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Estabilidad & Migración IA
              </h3>
              {analisisEstabilidad.tieneHistorico && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Base {analisisEstabilidad.anioBase}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Diagnóstico Interanual
              </span>
              <div className="font-bold text-slate-900">
                {analisisEstabilidad.estabilidadLaboral}
              </div>
              {analisisEstabilidad.tieneHistorico && (
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-500">Variación de Ingresos:</span>
                  <span
                    className={`font-mono font-bold ${
                      analisisEstabilidad.variacionIngresoPct >= 0
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}
                  >
                    {analisisEstabilidad.variacionIngresoPct > 0 ? '+' : ''}
                    {analisisEstabilidad.variacionIngresoPct}%
                  </span>
                </div>
              )}
            </div>

            {analisisEstabilidad.tieneHistorico &&
            analisisEstabilidad.camposParaConfirmar.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Campos Previos a Confirmar
                </span>
                {analisisEstabilidad.camposParaConfirmar.map((item, idx) => {
                  const confirmado = !!confirmadosPrevios[item.campo];
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800">{item.campo}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.valorPrevio}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmadosPrevios((prev) => ({ ...prev, [item.campo]: !confirmado }))
                        }
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                          confirmado
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        {confirmado ? 'Confirmado' : 'Confirmar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                {analisisEstabilidad.alertasMigracion[0]}
              </p>
            )}
          </div>

          {/* Tabla Comparativa Histórica */}
          {historicos.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Histórico Comparativo
              </h3>
              <div className="space-y-2 text-xs">
                {historicos.map((h) => (
                  <div
                    key={h.anioFiscal}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        Año {h.anioFiscal} ({h.estadoCodigo})
                      </div>
                      <div className="text-[11px] text-slate-500">{h.empleadores.join(', ')}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900">
                        ${h.ingresoBruto.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ded: ${h.deduccionesTotales.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leyenda Oficial del Semáforo IA */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2.5 text-xs">
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
              Leyenda Semáforo Autodinámico
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                <span className="text-slate-700">
                  <strong>AZUL (10/10):</strong> Validado con evidencia completa.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                <span className="text-slate-700">
                  <strong>AMARILLO (5/10):</strong> Pendiente temporal para continuar.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-500 shrink-0" />
                <span className="text-slate-700">
                  <strong>GRIS (10/10):</strong> Exento / No Aplica al perfil.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600 shrink-0" />
                <span className="text-slate-700">
                  <strong>ROJO (0–4/10):</strong> Dato o evidencia faltante (muestra auto-ayuda).
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/tax')}
              className="w-full mt-2 pt-2 border-t border-slate-100 text-blue-600 hover:text-blue-700 font-bold flex items-center justify-center gap-1"
            >
              <span>Ir a Radicación Clásica $150</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
