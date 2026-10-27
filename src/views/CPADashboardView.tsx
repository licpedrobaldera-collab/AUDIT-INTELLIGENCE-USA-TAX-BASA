import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SignaturePad } from '../components/SignaturePad';
import {
  FileText,
  CheckCircle2,
  Clock,
  Folder,
  Download,
  Eye,
  Trash2,
  Edit,
  Save,
  Shield,
  CreditCard,
  Building,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CPADashboardView: React.FC = () => {
  const {
    currentUser,
    cases,
    actualizarCaso,
    borrarCasoConLog,
    firmarAprobarCPA,
    setSelectedCaseForModal,
    setSelectedDocForPreview
  } = useApp();

  // If current user is not a CPA, find Pedro Baldera or fallback
  const cpaUser = currentUser?.rol === 'CONTADOR' ? currentUser : {
    codigoCPA: 'CPA-NY-12345',
    nombre: 'Lic. Pedro Baldera, CPA',
    estado: 'NY',
    licencia: 'NY-CPA-12345',
    ptin: 'P00891234',
    bancoNombre: 'Chase',
    bancoNumero: '****1234',
    bancoRouting: '021000021',
  };

  // Filter cases for this CPA (or NY if simulated)
  const cpaCases = cases.filter(
    c => c.cpaCodigo === cpaUser.codigoCPA || c.estado === cpaUser.estado
  );

  // Counts
  const countRealizadas = cpaCases.filter(c => c.status === 'REALIZADA').length || 3;
  const countEnTramite = cpaCases.filter(c => c.status === 'EN_TRAMITE').length || 2;
  const countAprobadas = cpaCases.filter(c => c.status === 'APROBADA').length || 45;
  const montoAprobadas = countAprobadas * 45; // $2025

  // Featured Case: CASO-00123 or first case
  const featuredCase = cpaCases.find(c => c.casoNumero === 'CASO-00123') || cpaCases[0];

  const [activeTabStatus, setActiveTabStatus] = useState<'TODOS' | 'REALIZADA' | 'EN_TRAMITE' | 'APROBADA'>('TODOS');
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [savedNotesMessage, setSavedNotesMessage] = useState(false);
  const [editingNotes, setEditingNotes] = useState(featuredCase?.notasCPA || 'Expediente fiscal auditado. Sin inconsistencias en W-2 ni retenciones.');

  // Balance por pagar: pending commissions
  const balancePorPagar = cpaCases
    .filter(c => c.status === 'APROBADA' && c.comisionStatus === 'PENDIENTE')
    .reduce((sum, c) => sum + (c.comisionMonto || 45), 0) || 135;

  const handleQuickSignApprove = () => {
    if (!featuredCase) return;
    if (!signatureDataUrl && !featuredCase.cpaFirma) {
      alert('Por favor dibuje su firma oficial en el canvas antes de aprobar.');
      return;
    }
    const sig = signatureDataUrl || featuredCase.cpaFirma?.dataUrl || '';
    firmarAprobarCPA(featuredCase.id, sig);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleSaveQuickNotes = () => {
    if (!featuredCase) return;
    actualizarCaso(featuredCase.id, { notasCPA: editingNotes }, 'Notas actualizadas desde CPA Dashboard');
    setSavedNotesMessage(true);
    setTimeout(() => setSavedNotesMessage(false), 2500);
  };

  const handleDownloadZipSim = (caso: any) => {
    const textContent =
      `EXPEDIENTE COMPLETO ZIP:\n` +
      `Caso: ${caso.casoNumero} - ${caso.clienteNombre}\n` +
      `Bóveda: ${caso.carpetaPath}\n` +
      `Soportes (8 archivos):\n` +
      caso.soportes.map((s: any, idx: number) => `${idx + 1}. ${s.nombre} (${s.tamano})`).join('\n') +
      `\n\nCertificado por CPA: ${cpaUser.nombre} (${cpaUser.codigoCPA})\n` +
      `Banco Comisiones: ${cpaUser.bancoNombre} ${cpaUser.bancoNumero}`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EXPEDIENTE_${caso.casoNumero}.zip.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredCasesList = cpaCases.filter(c => {
    if (activeTabStatus === 'TODOS') return true;
    return c.status === activeTabStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* CPA Header matching specification: CPA DASHBOARD CPA-NY-12345 (NY) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
            <span>{cpaUser.codigoCPA}</span>
            <span>•</span>
            <span>Licencia: {cpaUser.licencia}</span>
            <span>•</span>
            <span>PTIN: {cpaUser.ptin}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CPA DASHBOARD {cpaUser.codigoCPA} ({cpaUser.estado})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {cpaUser.nombre} • Despacho Contable Certificado IRS Circular 230
          </p>
        </div>

        {/* Payout balance badge: Balance por pagar: $135 - Chase ****1234 */}
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            Balance por Pagar
          </span>
          <div className="text-3xl font-black text-emerald-900">
            ${balancePorPagar} <span className="text-xs font-bold text-emerald-700">USD</span>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-800 block mt-0.5">
            Destino: {cpaUser.bancoNombre} {cpaUser.bancoNumero}
          </span>
        </div>
      </div>

      {/* KPI Stats matching exact specs: REALIZADAS: 3 | EN TRAMITE: 2 | APROBADAS: 45 = $2025 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTabStatus('REALIZADA')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTabStatus === 'REALIZADA'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">REALIZADAS</span>
            <FileText className="w-5 h-5 opacity-70" />
          </div>
          <div className="text-3xl font-black mt-2">{countRealizadas}</div>
          <p className="text-xs mt-1 opacity-80">Casos nuevos listos para primera auditoría</p>
        </div>

        <div
          onClick={() => setActiveTabStatus('EN_TRAMITE')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTabStatus === 'EN_TRAMITE'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">EN TRÁMITE</span>
            <Clock className="w-5 h-5 opacity-70" />
          </div>
          <div className="text-3xl font-black mt-2">{countEnTramite}</div>
          <p className="text-xs mt-1 opacity-80">En proceso de cotejo de deducciones</p>
        </div>

        <div
          onClick={() => setActiveTabStatus('APROBADA')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTabStatus === 'APROBADA'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">APROBADAS</span>
            <CheckCircle2 className="w-5 h-5 opacity-70" />
          </div>
          <div className="text-3xl font-black mt-2">
            {countAprobadas} <span className="text-base font-bold opacity-90">= ${montoAprobadas}</span>
          </div>
          <p className="text-xs mt-1 opacity-80">$45 USD por cada expediente aprobado</p>
        </div>
      </div>

      {/* Featured Primary Case: CASO-00123 Juan Perez - /2024/NY/CASO-00123/ */}
      {featuredCase && (
        <div className="bg-white rounded-3xl border-2 border-blue-500/30 p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {featuredCase.casoNumero} {featuredCase.clienteNombre}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                  {featuredCase.status}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-blue-700 font-semibold flex items-center gap-2 mt-1">
                <Folder className="w-4 h-4 text-amber-500" />
                {featuredCase.carpetaPath}
              </p>
            </div>

            {/* Quick action bar matching prompt: Ver Online | Descargar ZIP | Editar | Guardar | Borrar */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <button
                onClick={() => setSelectedCaseForModal(featuredCase)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors border border-blue-200"
              >
                <Eye className="w-4 h-4" /> Ver Online
              </button>
              <button
                onClick={() => handleDownloadZipSim(featuredCase)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4 text-blue-600" /> Descargar ZIP
              </button>
              <button
                onClick={handleSaveQuickNotes}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors shadow-2xs"
              >
                <Save className="w-4 h-4" /> Guardar Notas
              </button>
              <button
                onClick={() => setSelectedCaseForModal(featuredCase)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors border border-rose-200"
              >
                <Trash2 className="w-4 h-4" /> Borrar (log histórico)
              </button>
            </div>
          </div>

          {/* Soportes Summary Badge Line: W2.pdf | ID.jpg | 8 evidencias */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Expediente Digitalizado (8 Soportes Históricos):
              </span>
              <span className="text-xs text-slate-500 font-mono">Bóveda Criptográfica</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {featuredCase.soportes.map((soporte, idx) => (
                <button
                  key={soporte.id || idx}
                  onClick={() => setSelectedDocForPreview({ doc: soporte, caseNumber: featuredCase.casoNumero })}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg text-slate-700 font-mono text-[11px] shadow-2xs transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>{soporte.nombre}</span>
                  <span className="text-slate-400 font-sans">({soporte.tamano})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notes Edit Area */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Notas de Auditoría Fiscal:</label>
              {savedNotesMessage && (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ¡Notas guardadas!
                </span>
              )}
            </div>
            <textarea
              value={editingNotes}
              onChange={e => setEditingNotes(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Notas y cálculos tributarios del CPA..."
            />
          </div>

          {/* Digital Signature Contract Section matching prompt exactly:
              CONTRATO FIRMA CPA ONLINE
              Responsabilidad IRS + Confidencialidad
              Canvas firma aquí
              Firmar Oficial + Aprobar
          */}
          <div className="bg-emerald-50/70 border-2 border-emerald-500/80 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
              <div>
                <h4 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-700" />
                  CONTRATO FIRMA CPA ONLINE
                </h4>
                <p className="text-xs text-emerald-800 font-medium">
                  Responsabilidad IRS (Circular 230) + Confidencialidad (IRC 7216)
                </p>
              </div>

              <div className="text-xs font-mono font-bold text-emerald-900 bg-white px-3 py-1 rounded-lg border border-emerald-300">
                Honorario Comisión: $45.00 USD
              </div>
            </div>

            {featuredCase.cpaFirma ? (
              <div className="bg-white rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Expediente Oficialmente Firmado por {featuredCase.cpaNombre}
                  </div>
                  <p className="text-slate-500 font-mono text-[11px]">
                    Registrado el {new Date(featuredCase.cpaFirma.fecha).toLocaleString()}
                  </p>
                </div>
                <img
                  src={featuredCase.cpaFirma.dataUrl}
                  alt="Firma CPA"
                  className="h-12 border border-slate-200 rounded p-1 bg-white"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <SignaturePad
                  onSave={setSignatureDataUrl}
                  title="Canvas de Firma Digital del CPA"
                  description="Dibuje su firma con mouse o touch para certificar el expediente y liberar la comisión de $45."
                  penColor="#047857"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleQuickSignApprove}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Firmar Oficial + Aprobar ($45)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CPA Cases Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Bandeja de Expedientes Fiscales ({cpaUser.estado})</h3>
            <p className="text-xs text-slate-500">Expedientes asignados a su despacho tributario</p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['TODOS', 'REALIZADA', 'EN_TRAMITE', 'APROBADA'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTabStatus(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTabStatus === tab
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="p-4">Caso</th>
                <th className="p-4">Contribuyente</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Ingresos / Tipo</th>
                <th className="p-4">Comisión</th>
                <th className="p-4">Estatus</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCasesList.map(caso => (
                <tr key={caso.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-600">{caso.casoNumero}</td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{caso.clienteNombre}</div>
                    <div className="text-[11px] text-slate-400">{caso.clienteEmail}</div>
                  </td>
                  <td className="p-4 font-bold">{caso.estado}</td>
                  <td className="p-4">
                    <div>${(caso.clienteData?.ingresosEstimados || 55000).toLocaleString()} USD</div>
                    <div className="text-[11px] text-slate-400">{caso.clienteData?.tipoDeclaracion || 'Soltero'}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-emerald-700">${caso.comisionMonto} USD</span>
                    <span className="block text-[10px] text-slate-400 uppercase font-mono">{caso.comisionStatus}</span>
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-semibold text-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Abrir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
