import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PayoutReceiptModal } from '../components/PayoutReceiptModal';
import { SelfHealingV4Panel } from '../components/SelfHealingV4Panel';
import { PagoComision } from '../types';
import {
  FileSpreadsheet,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  Building,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  Send,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpRight,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminMatrizView: React.FC = () => {
  const {
    cases,
    users,
    payouts,
    financialStats,
    pagarComisionOnline,
    exportarExcelCSV,
    setSelectedCaseForModal,
    systemBankAccount,
    actualizarBancoSistema,
    pagosAfiliacion,
    aprobarTransferenciaAfiliacion,
    navigate
  } = useApp();

  const [activeReceipt, setActiveReceipt] = useState<PagoComision | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [stateFilter, setStateFilter] = useState<string>('TODOS');
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Editable System Bank State (Admin can change to any bank at any time)
  const [bankForm, setBankForm] = useState({
    bancoNombre: systemBankAccount.bancoNombre,
    titular: systemBankAccount.titular,
    numeroCuenta: systemBankAccount.numeroCuenta,
    routingSwift: systemBankAccount.routingSwift,
    tipoCuenta: systemBankAccount.tipoCuenta,
    instrucciones: systemBankAccount.instrucciones
  });

  const handleSaveSystemBank = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarBancoSistema(bankForm);
    setAdminNotice(`Cuenta bancaria del sistema actualizada a ${bankForm.bancoNombre} (${bankForm.numeroCuenta}).`);
    setTimeout(() => setAdminNotice(null), 4000);
  };

  // CPAs and Firms
  const cpaList = users.filter(u => u.rol === 'CONTADOR' || u.rol === 'FIRMA');

  // Calculate pending payout for each CPA
  const getCpaPending = (cpaId: string, cpaCodigo: string | null) => {
    return cases
      .filter(c => (c.cpaUserId === cpaId || c.cpaCodigo === cpaCodigo) && c.status === 'APROBADA' && c.comisionStatus === 'PENDIENTE')
      .reduce((sum, c) => sum + (c.comisionMonto || 45), 0);
  };

  const handlePagarOnline = (cpaId: string, cpaNombre: string) => {
    const pago = pagarComisionOnline(cpaId);
    if (!pago) {
      setAdminNotice(`No hay casos aprobados pendientes de cobro para ${cpaNombre}.`);
      setTimeout(() => setAdminNotice(null), 3500);
      return;
    }

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setActiveReceipt(pago);
  };

  const filteredCases = cases.filter(c => {
    const matchSearch =
      c.casoNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clienteEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cpaNombre && c.cpaNombre.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === 'TODOS' || c.status === statusFilter;
    const matchState = stateFilter === 'TODOS' || c.estado === stateFilter;

    return matchSearch && matchStatus && matchState;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Payout receipt modal */}
      <PayoutReceiptModal pago={activeReceipt} onClose={() => setActiveReceipt(null)} />

      {/* Main Header */}
      {adminNotice && (
        <div className="bg-emerald-900 text-white px-5 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md">
          <span>{adminNotice}</span>
          <button onClick={() => setAdminNotice(null)} className="text-emerald-300 hover:text-white font-bold">
            Cerrar
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Consola Ejecutiva Financiera</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            MATRIZ MAESTRA ADMIN - {systemBankAccount.bancoNombre}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Control de cobros de $150, comisiones CPA de $45, balances por estado y desembolsos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/global')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Globe className="w-4 h-4" /> GlobalTaxEngine V3.0
          </button>
          <button
            onClick={() => exportarExcelCSV('matriz_completa')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" /> PDF Reporte
          </button>
        </div>
      </div>

      {/* Primary Financial Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-2 border-blue-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
              MATRIZ CONCILIADA DE LIQUIDACIÓN Y FONDOS
            </span>
          </div>
          <span className="font-mono text-xs text-blue-700 font-bold bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-2xs">
            Bóveda de Desembolsos Oficial
          </span>
        </div>

        {/* Live Metrics based 100% on actual cases */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs">
            <span className="text-slate-400 block font-semibold uppercase text-[10px]">Cobrado Total ($150)</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              ${financialStats.totalCobrado.toLocaleString()} USD
            </div>
            <span className="text-[11px] text-slate-500 font-mono">({cases.length} casos reales)</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
            <span className="text-emerald-600 block font-semibold uppercase text-[10px]">Pagado a CPAs</span>
            <div className="text-xl font-black text-emerald-700 mt-0.5">
              ${financialStats.totalPagado.toLocaleString()} USD
            </div>
            <span className="text-[11px] text-slate-500 font-mono">({payouts.length} desembolsos)</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs">
            <span className="text-amber-600 block font-semibold uppercase text-[10px]">Por Pagar a CPAs</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">
              ${financialStats.totalPorPagar.toLocaleString()} USD
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Listos para Liquidación</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs">
            <span className="text-blue-700 block font-semibold uppercase text-[10px]">Neto en Bóveda</span>
            <div className="text-xl font-black text-blue-700 mt-0.5">
              ${financialStats.netoBHD.toLocaleString()} USD
            </div>
            <span className="text-[11px] text-blue-600 font-mono font-medium">Fondo de Reserva</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: MATRIZ CLIENTES */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              MATRIZ CLIENTES ({filteredCases.length} expedientes)
            </h3>
            <p className="text-xs text-slate-500">
              Registro canónico de todos los contribuyentes con ruta de bóveda /2024/{'{ESTADO}'}/CASO/
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente, caso, CPA..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium"
            >
              <option value="TODOS">Todos los Status</option>
              <option value="REALIZADA">REALIZADA</option>
              <option value="EN_TRAMITE">EN TRÁMITE</option>
              <option value="APROBADA">APROBADA</option>
            </select>

            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="NY">NY</option>
              <option value="FL">FL</option>
              <option value="NJ">NJ</option>
              <option value="TX">TX</option>
              <option value="RD">RD</option>
            </select>
          </div>
        </div>

        {/* Master Clients Table matching schema: Caso | Cliente | Estado | Email | Cobrado | CPA | Status */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="p-4">Caso</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Email</th>
                <th className="p-4">Cobrado</th>
                <th className="p-4">CPA Asignado</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map(caso => (
                <tr key={caso.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-600">{caso.casoNumero}</td>
                  <td className="p-4 font-bold text-slate-900">{caso.clienteNombre}</td>
                  <td className="p-4">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {caso.estado}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{caso.clienteEmail}</td>
                  <td className="p-4 font-bold text-slate-900">${caso.montoCobrado}</td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{caso.cpaNombre}</div>
                    <div className="text-[10px] text-blue-600 font-mono">{caso.cpaCodigo}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      caso.status === 'APROBADA'
                        ? 'bg-emerald-100 text-emerald-800'
                        : caso.status === 'EN_TRAMITE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {caso.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedCaseForModal(caso)}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white font-semibold transition-colors"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: MATRIZ FIRMAS + CONTACTOS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              MATRIZ FIRMAS + CONTACTOS
            </h3>
            <p className="text-xs text-slate-500">
              Liquidación en línea de comisiones de $45 por caso aprobado desde Cuenta BHD 08694150021
            </p>
          </div>
          <button
            onClick={() => exportarExcelCSV('firmas')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Firmas
          </button>
        </div>

        {/* Firmas Table matching specs: CPA | Firma | Estado | Email/WhatsApp | Banco | Por Pagar | Acción */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="p-4">CPA</th>
                <th className="p-4">Firma / Titular</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Email / WhatsApp</th>
                <th className="p-4">Banco Destino</th>
                <th className="p-4">Por Pagar</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cpaList.map(cpa => {
                const finalPending = getCpaPending(cpa.id, cpa.codigoCPA);

                return (
                  <tr key={cpa.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">{cpa.codigoCPA || 'CPA-NY-12345'}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{cpa.nombre}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Lic: {cpa.licencia} • PTIN: {cpa.ptin}</div>
                    </td>
                    <td className="p-4 font-bold">{cpa.estado}</td>
                    <td className="p-4">
                      <div className="text-slate-700">{cpa.email}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{cpa.telefono}</div>
                    </td>
                    <td className="p-4 font-mono text-slate-800">
                      {cpa.bancoNombre} {cpa.bancoNumero}
                    </td>
                    <td className="p-4">
                      <span className={`font-black text-sm ${finalPending > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        ${finalPending} USD
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {finalPending > 0 ? (
                          <button
                            onClick={() => handlePagarOnline(cpa.id, cpa.nombre)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> PAGAR ONLINE
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                            Al Día
                          </span>
                        )}

                        <a
                          href={`https://wa.me/${cpa.telefono?.replace(/\D/g, '') || '19175550199'}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Contactar WhatsApp"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`mailto:${cpa.email || 'info@cpa.com'}`}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Enviar Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: PAGOS HISTORIAL /PAYOUTS/2024/CPA-NY-12345/ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              PAGOS HISTORIAL /PAYOUTS/2024/CPA-NY-12345/
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Comprobantes emitidos desde Banco BHD 08694150021 hacia cuentas receptoras
            </p>
          </div>
          <button
            onClick={() => exportarExcelCSV('payouts')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5" /> Descargar Historial
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="p-4">Referencia BHD</th>
                <th className="p-4">CPA Beneficiario</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Monto Liquidado</th>
                <th className="p-4">Casos Aprobados</th>
                <th className="p-4">Fecha Emisión</th>
                <th className="p-4 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map(pago => (
                <tr key={pago.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{pago.referenciaBHD}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{pago.cpaNombre}</div>
                    <div className="text-[10px] text-blue-600 font-mono">{pago.cpaCodigo}</div>
                  </td>
                  <td className="p-4 font-bold">{pago.cpaEstado}</td>
                  <td className="p-4">
                    <div className="font-black text-emerald-700">${pago.monto.toLocaleString()} USD</div>
                    {pago.retencionAfiliacion && pago.retencionAfiliacion > 0 ? (
                      <div className="text-[10px] font-mono text-amber-700">
                        Bruto: ${pago.montoBruto} | Ret. CxC: -${pago.retencionAfiliacion}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-4 font-mono text-slate-600">
                    {pago.casosIncluidos.length} casos
                  </td>
                  <td className="p-4 text-slate-500">{pago.fechaPago}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setActiveReceipt(pago)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors"
                    >
                      Ver Recibo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: MEMBRESÍA SOCIEDAD DE CONTADORES (pagos_afiliacion $50 USD) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              MEMBRESÍA SOCIEDAD DE CONTADORES ($50.00 USD) — TABLA pagos_afiliacion
            </h3>
            <p className="text-xs text-slate-500">
              Control de cuota única de afiliación: Pagos Virtuales, Transferencias Bancarias y Cuentas por Cobrar por Retención en Primeros Ingresos
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold font-mono">
            {pagosAfiliacion.length} registros de afiliación
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="p-4">ID</th>
                <th className="p-4">Contador</th>
                <th className="p-4">Modalidad Contractual</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Referencia</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Gestión Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagosAfiliacion.map(af => {
                const cpaMatch = users.find(u => u.codigoCPA === af.contador_id || u.id === af.contador_id);
                const saldoCxC = cpaMatch?.cuentaPorCobrarSaldo ?? (af.estado === 'PAGADO' ? 0 : 50);

                return (
                  <tr key={af.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-slate-500">#{af.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{af.contador_nombre}</div>
                      <div className="text-[11px] text-blue-600 font-mono">{af.contador_id}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">{af.modalidad}</span>
                      <span className="text-[11px] text-slate-500">{af.pasarela || af.concepto}</span>
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      ${af.monto.toFixed(2)} {af.moneda}
                      {af.modalidad === 'RETENCION_PRIMEROS_INGRESOS' && saldoCxC > 0 && (
                        <span className="block text-[10px] font-mono text-amber-700">
                          CxC Pendiente: ${saldoCxC.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-slate-600">{af.referencia_pasarela || 'N/A'}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          af.estado === 'PAGADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : af.estado === 'FALLIDO'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {af.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {af.estado === 'PENDIENTE' && af.modalidad !== 'RETENCION_PRIMEROS_INGRESOS' ? (
                        <button
                          onClick={() => aprobarTransferenciaAfiliacion(af.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                        >
                          Confirmar Pago
                        </button>
                      ) : af.estado === 'PENDIENTE' ? (
                        <span className="text-[11px] text-amber-700 font-mono font-semibold">
                          Retención Automática Activa
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Confirmado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: CONFIGURACIÓN DE CUENTA BANCARIA PROPIA DEL SISTEMA (CAMBIABLE POR ADMIN) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-600" />
              Cuenta Bancaria Asignada al Sistema (Cambiable por el Administrador)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Esta cuenta se muestra únicamente al realizar un pago o transferencia de afiliación. Puede cambiarse a cualquier otro banco en todo momento.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Última actualización: {new Date(systemBankAccount.updatedAt).toLocaleString()}
          </span>
        </div>

        <form onSubmit={handleSaveSystemBank} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Banco Receptor del Sistema *</label>
            <input
              type="text"
              value={bankForm.bancoNombre}
              onChange={e => setBankForm({ ...bankForm, bancoNombre: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Titular / Razón Social *</label>
            <input
              type="text"
              value={bankForm.titular}
              onChange={e => setBankForm({ ...bankForm, titular: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Número de Cuenta *</label>
            <input
              type="text"
              value={bankForm.numeroCuenta}
              onChange={e => setBankForm({ ...bankForm, numeroCuenta: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Routing / SWIFT *</label>
            <input
              type="text"
              value={bankForm.routingSwift}
              onChange={e => setBankForm({ ...bankForm, routingSwift: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Tipo de Cuenta</label>
            <input
              type="text"
              value={bankForm.tipoCuenta}
              onChange={e => setBankForm({ ...bankForm, tipoCuenta: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 block mb-1">Instrucciones de Transferencia</label>
            <input
              type="text"
              value={bankForm.instrucciones}
              onChange={e => setBankForm({ ...bankForm, instrucciones: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Guardar / Cambiar Banco del Sistema
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 6: SELF-HEALING V4.0, VALIDACIÓN 100/100 & DESPLIEGUE ZERO-COST */}
      <SelfHealingV4Panel />
    </div>
  );
};
