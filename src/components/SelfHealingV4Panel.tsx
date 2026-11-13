import React, { useEffect, useMemo, useState } from 'react';
import {
  ClientSelfHealingWatchdog,
  FinalClientAuditReport,
  IncidentReport,
  ModuleHealthStatus,
  SelfHealingTelemetry
} from '../services/selfHealingCore';
import { GLOBAL_TAX_MATRIX } from '../services/globalTaxEngine';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Cloud,
  Copy,
  Database,
  Download,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  Wrench,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

const localWatchdog = new ClientSelfHealingWatchdog();

export const SelfHealingV4Panel: React.FC = () => {
  const [telemetry, setTelemetry] = useState<SelfHealingTelemetry | null>(null);
  const [clientHeartbeat, setClientHeartbeat] = useState(0);
  const [clientModules, setClientModules] = useState<Record<string, ModuleHealthStatus>>({});
  const [localIncidents, setLocalIncidents] = useState<IncidentReport[]>([]);
  const [faultModule, setFaultModule] = useState('CLOUD_STORAGE');
  const [isSimulating, setIsSimulating] = useState(false);

  // Validator & 100/100 Certifier state
  const [countryCode, setCountryCode] = useState('DO');
  const [clientName, setClientName] = useState('Inversiones Caribe SRL');
  const [caseId, setCaseId] = useState('CASE-DO-2026-001');
  const [formName, setFormName] = useState('IR-2');
  const [rawJsonInput, setRawJsonInput] = useState(
    JSON.stringify(
      {
        moneda: 'USD',
        codigoActividad: '',
        identificacionFiscal: '',
        ingresosBrutos: -450000,
        gastosDeducibles: 120000
      },
      null,
      2
    )
  );
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validatedData, setValidatedData] = useState<Record<string, unknown> | null>(null);
  const [finalReport, setFinalReport] = useState<FinalClientAuditReport | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [deployStack, setDeployStack] = useState<'vercel_supabase' | 'cloudflare_firebase'>('vercel_supabase');

  const fetchServerTelemetry = async () => {
    try {
      const res = await fetch('/api/self-healing/status');
      if (res.ok) {
        const data = (await res.json()) as SelfHealingTelemetry;
        setTelemetry(data);
      }
    } catch {
      // Keep last known telemetry during transient offline interval
    }
  };

  useEffect(() => {
    void fetchServerTelemetry();

    const stopWatchdog = localWatchdog.startWatchdog(snapshot => {
      setClientHeartbeat(snapshot.heartbeatCount);
      setClientModules(snapshot.moduleStates);
      setLocalIncidents(snapshot.incidents);
    });

    const serverPoll = window.setInterval(() => {
      void fetchServerTelemetry();
    }, 5000);

    return () => {
      stopWatchdog();
      window.clearInterval(serverPoll);
    };
  }, []);

  const mergedIncidents = useMemo(() => {
    const serverList = telemetry?.incidents || [];
    const map = new Map<string, IncidentReport>();
    [...serverList, ...localIncidents].forEach(item => {
      if (!map.has(item.incidentId)) {
        map.set(item.incidentId, item);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [telemetry, localIncidents]);

  const handleSimulateFault = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/self-healing/simulate-fault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName: faultModule,
          errorMessage: `Anomalía de latencia/esquema detectada en ${faultModule}`
        })
      });
      if (res.ok) {
        const data = (await res.json()) as { telemetry: SelfHealingTelemetry };
        setTelemetry(data.telemetry);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const handleValidateAndCertify = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    let parsedRaw: Record<string, unknown> = {};
    try {
      parsedRaw = JSON.parse(rawJsonInput) as Record<string, unknown>;
    } catch {
      setValidationError('El JSON de entrada del formulario tiene un error de sintaxis.');
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch('/api/self-healing/validate-certify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          clientName,
          countryCode,
          formName,
          rawFormData: parsedRaw
        })
      });

      const data = (await res.json()) as {
        ok?: boolean;
        validatedData?: Record<string, unknown>;
        finalReport?: FinalClientAuditReport;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.finalReport) {
        setValidationError(data.error || 'No se pudo completar la validación.');
        return;
      }

      setValidatedData(data.validatedData || parsedRaw);
      setFinalReport(data.finalReport);
      setRawJsonInput(JSON.stringify(data.validatedData || parsedRaw, null, 2));
      void fetchServerTelemetry();

      try {
        confetti({ particleCount: 80, spread: 75, origin: { y: 0.65 } });
      } catch {
        // ignore
      }
    } catch {
      setValidationError('Error de red comunicando con SelfHealingCore V4.0.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!finalReport) return;
    const payload = {
      ...finalReport,
      validatedData
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${finalReport.reportId}_${finalReport.caseId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyCommand = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const moduleList = Object.entries(telemetry?.moduleStates || clientModules);

  const vercelCommands = `# 1. Subir a GitHub y desplegar Frontend + API Serverless en Vercel (Capa Gratuita)
npm i -g vercel
vercel login
vercel env add GEMINI_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel --prod

# 2. Aplicar esquema PostgreSQL + Storage Bucket en Supabase (supabase/schema_v4.sql)
npx supabase login
npx supabase db push --file supabase/schema_v4.sql`;

  const cloudflareCommands = `# 1. Compilar SPA y desplegar en Cloudflare Pages (Capa Gratuita Ilimitada)
npm run build
npx wrangler login
npx wrangler pages deploy dist --project-name=audit-intelligence-global-tax

# 2. Desplegar reglas Firestore en Firebase Spark Plan (Sin Costo Inicial)
npm i -g firebase-tools
firebase login
firebase deploy --only firestore:rules`;

  return (
    <div className="space-y-6">
      {/* SECTION A: WATCHDOG 5-SECOND HEALTH & SELF-HEALING */}
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-lg p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold font-mono">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>SELF-HEALING CORE V4.0 · WATCHDOG CADA 5 SEGUNDOS (ZERO AI QUOTA)</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Monitor de Salud, Autorreparación y Resiliencia Operativa
            </h2>
            <p className="text-xs text-slate-400">
              Vigilancia local cada 5s sin consumir cuota de Gemini. Las consultas IA normativas se ejecutan bajo demanda al auditar formularios.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl font-mono">
              <span className="text-slate-400">Latidos Servidor:</span>{' '}
              <strong className="text-emerald-400">#{telemetry?.heartbeatCount ?? 0}</strong>
              <span className="text-slate-600 mx-1.5">|</span>
              <span className="text-slate-400">Cliente:</span>{' '}
              <strong className="text-blue-400">#{clientHeartbeat}</strong>
            </div>
          </div>
        </div>

        {/* Module Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {moduleList.map(([name, status]) => (
            <div
              key={name}
              className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"></span>
                <span className="text-[10px] font-mono font-bold text-emerald-400">{status}</span>
              </div>
              <div className="font-mono font-bold text-[11px] text-slate-200 truncate" title={name}>
                {name}
              </div>
            </div>
          ))}
        </div>

        {/* Fault Simulation + Incident Log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
            <div className="font-bold text-slate-200 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Prueba de Autorreparación Instantánea (Failover)
            </div>
            <p className="text-[11px] text-slate-400">
              Simula una anomalía en cualquier microservicio para verificar el aislamiento, parche de respaldo y registro en bitácora.
            </p>
            <div className="flex flex-wrap gap-2">
              <select
                value={faultModule}
                onChange={e => setFaultModule(e.target.value)}
                className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white"
              >
                <option value="TAX_ENGINE">TAX_ENGINE</option>
                <option value="FORM_VALIDATOR">FORM_VALIDATOR</option>
                <option value="PROFESSIONAL_REGISTRY">PROFESSIONAL_REGISTRY</option>
                <option value="CLOUD_STORAGE">CLOUD_STORAGE</option>
                <option value="UPSTASH_REDIS_QUEUE">UPSTASH_REDIS_QUEUE</option>
                <option value="SUPABASE_POSTGRES">SUPABASE_POSTGRES</option>
              </select>
              <button
                type="button"
                onClick={handleSimulateFault}
                disabled={isSimulating}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                Simular & Reparar
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Bitácora de Incidencias Autorreparadas ({mergedIncidents.length})
              </span>
              <span className="text-[10px] font-mono text-slate-500">Últimos eventos en tiempo real</span>
            </div>

            {mergedIncidents.length === 0 ? (
              <div className="text-[11px] text-slate-400 py-3 font-mono">
                0 incidencias pendientes · Todos los módulos operando al 100%.
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {mergedIncidents.slice(0, 8).map(inc => (
                  <div
                    key={inc.incidentId}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="text-emerald-400 font-bold">RESUELTO ({inc.resolutionTimeMs}ms)</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-blue-300 font-bold">{inc.module}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500">{inc.incidentId}</span>
                      </div>
                      <div className="text-[11px] text-slate-200">{inc.errorDetected}</div>
                      <div className="text-[10px] text-emerald-300/90">{inc.autoRepairAction}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION B: SMART FORM VALIDATOR, AUTO-FIXER & 100/100 FINAL AUDIT CERTIFICATE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Validador, Corrector en Línea & Certificado 100/100
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detecta errores matemáticos, campos vacíos o monedas incorrectas, los corrige automáticamente con respaldo legal y emite el informe final 100/100.
            </p>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleValidateAndCertify} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">País / Jurisdicción</label>
                <select
                  value={countryCode}
                  onChange={e => {
                    const code = e.target.value;
                    setCountryCode(code);
                    const rule = GLOBAL_TAX_MATRIX[code];
                    if (rule) {
                      setFormName(rule.requiredForms.CORPORATE[0] || 'Tax Return');
                    }
                  }}
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white font-semibold"
                >
                  {Object.values(GLOBAL_TAX_MATRIX).map(r => (
                    <option key={r.countryCode} value={r.countryCode}>
                      {r.countryCode} · {r.countryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Formulario Oficial</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ID Expediente</label>
                <input
                  type="text"
                  value={caseId}
                  onChange={e => setCaseId(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contribuyente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Datos del Formulario (JSON editable para probar autocorrección)
              </label>
              <textarea
                rows={7}
                value={rawJsonInput}
                onChange={e => setRawJsonInput(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 font-mono text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isValidating}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              {isValidating ? 'Auditando y Corrigiendo...' : 'Validar, Corregir y Emitir Informe 100/100'}
            </button>
          </form>
        </div>

        {/* Certificate Output */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          {finalReport ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-md">
                    100
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> {finalReport.status}
                    </div>
                    <h4 className="font-black text-base text-slate-900 mt-0.5">
                      Certificado Auditado · {finalReport.clientName} ({finalReport.countryCode})
                    </h4>
                    <div className="text-[11px] font-mono text-slate-500">
                      {finalReport.reportId} · Motor: {finalReport.engineMode}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownloadCertificate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Descargar Certificado JSON
                </button>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 leading-relaxed">
                <span className="font-bold uppercase text-[10px] text-emerald-700 block mb-1">
                  Dictamen Técnico Ejecutivo (100/100):
                </span>
                {finalReport.executiveJustification}
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Correcciones Aplicadas en Línea ({finalReport.appliedCorrections.length})
                </h5>
                {finalReport.appliedCorrections.length === 0 ? (
                  <p className="text-xs text-slate-500">No se requirieron correcciones; todos los campos cumplían al 100%.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {finalReport.appliedCorrections.map((fix, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
                          <span className="font-bold text-indigo-700">Campo: {fix.field}</span>
                          <span>
                            <span className="line-through text-rose-600">{String(fix.originalValue)}</span>
                            <span className="mx-1.5 text-slate-400">→</span>
                            <span className="font-bold text-emerald-700">{String(fix.correctedValue)}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{fix.legalJustification}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-2 text-slate-400">
              <Award className="w-12 h-12 text-slate-300" />
              <p className="text-xs font-bold text-slate-700">
                Listo para auditar y certificar al 100/100
              </p>
              <p className="text-[11px] max-w-md">
                El formulario precargado contiene errores intencionales (moneda incorrecta, actividad vacía, ingreso negativo). Haz clic en &ldquo;Validar, Corregir y Emitir Informe 100/100&rdquo; para ver la autocorrección automática.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION C: ZERO-COST HIGH AVAILABILITY DEPLOYMENT (VERCEL+SUPABASE / CLOUDFLARE+FIREBASE) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-600" />
              Infraestructura Zero-Cost & Alta Disponibilidad (Comandos de Despliegue)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Archivos <code className="font-mono bg-slate-100 px-1 rounded">vercel.json</code>,{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">wrangler.toml</code> y{' '}
              <code className="font-mono bg-slate-100 px-1 rounded">supabase/schema_v4.sql</code> integrados en el proyecto.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setDeployStack('vercel_supabase')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                deployStack === 'vercel_supabase' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vercel + Supabase + Upstash
            </button>
            <button
              type="button"
              onClick={() => setDeployStack('cloudflare_firebase')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                deployStack === 'cloudflare_firebase' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cloudflare + Firebase Spark
            </button>
          </div>
        </div>

        {/* Live Connector Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-800">Edge / Serverless</span>
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Listo (vercel.json / wrangler)
            </span>
          </div>
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">Supabase PostgreSQL</span>
            </div>
            <span
              className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                telemetry?.infrastructure.supabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {telemetry?.infrastructure.supabaseConfigured ? 'Conectado' : 'Schema SQL Listo'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <span className="font-bold text-slate-800">Upstash Redis (3-5s)</span>
            </div>
            <span
              className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                telemetry?.infrastructure.upstashRedisConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {telemetry?.infrastructure.upstashRedisConfigured ? 'REST Activo' : 'Watchdog Local Activo'}
            </span>
          </div>
        </div>

        {/* Exact CLI Commands Block */}
        <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="font-mono font-bold text-blue-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" />
              {deployStack === 'vercel_supabase'
                ? 'Comandos Exactos: Vercel + Supabase + Upstash Redis (Capa Gratuita)'
                : 'Comandos Exactos: Cloudflare Pages + Firebase Spark (Capa Gratuita)'}
            </span>
            <button
              type="button"
              onClick={() =>
                copyCommand(
                  deployStack,
                  deployStack === 'vercel_supabase' ? vercelCommands : cloudflareCommands
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px]"
            >
              <Copy className="w-3 h-3" />
              {copiedCmd === deployStack ? 'Copiado' : 'Copiar Comandos'}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            {deployStack === 'vercel_supabase' ? vercelCommands : cloudflareCommands}
          </pre>
        </div>
      </div>
    </div>
  );
};
