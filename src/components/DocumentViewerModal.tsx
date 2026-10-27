import React from 'react';
import { SoporteDocumento } from '../types';
import { X, Download, Printer, FileText, CheckCircle2, ShieldCheck, Folder } from 'lucide-react';

interface DocumentViewerModalProps {
  item: { doc: SoporteDocumento; caseNumber: string } | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ item, onClose }) => {
  if (!item) return null;
  const { doc, caseNumber } = item;

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([
      `--- EXPEDIENTE FISCAL OFICIAL USA TAX 2024 ---\n` +
      `Caso: ${caseNumber}\n` +
      `Documento: ${doc.nombre}\n` +
      `Categoría: ${doc.categoria}\n` +
      `Fecha de Registro: ${doc.fecha}\n` +
      `Verificación de Autenticidad: Audit Intelligence V2.3 - BHD 08694150021\n\n` +
      `CONTENIDO:\n${doc.previsualizacionTexto || 'Documento certificado e incorporado en bóveda segura.'}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = doc.nombre.replace('.pdf', '.txt').replace('.jpg', '.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight flex items-center gap-2">
                {doc.nombre}
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {doc.categoria}
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-2 mt-0.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                /2024/{caseNumber.split('-')[0] || 'TAX'}/{caseNumber}/{doc.nombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Body preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs font-mono text-xs text-slate-800 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">INTERNAL REVENUE SERVICE / STATE TAX COMMISSION</span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">EXPEDIENTE DIGITALIZADO DE AUDITORÍA</h4>
                <p className="text-xs text-slate-500">Número de Caso: <span className="font-bold text-blue-600">{caseNumber}</span></p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verificado Oficial
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Registrado: {doc.fecha}</p>
              </div>
            </div>

            {/* Document Content */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
              {doc.previsualizacionTexto || 'Certificado fiscal en custodia criptográfica de alta seguridad.'}
            </div>

            <div className="grid grid-cols-2 gap-4 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block">Tamaño del archivo:</span>
                <span className="font-semibold">{doc.tamano}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Custodia BHD:</span>
                <span className="font-semibold text-blue-600">Cuenta 08694150021</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Disponible para inspección CPA / IRS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" /> Descargar Copia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
