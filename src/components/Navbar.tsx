import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  Building,
  FileSpreadsheet,
  FileText,
  Users,
  LayoutDashboard,
  LogIn,
  UserPlus,
  KeyRound,
  LogOut,
  Menu,
  X,
  CreditCard,
  ChevronDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenCambiarClave: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCambiarClave }) => {
  const {
    currentUser,
    activeRoute,
    navigate,
    logout,
    switchRoleDemo,
    resetToDefaults
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Radicar Tax $150', route: '/tax', icon: FileText, badge: '$150' },
    { label: 'CPA Dashboard', route: '/cpa/dashboard', icon: LayoutDashboard, roleRestricted: ['CONTADOR', 'ADMIN', 'DEV'] },
    { label: 'Matriz Admin BHD', route: '/admin/matriz', icon: FileSpreadsheet, roleRestricted: ['ADMIN', 'DEV'] },
    { label: 'Historial', route: '/historial', icon: ShieldCheck },
    { label: 'Directorio Firmas', route: '/directorio', icon: Building },
  ];

  const handleLinkClick = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top micro-bar: Bank BHD 08694150021 Guarantee & Role Simulator */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200">AUDIT-INTELLIGENCE V2.3</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-emerald-400 font-medium">BHD Cuenta: 08694150021</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">IRS Circular 230 Certified & IRC 7216</span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium hidden md:inline">Probar rol:</span>
            <div className="flex items-center gap-1 bg-slate-900 px-1 py-0.5 rounded-md border border-slate-700">
              <button
                onClick={() => switchRoleDemo('CONTADOR', 'user-cpa-ny-01')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  currentUser?.rol === 'CONTADOR' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="CPA Pedro Baldera (NY)"
              >
                CPA (NY)
              </button>
              <button
                onClick={() => switchRoleDemo('ADMIN')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  currentUser?.rol === 'ADMIN' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Superintendente Admin BHD"
              >
                ADMIN
              </button>
              <button
                onClick={() => switchRoleDemo('CLIENTE')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  currentUser?.rol === 'CLIENTE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Cliente Juan Perez"
              >
                CLIENTE
              </button>
              <button
                onClick={() => switchRoleDemo('FIRMA')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                  currentUser?.rol === 'FIRMA' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Firma Contable"
              >
                FIRMA
              </button>
            </div>

            <button
              onClick={resetToDefaults}
              className="text-slate-400 hover:text-amber-300 p-1 rounded transition-colors"
              title="Reiniciar datos iniciales"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                AUDIT-INTELLIGENCE <span className="text-blue-400 text-xs px-1.5 py-0.5 rounded bg-blue-900/50 border border-blue-500/40 font-mono">USA TAX V2.3</span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 font-mono">
                BHD 08694150021 • Expedientes $150 • CPA $45
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = activeRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleLinkClick(link.route)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile / Auth Area */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                    <span>{currentUser.nombre}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      currentUser.rol === 'ADMIN'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : currentUser.rol === 'CONTADOR'
                        ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {currentUser.rol}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {currentUser.codigoCPA || currentUser.email || currentUser.telefono}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button
                    onClick={onOpenCambiarClave}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                    title="Cambiar Contraseña"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-md transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Entrar
                </button>
                <button
                  onClick={() => navigate('/registro')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  <UserPlus className="w-4 h-4" /> Registrarse
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <nav className="space-y-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = activeRoute === link.route;
              return (
                <button
                  key={link.route}
                  onClick={() => handleLinkClick(link.route)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {currentUser ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs">
                  <div className="font-bold text-white">{currentUser.nombre}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{currentUser.rol} • {currentUser.codigoCPA || currentUser.email}</div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      onOpenCambiarClave();
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 text-center py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300"
                  >
                    Cambiar Clave
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs bg-rose-900/40 text-rose-300 border border-rose-800/50 rounded-md"
                  >
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLinkClick('/login')}
                  className="w-full text-center py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg text-white"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => handleLinkClick('/registro')}
                  className="w-full text-center py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >
                  Registrar Rol
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
