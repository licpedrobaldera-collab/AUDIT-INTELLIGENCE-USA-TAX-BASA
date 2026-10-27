import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, KeyRound, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

interface CambiarClaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CambiarClaveModal: React.FC<CambiarClaveModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, cambiarClave } = useApp();

  const [identificador, setIdentificador] = useState(currentUser?.email || currentUser?.identificacion || '');
  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identificador.trim()) {
      setError('Por favor proporcione su identificador (Email, Teléfono o Cédula).');
      return;
    }

    if (claveNueva.length < 8) {
      setError('La nueva clave debe tener al menos 8 caracteres.');
      return;
    }

    if (claveNueva !== confirmarClave) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const res = cambiarClave(identificador, claveActual, claveNueva);
    if (!res.success) {
      setError(res.error || 'Error al actualizar contraseña.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Cambiar Contraseña</h3>
              <p className="text-xs text-slate-400 font-mono">Actualización segura de credenciales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Contraseña actualizada correctamente!</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email / Teléfono / Cédula / ID
            </label>
            <input
              type="text"
              value={identificador}
              onChange={e => setIdentificador(e.target.value)}
              placeholder="juan@email.com o +1-917... o ID"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={claveActual}
              onChange={e => setClaveActual(e.target.value)}
              placeholder="Clave actual"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nueva Contraseña (mínimo 8 caracteres)
            </label>
            <input
              type="password"
              value={claveNueva}
              onChange={e => setClaveNueva(e.target.value)}
              placeholder="Nueva clave segura"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={confirmarClave}
              onChange={e => setConfirmarClave(e.target.value)}
              placeholder="Repita nueva clave"
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
            >
              Actualizar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
