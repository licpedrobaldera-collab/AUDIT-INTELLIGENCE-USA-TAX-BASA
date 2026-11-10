"use client";
import React, { useState } from 'react';
import Link from 'next/link';

interface CasoTax {
  id: string;
  cliente: string;
  anioFiscal: number;
  estado: string;
  montoCobrado: number;
  status: 'PAGADO' | 'PENDIENTE' | 'FIRMADO' | 'ENTREGADO';
  cpaAsignadoId?: string;
  cpaAsignadoNombre?: string;
  cpaAsignadoCodigo?: string;
}

interface CPADisponible {
  id: string;
  nombre: string;
  codigo: string;
  estados: string[];
  activo: boolean;
  verificado: boolean;
  casosFirmados: number;
}

const CPAS_INICIALES: CPADisponible[] = [
  { id: '1', nombre: 'Carlos Mendoza, CPA', codigo: 'CPA-NY-12345', estados: ['NY', 'NJ'], activo: true, verificado: true, casosFirmados: 12 },
  { id: '2', nombre: 'Elena Rodriguez, CPA', codigo: 'CPA-FL-88214', estados: ['FL', 'GA'], activo: true, verificado: true, casosFirmados: 19 },
  { id: '3', nombre: 'Robert Thorne, CPA', codigo: 'CPA-CA-55109', estados: ['CA', 'WA'], activo: true, verificado: true, casosFirmados: 8 },
  { id: '4', nombre: 'Patricia Gomez, CPA', codigo: 'CPA-NY-99231', estados: ['NY', 'PA'], activo: true, verificado: true, casosFirmados: 15 },
];

const CASOS_INICIALES: CasoTax[] = [
  { id: '1045', cliente: 'Juan Perez', anioFiscal: 2023, estado: 'NY', montoCobrado: 150, status: 'PAGADO', cpaAsignadoNombre: 'Carlos Mendoza, CPA', cpaAsignadoCodigo: 'CPA-NY-12345' },
  { id: '1046', cliente: 'Alice Smith', anioFiscal: 2023, estado: 'NY', montoCobrado: 150, status: 'PAGADO' },
  { id: '1047', cliente: 'Marcos Fernandez', anioFiscal: 2023, estado: 'FL', montoCobrado: 180, status: 'PAGADO' },
  { id: '1048', cliente: 'David Miller', anioFiscal: 2023, estado: 'CA', montoCobrado: 150, status: 'PAGADO' },
  { id: '1049', cliente: 'Sofia Castillo', anioFiscal: 2023, estado: 'NY', montoCobrado: 150, status: 'PAGADO' },
];

export default function AsignarCasosPage() {
  const [casos, setCasos] = useState<CasoTax[]>(CASOS_INICIALES);
  const [modalCaso, setModalCaso] = useState<CasoTax | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [notificacion, setNotificacion] = useState<string | null>(null);

  const estadosDisponibles = ['TODOS', ...Array.from(new Set(casos.map(c => c.estado)))];

  const casosFiltrados = filtroEstado === 'TODOS'
    ? casos
    : casos.filter(c => c.estado === filtroEstado);

  const getCpasParaEstado = (estado: string) => {
    return CPAS_INICIALES.filter(cpa =>
      cpa.activo && cpa.verificado && cpa.estados.includes(estado)
    );
  };

  const handleAsignarCPA = (cpa: CPADisponible) => {
    if (!modalCaso) return;
    setCasos(prev =>
      prev.map(c => c.id === modalCaso.id
        ? {
            ...c,
            cpaAsignadoId: cpa.id,
            cpaAsignadoNombre: cpa.nombre,
            cpaAsignadoCodigo: cpa.codigo,
          }
        : c
      )
    );
    setNotificacion(`✓ Caso #${modalCaso.id} asignado exitosamente a ${cpa.nombre} (${cpa.codigo})`);
    setModalCaso(null);
    setTimeout(() => setNotificacion(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Administración Central • Flujo de Despacho
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            Asignación de Casos a CPAs Firmantes
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Filtra y asigna declaraciones fiscales cobradas a profesionales autorizados en la jurisdicción correspondiente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Filtrar Estado:</span>
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              {estadosDisponibles.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
          <Link
            href="/admin/cpas"
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Ver Bitácora de Comisiones →
          </Link>
        </div>
      </div>

      {notificacion && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{notificacion}</span>
          <button onClick={() => setNotificacion(null)} className="text-emerald-600 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Grid de Casos */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-3.5">ID Caso</th>
                <th className="px-6 py-3.5">Cliente</th>
                <th className="px-6 py-3.5 text-center">Año Fiscal</th>
                <th className="px-6 py-3.5 text-center">Estado Fiscal</th>
                <th className="px-6 py-3.5 text-right">Cobrado (USD)</th>
                <th className="px-6 py-3.5 text-center">Estatus</th>
                <th className="px-6 py-3.5">CPA Asignado</th>
                <th className="px-6 py-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {casosFiltrados.map(caso => (
                <tr key={caso.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    #{caso.id}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {caso.cliente}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-slate-600">
                    {caso.anioFiscal}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {caso.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-900">
                    ${caso.montoCobrado}.00
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      caso.status === 'PAGADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {caso.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {caso.cpaAsignadoNombre ? (
                      <div>
                        <div className="font-semibold text-xs text-slate-900">{caso.cpaAsignadoNombre}</div>
                        <div className="font-mono text-[11px] text-indigo-600 font-bold">{caso.cpaAsignadoCodigo}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 font-semibold italic">
                        Sin CPA asignado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setModalCaso(caso)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        caso.cpaAsignadoNombre
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                      }`}
                    >
                      {caso.cpaAsignadoNombre ? 'Reasignar CPA' : 'Asignar CPA Firmante'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Búsqueda y Selección de CPA Autorizado */}
      {modalCaso && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase">Motor de Búsqueda Jurisdiccional</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Asignar CPA para Caso #{modalCaso.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Cliente: <strong>{modalCaso.cliente}</strong> • Jurisdicción requerida: <strong className="text-indigo-600">{modalCaso.estado}</strong>
                </p>
              </div>
              <button
                onClick={() => setModalCaso(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                CPAs Autorizados en {modalCaso.estado} (Activos & Verificados):
              </h4>

              {getCpasParaEstado(modalCaso.estado).length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  No hay CPAs autorizados actualmente para el estado {modalCaso.estado}. Por favor registra uno en la sección de Afiliados.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {getCpasParaEstado(modalCaso.estado).map(cpa => (
                    <div
                      key={cpa.id}
                      className="p-3.5 border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900">{cpa.nombre}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs font-bold text-indigo-600">{cpa.codigo}</span>
                          <span className="text-[11px] text-slate-500">• {cpa.casosFirmados} casos firmados</span>
                          <span className="text-[11px] font-bold text-emerald-600">• Comisión: $45</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAsignarCPA(cpa)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors shrink-0"
                      >
                        Click Asignar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalCaso(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
