import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LogIn,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  UserPlus
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, navigate, users } = useApp();

  const [identificador, setIdentificador] = useState('licpedrobaldera@gmail.com');
  const [clave, setClave] = useState('12345678');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotCodeSent, setForgotCodeSent] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identificador.trim() || !clave.trim()) {
      setErrorMessage('Por favor ingrese su identificación y contraseña.');
      return;
    }

    const result = login(identificador, clave);
    if (!result.success) {
      setErrorMessage(result.message || 'Error en las credenciales.');
    }
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotInput.trim()) return;
    setForgotCodeSent(true);
  };

  const handleVerifyRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryCode.length === 6) {
      setRecoverySuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotCodeSent(false);
        setRecoverySuccess(false);
        setClave('12345678');
      }, 2000);
    }
  };

  const quickAccounts = [
    { label: 'Cliente', sub: 'carlos.mendoza@email.com', id: 'carlos.mendoza@email.com', pass: '12345678' },
    { label: 'Contador CPA', sub: 'CPA-NY-12345', id: 'licpedrobaldera@gmail.com', pass: '12345678' },
    { label: 'CPE / Enrolled Agent', sub: 'CPE-FL-99201', id: 'cpe.auditor@audittax.com', pass: '12345678' },
    { label: 'Abogado Tributario', sub: 'ABG-RD-54820', id: 'abogado.tributario@audittax.com', pass: '12345678' },
    { label: 'Representante Legal', sub: 'REP-FL-77410', id: 'replegal@audittax.com', pass: '12345678' },
    { label: 'Administrador', sub: 'Panel Central', id: 'admin@audittax.com', pass: 'admin123' }
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" /> Recuperar Clave (SMS/Email 15min)
              </h4>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {!forgotCodeSent ? (
              <form onSubmit={handleSendRecovery} className="space-y-3">
                <p className="text-slate-600">
                  Ingrese su correo electrónico, teléfono o ID registrado para enviarle un código temporal de 6 dígitos válido por 15 minutos:
                </p>
                <input
                  type="text"
                  value={forgotInput}
                  onChange={e => setForgotInput(e.target.value)}
                  placeholder="usuario@email.com o +1-917... o ID"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  Enviar Código SMS / Email (15 min)
                </button>
              </form>
            ) : recoverySuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <p className="font-bold">¡Código Validado!</p>
                <p className="text-[11px]">Su contraseña temporal ha sido restablecida a: <strong>12345678</strong></p>
              </div>
            ) : (
              <form onSubmit={handleVerifyRecovery} className="space-y-3">
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-[11px]">
                  Código enviado a {forgotInput}. Ingrese el código de prueba de 6 dígitos: <strong>849201</strong>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={recoveryCode}
                  onChange={e => setRecoveryCode(e.target.value)}
                  placeholder="Código 6 dígitos"
                  className="w-full p-2.5 text-center font-mono font-bold tracking-widest text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Verificar y Desbloquear
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-7 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
            INICIAR SESIÓN (LOGIN)
          </h2>
          <p className="text-xs text-slate-500">
            Acceso por Email, Teléfono, Cédula, Licencia o Código ({users.length} usuarios registrados)
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email / Teléfono / Cédula / Licencia / Código
            </label>
            <input
              type="text"
              value={identificador}
              onChange={e => setIdentificador(e.target.value)}
              placeholder="Ej: carlos.mendoza@email.com o CPA-NY-12345"
              required
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={clave}
              onChange={e => setClave(e.target.value)}
              placeholder="Clave"
              required
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            Entrar al Sistema
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => navigate('/registro')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" /> Registrar Nuevo Usuario
          </button>
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-slate-600 hover:text-slate-900 hover:underline font-semibold"
          >
            Olvidé clave (Email/SMS 15min)
          </button>
        </div>

        {/* Quick Instant Login Accounts by Role */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Acceso Rápido por Rol (Haz clic para cargar y entrar):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            {quickAccounts.map(acc => (
              <button
                key={acc.id}
                type="button"
                onClick={() => {
                  setIdentificador(acc.id);
                  setClave(acc.pass);
                  login(acc.id, acc.pass);
                }}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-left transition-colors"
              >
                <div className="font-bold text-slate-900">{acc.label}</div>
                <div className="text-slate-500 font-mono text-[10px] truncate">{acc.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
