import React from 'react';
import { PagoComision } from '../types';
import { X, Download, Printer, CheckCircle, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

interface PayoutReceiptModalProps {
  pago: PagoComision | null;
  onClose: () => void;
}

export const PayoutReceiptModal: React.FC<PayoutReceiptModalProps> = ({ pago, onClose }) => {
  if (!pago) return null;

  const handleDownload = () => {
    const textContent =
      `============================================================\n` +
      `       COMPROBANTE OFICIAL DE TRANSFERENCIA BHD\n` +
      `         AUDIT INTELLIGENCE USA TAX V2.3\n` +
      `        Cuenta Origen: Banco BHD - 08694150021\n` +
      `============================================================\n\n` +
      `REFERENCIA BHD:     ${pago.referenciaBHD}\n` +
      `FECHA DE EMISIÓN:   ${pago.fechaPago}\n` +
      `BENEFICIARIO (CPA): ${pago.cpaNombre} (${pago.cpaCodigo})\n` +
      `ESTADO FISCAL:      ${pago.cpaEstado}\n` +
      `BANCO DESTINO:      ${pago.bancoDestino}\n` +
      `MÉTODO DE PAGO:     ${pago.metodoPago}\n` +
      `ESTADO:             ${pago.estado}\n\n` +
      `------------------------------------------------------------\n` +
      `MONTO TOTAL PAGADO: $${pago.monto.toFixed(2)} USD\n` +
      `CASOS LIQUIDADOS:   ${pago.casosIncluidos.join(', ')}\n` +
      `TASA DE COMISIÓN:   $45.00 USD por caso aprobado\n` +
      `------------------------------------------------------------\n\n` +
      `Ruta de archivo contable:\n${pago.comprobanteUrl}\n\n` +
      `Este documento es un comprobante electrónico válido conforme\n` +
      `a las regulaciones bancarias y de auditoría contable.`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RECIBO_BHD_${pago.referenciaBHD}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Receipt Header Banner */}
        <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono uppercase tracking-widest font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" /> Comprobante Oficial BHD
          </div>
          <h3 className="text-xl font-bold tracking-tight">Liquidación de Comisiones CPA</h3>
          <p className="text-emerald-200 text-xs mt-1">Audit Intelligence USA Tax - Cuenta BHD 08694150021</p>
        </div>

        {/* Amount Display */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Monto Transferido</span>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ${pago.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm font-semibold text-slate-500">USD</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {pago.estado}
          </div>
        </div>

        {/* Details List */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-slate-400 block font-medium">Referencia BHD</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{pago.referenciaBHD}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Fecha y Hora</span>
              <span className="font-mono text-slate-700">{pago.fechaPago}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium">Cuenta Emisora:</span>
              <span className="font-semibold text-slate-800 text-right">Banco BHD - Cuenta 08694150021</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium">CPA Beneficiario:</span>
              <span className="font-semibold text-slate-800 text-right">{pago.cpaNombre} ({pago.cpaCodigo})</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium">Cuenta Destino:</span>
              <span className="font-mono text-slate-800 text-right">{pago.bancoDestino}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-slate-500 font-medium">Ruta Archivo Payouts:</span>
              <span className="font-mono text-blue-600 text-right">{pago.comprobanteUrl}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-slate-500 font-medium block mb-1.5">
              Casos Liquidados ({pago.casosIncluidos.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
              {pago.casosIncluidos.map(caso => (
                <span key={caso} className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-700 border border-slate-200">
                  {caso} ($45)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" /> Descargar Recibo
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
