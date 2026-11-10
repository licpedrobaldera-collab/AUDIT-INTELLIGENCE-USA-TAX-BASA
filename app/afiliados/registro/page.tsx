"use client";
import React, { useState } from 'react';
import Link from 'next/link';

interface RegistroForm {
  nombreCompleto: string;
  email: string;
  telefono: string;
  numeroLicencia: string;
  estadoPrincipal: string;
  estadosAutorizados: string[];
  credencialPTIN: string;
  firmaPngBase64: string | null;
  fotoLicenciaNombre: string | null;
  w9Nombre: string | null;
}

const ESTADOS_USA = [
  'NY', 'NJ', 'FL', 'CA', 'TX', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI', 'MA', 'VA', 'WA', 'AZ'
];

export default function RegistroAfiliadosPage() {
  const [formData, setFormData] = useState<RegistroForm>({
    nombreCompleto: '',
    email: '',
    telefono: '+1 ',
    numeroLicencia: '',
    estadoPrincipal: 'NY',
    estadosAutorizados: ['NY'],
    credencialPTIN: '',
    firmaPngBase64: null,
    fotoLicenciaNombre: null,
    w9Nombre: null,
  });

  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Código de registro calculado automáticamente: CPA-{ESTADO}-{LICENCIA}
  const codigoGenerado = formData.numeroLicencia.trim()
    ? `CPA-${formData.estadoPrincipal.toUpperCase()}-${formData.numeroLicencia.trim().toUpperCase()}`
    : `CPA-${formData.estadoPrincipal.toUpperCase()}-XXXXX`;

  const handleEstadoToggle = (estado: string) => {
    setFormData(prev => {
      const existe = prev.estadosAutorizados.includes(estado);
      const nuevaLista = existe
        ? prev.estadosAutorizados.filter(e => e !== estado)
        : [...prev.estadosAutorizados, estado];
      return {
        ...prev,
        estadosAutorizados: nuevaLista.length > 0 ? nuevaLista : [estado],
      };
    });
  };

  const handleFirmaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        setErrorMsg('El archivo de firma debe ser obligatoriamente formato PNG (fondo transparente).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, firmaPngBase64: reader.result as string }));
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreCompleto || !formData.email || !formData.numeroLicencia || !formData.credencialPTIN) {
      setErrorMsg('Por favor completa todos los campos obligatorios.');
      return;
    }
    setErrorMsg(null);
    setEnviado(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-2 inline-block">
          ← Volver al Inicio
        </Link>
        <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider">
          Programa de Afiliados HIGHUB
        </span>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">
          Registro de CPA Afiliado
        </h1>
        <p className="text-slate-600 mt-2 text-sm">
          Únete a la red de contadores autorizados de Audit Intelligence USA. Firma declaraciones fiscales 1040 en tus estados de jurisdicción y recibe una compensación estándar de <strong className="text-emerald-700">$45.00 USD</strong> por caso verificado.
        </p>
      </div>

      {enviado ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-emerald-900">¡Solicitud de Registro Recibida!</h2>
          <p className="text-emerald-800 text-sm mt-2 max-w-lg mx-auto">
            Hemos registrado a <strong>{formData.nombreCompleto}</strong>. Tu Código de Registro asignado es:
          </p>
          <div className="my-4 inline-block font-mono text-lg font-bold bg-white text-indigo-700 border border-indigo-200 px-6 py-2 rounded-xl shadow-xs">
            {codigoGenerado}
          </div>
          <p className="text-slate-600 text-xs mt-2">
            El administrador revisará tu credencial PTIN ({formData.credencialPTIN}) y la foto de tu licencia estatal para activar tu estatus en el motor de firma.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/admin/cpas"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-xs"
            >
              Ver en Bitácora Admin
            </Link>
            <button
              onClick={() => setEnviado(false)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50"
            >
              Registrar Otro CPA
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Código Autogenerado Banner */}
          <div className="mb-8 p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Código de Registro Auto-Generado
              </span>
              <p className="text-xs text-slate-600 mt-0.5">
                Formato corporativo: <code className="font-mono font-semibold">CPA-{"{ESTADO}"}-{"{LICENCIA}"}</code>
              </p>
            </div>
            <div className="font-mono text-base font-extrabold text-indigo-900 bg-white border border-indigo-200 px-3.5 py-1.5 rounded-lg shadow-2xs">
              {codigoGenerado}
            </div>
          </div>

          <div className="space-y-6">
            {/* Sección 1: Datos Personales */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
                1. Información Profesional y Contacto
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Completo (CPA) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: John Smith, CPA"
                    value={formData.nombreCompleto}
                    onChange={e => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico Oficial *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="cpa.email@domain.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono Celular (Notificaciones WhatsApp / SMS) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+1 829 771 7390 (RD) o +1 305 555 0199 (USA)"
                    value={formData.telefono}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IRS PTIN (Preparer Tax Identification Number) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="P01234567 o PTIN-654321"
                    value={formData.credencialPTIN}
                    onChange={e => setFormData({ ...formData, credencialPTIN: e.target.value })}
                    className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Licencias y Jurisdicción */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
                2. Licencia Estatal y Jurisdicción Fiscal
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Principal de la Licencia *
                  </label>
                  <select
                    value={formData.estadoPrincipal}
                    onChange={e => setFormData({
                      ...formData,
                      estadoPrincipal: e.target.value,
                      estadosAutorizados: Array.from(new Set([e.target.value, ...formData.estadosAutorizados]))
                    })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {ESTADOS_USA.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Licencia CPA *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 12345"
                    value={formData.numeroLicencia}
                    onChange={e => setFormData({ ...formData, numeroLicencia: e.target.value })}
                    className="w-full text-sm font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Estados adicionales donde está autorizado para firmar:
                </label>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS_USA.map(estado => {
                    const seleccionado = formData.estadosAutorizados.includes(estado);
                    return (
                      <button
                        type="button"
                        key={estado}
                        onClick={() => handleEstadoToggle(estado)}
                        className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all border ${
                          seleccionado
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {estado} {seleccionado ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sección 3: Cargas Documentales */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
                3. Credenciales, Firma Hológrafa & W-9
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Firma PNG */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Firma Digitalizada (PNG Transparente) *
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Trazo o fotografía de firma física para estampar en los 1040.
                  </p>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleFirmaUpload}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {formData.firmaPngBase64 && (
                    <div className="mt-3 p-2 bg-white border border-slate-200 rounded-lg inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.firmaPngBase64}
                        alt="Previsualización de Firma"
                        className="h-10 max-w-[150px] object-contain mix-blend-multiply"
                      />
                    </div>
                  )}
                </div>

                {/* Foto Licencia */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Foto o Certificado de Licencia CPA
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    PDF o imagen del carnet emitido por el Estado.
                  </p>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={e => setFormData({ ...formData, fotoLicenciaNombre: e.target.files?.[0]?.name || null })}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {formData.fotoLicenciaNombre && (
                    <span className="block mt-2 text-xs text-emerald-700 font-medium">
                      ✓ Archivo: {formData.fotoLicenciaNombre}
                    </span>
                  )}
                </div>

                {/* W-9 Form */}
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Formulario W-9 para Pago de Comisiones
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Requerido para transferir las comisiones acumuladas de $45 por caso firmado.
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setFormData({ ...formData, w9Nombre: e.target.files?.[0]?.name || null })}
                    className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  {formData.w9Nombre && (
                    <span className="block mt-2 text-xs text-emerald-700 font-medium">
                      ✓ W-9 cargado: {formData.w9Nombre}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              * Campos obligatorios para certificación
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors"
            >
              Completar Registro de CPA
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
