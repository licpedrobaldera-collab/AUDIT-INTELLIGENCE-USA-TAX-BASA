import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  LayoutDashboard,
  FileSpreadsheet,
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
  FolderTree
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { navigate, financialStats, cases, users } = useApp();

  const modules = [
    {
      title: '/tax - Cliente $150 + Evidencias + Carpeta',
      description: 'Radicación de expediente tributario 2024. Carga de hasta 8 soportes históricos, firma digital del contribuyente, cobro de $150 y asignación automática de CPA por estado.',
      route: '/tax',
      icon: FileText,
      badge: 'Expedientes $150',
      color: 'bg-blue-600',
    },
    {
      title: '/cpa/dashboard - CPA Dashboard',
      description: 'Panel exclusivo del CPA (ej: CPA-NY-12345). Ver documentos online, descargar ZIP, editar notas de auditoría, borrar con log inmutable y firmar oficialmente bajo Circular 230.',
      route: '/cpa/dashboard',
      icon: LayoutDashboard,
      badge: 'Comisión $45',
      color: 'bg-indigo-600',
    },
    {
      title: '/admin/matriz - Matriz Maestra Admin BHD',
      description: 'Consola gerencial de control financiero: Balance BHD 08694150021, desglose por estados (NY $3,800, FL $2,200), tabla de clientes, liquidación online de comisiones y exportación Excel/PDF.',
      route: '/admin/matriz',
      icon: FileSpreadsheet,
      badge: 'BHD 08694150021',
      color: 'bg-emerald-600',
    },
    {
      title: '/historial - Realizadas / En Trámite / Aprobadas',
      description: 'Filtrado multidimensional por estados (NY, FL, NJ, TX, RD) con conteos dinámicos en pestañas (ej: NY 12/8/45) y rastreo de ruta de archivos /2024/{ESTADO}/CASO/.',
      route: '/historial',
      icon: ShieldCheck,
      badge: 'Auditoría',
      color: 'bg-amber-600',
    },
    {
      title: '/directorio - Firmas por Estado & Contacto',
      description: 'Directorio oficial de CPAs y firmas contables acreditadas con PTIN, licencia, verificación bancaria y enlace directo a WhatsApp y correo electrónico.',
      route: '/directorio',
      icon: Building,
      badge: 'Firmas Certificadas',
      color: 'bg-purple-600',
    },
    {
      title: '/login & /registro - Multi-Rol',
      description: 'Autenticación universal por Email, Teléfono o Cédula/ID. Registro para CLIENTE, CONTADOR (con PTIN y cuenta de comisiones), FIRMA, ADMIN y DEV.',
      route: '/login',
      icon: LogIn,
      badge: 'Roles & Seguridad',
      color: 'bg-slate-800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Versión 2.3 Producción • Cumplimiento IRS Circular 230</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            AUDIT-INTELLIGENCE USA TAX V2.3
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Sistema integral de radicación tributaria, gestión de expedientes digitalizados en carpetas históricas, 
            contratos con firma electrónica, asignación automática de CPAs y matriz financiera centralizada en 
            <strong className="text-emerald-400 font-mono"> Banco BHD Cuenta 08694150021</strong>.
          </p>

          {/* Device Readiness Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Laptop className="w-4 h-4 text-blue-400" /> Compatible PC & Desktop
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Tablet className="w-4 h-4 text-indigo-400" /> Optimizado Tablet & iPad
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Smartphone className="w-4 h-4 text-emerald-400" /> 100% Celular / Móvil
            </span>
          </div>
        </div>
      </div>

      {/* Real-Time Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cobrado Total ($150)</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${financialStats.totalCobrado.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> 100 Casos Radicados
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pagado CPAs ($45)</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ${financialStats.totalPagado.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            80 Liquidaciones Efectuadas
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Por Pagar Comisiones</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ${financialStats.totalPorPagar.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Listos para Pagar Online
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">NETO BHD 08694150021</div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            ${financialStats.netoBHD.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1 font-mono">
            Balance Conciliado
          </div>
        </div>
      </div>

      {/* System Route Modules Navigation Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            Módulos del Sistema V2.3
          </h2>
          <span className="text-xs text-slate-500">Haga clic en cualquier módulo para acceder directamente</span>
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

      {/* Fast Instructions for PC / Tablet / Mobile */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-xs text-slate-700 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Arquitectura Operativa V2.3
        </h3>
        <p className="leading-relaxed">
          Cada radicación genera de forma automática la estructura canónica de archivos:
          <code className="mx-1 px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-blue-700">
            /2024/{'{ESTADO}'}/CASO-{'{ID}'}/
          </code>
          conteniendo 8 documentos soportes históricos (W-2, 1099, Cédula/ID, deducciones, contrato). 
          Los CPAs autorizados examinan el expediente online, descargan en formato ZIP o firman oficialmente para 
          habilitar el desembolso de <strong className="text-emerald-700">$45.00 USD</strong> mediante la cuenta matriz
          <strong> Banco BHD 08694150021</strong>.
        </p>
      </div>
    </div>
  );
};
