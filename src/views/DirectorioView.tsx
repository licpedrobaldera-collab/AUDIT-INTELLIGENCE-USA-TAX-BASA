import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USState } from '../types';
import {
  Building,
  Mail,
  Phone,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  DollarSign,
  UserCheck,
  Briefcase
} from 'lucide-react';

export const DirectorioView: React.FC = () => {
  const { users, cases, navigate } = useApp();

  const cpas = users.filter(u => u.rol === 'CONTADOR' || u.rol === 'FIRMA');

  const [assignedSuccess, setAssignedSuccess] = useState<string | null>(null);

  const getCpaStats = (codigoCPA: string | null) => {
    const cpaCases = cases.filter(c => c.cpaCodigo === codigoCPA);
    const aprobados = cpaCases.filter(c => c.status === 'APROBADA').length;
    const totalMonto = aprobados * 45;
    return {
      aprobados: aprobados || (codigoCPA === 'CPA-NY-12345' ? 45 : 12),
      monto: totalMonto || (codigoCPA === 'CPA-NY-12345' ? 2025 : 540),
    };
  };

  const handleAsignar = (cpaNombre: string) => {
    setAssignedSuccess(`Se ha fijado a ${cpaNombre} como CPA preferente para nuevas radicaciones.`);
    setTimeout(() => setAssignedSuccess(null), 3500);
  };

  const statesConfig: Array<{ code: USState; label: string; icon: string }> = [
    { code: 'NY', label: 'NY - 5 Firmas', icon: '🗽' },
    { code: 'FL', label: 'FL - 3 Firmas', icon: '☀️' },
    { code: 'TX', label: 'TX - 2 Firmas', icon: '🤠' },
    { code: 'NJ', label: 'NJ - 2 Firmas', icon: '🌊' },
    { code: 'RD', label: 'RD - 2 Firmas', icon: '🌴' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
          <span>Colegio de Contadores Públicos Autorizados (CPAs) & Firmas</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          DIRECTORIO FIRMAS POR ESTADO
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Directorio oficial de CPAs acreditados con PTIN activo, cuentas bancarias validadas para comisiones de $45
        </p>
      </div>

      {assignedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{assignedSuccess}</span>
        </div>
      )}

      {/* Directory grouped by states */}
      <div className="space-y-8">
        {statesConfig.map(st => {
          const stateCpas = cpas.filter(c => c.estado === st.code);
          // If state has no exact cpa registered yet, fallback to sample
          const listToShow = stateCpas.length > 0 ? stateCpas : [
            {
              id: `cpa-sample-${st.code}`,
              nombre: `Despacho Asociado ${st.code} CPA`,
              codigoCPA: `CPA-${st.code}-77890`,
              licencia: `${st.code}-CPA-77890`,
              ptin: `P00${Math.floor(100000 + Math.random() * 900000)}`,
              email: `contacto.${st.code.toLowerCase()}@cpanetwork.com`,
              telefono: '+1 (800) 555-0199',
              bancoNombre: 'Banco BHD',
              bancoNumero: '****8842',
              estado: st.code,
            }
          ];

          return (
            <div key={st.code} className="space-y-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span className="text-xl">{st.icon}</span> {st.label}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listToShow.map((cpa: any) => {
                  const stats = getCpaStats(cpa.codigoCPA);

                  return (
                    <div
                      key={cpa.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {cpa.codigoCPA}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-base mt-1">
                              {cpa.nombre}
                            </h4>
                          </div>

                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verificado
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 font-mono space-y-0.5">
                          <div>Licencia: <strong className="text-slate-800">{cpa.licencia}</strong> | PTIN: <strong className="text-slate-800">{cpa.ptin}</strong></div>
                          <div className="flex items-center gap-1 text-slate-700 font-sans">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {cpa.email}
                          </div>
                          <div className="flex items-center gap-1 text-slate-700 font-sans">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {cpa.telefono}
                          </div>
                        </div>

                        {/* Bank info & cases processed */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cuenta de Liquidación:</span>
                            <span className="font-mono font-bold text-slate-800">
                              🏦 {cpa.bancoNombre} {cpa.bancoNumero}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Historial Aprobados:</span>
                            <span className="font-bold text-emerald-700">
                              {stats.aprobados} casos = ${stats.monto} USD
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons matching exact user code: Ver Casos | Email | WhatsApp | Asignar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
                        <button
                          onClick={() => navigate('/cpa/dashboard')}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors shadow-2xs"
                        >
                          Ver Casos
                        </button>

                        <a
                          href={`mailto:${cpa.email}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" /> Email
                        </a>

                        <a
                          href={`https://wa.me/${cpa.telefono?.replace(/\D/g, '') || '19175550199'}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                        </a>

                        <button
                          onClick={() => handleAsignar(cpa.nombre)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-colors"
                        >
                          Asignar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
