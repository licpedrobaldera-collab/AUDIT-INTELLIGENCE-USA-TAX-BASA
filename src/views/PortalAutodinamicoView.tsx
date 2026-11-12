import React, { useState } from 'react';
import PortalLlenadoAutodinamico from '../components/PortalLlenadoAutodinamico';
import { useApp } from '../context/AppContext';
import { HistoricoCliente } from '@/lib/autodynamic-citizen-engine';
import { History, Sparkles } from 'lucide-react';

export const PortalAutodinamicoView: React.FC = () => {
  const { currentUser, cases } = useApp();
  const [incluirHistoricoEjemplo, setIncluirHistoricoEjemplo] = useState(true);

  // Build historical records from real prior cases in the app if present
  const historicosReales: HistoricoCliente[] = cases
    .filter(c => c.clienteEmail === currentUser?.email || c.estado === (currentUser?.estado || 'NY'))
    .slice(0, 2)
    .map(c => ({
      anioFiscal: (c.clienteData?.anoFiscal || 2024) - 1,
      estadoCodigo: c.estado,
      estadoCivil: c.clienteData?.tipoDeclaracion || 'Soltero',
      dependientes: c.clienteData?.dependientes || 0,
      direccion: c.clienteData?.direccion || '450 W 42nd St, New York, NY 10036',
      empleadores: ['Empleador Principal LLC'],
      ingresoBruto: c.clienteData?.ingresosEstimados || 62000,
      deduccionesTotales: 13850
    }));

  const historicoReferenciaBase: HistoricoCliente[] =
    historicosReales.length > 0
      ? historicosReales
      : incluirHistoricoEjemplo
      ? [
          {
            anioFiscal: 2025,
            estadoCodigo: currentUser?.estado || 'NY',
            estadoCivil: 'Soltero',
            dependientes: 0,
            direccion: '450 W 42nd St, Apt 14B, New York, NY 10036',
            empleadores: ['Empleador Principal LLC'],
            ingresoBruto: 61500,
            deduccionesTotales: 14600
          }
        ]
      : [];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Context Bar */}
      <div className="bg-indigo-950 text-white px-4 py-2.5 border-b border-indigo-900">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="font-bold">Portal Ciudadano 1040 & SALT Autodinámico</span>
            <span className="hidden sm:inline text-indigo-300">
              • Semáforo IA 10/10 + Auto-Ayuda + Exportación Excel Preliminar
            </span>
          </div>

          {historicosReales.length === 0 && (
            <button
              type="button"
              onClick={() => setIncluirHistoricoEjemplo(!incluirHistoricoEjemplo)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-900 hover:bg-indigo-800 border border-indigo-700 text-indigo-100 font-semibold transition-colors"
            >
              <History className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {incluirHistoricoEjemplo
                  ? 'Histórico 2025 Activo (Probar Migración)'
                  : 'Activar Histórico Base 2025'}
              </span>
            </button>
          )}
        </div>
      </div>

      <PortalLlenadoAutodinamico
        clienteNombre={currentUser?.nombre || 'Contribuyente Demo'}
        estadoInicial={currentUser?.estado || 'NY'}
        historicos={historicoReferenciaBase}
      />
    </div>
  );
};
