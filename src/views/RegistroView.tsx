import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, USState, ModalidadAfiliacion, User } from '../types';
import {
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Building,
  Scale,
  Briefcase,
  Award,
  User as UserIcon,
  ShieldCheck,
  LogIn,
  Search,
  Sparkles,
  FileCheck2
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ROLE_CARDS: {
  rol: UserRole;
  titulo: string;
  subtitulo: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    rol: 'CLIENTE',
    titulo: 'Cliente / Contribuyente',
    subtitulo: 'Radicación 1040, carga de W-2/1099 y seguimiento',
    badge: '$150 Radicación',
    icon: UserIcon
  },
  {
    rol: 'CONTADOR',
    titulo: 'Contador Público (CPA)',
    subtitulo: 'Licencia estatal, PTIN y comisión $45/caso',
    badge: 'CPA $45',
    icon: ShieldCheck
  },
  {
    rol: 'CPE',
    titulo: 'CPE / Enrolled Agent',
    subtitulo: 'Especialista tributario certificado IRS / NASBA',
    badge: 'CPE Certificado',
    icon: Award
  },
  {
    rol: 'ABOGADO',
    titulo: 'Abogado Tributario',
    subtitulo: 'Exequátur / Colegiatura y dictamen legal',
    badge: 'Legal Tax',
    icon: Scale
  },
  {
    rol: 'REPRESENTANTE_LEGAL',
    titulo: 'Representante Legal',
    subtitulo: 'Apoderado corporativo / Poder notarial',
    badge: 'Apoderado',
    icon: Briefcase
  },
  {
    rol: 'FIRMA',
    titulo: 'Firma / Despacho',
    subtitulo: 'Estudio contable o jurídico multi-agente',
    badge: 'Despacho',
    icon: Building
  }
];

export const RegistroView: React.FC = () => {
  const { registerUser, users, currentUser, login, systemBankAccount, navigate } = useApp();

  const [rol, setRol] = useState<UserRole>('CLIENTE');
  const [estado, setEstado] = useState<USState>('NY');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [clave, setClave] = useState('');

  // Contador / CPE / Firma fields
  const [licencia, setLicencia] = useState('');
  const [ptin, setPtin] = useState('');
  const [bancoNombre, setBancoNombre] = useState('Chase Bank');
  const [bancoNumero, setBancoNumero] = useState('****9921');
  const [bancoRouting, setBancoRouting] = useState('021000021');
  const [modalidadAfiliacion, setModalidadAfiliacion] = useState<ModalidadAfiliacion>('RETENCION_PRIMEROS_INGRESOS');
  const [aceptarClausulaAfiliacion, setAceptarClausulaAfiliacion] = useState(true);

  // Abogado & Representante Legal fields
  const [colegiaturaAbogado, setColegiaturaAbogado] = useState('');
  const [colegioEntidad, setColegioEntidad] = useState('');
  const [enlaceVerificacionOficial, setEnlaceVerificacionOficial] = useState('https://');
  const [empresaRepresentada, setEmpresaRepresentada] = useState('');
  const [poderRepresentacionDoc, setPoderRepresentacionDoc] = useState('');

  // Directory filter
  const [roleFilter, setRoleFilter] = useState<'TODOS' | UserRole>('TODOS');
  const [searchUsers, setSearchUsers] = useState('');

  // Verification code state
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [sixDigitCode, setSixDigitCode] = useState('');
  const [generatedSampleCode, setGeneratedSampleCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [createdUser, setCreatedUser] = useState<User | null>(null);

  const isAccountingRole = rol === 'CONTADOR' || rol === 'FIRMA' || rol === 'CPE';

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

    if (rol === 'ABOGADO' && !colegiaturaAbogado.trim()) {
      setErrorMsg('Para registrar un Abogado Tributario debe indicar su número de Colegiatura / Exequátur / Bar.');
      return;
    }

    if (rol === 'REPRESENTANTE_LEGAL' && !empresaRepresentada.trim()) {
      setErrorMsg('Para Representante Legal debe indicar el nombre de la empresa o persona representada.');
      return;
    }

    if (isAccountingRole && !aceptarClausulaAfiliacion) {
      setErrorMsg('Debe aceptar la cláusula de membresía de la Sociedad de Contadores ($50.00 USD) para continuar.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedSampleCode(code);
    setSixDigitCode('');
    setShowCodeModal(true);
  };

  const handleConfirmSixDigits = (e: React.FormEvent) => {
    e.preventDefault();
    if (sixDigitCode !== generatedSampleCode && sixDigitCode !== '123456') {
      setErrorMsg(`Código incorrecto. Use el código generado: ${generatedSampleCode}`);
      return;
    }

    const clausulaTexto = isAccountingRole
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
      licencia: isAccountingRole ? licencia : rol === 'ABOGADO' ? colegiaturaAbogado : null,
      ptin: isAccountingRole ? ptin : null,
      bancoNombre: isAccountingRole ? bancoNombre : null,
      bancoNumero: isAccountingRole ? bancoNumero : null,
      bancoRouting: isAccountingRole ? bancoRouting : null,
      colegiaturaAbogado: rol === 'ABOGADO' ? colegiaturaAbogado : null,
      colegioEntidad: colegiaOrAuthority(),
      enlaceVerificacionOficial:
        rol === 'ABOGADO' || rol === 'CPE' ? enlaceVerificacionOficial : null,
      empresaRepresentada: rol === 'REPRESENTANTE_LEGAL' ? empresaRepresentada : null,
      poderRepresentacionDoc: rol === 'REPRESENTANTE_LEGAL' ? poderRepresentacionDoc : null,
      ...(isAccountingRole
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
      setCreatedUser({
        id: res.userId || `user-${Date.now()}`,
        rol,
        estado,
        nombre,
        email: email || null,
        telefono: telefono || null,
        identificacion: identificacion || null,
        claveHash: clave,
        codigoCPA: null,
        licencia: isAccountingRole ? licencia : rol === 'ABOGADO' ? colegiaturaAbogado : null,
        ptin: isAccountingRole ? ptin : null,
        bancoNombre: null,
        bancoNumero: null,
        bancoRouting: null,
        bancoTitular: null,
        activo: true,
        createdAt: new Date().toISOString()
      });
      setNombre('');
      setEmail('');
      setTelefono('');
      setIdentificacion('');
      setClave('');
      setColegiaturaAbogado('');
      setEmpresaRepresentada('');
      setPoderRepresentacionDoc('');

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } else {
      setShowCodeModal(false);
      setErrorMsg(res.error || 'Error al crear usuario.');
    }
  };

  function colegiaOrAuthority() {
    if (colegioEntidad.trim()) return colegioEntidad.trim();
    if (rol === 'ABOGADO') return 'Colegio de Abogados / Tax Bar';
    if (rol === 'CPE') return 'NASBA / NAEA Enrolled Agent';
    if (rol === 'REPRESENTANTE_LEGAL') return 'Registro Mercantil / Poder Notarial';
    return null;
  }

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchRole = roleFilter === 'TODOS' || u.rol === roleFilter;
      const q = searchUsers.trim().toLowerCase();
      const matchQuery =
        !q ||
        u.nombre.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.codigoCPA && u.codigoCPA.toLowerCase().includes(q)) ||
        (u.identificacion && u.identificacion.toLowerCase().includes(q)) ||
        u.rol.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [users, roleFilter, searchUsers]);

  const roleBadgeColor = (r: UserRole) => {
    switch (r) {
      case 'CLIENTE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CONTADOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CPE':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'ABOGADO':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'REPRESENTANTE_LEGAL':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ADMIN':
      case 'DEV':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const handleQuickLoginUser = (u: User) => {
    const identifier = u.email || u.identificacion || u.telefono || u.codigoCPA || '';
    if (!identifier) return;
    login(identifier, u.claveHash);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
                Hemos generado un código de 6 dígitos para activar su registro como <strong>{rol}</strong>:
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center space-y-1.5">
              <span className="text-[11px] text-blue-700 block font-semibold">Código de Validación:</span>
              <span className="font-mono text-2xl font-black text-blue-900 tracking-widest block">
                {generatedSampleCode}
              </span>
              <button
                type="button"
                onClick={() => setSixDigitCode(generatedSampleCode)}
                className="text-[11px] font-bold text-blue-700 underline hover:text-blue-900"
              >
                Autocompletar código
              </button>
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold font-mono">
            <UserPlus className="w-3.5 h-3.5" />
            <span>REGISTRO INICIAL DE USUARIOS & CONTROL DE ACCESOS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Alta de Cliente, Contador (CPA), CPE, Abogado y Representante Legal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Crea nuevas cuentas con validación de 6 dígitos o inicia sesión al instante con cualquier usuario registrado.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-blue-50 transition-colors shrink-0"
        >
          <LogIn className="w-4 h-4 text-blue-600" />
          Ir a Pantalla de Login
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: REGISTRATION FORM */}
        <div className="lg:col-span-6 bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Formulario de Registro por Rol
                </h2>
                <p className="text-xs text-slate-500">
                  Selecciona el perfil para desplegar sus requisitos oficiales
                </p>
              </div>
            </div>
          </div>

          {createdUser && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ¡Usuario {createdUser.rol} Registrado y Sesión Iniciada!
              </div>
              <div className="bg-white/90 rounded-xl p-3 border border-emerald-200 font-mono text-[11px] space-y-1">
                <div><strong>Nombre:</strong> {currentUser?.nombre || createdUser.nombre}</div>
                <div><strong>Rol Activo:</strong> {currentUser?.rol || createdUser.rol}</div>
                {currentUser?.codigoCPA && <div><strong>Código Asignado:</strong> {currentUser.codigoCPA}</div>}
                <div><strong>Acceso:</strong> {currentUser?.email || currentUser?.telefono || currentUser?.identificacion}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      createdUser.rol === 'CONTADOR' || createdUser.rol === 'CPE'
                        ? '/cpa/dashboard'
                        : createdUser.rol === 'ABOGADO' || createdUser.rol === 'REPRESENTANTE_LEGAL'
                        ? '/global'
                        : createdUser.rol === 'ADMIN'
                        ? '/admin/matriz'
                        : '/tax'
                    )
                  }
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors"
                >
                  Ir a mi Panel ({createdUser.rol})
                </button>
                <button
                  type="button"
                  onClick={() => setCreatedUser(null)}
                  className="px-3 py-2 bg-white border border-emerald-300 text-emerald-800 font-bold rounded-xl hover:bg-emerald-100"
                >
                  Registrar Otro Usuario
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
            {/* Visual Role Cards */}
            <div>
              <label className="block font-bold text-slate-700 mb-2">
                1. Tipo de Usuario / Perfil Profesional *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ROLE_CARDS.map(card => {
                  const Icon = card.icon;
                  const active = rol === card.rol;
                  return (
                    <button
                      key={card.rol}
                      type="button"
                      onClick={() => setRol(card.rol)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-blue-400 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs truncate">{card.titulo}</div>
                        <div className={`text-[10px] leading-tight mt-0.5 ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                          {card.subtitulo}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Otros roles administrativos:</span>
                <button
                  type="button"
                  onClick={() => setRol('ADMIN')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    rol === 'ADMIN' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  ADMIN
                </button>
                <button
                  type="button"
                  onClick={() => setRol('DEV')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    rol === 'DEV' ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  DEV
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Estado / Jurisdicción Principal:
              </label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as USState)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-slate-800"
              >
                <option value="NY">New York (NY)</option>
                <option value="FL">Florida (FL)</option>
                <option value="TX">Texas (TX)</option>
                <option value="CA">California (CA)</option>
                <option value="NJ">New Jersey (NJ)</option>
                <option value="IL">Illinois (IL)</option>
                <option value="GA">Georgia (GA)</option>
                <option value="PR">Puerto Rico (PR)</option>
                <option value="RD">República Dominicana (RD / Expat)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Lic. Juan Pérez"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="+1-917-555-0100"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cédula / ID / Tax ID</label>
                <input
                  type="text"
                  value={identificacion}
                  onChange={e => setIdentificacion(e.target.value)}
                  placeholder="ID / SSN / RNC / Pasaporte"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contraseña (mínimo 8 caracteres) *</label>
              <input
                type="password"
                value={clave}
                onChange={e => setClave(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* ROLE SPECIFIC: ABOGADO */}
            {rol === 'ABOGADO' && (
              <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-purple-950 uppercase tracking-wider block">
                  Acreditación Abogado Tributario & Colegio Profesional:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-medium text-purple-900 mb-1">No. Colegiatura / Exequátur / Bar *</label>
                    <input
                      type="text"
                      value={colegiaturaAbogado}
                      onChange={e => setColegiaturaAbogado(e.target.value)}
                      placeholder="Ej: EXQ-54820 / BAR-9921"
                      className="w-full p-2.5 rounded-lg border border-purple-300 bg-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-purple-900 mb-1">Colegio de Abogados / Entidad</label>
                    <input
                      type="text"
                      value={colegioEntidad}
                      onChange={e => setColegioEntidad(e.target.value)}
                      placeholder="CARD / ABA / Colegio Oficial"
                      className="w-full p-2.5 rounded-lg border border-purple-300 bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-purple-900 mb-1">Enlace Oficial de Verificación (https://)</label>
                  <input
                    type="url"
                    value={enlaceVerificacionOficial}
                    onChange={e => setEnlaceVerificacionOficial(e.target.value)}
                    placeholder="https://www.colegiodeabogados.org.do"
                    className="w-full p-2.5 rounded-lg border border-purple-300 bg-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* ROLE SPECIFIC: REPRESENTANTE LEGAL */}
            {rol === 'REPRESENTANTE_LEGAL' && (
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider block">
                  Datos de Representación Legal & Poder Corporativo:
                </span>
                <div>
                  <label className="block font-medium text-indigo-900 mb-1">Empresa o Persona Representada *</label>
                  <input
                    type="text"
                    value={empresaRepresentada}
                    onChange={e => setEmpresaRepresentada(e.target.value)}
                    placeholder="Ej: Caribe Global Holdings LLC"
                    className="w-full p-2.5 rounded-lg border border-indigo-300 bg-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-medium text-indigo-900 mb-1">No. Poder Notarial / Acta</label>
                    <input
                      type="text"
                      value={poderRepresentacionDoc}
                      onChange={e => setPoderRepresentacionDoc(e.target.value)}
                      placeholder="Ej: PODER-2026-881"
                      className="w-full p-2.5 rounded-lg border border-indigo-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-indigo-900 mb-1">Registro / Cámara Emisora</label>
                    <input
                      type="text"
                      value={colegioEntidad}
                      onChange={e => setColegioEntidad(e.target.value)}
                      placeholder="Cámara de Comercio / Notaría"
                      className="w-full p-2.5 rounded-lg border border-indigo-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ROLE SPECIFIC: CONTADOR / CPE / FIRMA */}
            {isAccountingRole && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                  Acreditación {rol} & Cuenta Comisiones ($45):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-medium text-emerald-900 mb-1">Licencia {rol}</label>
                    <input
                      type="text"
                      value={licencia}
                      onChange={e => setLicencia(e.target.value)}
                      placeholder={`Ej: ${estado}-${rol}-9921`}
                      className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-emerald-900 mb-1">PTIN / Registro IRS-NASBA</label>
                    <input
                      type="text"
                      value={ptin}
                      onChange={e => setPtin(e.target.value)}
                      placeholder="Ej: P00891234"
                      className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white font-mono"
                    />
                  </div>
                </div>

                {rol === 'CPE' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-medium text-emerald-900 mb-1">Organismo CPE / EA</label>
                      <input
                        type="text"
                        value={colegioEntidad}
                        onChange={e => setColegioEntidad(e.target.value)}
                        placeholder="NASBA / NAEA / IRS EA"
                        className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-emerald-900 mb-1">Enlace Oficial CPE (https://)</label>
                      <input
                        type="url"
                        value={enlaceVerificacionOficial}
                        onChange={e => setEnlaceVerificacionOficial(e.target.value)}
                        placeholder="https://www.irs.gov"
                        className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-emerald-900 mb-1">Banco</label>
                    <input
                      type="text"
                      value={bancoNombre}
                      onChange={e => setBancoNombre(e.target.value)}
                      className="w-full p-2 rounded-lg border border-emerald-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-emerald-900 mb-1">Cuenta</label>
                    <input
                      type="text"
                      value={bancoNumero}
                      onChange={e => setBancoNumero(e.target.value)}
                      className="w-full p-2 rounded-lg border border-emerald-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-emerald-900 mb-1">Routing</label>
                    <input
                      type="text"
                      value={bancoRouting}
                      onChange={e => setBancoRouting(e.target.value)}
                      className="w-full p-2 rounded-lg border border-emerald-300 bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Cuota de Membresía Sociedad de Contadores ($50.00 USD) */}
                <div className="pt-2 border-t border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">
                      Membresía Sociedad de Contadores ($50.00 USD):
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold">
                      Pago Único
                    </span>
                  </div>

                  <select
                    value={modalidadAfiliacion}
                    onChange={e => setModalidadAfiliacion(e.target.value as ModalidadAfiliacion)}
                    className="w-full p-2 rounded-lg border border-emerald-300 bg-white font-semibold text-slate-800"
                  >
                    <option value="RETENCION_PRIMEROS_INGRESOS">
                      Retención en Primeros Ingresos ($50 CxC desde el primer caso)
                    </option>
                    <option value="PAGO_VIRTUAL">
                      Pago Virtual ($50 USD vía Stripe / PayPal / Azul / CardNet)
                    </option>
                    <option value="TRANSFERENCIA_BANCO_SISTEMA">
                      Transferencia Bancaria ($50 USD a cuenta del sistema)
                    </option>
                  </select>

                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-emerald-950 bg-white/80 p-2 rounded-lg border border-emerald-200">
                    <input
                      type="checkbox"
                      checked={aceptarClausulaAfiliacion}
                      onChange={e => setAceptarClausulaAfiliacion(e.target.checked)}
                      className="mt-0.5 rounded border-emerald-400 text-emerald-600"
                    />
                    <span>
                      Acepto la cláusula contractual de afiliación ($50.00 USD) y forma de pago seleccionada.
                    </span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-md transition-all cursor-pointer"
            >
              Registrar {rol} (Verificación 6 dígitos)
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: REGISTERED USERS DIRECTORY & 1-CLICK LOGIN */}
        <div className="lg:col-span-6 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-blue-600" />
                  Usuarios Registrados en el Sistema ({filteredUsers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Visualiza cada cuenta por rol (Cliente, CPA, CPE, Abogado, Rep. Legal) e inicia sesión al instante.
                </p>
              </div>
              {currentUser && (
                <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-mono font-bold">
                  Sesión: {currentUser.rol}
                </span>
              )}
            </div>

            {/* Search & Role Filter */}
            <div className="space-y-2.5 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchUsers}
                  onChange={e => setSearchUsers(e.target.value)}
                  placeholder="Buscar por nombre, email, código o licencia..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(['TODOS', 'CLIENTE', 'CONTADOR', 'CPE', 'ABOGADO', 'REPRESENTANTE_LEGAL', 'ADMIN'] as const).map(rf => (
                  <button
                    key={rf}
                    type="button"
                    onClick={() => setRoleFilter(rf)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      roleFilter === rf
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rf === 'REPRESENTANTE_LEGAL' ? 'REP. LEGAL' : rf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
            {filteredUsers.map(u => {
              const isCurrent = currentUser?.id === u.id;
              return (
                <div
                  key={u.id}
                  className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${roleBadgeColor(u.rol)}`}>
                        {u.rol}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {u.estado}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          ACTIVO AHORA
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-sm text-slate-900 truncate">{u.nombre}</div>

                    <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                      <div>
                        {u.email || u.telefono || u.identificacion}
                        {u.codigoCPA ? ` · ${u.codigoCPA}` : ''}
                      </div>
                      {u.licencia && <div>Licencia/Exq: {u.licencia}</div>}
                      {u.empresaRepresentada && <div>Representa a: {u.empresaRepresentada}</div>}
                      {u.colegioEntidad && <div>Entidad: {u.colegioEntidad}</div>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickLoginUser(u)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-1.5 transition-colors ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {isCurrent ? 'Sesión Activa' : 'Logear'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
