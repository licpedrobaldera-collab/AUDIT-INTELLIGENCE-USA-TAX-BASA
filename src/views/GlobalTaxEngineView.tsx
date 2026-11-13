import React, { useEffect, useMemo, useState } from 'react';
import {
  AutonomousCaseManager,
  CertifiedProfessional,
  ClientCaseFolder,
  EntityType,
  GLOBAL_TAX_MATRIX,
  ProfessionalRole,
  ProfessionalVerificationModule,
  SplitPaymentRecord,
  SUPPORTED_LANGUAGES,
  getJurisdictionRule
} from '../services/globalTaxEngine';
import {
  Globe,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  FolderTree,
  Users,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
  Calculator,
  Search,
  Upload,
  AlertCircle,
  Wallet,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SelfHealingV4Panel } from '../components/SelfHealingV4Panel';

interface GroundedSource {
  title: string;
  uri: string;
}

interface TurboSyncStatus {
  status: 'IDLE' | 'SYNCING' | 'OK' | 'UNCONFIGURED' | 'ERROR';
  model: string;
  intervalMinutes: number;
  lastSyncTimestamp: string | null;
  nextSyncTimestamp: string | null;
  summary: string;
  sources: GroundedSource[];
  errorMessage?: string;
}

interface AutonomousFilingResponse {
  ok: boolean;
  model: string;
  jurisdiction: string;
  countryCode: string;
  language: string;
  formsUsed: string[];
  reportMarkdown: string;
  sources: GroundedSource[];
  generatedAt: string;
  error?: string;
}

const proModuleSingleton = new ProfessionalVerificationModule();
const caseManagerSingleton = new AutonomousCaseManager(proModuleSingleton);

export const GlobalTaxEngineView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jurisdiction' | 'professionals' | 'cases' | 'selfhealing'>('jurisdiction');
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Jurisdiction & AI State
  const [countryCode, setCountryCode] = useState('DO');
  const [customCountryInput, setCustomCountryInput] = useState('');
  const [language, setLanguage] = useState('es');
  const [entityType, setEntityType] = useState<EntityType>('CORPORATE');
  const [sectorCode, setSectorCode] = useState('CIIU-6201');
  const [financialDataJson, setFinancialDataJson] = useState(
    JSON.stringify(
      {
        ingresosBrutosAnuales: 185000,
        costosOperativos: 62000,
        nominaYSeguridadSocial: 34000,
        retencionesPagadas: 8500,
        activosFijosNetos: 92000
      },
      null,
      2
    )
  );

  // Server-side TurboTaxAIEngine State
  const [syncStatus, setSyncStatus] = useState<TurboSyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingFiling, setIsGeneratingFiling] = useState(false);
  const [aiFilingResult, setAiFilingResult] = useState<AutonomousFilingResponse | null>(null);

  // Professionals & Autonomous Cases State
  const [professionals, setProfessionals] = useState<CertifiedProfessional[]>(() => proModuleSingleton.listAll());
  const [cases, setCases] = useState<ClientCaseFolder[]>(() => caseManagerSingleton.listCases());
  const [splitHistory, setSplitHistory] = useState<SplitPaymentRecord[]>(() => caseManagerSingleton.listSplitHistory());

  // New Professional Form
  const [proForm, setProForm] = useState({
    fullName: '',
    role: 'ACCOUNTANT' as ProfessionalRole,
    countryCode: 'DO',
    licenseNumber: '',
    issuingAuthority: 'ICPARD / Colegio Oficial',
    officialValidationUrl: 'https://',
    evidenceFileUrl: 'Credencial_Exequatur.pdf',
    commissionRatePercent: 40
  });

  // New Autonomous Case Form
  const [caseForm, setCaseForm] = useState({
    clientName: '',
    taxYear: new Date().getFullYear(),
    totalFee: 450,
    accountantId: proModuleSingleton.getVerifiedByRole('ACCOUNTANT')[0]?.id || '',
    auditorId: proModuleSingleton.getVerifiedByRole('AUDITOR')[0]?.id || '',
    legalAdvisorId: proModuleSingleton.getVerifiedByRole('LEGAL_ADVISOR')[0]?.id || ''
  });

  const activeRule = useMemo(() => getJurisdictionRule(countryCode), [countryCode]);
  const verifiedAccountants = useMemo(() => professionals.filter(p => p.role === 'ACCOUNTANT' && p.verificationStatus === 'VERIFIED'), [professionals]);
  const verifiedAuditors = useMemo(() => professionals.filter(p => p.role === 'AUDITOR' && p.verificationStatus === 'VERIFIED'), [professionals]);
  const verifiedLegal = useMemo(() => professionals.filter(p => p.role === 'LEGAL_ADVISOR' && p.verificationStatus === 'VERIFIED'), [professionals]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch('/api/global-tax/sync-status');
      if (res.ok) {
        const data = (await res.json()) as TurboSyncStatus;
        setSyncStatus(data);
      }
    } catch {
      // ignore initial offline error
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const handleSelectCountry = (code: string) => {
    const clean = code.trim().toUpperCase();
    setCountryCode(clean);
    const rule = getJurisdictionRule(clean);
    setLanguage(rule.defaultLanguage);
    setSectorCode(`${rule.activityStandard}-001`);
  };

  const handleTriggerTurboSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/global-tax/sync-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode })
      });
      const data = (await res.json()) as TurboSyncStatus;
      setSyncStatus(data);
      if (data.status === 'OK') {
        showToast('success', 'Turbo-Sync Global completado con Google Search Grounding.');
      } else {
        showToast('info', data.errorMessage || 'Estado de sincronización actualizado.');
      }
    } catch {
      showToast('error', 'No se pudo conectar con el servidor de sincronización horaria.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePrepareAutonomousFiling = async () => {
    setIsGeneratingFiling(true);
    try {
      let parsedFinancial: Record<string, unknown> = {};
      try {
        parsedFinancial = JSON.parse(financialDataJson);
      } catch {
        showToast('error', 'El bloque JSON de datos financieros tiene un error de sintaxis.');
        setIsGeneratingFiling(false);
        return;
      }

      const res = await fetch('/api/global-tax/prepare-filing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          language,
          entityType,
          sectorCode,
          financialData: parsedFinancial
        })
      });

      const data = (await res.json()) as AutonomousFilingResponse;
      if (!res.ok || !data.ok) {
        showToast('error', data.error || 'Error preparando borrador autónomo IA.');
        return;
      }
      setAiFilingResult(data);
      showToast('success', `Borrador fiscal generado para ${data.jurisdiction} (${data.language.toUpperCase()}).`);
    } catch {
      showToast('error', 'Error de red invocando el orquestador Multi-IA.');
    } finally {
      setIsGeneratingFiling(false);
    }
  };

  const handleRegisterProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = proModuleSingleton.registerProfessional({
        fullName: proForm.fullName,
        role: proForm.role,
        countryCode: proForm.countryCode.toUpperCase(),
        licenseNumber: proForm.licenseNumber,
        issuingAuthority: proForm.issuingAuthority,
        officialValidationUrl: proForm.officialValidationUrl,
        evidenceFileUrl: proForm.evidenceFileUrl,
        commissionRate: Number(proForm.commissionRatePercent) / 100
      });
      setProfessionals(proModuleSingleton.listAll());
      setProForm({
        ...proForm,
        fullName: '',
        licenseNumber: '',
        officialValidationUrl: 'https://'
      });
      showToast('success', `Profesional ${created.fullName} registrado en estado PENDIENTE DE VALIDACIÓN.`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error validando datos del profesional.');
    }
  };

  const handleVerifyProfessional = (id: string) => {
    const updated = proModuleSingleton.verifyProfessional(id);
    if (updated) {
      setProfessionals(proModuleSingleton.listAll());
      // Auto-select if empty in case form
      if (updated.role === 'ACCOUNTANT' && !caseForm.accountantId) {
        setCaseForm(prev => ({ ...prev, accountantId: updated.id }));
      } else if (updated.role === 'AUDITOR' && !caseForm.auditorId) {
        setCaseForm(prev => ({ ...prev, auditorId: updated.id }));
      } else if (updated.role === 'LEGAL_ADVISOR' && !caseForm.legalAdvisorId) {
        setCaseForm(prev => ({ ...prev, legalAdvisorId: updated.id }));
      }
      showToast('success', `${updated.fullName} ha sido VERIFICADO ante su organismo oficial.`);
    }
  };

  const handleCreateAutonomousCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseForm.clientName.trim()) {
      showToast('error', 'Ingresa el nombre del cliente o razón social.');
      return;
    }
    const created = caseManagerSingleton.createAutonomousCase({
      clientName: caseForm.clientName,
      countryCode,
      taxYear: Number(caseForm.taxYear),
      entityType,
      sectorCode,
      totalFee: Number(caseForm.totalFee),
      assignedTeam: {
        accountantId: caseForm.accountantId || verifiedAccountants[0]?.id,
        auditorId: caseForm.auditorId || verifiedAuditors[0]?.id,
        legalAdvisorId: caseForm.legalAdvisorId || verifiedLegal[0]?.id
      }
    });
    setCases(caseManagerSingleton.listCases());
    setCaseForm(prev => ({ ...prev, clientName: '' }));
    showToast('success', `Expediente autónomo creado: ${created.folderPath}`);
  };

  const handleApproveAndSplit = (caso: ClientCaseFolder) => {
    const accountantId = caso.assignedTeam.accountantId || verifiedAccountants[0]?.id || '';
    const auditorId = caso.assignedTeam.auditorId || verifiedAuditors[0]?.id || '';
    const legalAdvisorId = caso.assignedTeam.legalAdvisorId || verifiedLegal[0]?.id || '';

    try {
      const record = caseManagerSingleton.approveAndDistributeCommissions(caso.caseId, caso.totalFee, {
        accountantId,
        auditorId,
        legalAdvisorId
      });
      setCases(caseManagerSingleton.listCases());
      setProfessionals(proModuleSingleton.listAll());
      setSplitHistory(caseManagerSingleton.listSplitHistory());
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      showToast(
        'success',
        `Split Payment ejecutado (${record.id}): $${record.totalFee} USD distribuidos entre equipo verificado y plataforma.`
      );
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error distribuyendo comisiones.');
    }
  };

  const roleBadge = (role: ProfessionalRole) => {
    if (role === 'ACCOUNTANT') return { label: 'Contador Público', cls: 'bg-blue-100 text-blue-800 border-blue-200', icon: Calculator };
    if (role === 'AUDITOR') return { label: 'Auditor', cls: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Search };
    return { label: 'Asesor Legal', cls: 'bg-purple-100 text-purple-800 border-purple-200', icon: Scale };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Notification Toast */}
      {notice && (
        <div
          className={`px-5 py-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md border ${
            notice.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : notice.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-300" /> : <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
            <span>{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-white/70 hover:text-white font-bold ml-4">
            Cerrar
          </button>
        </div>
      )}

      {/* Executive Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-bold font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>GLOBAL TAX ENGINE V3.0 • ARQUITECTURA DE EXPANSIÓN MUNDIAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Orquestador Tributario Multi-País, Validación Profesional & Split Payments
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Operación dinámica en EE. UU., República Dominicana, España, México, Colombia, Guatemala, Italia, Japón, China, Rusia y cualquier código ISO mundial con actualización horaria mediante búsqueda fundamentada.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 text-xs">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3.5">
              <span className="text-[10px] uppercase text-blue-200 font-bold block">Jurisdicción Activa</span>
              <span className="text-lg font-black text-white">{activeRule.countryCode} • {activeRule.currency}</span>
              <span className="text-[10px] text-slate-300 block truncate">{activeRule.activityStandard}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3.5">
              <span className="text-[10px] uppercase text-emerald-200 font-bold block">Equipo Certificado</span>
              <span className="text-lg font-black text-white">
                {professionals.filter(p => p.verificationStatus === 'VERIFIED').length} / {professionals.length}
              </span>
              <span className="text-[10px] text-slate-300 block">CPA • Auditor • Legal</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3.5 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase text-amber-200 font-bold block">Expedientes V3</span>
              <span className="text-lg font-black text-white">{cases.length} Activos</span>
              <span className="text-[10px] text-slate-300 block">{splitHistory.length} Split Pagos</span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('jurisdiction')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'jurisdiction'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 1. Jurisdicción, Normativa & IA Horaria
          </button>
          <button
            onClick={() => setActiveTab('professionals')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'professionals'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> 2. Directorio Certificado (CPA / Auditor / Legal)
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cases'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <FolderTree className="w-4 h-4" /> 3. Expedientes Autónomos & Split Payments
          </button>
          <button
            onClick={() => setActiveTab('selfhealing')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'selfhealing'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> 4. Self-Healing V4.0 & Certificación 100/100
          </button>
        </div>
      </div>

      {/* TAB 1: JURISDICTION & MULTI-AI ENGINE */}
      {activeTab === 'jurisdiction' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Jurisdiction Configurator & Forms */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Motor de Jurisdicción y Normativa Dinámica
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecciona un país o ingresa cualquier código ISO-3166 para asignar formularios oficiales.
                </p>
              </div>

              {/* Quick Country Selector Pills */}
              <div className="flex flex-wrap gap-1.5">
                {Object.values(GLOBAL_TAX_MATRIX).map(item => (
                  <button
                    key={item.countryCode}
                    type="button"
                    onClick={() => handleSelectCountry(item.countryCode)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      countryCode === item.countryCode
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.countryCode} · {item.countryName.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Custom ISO + Language */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código País ISO (Global)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      maxLength={3}
                      value={customCountryInput}
                      onChange={e => setCustomCountryInput(e.target.value.toUpperCase())}
                      placeholder="Ej: BR, FR, DE, CA"
                      className="w-full p-2 rounded-xl border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => customCountryInput.trim() && handleSelectCountry(customCountryInput)}
                      className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Idioma del Dictamen IA</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    {SUPPORTED_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Entity Type & Sector Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Régimen Fiscal</label>
                  <select
                    value={entityType}
                    onChange={e => setEntityType(e.target.value as EntityType)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="INDIVIDUAL">Persona Física / Individual</option>
                    <option value="CORPORATE">Persona Jurídica / Empresa</option>
                    <option value="NON_PROFIT">ONG / Sin Fines de Lucro (ISFL)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Actividad ({activeRule.activityStandard})
                  </label>
                  <input
                    type="text"
                    value={sectorCode}
                    onChange={e => setSectorCode(e.target.value)}
                    placeholder={`Ej: ${activeRule.activityStandard}-6201`}
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              {/* Live Jurisdiction Specification Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Autoridad Tributaria</span>
                    <span className="font-extrabold text-slate-900">{activeRule.taxAuthority}</span>
                  </div>
                  <a
                    href={activeRule.officialPortal}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-blue-700 font-bold hover:bg-blue-50"
                  >
                    Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                    Formularios Oficiales Asignados ({entityType})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRule.requiredForms[entityType].map(form => (
                      <span
                        key={form}
                        className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-mono font-bold border border-blue-200"
                      >
                        {form}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Turbo-Sync Widget */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Actualización Horaria (Cron cada 60 min)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Búsqueda web fundamentada en boletines fiscales y tasas oficiales.
                  </p>
                </div>
                <button
                  onClick={handleTriggerTurboSync}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Turbo-Sync'}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                  <span>Estado: <strong className="text-emerald-400">{syncStatus?.status || 'INICIANDO'}</strong></span>
                  <span>
                    Último Sync:{' '}
                    {syncStatus?.lastSyncTimestamp
                      ? new Date(syncStatus.lastSyncTimestamp).toLocaleTimeString()
                      : 'Pendiente'}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                  {syncStatus?.summary ||
                    'Worker horario configurado cada 60 minutos. Haz clic en Turbo-Sync para consultar las reformas fiscales más recientes con Google Search Grounding.'}
                </p>
                {syncStatus?.sources && syncStatus.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-blue-300 block">Fuentes Verificadas:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {syncStatus.sources.slice(0, 5).map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[10px] border border-slate-700"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[180px]">{src.title || src.uri}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Autonomous Tax Filing AI Generator */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Orquestador Multi-IA · Preparación Autónoma de Declaración
                </h2>
                <p className="text-xs text-slate-500">
                  Calcula base imponible, deducciones aplicables, llenado casilla por casilla y dictamen legal-auditor en servidor seguro.
                </p>
              </div>
              <button
                onClick={handlePrepareAutonomousFiling}
                disabled={isGeneratingFiling}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingFiling ? 'animate-pulse' : ''}`} />
                {isGeneratingFiling ? 'Procesando Jurisdicción...' : `Preparar Declaración (${activeRule.countryCode})`}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">
                Datos Financieros / Balanza del Contribuyente (JSON estructurado)
              </label>
              <textarea
                rows={6}
                value={financialDataJson}
                onChange={e => setFinancialDataJson(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 font-mono text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 min-h-[280px]">
              {aiFilingResult ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 text-xs">
                    <span className="font-extrabold text-indigo-800">
                      Borrador Autónomo · {aiFilingResult.jurisdiction} ({aiFilingResult.language.toUpperCase()})
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Formularios: {aiFilingResult.formsUsed.join(', ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans max-h-[380px] overflow-y-auto pr-1">
                    {aiFilingResult.reportMarkdown}
                  </div>

                  {aiFilingResult.sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Referencias Normativas Encontradas (Google Search Grounding):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiFilingResult.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-blue-700 hover:bg-blue-50 text-[11px] font-medium"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-[220px]">{src.title || src.uri}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-2 text-slate-400">
                  <FileText className="w-10 h-10 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    Presiona &ldquo;Preparar Declaración ({activeRule.countryCode})&rdquo; para generar el cálculo casilla por casilla.
                  </p>
                  <p className="text-[11px] max-w-md">
                    El orquestador en servidor consulta la normativa tributaria actualizada de {activeRule.taxAuthority} y emite el borrador oficial prellenado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CERTIFIED PROFESSIONALS REGISTRY */}
      {activeTab === 'professionals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Registration Form */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Alta de Profesional Certificado
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro independiente para Contadores Públicos, Auditores y Asesores Legales con validación ante colegio oficial.
              </p>
            </div>

            <form onSubmit={handleRegisterProfessional} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rol Profesional *</label>
                <select
                  value={proForm.role}
                  onChange={e => setProForm({ ...proForm, role: e.target.value as ProfessionalRole })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  <option value="ACCOUNTANT">Contador Público (CPA)</option>
                  <option value="AUDITOR">Auditor Independiente / Forense</option>
                  <option value="LEGAL_ADVISOR">Asesor Legal Tributario</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={proForm.fullName}
                  onChange={e => setProForm({ ...proForm, fullName: e.target.value })}
                  placeholder="Ej: Lic. Ana Gómez"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">País ISO *</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={proForm.countryCode}
                    onChange={e => setProForm({ ...proForm, countryCode: e.target.value.toUpperCase() })}
                    placeholder="DO / US / ES"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Comisión % *</label>
                  <input
                    type="number"
                    min={5}
                    max={80}
                    required
                    value={proForm.commissionRatePercent}
                    onChange={e => setProForm({ ...proForm, commissionRatePercent: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. Exequátur / Cédula / Licencia *</label>
                <input
                  type="text"
                  required
                  value={proForm.licenseNumber}
                  onChange={e => setProForm({ ...proForm, licenseNumber: e.target.value })}
                  placeholder="Ej: EXQ-98432 / PTIN-88321"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Colegio / Entidad Emisora *</label>
                <input
                  type="text"
                  required
                  value={proForm.issuingAuthority}
                  onChange={e => setProForm({ ...proForm, issuingAuthority: e.target.value })}
                  placeholder="ICPARD / ICAC / IMCP / IRS"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Enlace Web Oficial de Verificación (https://) *</label>
                <input
                  type="url"
                  required
                  value={proForm.officialValidationUrl}
                  onChange={e => setProForm({ ...proForm, officialValidationUrl: e.target.value })}
                  placeholder="https://www.icpard.org/verificar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Evidencia Documental (PDF / Imagen)</label>
                <label className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100">
                  <span className="truncate text-slate-600 font-mono">{proForm.evidenceFileUrl}</span>
                  <Upload className="w-4 h-4 text-blue-600 shrink-0" />
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setProForm({ ...proForm, evidenceFileUrl: file.name });
                      }
                    }}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Registrar Credencial Profesional
              </button>
            </form>
          </div>

          {/* Directory List */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Directorio Global de Profesionales Certificados ({professionals.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Solo los profesionales con estado VERIFIED pueden recibir asignaciones y Split Payments.
                </p>
              </div>
              <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 font-bold">
                Validación Multi-Colegio
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {professionals.map(pro => {
                const badge = roleBadge(pro.role);
                const RoleIcon = badge.icon;
                return (
                  <div key={pro.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}>
                          <RoleIcon className="w-3 h-3" /> {badge.label}
                        </span>
                        <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {pro.countryCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            pro.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {pro.verificationStatus}
                        </span>
                      </div>

                      <div className="font-black text-sm text-slate-900">{pro.fullName}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        Licencia: <strong className="text-slate-800">{pro.licenseNumber}</strong> · Entidad: {pro.issuingAuthority}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        <a
                          href={pro.officialValidationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                        >
                          Verificar en organismo oficial <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600 font-mono">Soporte: {pro.evidenceFileUrl}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-mono text-slate-500">
                          Split: <strong className="text-slate-900">{Math.round(pro.commissionRate * 100)}%</strong>
                        </div>
                        <div className="inline-flex items-center gap-1 text-sm font-black text-emerald-700 mt-0.5">
                          <Wallet className="w-4 h-4" /> ${pro.walletBalance.toFixed(2)} USD
                        </div>
                      </div>

                      {pro.verificationStatus !== 'VERIFIED' ? (
                        <button
                          onClick={() => handleVerifyProfessional(pro.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                        >
                          Verificar Credencial
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Habilitado
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTONOMOUS CASES & SPLIT PAYMENTS */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Case Folder Form */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FolderTree className="w-5 h-5 text-blue-600" />
                  Crear Expediente Autónomo Global
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Genera automáticamente la carpeta por país/año, borradores oficiales y asigna la terna certificada.
                </p>
              </div>

              <form onSubmit={handleCreateAutonomousCase} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Cliente o Empresa *</label>
                  <input
                    type="text"
                    required
                    value={caseForm.clientName}
                    onChange={e => setCaseForm({ ...caseForm, clientName: e.target.value })}
                    placeholder="Ej: Caribe Tech SRL / Global Trade Corp"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jurisdicción</label>
                    <input
                      type="text"
                      value={countryCode}
                      onChange={e => handleSelectCountry(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono uppercase bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Año Fiscal</label>
                    <input
                      type="number"
                      value={caseForm.taxYear}
                      onChange={e => setCaseForm({ ...caseForm, taxYear: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Honorario USD</label>
                    <input
                      type="number"
                      min={50}
                      value={caseForm.totalFee}
                      onChange={e => setCaseForm({ ...caseForm, totalFee: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contador Público Asignado</label>
                  <select
                    value={caseForm.accountantId}
                    onChange={e => setCaseForm({ ...caseForm, accountantId: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {verifiedAccountants.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({Math.round(a.commissionRate * 100)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Auditor Asignado</label>
                  <select
                    value={caseForm.auditorId}
                    onChange={e => setCaseForm({ ...caseForm, auditorId: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {verifiedAuditors.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({Math.round(a.commissionRate * 100)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Asesor Legal Asignado</label>
                  <select
                    value={caseForm.legalAdvisorId}
                    onChange={e => setCaseForm({ ...caseForm, legalAdvisorId: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {verifiedLegal.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({Math.round(a.commissionRate * 100)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Generar Estructura & Expediente Autónomo
                </button>
              </form>
            </div>

            {/* Active Autonomous Cases List */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Bóveda de Expedientes Autónomos ({cases.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aprueba expedientes para firmar documentos y ejecutar Split Payment automático.
                  </p>
                </div>
              </div>

              {cases.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500 space-y-2">
                  <FolderTree className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">Aún no hay expedientes globales creados.</p>
                  <p>Crea tu primer expediente en el formulario izquierdo para generar su estructura y repartir honorarios.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {cases.map(caso => (
                    <div key={caso.caseId} className="p-5 space-y-3 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-700">{caso.caseId}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                caso.status === 'READY_TO_FILE'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {caso.status}
                            </span>
                          </div>
                          <h4 className="font-black text-sm text-slate-900 mt-0.5">{caso.clientName}</h4>
                          <code className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">
                            {caso.folderPath}
                          </code>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-slate-900">${caso.totalFee.toFixed(2)} USD</div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {caso.entityType} · {caso.sectorCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {caso.documents.map(doc => (
                          <span
                            key={doc.name}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono border ${
                              doc.status === 'FINAL_SIGNED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            <FileText className="w-3 h-3" /> {doc.name} ({doc.status})
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        {caso.lastDistribution ? (
                          <div className="text-[11px] text-emerald-700 font-semibold">
                            Distribuido ({caso.lastDistribution.id}): Plataforma ${caso.lastDistribution.platformShare.toFixed(2)} + Equipo $
                            {(caso.lastDistribution.totalFee - caso.lastDistribution.platformShare).toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500">
                            Listo para revisión de terna (Contador + Auditor + Legal)
                          </div>
                        )}

                        {caso.status !== 'READY_TO_FILE' && (
                          <button
                            onClick={() => handleApproveAndSplit(caso)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Aprobar & Repartir Comisiones
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Split Payment Ledger */}
          {splitHistory.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="font-black text-base text-slate-900">
                  Libro de Reparto de Comisiones (Split Payments)
                </h3>
                <p className="text-xs text-slate-500">
                  Distribución automática entre Plataforma y los 3 roles certificados (Contador, Auditor, Asesor Legal).
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[11px]">
                      <th className="p-4">Split ID</th>
                      <th className="p-4">Expediente</th>
                      <th className="p-4">Honorario Total</th>
                      <th className="p-4">Reparto Equipo Certificado</th>
                      <th className="p-4">Plataforma</th>
                      <th className="p-4">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {splitHistory.map(sp => (
                      <tr key={sp.id} className="hover:bg-slate-50">
                        <td className="p-4 font-mono font-bold text-blue-700">{sp.id}</td>
                        <td className="p-4 font-mono text-slate-700">{sp.caseId}</td>
                        <td className="p-4 font-black text-slate-900">${sp.totalFee.toFixed(2)} USD</td>
                        <td className="p-4 space-y-1">
                          {sp.shares.map(sh => (
                            <div key={sh.professionalId} className="text-[11px] font-mono">
                              <span className="font-bold text-slate-800">{sh.role}</span>: ${sh.amount.toFixed(2)} ({Math.round(sh.rate * 100)}%) — {sh.fullName}
                            </div>
                          ))}
                        </td>
                        <td className="p-4 font-mono font-bold text-emerald-700">
                          ${sp.platformShare.toFixed(2)} ({Math.round(sp.platformRate * 100)}%)
                        </td>
                        <td className="p-4 text-slate-500">{new Date(sp.distributedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SELF-HEALING V4.0 & CERTIFICACION 100/100 */}
      {activeTab === 'selfhealing' && <SelfHealingV4Panel />}
    </div>
  );
};
