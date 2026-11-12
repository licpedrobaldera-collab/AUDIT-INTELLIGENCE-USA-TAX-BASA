import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Building,
  LogIn,
  UserPlus,
  ArrowRight,
  Shield,
  Smartphone,
  Laptop,
  Tablet,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  FolderTree,
  Send,
  Zap
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { navigate, cases, users } = useApp();

  const modules = [
    {
      title: 'Radicar Caso Tributario ($150 USD)',
      description: 'Radicación de expedientes tributarios reales para todos los estados de USA. Carga de soportes, firma digital del contribuyente, cobro de $150 y asignación inmediata de CPA.',
      route: '/tax',
      icon: FileText,
      badge: '$150 Tarifa',
      color: 'bg-blue-600',
    },
    {
      title: 'Portal Ciudadano 1040 Autodinámico (IA)',
      description: 'Llenado guiado 52 jurisdicciones con Semáforo IA 10/10, auto-ayuda en vivo, migración año anterior, estabilidad laboral y descarga preliminar Excel.',
      route: '/portal-ciudadano',
      icon: Zap,
      badge: 'IA 10/10',
      color: 'bg-violet-600',
    },
    {
      title: 'CPA Dashboard & Auditoría',
      description: 'Panel exclusivo del CPA con distribución gráfica en tiempo real (Recharts: Realizadas vs. En Trámite vs. Aprobadas), examen de soportes online y firma oficial.',
      route: '/cpa/dashboard',
      icon: LayoutDashboard,
      badge: '$45 Comisión',
      color: 'bg-indigo-600',
    },
    {
      title: 'Historial de Expedientes',
      description: 'Monitoreo de expedientes reales clasificados por estado (todos los estados de USA) y fases de auditoría con rastreo de bóveda criptográfica.',
      route: '/historial',
      icon: ShieldCheck,
      badge: 'Auditoría Real',
      color: 'bg-amber-600',
    },
    {
      title: 'Directorio de Firmas y CPAs',
      description: 'Red nacional de contadores públicos certificados con licencia y PTIN activo. Contacto directo por WhatsApp y correo electrónico.',
      route: '/directorio',
      icon: Building,
      badge: 'CPAs Acreditados',
      color: 'bg-purple-600',
    },
    {
      title: 'Acceso Seguro y Registro de Cuentas',
      description: 'Portal de autenticación y alta de cuentas para Contribuyentes (Clientes), Contadores Públicos Autorizados (CPAs) y Despachos Contables.',
      route: '/registro',
      icon: UserPlus,
      badge: 'Clientes & CPAs',
      color: 'bg-emerald-600',
    },
    {
      title: 'Iniciar Sesión',
      description: 'Acceso directo con Email, Teléfono o Identificación oficial y clave segura para consultar expedientes o gestionar auditorías.',
      route: '/login',
      icon: LogIn,
      badge: 'Multi-Dispositivo',
      color: 'bg-slate-800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner - Clean Professional Presentation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Plataforma Oficial de Gestión Tributaria en USA • Cumplimiento IRS Circular 230</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            AUDIT-INTELLIGENCE USA TAX
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Sistema integral de radicación tributaria, expedientes digitalizados en bóveda segura, contratos con firma electrónica legal (ESIGN/UETA) y asignación a Contadores Públicos Autorizados (CPAs) certificados para todos los estados de los Estados Unidos.
          </p>

          {/* Device Readiness Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Laptop className="w-4 h-4 text-blue-400" /> PC & Laptop
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Tablet className="w-4 h-4 text-indigo-400" /> Tablet & iPad
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Smartphone className="w-4 h-4 text-emerald-400" /> Móvil & Celular
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Zap className="w-4 h-4 text-yellow-400" /> Compatible API / Web / Streamlit
            </span>
          </div>
        </div>
      </div>

      {/* Call to Action: Fast Launch for Clients and CPAs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Para Contribuyentes</span>
            <h3 className="text-lg font-black">Radicar mi Declaración ($150 USD)</h3>
            <p className="text-xs text-blue-100 max-w-sm">
              Sube tus documentos fiscales (W-2, 1099, ID), firma digitalmente y asigna tu caso a un CPA oficial.
            </p>
          </div>
          <button
            onClick={() => navigate('/tax')}
            className="px-4 py-2.5 bg-white text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-50 transition-all shadow-xs shrink-0 flex items-center gap-1"
          >
            <span>Radicar Ahora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md flex items-center justify-between border border-slate-700">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Para Contadores Públicos (CPAs)</span>
            <h3 className="text-lg font-black">Panel de Auditoría & Comisiones ($45 USD)</h3>
            <p className="text-xs text-slate-300 max-w-sm">
              Revisa expedientes asignados, analiza la distribución con gráficos Recharts y aprueba declaraciones con tu firma.
            </p>
          </div>
          <button
            onClick={() => navigate('/cpa/dashboard')}
            className="px-4 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 transition-all shadow-xs shrink-0 flex items-center gap-1"
          >
            <span>Ir a Panel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* System Route Modules Navigation Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            Módulos del Sistema Operativo
          </h2>
          <span className="text-xs text-slate-500">Accede directamente al módulo requerido</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map(mod => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.route}
                onClick={() => navigate(mod.route)}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl ${mod.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Abrir módulo</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Infrastructure Details */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-700 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Arquitectura Operativa en Producción
        </h3>
        <p className="leading-relaxed">
          Cada radicación genera de forma automática la estructura canónica de archivos en bóveda:
          <code className="mx-1 px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-blue-700">
            /2024/{'{ESTADO}'}/CASO-{'{ID}'}/
          </code>
          conteniendo los soportes tributarios obligatorios. Los Contadores Públicos Autorizados (CPAs) con licencia activa auditan el expediente online, visualizan métricas estadísticas en tiempo real y firman electrónicamente para formalizar la liquidación de sus comisiones.
        </p>
      </div>
    </div>
  );
};
