import React, { useState } from 'react';
import { TaxCase } from '../types';
import { useApp } from '../context/AppContext';
import { SignaturePad } from './SignaturePad';
import {
  X,
  Folder,
  Download,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Save,
  PenTool,
  History,
  Shield,
  ExternalLink,
  User,
  Mail,
  Phone,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CaseDetailModalProps {
  caso: TaxCase | null;
  onClose: () => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ caso, onClose }) => {
  const {
    currentUser,
    actualizarCaso,
    borrarCasoConLog,
    firmarAprobarCPA,
    setSelectedDocForPreview
  } = useApp();

  const [activeTab, setActiveTab] = useState<'expediente' | 'firma' | 'historial'>('expediente');
  const [cpaNotes, setCpaNotes] = useState(caso?.notasCPA || '');
  const [firmaCpaDataUrl, setFirmaCpaDataUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [savedNotification, setSavedNotification] = useState(false);

  if (!caso) return null;

  const isCpa = currentUser?.rol === 'CONTADOR' || currentUser?.rol === 'ADMIN' || currentUser?.rol === 'DEV';
  const isAssignedCpa = currentUser?.codigoCPA === caso.cpaCodigo || currentUser?.id === caso.cpaUserId || currentUser?.rol === 'ADMIN';

  const handleSaveNotes = () => {
    actualizarCaso(caso.id, { notasCPA: cpaNotes }, `Notas actualizadas por ${currentUser?.nombre || 'CPA'}`);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleFirmarYAprobar = () => {
    if (!firmaCpaDataUrl && !caso.cpaFirma) {
      alert('Por favor realice su trazo de firma digital en el recuadro antes de aprobar.');
      return;
    }
    const signatureToUse = firmaCpaDataUrl || caso.cpaFirma?.dataUrl || '';
    firmarAprobarCPA(caso.id, signatureToUse);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
    setActiveTab('expediente');
  };

  const handleDeleteCase = () => {
    if (!deleteReason.trim()) {
      alert('Debe ingresar un motivo obligatorio para registrar en el log de auditoría.');
      return;
    }
    borrarCasoConLog(caso.id, deleteReason);
    onClose();
  };

  const handleDownloadZip = () => {
    // Generate text archive summary file
    const manifest =
      `PAQUETE EXPEDIENTE ZIP V2.3: ${caso.casoNumero}\n` +
      `Ruta Bóveda: ${caso.carpetaPath}\n` +
      `Cliente: ${caso.clienteNombre} (${caso.clienteEmail})\n` +
      `Estado: ${caso.estado}\n` +
      `Monto Cobrado: $${caso.montoCobrado} USD\n` +
      `Estatus: ${caso.status}\n\n` +
      `LISTA DE DOCUMENTOS SOPORTES (8):\n` +
      caso.soportes.map((s, i) => `${i + 1}. [${s.categoria}] ${s.nombre} (${s.tamano})`).join('\n') +
      `\n\nHISTORIAL DE AUDITORIA:\n` +
      caso.historial.map(h => `[${h.fecha}] ${h.accion} por ${h.usuario}: ${h.detalle}`).join('\n');

    const blob = new Blob([manifest], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EXPEDIENTE_${caso.casoNumero}_${caso.estado}.zip.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {caso.estado}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">{caso.casoNumero} - {caso.clienteNombre}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  caso.status === 'APROBADA'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : caso.status === 'EN_TRAMITE'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {caso.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono flex items-center gap-2 mt-0.5">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                {caso.carpetaPath}
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

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 bg-slate-50 text-xs font-semibold">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('expediente')}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'expediente'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Expediente & Soportes ({caso.soportes.length})
            </button>
            <button
              onClick={() => setActiveTab('firma')}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'firma'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-4 h-4" /> Firma Contrato CPA
              {caso.cpaFirma ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'historial'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" /> Historial de Auditoría ({caso.historial.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md shadow-2xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" /> Descargar ZIP
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB: EXPEDIENTE */}
          {activeTab === 'expediente' && (
            <div className="space-y-6">
              {/* Client & Assignment Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">Datos del Contribuyente</span>
                  <div className="font-bold text-slate-900 text-sm">{caso.clienteNombre}</div>
                  <div className="text-slate-600 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" /> {caso.clienteEmail}
                  </div>
                  {caso.clienteTelefono && (
                    <div className="text-slate-600 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {caso.clienteTelefono}
                    </div>
                  )}
                  <div className="text-slate-500 mt-1 font-mono">SSN: ***-**-{caso.clienteData?.ssnLast4 || '4192'}</div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">CPA Asignado Oficial</span>
                  <div className="font-bold text-slate-900 text-sm">{caso.cpaNombre}</div>
                  <div className="text-blue-600 font-mono font-medium">{caso.cpaCodigo}</div>
                  <div className="text-slate-500 mt-1">Estado: {caso.estado} • Año 2024</div>
                  <div className="text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Comisión CPA: ${caso.comisionMonto} USD ({caso.comisionStatus})
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">Finanzas & Declaración</span>
                  <div className="flex justify-between py-0.5 border-b border-slate-200">
                    <span className="text-slate-500">Monto Cobrado:</span>
                    <span className="font-bold text-slate-900">${caso.montoCobrado} USD</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-200">
                    <span className="text-slate-500">Tipo Presentación:</span>
                    <span className="font-medium text-slate-700">{caso.clienteData?.tipoDeclaracion || 'Soltero'}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Ingresos W-2:</span>
                    <span className="font-mono font-bold text-slate-800">${(caso.clienteData?.ingresosEstimados || 65000).toLocaleString()} USD</span>
                  </div>
                </div>
              </div>

              {/* Soportes List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-600" />
                    Archivos Soportes Históricos ({caso.soportes.length})
                  </h4>
                  <span className="text-xs text-slate-500 font-mono">Bóveda: {caso.carpetaPath}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {caso.soportes.map((soporte, idx) => (
                    <div
                      key={soporte.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition-all shadow-2xs group"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-700">
                            {soporte.nombre}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{soporte.tamano}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">{soporte.categoria}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => setSelectedDocForPreview({ doc: soporte, caseNumber: caso.casoNumero })}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                          title="Ver Online"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CPA Notes & Tax Computation Editor */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-500" />
                    Notas de Auditoría Fiscal & Cálculos CPA
                  </label>
                  {savedNotification && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ¡Guardado con éxito!
                    </span>
                  )}
                </div>
                <textarea
                  value={cpaNotes}
                  onChange={e => setCpaNotes(e.target.value)}
                  placeholder="Escriba aquí notas de verificación, créditos tributarios aplicables, dependientes y código de deducción..."
                  rows={3}
                  className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" /> Guardar Notas
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FIRMA CONTRATO CPA */}
          {activeTab === 'firma' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 mb-1">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  CONTRATO FIRMA CPA ONLINE - RESPONSABILIDAD IRS + CONFIDENCIALIDAD
                </div>
                <p className="leading-relaxed text-emerald-800">
                  En cumplimiento con la <strong>Circular 230 del Departamento del Tesoro / IRS</strong> y la <strong>Sección 7216 del Código de Rentas Internas (IRC)</strong>, 
                  el Contador Público Autorizado (CPA) certifica que los soportes adjuntos han sido examinados y que la liquidación se procesa conforme a las directrices tributarias vigentes para el año fiscal 2024.
                </p>
                <div className="mt-2 text-[11px] font-mono text-emerald-700 flex items-center gap-4">
                  <span>Licencia: {currentUser?.licencia || 'NY-CPA-12345'}</span>
                  <span>PTIN: {currentUser?.ptin || 'P00891234'}</span>
                  <span>Comisión: $45.00 USD</span>
                </div>
              </div>

              {caso.cpaFirma ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3">
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-4 h-4" /> Caso Firmado Oficialmente por CPA
                  </div>
                  <div className="max-w-xs mx-auto border-2 border-emerald-500 rounded-lg bg-white p-2 shadow-xs">
                    <img src={caso.cpaFirma.dataUrl} alt="Firma CPA" className="max-h-24 mx-auto object-contain" />
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Registrado el {new Date(caso.cpaFirma.fecha).toLocaleString()} por {caso.cpaNombre} ({caso.cpaCodigo})
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <SignaturePad
                    onSave={setFirmaCpaDataUrl}
                    title="Canvas de Firma Digital del CPA"
                    description="Firme con el mouse o pantalla táctil para autorizar formalmente la auditoría y e-filing ante el IRS."
                    penColor="#047857"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">
                      Al firmar, el estado del caso pasará a <strong>APROBADA</strong> y se acreditará $45 en comisiones.
                    </span>
                    <button
                      onClick={handleFirmarYAprobar}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Firmar Oficial + Aprobar Caso ($45)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Trazabilidad Criptográfica & Registro Histórico
                </h4>
                <span className="text-xs font-mono text-slate-500">Ruta: {caso.carpetaPath}</span>
              </div>

              <div className="space-y-3">
                {caso.historial.map((item, idx) => (
                  <div key={item.id || idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        {item.accion}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">{item.fecha}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{item.detalle}</p>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      Operador: <span className="text-slate-700 font-semibold">{item.usuario}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete case section (Audit Log compliant) */}
          <div className="pt-4 border-t border-slate-200">
            {!showDeleteConfirm ? (
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Gestión de retención y bajas de expediente:</span>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Borrar caso (log histórico)
                </button>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-800 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Confirmar Borrado de Expediente Fiscal
                </div>
                <p className="text-rose-700">
                  Esta acción quedará registrada en el log inmutable de auditoría. Indique el motivo oficial de la baja:
                </p>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  placeholder="Ej: Duplicado, desistimiento formal del cliente con carta firmada..."
                  className="w-full p-2 bg-white border border-rose-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteCase}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-bold shadow-xs"
                  >
                    Confirmar Borrado & Registrar en Log
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs">
          <div className="text-slate-500 font-mono">
            {caso.carpetaPath} • BHD 08694150021
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
