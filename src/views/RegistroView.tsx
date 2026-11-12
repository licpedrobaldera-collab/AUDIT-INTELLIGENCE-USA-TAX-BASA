import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, USState, ModalidadAfiliacion } from '../types';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegistroView: React.FC = () => {
  const { registerUser, systemBankAccount, navigate } = useApp();

  const [rol, setRol] = useState<UserRole>('CLIENTE');
  const [estado, setEstado] = useState<USState>('NY');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [clave, setClave] = useState('');

  // Contador / Firma specific fields
  const [licencia, setLicencia] = useState('');
  const [ptin, setPtin] = useState('');
  const [bancoNombre, setBancoNombre] = useState('Chase Bank');
  const [bancoNumero, setBancoNumero] = useState('****9921');
  const [bancoRouting, setBancoRouting] = useState('021000021');
  const [modalidadAfiliacion, setModalidadAfiliacion] = useState<ModalidadAfiliacion>('RETENCION_PRIMEROS_INGRESOS');
  const [aceptarClausulaAfiliacion, setAceptarClausulaAfiliacion] = useState(true);

  // Verification code state
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [sixDigitCode, setSixDigitCode] = useState('');
  const [generatedSampleCode, setGeneratedSampleCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim()) {
      setErrorMsg('Por favor ingrese su nombre completo.');
      return;
    }

    if (!email.trim() && !telefono.trim() && !identificacion.trim()) {
      setErrorMsg('Al menos un dato de contacto es requerido (Email, Teléfono o ID/Cédula).');
      return;
    }

    if (clave.length < 8) {
      setErrorMsg('La clave debe tener mínimo 8 caracteres.');
      return;
    }

    if ((rol === 'CONTADOR' || rol === 'FIRMA') && !aceptarClausulaAfiliacion) {
      setErrorMsg('Debe aceptar la cláusula de membresía de la Sociedad de Contadores ($50.00 USD) para continuar.');
      return;
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedSampleCode(code);
    setShowCodeModal(true);
  };

  const handleConfirmSixDigits = (e: React.FormEvent) => {
    e.preventDefault();
    if (sixDigitCode !== generatedSampleCode && sixDigitCode !== '123456') {
      setErrorMsg(`Código incorrecto. Use el código generado: ${generatedSampleCode}`);
      return;
    }

    const isCpaRole = rol === 'CONTADOR' || rol === 'FIRMA';
    const clausulaTexto = isCpaRole
      ? modalidadAfiliacion === 'RETENCION_PRIMEROS_INGRESOS'
        ? 'Autorizo retener la cuota única de afiliación ($50.00 USD) como Cuenta por Cobrar de mis primeros ingresos devengados desde mi primer caso.'
        : modalidadAfiliacion === 'TRANSFERENCIA_BANCO_SISTEMA'
        ? `Pago único de afiliación ($50.00 USD) vía transferencia bancaria a la cuenta asignada al sistema (${systemBankAccount.bancoNombre}).`
        : 'Pago único de afiliación ($50.00 USD) vía Pasarela Virtual antes de brindar el servicio.'
      : undefined;

    const res = registerUser({
      rol,
      estado,
      nombre,
      email: email || null,
      telefono: telefono || null,
      identificacion: identificacion || null,
      claveHash: clave,
      licencia: isCpaRole ? licencia : null,
      ptin: isCpaRole ? ptin : null,
      bancoNombre: isCpaRole ? bancoNombre : null,
      bancoNumero: isCpaRole ? bancoNumero : null,
      bancoRouting: isCpaRole ? bancoRouting : null,
      ...(isCpaRole
        ? {
            modalidadAfiliacion,
            estadoAfiliacion:
              modalidadAfiliacion === 'RETENCION_PRIMEROS_INGRESOS'
                ? 'AUTORIZADO_RETENCION'
                : 'PENDIENTE',
            contratoAfiliacionFirmado: aceptarClausulaAfiliacion,
            clausulaFormaPagoTexto: clausulaTexto,
          }
        : {}),
    });

    if (res.success) {
      setShowCodeModal(false);
      setCreatedSuccess(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } else {
      setErrorMsg(res.error || 'Error al crear usuario.');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* 6-Digit Code Verification Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-xs space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-black text-base">
                6
              </div>
              <h4 className="font-extrabold text-slate-900 text-base">
                Verificación de Seguridad
              </h4>
              <p className="text-slate-500">
                Hemos generado un código de 6 dígitos para validar su registro como <strong>{rol}</strong>:
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <span className="text-[11px] text-blue-700 block font-semibold">Código de Validación:</span>
              <span className="font-mono text-2xl font-black text-blue-900 tracking-widest">
                {generatedSampleCode}
              </span>
            </div>

            <form onSubmit={handleConfirmSixDigits} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={sixDigitCode}
                onChange={e => setSixDigitCode(e.target.value)}
                placeholder="Ingrese 6 dígitos"
                className="w-full p-3 text-center font-mono font-bold tracking-widest text-lg rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
              >
                Confirmar y Activar Cuenta {rol}
              </button>

              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="w-full py-2 text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Registration Card matching user code */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
            REGISTRO POR ROL
          </h2>
          <p className="text-xs text-slate-500">
            Audit Intelligence USA Tax • Plataforma Multi-Jurisdicción
          </p>
        </div>

        {createdSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ¡Usuario {rol} Creado Exitosamente!
            </div>
            <p className="leading-relaxed">
              Su cuenta ha sido activada y vinculada a la plataforma. Ya puede gestionar expedientes o radicar casos.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => navigate(rol === 'CONTADOR' ? '/cpa/dashboard' : rol === 'ADMIN' ? '/admin/matriz' : '/tax')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors"
              >
                Continuar a mi panel
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePreSubmit} className="space-y-4 text-xs">
          {/* Role select matching exact options */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Seleccionar Rol del Sistema:
            </label>
            <select
              value={rol}
              onChange={e => setRol(e.target.value as UserRole)}
              className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="CLIENTE">CLIENTE ($150 Radicación Tax)</option>
              <option value="CONTADOR">CONTADOR (CPA - Comisión $45)</option>
              <option value="FIRMA">FIRMA (Despacho Asociado)</option>
              <option value="ADMIN">ADMIN (Superintendencia BHD)</option>
              <option value="DEV">DEV (Ingeniería de Sistemas)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Estado de Radicación / Jurisdicción (50 Estados USA + PR):
            </label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value as USState)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="NY">🗽 New York (NY)</option>
              <option value="FL">☀️ Florida (FL)</option>
              <option value="TX">🤠 Texas (TX)</option>
              <option value="CA">🌴 California (CA)</option>
              <option value="NJ">🌊 New Jersey (NJ)</option>
              <option value="IL">🏙️ Illinois (IL)</option>
              <option value="PA">🔔 Pennsylvania (PA)</option>
              <option value="OH">🌾 Ohio (OH)</option>
              <option value="GA">🍑 Georgia (GA)</option>
              <option value="NC">🌲 North Carolina (NC)</option>
              <option value="MI">🚗 Michigan (MI)</option>
              <option value="VA">🏛️ Virginia (VA)</option>
              <option value="WA">☕ Washington (WA)</option>
              <option value="AZ">🌵 Arizona (AZ)</option>
              <option value="MA">🎓 Massachusetts (MA)</option>
              <option value="TN">🎸 Tennessee (TN)</option>
              <option value="IN">🏎️ Indiana (IN)</option>
              <option value="MO">⛵ Missouri (MO)</option>
              <option value="MD">🦀 Maryland (MD)</option>
              <option value="WI">🧀 Wisconsin (WI)</option>
              <option value="CO">🏔️ Colorado (CO)</option>
              <option value="MN">❄️ Minnesota (MN)</option>
              <option value="SC">🏝️ South Carolina (SC)</option>
              <option value="AL">🚀 Alabama (AL)</option>
              <option value="LA">🎷 Louisiana (LA)</option>
              <option value="KY">🐎 Kentucky (KY)</option>
              <option value="OR">🌲 Oregon (OR)</option>
              <option value="OK">⚡ Oklahoma (OK)</option>
              <option value="CT">⚓ Connecticut (CT)</option>
              <option value="UT">⛷️ Utah (UT)</option>
              <option value="NV">🎰 Nevada (NV)</option>
              <option value="PR">🇵🇷 Puerto Rico (PR)</option>
              <option value="DC">🏛️ District of Columbia (DC)</option>
              <option value="RD">🌴 República Dominicana (Expat/Intl)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Nombre completo"
              required
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email (opcional)"
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Teléfono (opcional)
            </label>
            <input
              type="text"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="Teléfono (opcional)"
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ID / Cédula (opcional)
            </label>
            <input
              type="text"
              value={identificacion}
              onChange={e => setIdentificacion(e.target.value)}
              placeholder="ID / Cédula (opcional)"
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Clave min 8 *
            </label>
            <input
              type="password"
              value={clave}
              onChange={e => setClave(e.target.value)}
              placeholder="Clave min 8"
              required
              className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Conditional CPA fields matching exact code:
              {rol==='CONTADOR' && <>
              <input placeholder='Licencia CPA'/>
              <input placeholder='PTIN'/>
              <input placeholder='Banco comisión $45'/>
              <input placeholder='Número cuenta'/>
              <input placeholder='Routing/SWIFT'/>
              </>}
          */}
          {(rol === 'CONTADOR' || rol === 'FIRMA') && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3 pt-3">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                Datos Acreditación CPA & Cuenta Comisiones ($45):
              </span>

              <div>
                <label className="block font-medium text-emerald-900 mb-1">Licencia CPA</label>
                <input
                  type="text"
                  value={licencia}
                  onChange={e => setLicencia(e.target.value)}
                  placeholder="Licencia CPA (ej: NY-CPA-9921)"
                  className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-emerald-900 mb-1">PTIN (IRS)</label>
                <input
                  type="text"
                  value={ptin}
                  onChange={e => setPtin(e.target.value)}
                  placeholder="PTIN (ej: P00891234)"
                  className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-emerald-900 mb-1">Banco comisión $45</label>
                <input
                  type="text"
                  value={bancoNombre}
                  onChange={e => setBancoNombre(e.target.value)}
                  placeholder="Banco comisión $45 (ej: Chase / Banco BHD)"
                  className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-emerald-900 mb-1">Número cuenta</label>
                  <input
                    type="text"
                    value={bancoNumero}
                    onChange={e => setBancoNumero(e.target.value)}
                    placeholder="Número cuenta"
                    className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-emerald-900 mb-1">Routing/SWIFT</label>
                  <input
                    type="text"
                    value={bancoRouting}
                    onChange={e => setBancoRouting(e.target.value)}
                    placeholder="Routing/SWIFT"
                    className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Cuota de Membresía Sociedad de Contadores ($50.00 USD) */}
              <div className="mt-3 pt-3 border-t border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">
                    Membresía Sociedad de Contadores (Cuota única $50.00 USD):
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                    Pago Único
                  </span>
                </div>

                <select
                  value={modalidadAfiliacion}
                  onChange={e => setModalidadAfiliacion(e.target.value as ModalidadAfiliacion)}
                  className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white font-semibold text-slate-800"
                >
                  <option value="RETENCION_PRIMEROS_INGRESOS">
                    Autorizar Retención en Primeros Ingresos ($50 CxC desde mi primer caso)
                  </option>
                  <option value="PAGO_VIRTUAL">
                    Pago Virtual ($50 USD vía Stripe / PayPal / Azul antes de brindar servicio)
                  </option>
                  <option value="TRANSFERENCIA_BANCO_SISTEMA">
                    Transferencia Bancaria ($50 USD a cuenta asignada del sistema)
                  </option>
                </select>

                <label className="flex items-start gap-2 cursor-pointer text-[11px] text-emerald-950 bg-white/80 p-2.5 rounded-lg border border-emerald-200">
                  <input
                    type="checkbox"
                    checked={aceptarClausulaAfiliacion}
                    onChange={e => setAceptarClausulaAfiliacion(e.target.checked)}
                    className="mt-0.5 rounded border-emerald-400 text-emerald-600"
                  />
                  <span>
                    Acepto la cláusula contractual de membresía ($50.00 USD). Si elijo retención, autorizo descontar el derecho de afiliación como Cuenta por Cobrar desde mi primer caso generador de ingresos.
                  </span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all cursor-pointer"
          >
            Crear {rol} - Código 6 dígitos
          </button>

          <p className="text-center text-slate-500 pt-2">
            ¿Ya tiene cuenta?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 font-bold hover:underline"
            >
              Iniciar Sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
