import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 uppercase tracking-wide mb-4">
          Motor Corporativo de Firma 1040 & Bitácora HIGHUB
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Audit Intelligence USA
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Plataforma integral para gestión de contadores públicos certificados (CPA), estampación digital verificada de formularios fiscales 1040 y consolidación automática de comisiones contables de $45 USD por caso.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Card 1: Admin Bitácora CPAs */}
        <Link
          href="/admin/cpas"
          className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              📊
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              $45 USD / Unidad
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Administración de CPAs & Comisiones
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Consulta el histórico consolidado desde <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">comisiones_highub.csv</code>, filtra por estado fiscal, edita números telefónicos (RD / USA) y exporta reportes en tiempo real.
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
            Entrar al Histórico Admin →
          </div>
        </Link>

        {/* Card 2: Asignación de Casos */}
        <Link
          href="/admin/casos"
          className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              📁
            </span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Jurisdicción Auto
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Asignación de Casos Fiscales
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Asigna declaraciones 1040 pendientes a CPAs afiliados autorizados según el estado de la licencia (NY, NJ, CA, FL, etc.) con cálculo automático de comisiones acumuladas.
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
            Gestionar Asignaciones →
          </div>
        </Link>

        {/* Card 3: Dashboard CPA Firmante */}
        <Link
          href="/cpa/dashboard"
          className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              🖋️
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              Firma Hológrafa PNG
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Panel de Firma del CPA
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Espacio de trabajo para el contador autenticado. Carga de firma transparente PNG, estampación digital sobre formularios 1040, trazabilidad criptográfica y confirmación de balance.
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
            Abrir Panel CPA →
          </div>
        </Link>

        {/* Card 4: Registro Afiliados */}
        <Link
          href="/afiliados/registro"
          className="group block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
              📝
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              Auto Código CPA
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Registro de CPAs Afiliados
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Formulario de incorporación de nuevos profesionales. Generación automática del Código de Registro (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">CPA-ESTADO-LICENCIA</code>), carga de PTIN, W-9 y credenciales.
          </p>
          <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
            Formulario de Registro →
          </div>
        </Link>
      </div>

      {/* Protocol Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Estructura de Almacenamiento HIGHUB</h3>
          <p className="mt-1 text-sm text-slate-300 max-w-2xl">
            Los expedientes aprobados se archivan de forma jerárquica con trazabilidad estricta: <code className="text-xs text-indigo-300 font-mono">/HIGHUB/[AÑO]/[ESTADO]/[CLIENTE]/1040_FIRMADO_[CODIGO_CPA].pdf</code> junto al registro de auditoría y recibo de comisión de $45.
          </p>
        </div>
        <div className="shrink-0 flex gap-3">
          <Link
            href="/cpa/dashboard"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            Probar Firma
          </Link>
          <Link
            href="/admin/cpas"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            Ver Bitácora
          </Link>
        </div>
      </div>
    </div>
  );
}
