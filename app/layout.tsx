import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AUDIT INTELLIGENCE USA - Tax & CPA Platform',
  description: 'Sistema contable y de firma digital de formularios 1040 con gestión de CPAs afiliados, comisiones de $45 y archivo HIGHUB.',
  openGraph: {
    title: 'AUDIT INTELLIGENCE USA - Tax & CPA Platform',
    description: 'Sistema contable y de firma digital de formularios 1040 con gestión de CPAs afiliados, comisiones de $45 y archivo HIGHUB.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm group-hover:bg-indigo-500 transition-colors">
                AI
              </span>
              <div>
                <span className="font-bold tracking-tight text-white block text-sm sm:text-base">
                  AUDIT INTELLIGENCE USA
                </span>
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold block">
                  HIGHUB • Tax Platform
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/admin/cpas"
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Comisiones CPAs
              </Link>
              <Link
                href="/admin/casos"
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Asignar Casos
              </Link>
              <Link
                href="/cpa/dashboard"
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 hover:bg-indigo-900 transition-colors"
              >
                Panel CPA
              </Link>
              <Link
                href="/afiliados/registro"
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Registro Afiliado
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© 2026 Audit Intelligence USA — Protocolo de Firma 1040 & Archivo Inmutable HIGHUB</span>
            <span className="font-mono text-[11px] text-slate-400">Comisión Estándar: $45.00 USD / Caso</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
