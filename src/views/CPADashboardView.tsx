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
  Save,
  Shield,
  CreditCard,
  Building,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp,
  Inbox
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const CPADashboardView: React.FC = () => {
  const {
    currentUser,
    cases,
    actualizarCaso,
    borrarCasoConLog,
    firmarAprobarCPA,
    setSelectedCaseForModal,
    setSelectedDocForPreview,
    navigate,
    resetToDefaults
  } = useApp();

  // Active CPA user details
  const cpaUser = currentUser?.rol === 'CONTADOR' ? currentUser : {
    codigoCPA: 'CPA-NY-12345',
    nombre: 'Lic. Pedro Baldera, CPA',
    estado: 'NY',
    licencia: 'NY-CPA-12345',
    ptin: 'P00891234',
    bancoNombre: 'Chase Bank',
    bancoNumero: '****1234',
    bancoRouting: '021000021',
  };

  // Real filtered cases for this CPA
  const cpaCases = cases.filter(
    c => c.cpaCodigo === cpaUser.codigoCPA || c.cpaUserId === currentUser?.id || c.estado === cpaUser.estado
  );

  // Exact real counts based on real cases registered
  const countRealizadas = cpaCases.filter(c => c.status === 'REALIZADA').length;
  const countEnTramite = cpaCases.filter(c => c.status === 'EN_TRAMITE').length;
  const countAprobadas = cpaCases.filter(c => c.status === 'APROBADA').length;
  const montoAprobadas = countAprobadas * 45;

  // Selected case for featured detail or first available real case
  const featuredCase = cpaCases[0] || null;

  const [activeTabStatus, setActiveTabStatus] = useState<'TODOS' | 'REALIZADA' | 'EN_TRAMITE' | 'APROBADA'>('TODOS');
  const [hoveredStatusKey, setHoveredStatusKey] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [savedNotesMessage, setSavedNotesMessage] = useState(false);
  const [editingNotes, setEditingNotes] = useState(featuredCase?.notasCPA || 'Auditoría fiscal preliminar: revisión de retenciones W-2, deducciones estándar y elegibilidad.');

  // Real balance por pagar: real pending approved cases comision
  const balancePorPagar = cpaCases
    .filter(c => c.status === 'APROBADA' && c.comisionStatus === 'PENDIENTE')
    .reduce((sum, c) => sum + (c.comisionMonto || 45), 0);

  const totalCasesCount = cpaCases.length;

  // Chart data for Recharts status distribution with rich metadata for CPAs
  const chartData = [
    {
      name: 'Realizadas',
      statusKey: 'REALIZADA' as const,
      value: countRealizadas,
      color: '#2563eb', // Blue-600
      accentColor: '#3b82f6',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      pillBg: 'bg-blue-600',
      desc: 'Expedientes radicados pendientes de asignación o revisión',
      financial: `$${countRealizadas * 150} USD cobrado cliente`,
      subdetail: 'Formularios 1040 ingresados al sistema'
    },
    {
      name: 'En Trámite',
      statusKey: 'EN_TRAMITE' as const,
      value: countEnTramite,
      color: '#f59e0b', // Amber-500
      accentColor: '#fbbf24',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      pillBg: 'bg-amber-500',
      desc: 'Cotejo de formularios W-2, 1099 y deducciones fiscales',
      financial: 'Auditoría en curso bajo Circular 230',
      subdetail: 'En cotejo de comprobantes y anexos'
    },
    {
      name: 'Aprobadas',
      statusKey: 'APROBADA' as const,
      value: countAprobadas,
      color: '#10b981', // Emerald-500
      accentColor: '#34d399',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      pillBg: 'bg-emerald-600',
      desc: 'Auditadas y certificadas con firma oficial del CPA',
      financial: `$${montoAprobadas} USD comisión generada ($45/caso)`,
      subdetail: 'Listas para e-file y liquidación bancaria'
    },
  ];

  const hoveredItem = chartData.find(item => item.statusKey === hoveredStatusKey) || null;

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
      `EXPEDIENTE FISCAL OFICIAL COMPLETO (ZIP ARCHIVE):\n` +
      `Caso Número: ${caso.casoNumero} - ${caso.clienteNombre}\n` +
      `Jurisdicción: ${caso.estado}\n` +
      `Carpeta Raíz: ${caso.carpetaPath}\n` +
      `Soportes Vinculados (${caso.soportes?.length || 0} archivos):\n` +
      caso.soportes.map((s: any, idx: number) => `${idx + 1}. [${s.categoria}] ${s.nombre} (${s.tamano})`).join('\n') +
      `\n\nCPA Auditor Certificado: ${cpaUser.nombre} (${cpaUser.codigoCPA})\n` +
      `PTIN: ${cpaUser.ptin} | Licencia: ${cpaUser.licencia}\n` +
      `Cuenta de Liquidación de Comisiones: ${cpaUser.bancoNombre} ${cpaUser.bancoNumero}`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EXPEDIENTE_${caso.casoNumero}_${caso.estado}.zip.txt`;
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
      {/* CPA Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
            <span>{cpaUser.codigoCPA}</span>
            <span>•</span>
            <span>Licencia: {cpaUser.licencia || 'Registrada'}</span>
            <span>•</span>
            <span>PTIN: {cpaUser.ptin || 'P-Activo'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CPA DASHBOARD {cpaUser.codigoCPA} ({cpaUser.estado})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {cpaUser.nombre} • Despacho Contable Certificado IRS Circular 230 & IRC 7216
          </p>
        </div>

        {/* Real Commission Balance Badge */}
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 text-right">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            Balance por Cobrar
          </span>
          <div className="text-3xl font-black text-emerald-900">
            ${balancePorPagar} <span className="text-xs font-bold text-emerald-700">USD</span>
          </div>
          <span className="text-xs font-mono font-medium text-emerald-800 block mt-0.5">
            Destino: {cpaUser.bancoNombre} {cpaUser.bancoNumero}
          </span>
        </div>
      </div>

      {/* KPI Stats based on real registered data */}
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
          <p className="text-xs mt-1 opacity-80">Expedientes recibidos pendientes de auditoría</p>
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
          <p className="text-xs mt-1 opacity-80">En proceso de cotejo de deducciones fiscales</p>
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
            {countAprobadas} <span className="text-base font-bold opacity-90">= ${montoAprobadas} USD</span>
          </div>
          <p className="text-xs mt-1 opacity-80">$45.00 USD de comisión por caso aprobado</p>
        </div>
      </div>

      {/* RECHARTS DATA VISUALIZATION SECTION: Distribution of Case Statuses */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Section Header with Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              <PieChartIcon className="w-3.5 h-3.5" />
              <span>Recharts Interactive Visual Oversight</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Distribución de Casos Fiscales
            </h3>
            <p className="text-xs text-slate-500">
              Supervisión visual en tiempo real: Realizadas vs. En Trámite vs. Aprobadas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTabStatus('TODOS')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTabStatus === 'TODOS'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({totalCasesCount})
              </button>
              <button
                onClick={() => setActiveTabStatus('REALIZADA')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTabStatus === 'REALIZADA'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Realizadas ({countRealizadas})
              </button>
              <button
                onClick={() => setActiveTabStatus('EN_TRAMITE')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTabStatus === 'EN_TRAMITE'
                    ? 'bg-amber-500 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                En Trámite ({countEnTramite})
              </button>
              <button
                onClick={() => setActiveTabStatus('APROBADA')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTabStatus === 'APROBADA'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Aprobadas ({countAprobadas})
              </button>
            </div>

            {totalCasesCount === 0 && (
              <button
                onClick={resetToDefaults}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
              >
                Cargar Datos Demo
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Recharts PieChart (Left) + Detailed Oversight Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Recharts PieChart Container */}
          <div className="lg:col-span-6 bg-slate-50/70 p-6 rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center relative">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-blue-600" />
                Gráfico Circular de Casos
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Filtro Activo: {activeTabStatus}
              </span>
            </div>

            <div className="relative w-full h-72 sm:h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalCasesCount > 0 ? chartData : [{ name: 'Sin casos', statusKey: 'TODOS', value: 1, color: '#e2e8f0', desc: '', financial: '', badgeBg: '', pillBg: '', subdetail: '' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={totalCasesCount > 1 ? 4 : 0}
                    dataKey="value"
                    nameKey="name"
                    stroke="#ffffff"
                    strokeWidth={3}
                    onClick={(entry: any) => {
                      if (entry?.statusKey && entry.statusKey !== 'TODOS') {
                        setActiveTabStatus(entry.statusKey);
                      }
                    }}
                    onMouseEnter={(entry: any) => {
                      if (entry?.statusKey && entry.statusKey !== 'TODOS') {
                        setHoveredStatusKey(entry.statusKey);
                      }
                    }}
                    onMouseLeave={() => setHoveredStatusKey(null)}
                  >
                    {(totalCasesCount > 0 ? chartData : [{ color: '#e2e8f0' }]).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="cursor-pointer transition-opacity duration-200 hover:opacity-90"
                      />
                    ))}
                  </Pie>
                  {totalCasesCount > 0 && (
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          const pct = totalCasesCount > 0 ? ((item.value / totalCasesCount) * 100).toFixed(1) : '0';
                          return (
                            <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs min-w-[210px] space-y-1.5 backdrop-blur-md">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5">
                                <span className="font-bold flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                                  {item.name}
                                </span>
                                <span className="font-mono text-emerald-400 font-bold">{pct}%</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Volumen:</span>
                                <span className="font-bold text-white">{item.value} {item.value === 1 ? 'caso' : 'casos'}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-sans">
                                {item.desc}
                              </div>
                              <div className="pt-1 text-[11px] font-semibold border-t border-slate-800 text-emerald-400">
                                {item.financial}
                              </div>
                              <div className="text-[10px] text-slate-400 italic text-right pt-0.5">
                                Clic para filtrar expedientes
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  )}
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    formatter={(value) => (
                      <span className="text-xs font-semibold text-slate-700 px-1 hover:text-blue-600 transition-colors cursor-pointer">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Metric Inside the Donut Hole */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none">
                  {hoveredItem ? hoveredItem.value : totalCasesCount}
                </span>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mt-1">
                  {hoveredItem ? hoveredItem.name : 'Total Casos'}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 mt-0.5">
                  {hoveredItem
                    ? hoveredItem.statusKey === 'APROBADA'
                      ? `$${montoAprobadas} USD`
                      : totalCasesCount > 0
                      ? `${((hoveredItem.value / totalCasesCount) * 100).toFixed(0)}% del total`
                      : '0%'
                    : `$${balancePorPagar} USD por cobrar`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-2 italic">
              Pase el cursor sobre las secciones para ver detalles o haga clic en un sector para filtrar la lista.
            </p>
          </div>

          {/* Detailed Status Oversight Cards (Right Column) */}
          <div className="lg:col-span-6 space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Desglose Analítico por Fase
              </span>
              <span className="text-xs font-mono text-slate-500">
                Comisión: $45.00 USD / caso
              </span>
            </div>

            {chartData.map((item) => {
              const pct = totalCasesCount > 0 ? Math.round((item.value / totalCasesCount) * 100) : 0;
              const isSelected = activeTabStatus === item.statusKey;
              const isHovered = hoveredStatusKey === item.statusKey;

              return (
                <div
                  key={item.statusKey}
                  onClick={() => setActiveTabStatus(item.statusKey)}
                  onMouseEnter={() => setHoveredStatusKey(item.statusKey)}
                  onMouseLeave={() => setHoveredStatusKey(null)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-slate-900 ring-2 ring-slate-900 bg-white shadow-md'
                      : isHovered
                      ? 'border-blue-400 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.pillBg}`} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                          {item.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeBg}`}>
                          {pct}% del total
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {item.desc}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.subdetail}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-slate-900">
                        {item.value} <span className="text-xs font-bold text-slate-400">casos</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 block font-mono">
                        {item.statusKey === 'APROBADA'
                          ? `$${item.value * 45} USD ganados`
                          : item.statusKey === 'REALIZADA'
                          ? `$${item.value * 150} USD ingresado`
                          : 'Pendiente auditoría'}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${item.pillBg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Quick Summary Strip */}
            <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-600 font-medium border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Ingresos brutos acumulados: <strong className="text-slate-900">${totalCasesCount * 150} USD</strong>
              </span>
              <button
                onClick={() => navigate('/tax')}
                className="text-blue-600 hover:text-blue-700 font-bold inline-flex items-center gap-1 hover:underline"
              >
                + Radicar nuevo caso ($150)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Active Case for Audit, Signing and Notes */}
      {featuredCase ? (
        <div className="bg-white rounded-3xl border-2 border-blue-500/30 p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {featuredCase.casoNumero} — {featuredCase.clienteNombre}
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

            {/* Quick action bar */}
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

          {/* Soportes Summary Badge Line */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Expediente Digitalizado ({featuredCase.soportes?.length || 0} Soportes):
              </span>
              <span className="text-xs text-slate-500 font-mono">Bóveda Criptográfica</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {featuredCase.soportes?.map((soporte, idx) => (
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

          {/* Digital Signature Contract Section */}
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
      ) : null}

      {/* CPA Cases Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Bandeja de Expedientes Fiscales ({cpaUser.estado})</h3>
            <p className="text-xs text-slate-500">Expedientes reales registrados en su jurisdicción</p>
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

        {filteredCasesList.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No hay casos en este filtro de estatus ({activeTabStatus}).
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
