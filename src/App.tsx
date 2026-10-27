import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { CaseDetailModal } from './components/CaseDetailModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { CambiarClaveModal } from './components/CambiarClaveModal';

// Views
import { HomeView } from './views/HomeView';
import { TaxIntakeView } from './views/TaxIntakeView';
import { CPADashboardView } from './views/CPADashboardView';
import { AdminMatrizView } from './views/AdminMatrizView';
import { HistorialView } from './views/HistorialView';
import { DirectorioView } from './views/DirectorioView';
import { LoginView } from './views/LoginView';
import { RegistroView } from './views/RegistroView';

import { ShieldCheck, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeRoute,
    selectedCaseForModal,
    setSelectedCaseForModal,
    selectedDocForPreview,
    setSelectedDocForPreview
  } = useApp();

  const [cambiarClaveOpen, setCambiarClaveOpen] = useState(false);

  // Render view corresponding to activeRoute
  const renderActiveView = () => {
    switch (activeRoute) {
      case '/':
        return <HomeView />;
      case '/tax':
        return <TaxIntakeView />;
      case '/cpa/dashboard':
        return <CPADashboardView />;
      case '/admin/matriz':
        return <AdminMatrizView />;
      case '/historial':
        return <HistorialView />;
      case '/directorio':
        return <DirectorioView />;
      case '/login':
        return <LoginView />;
      case '/registro':
        return <RegistroView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Main Navigation */}
      <Navbar onOpenCambiarClave={() => setCambiarClaveOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {renderActiveView()}
      </main>

      {/* Global Interactive Modals */}
      <CaseDetailModal
        caso={selectedCaseForModal}
        onClose={() => setSelectedCaseForModal(null)}
      />

      <DocumentViewerModal
        item={selectedDocForPreview}
        onClose={() => setSelectedDocForPreview(null)}
      />

      <CambiarClaveModal
        isOpen={cambiarClaveOpen}
        onClose={() => setCambiarClaveOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <div className="font-extrabold text-white flex items-center justify-center sm:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>AUDIT-INTELLIGENCE USA TAX V2.3</span>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              Cuenta Matriz BHD: <span className="text-emerald-400 font-bold">08694150021</span> • IRC Sección 7216 & Treasury Circular 230
            </p>
          </div>

          <div className="text-[11px] text-slate-400">
            <span>© 2024–2026 Audit Intelligence LLC. Todos los derechos reservados.</span>
            <div className="mt-0.5 text-slate-500">
              Optimizado para PC, Celular y Tablet • GitHub + Vercel Ready
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
