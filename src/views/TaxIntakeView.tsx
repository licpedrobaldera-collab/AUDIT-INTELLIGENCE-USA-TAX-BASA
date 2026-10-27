import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { USState } from '../types';
import { SignaturePad } from '../components/SignaturePad';
import {
  FileText,
  Upload,
  CheckCircle2,
  Folder,
  DollarSign,
  UserCheck,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  FileCheck,
  Eye,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TaxIntakeView: React.FC = () => {
  const { crearCasoTax, navigate, setSelectedCaseForModal } = useApp();

  const [estado, setEstado] = useState<USState>('NY');
  const [nombre, setNombre] = useState('Juan Perez');
  const [email, setEmail] = useState('juan.perez.tax2024@email.com');
  const [telefono, setTelefono] = useState('+1 (917) 555-0143');
  const [ssnLast4, setSsnLast4] = useState('4192');
  const [tipoDeclaracion, setTipoDeclaracion] = useState<'Soltero' | 'Casado conjunto' | 'Cabeza de familia'>('Soltero');
  const [ingresos, setIngresos] = useState<number>(68500);
  const [direccion, setDireccion] = useState('645 W 187th St, Apt 4B, New York, NY 10033');

  // Evidence files state
  const [selectedFiles, setSelectedFiles] = useState<Array<{ name: string; size: string; type: string; category: any }>>([
    { name: 'W2_Form_Wage_Statement_2024.pdf', size: '340 KB', type: 'PDF', category: 'W2' },
    { name: 'Driver_License_State_Photo_ID.jpg', size: '1.2 MB', type: 'JPG', category: 'IDENTIFICACION' },
    { name: 'Form_1099_NEC_Courier_Income.pdf', size: '215 KB', type: 'PDF', category: '1099' },
    { name: 'Tuition_Statement_Form_1098_T.pdf', size: '188 KB', type: 'PDF', category: 'DEDUCCIONES' },
  ]);

  const [clienteFirmaUrl, setClienteFirmaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCase, setSuccessCase] = useState<any | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(0)} KB`,
        type: f.name.endsWith('.pdf') ? 'PDF' : 'JPG',
        category: 'OTRO',
      }));
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handlePagarYRadicar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) {
      alert('Por favor complete su nombre y correo electrónico.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const nuevoCaso = crearCasoTax({
        estado,
        nombre,
        email,
        telefono,
        ssnLast4,
        tipoDeclaracion,
        ingresosEstimados: Number(ingresos) || 60000,
        direccion,
        archivos: selectedFiles,
        firmaClienteUrl: clienteFirmaUrl,
      });

      setIsSubmitting(false);
      setSuccessCase(nuevoCaso);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Success Modal / Banner */}
      {successCase && (
        <div className="mb-8 bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 sm:p-8 shadow-lg text-emerald-950 animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  Radicación Exitosa • Pago $150 Confirmado
                </span>
                <h3 className="text-2xl font-black text-emerald-950">
                  {successCase.casoNumero} Generado
                </h3>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Ruta de Bóveda Asignada:</span>
              <span className="font-mono font-bold text-blue-700 text-sm flex items-center gap-1.5 mt-0.5">
                <Folder className="w-4 h-4 text-amber-500" />
                {successCase.carpetaPath}
              </span>
              <span className="text-slate-500 text-[11px] mt-1 block">
                Contiene 8 soportes históricos listos para inspección CPA.
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">CPA Asignado Aleatorio ({successCase.estado}):</span>
              <span className="font-bold text-slate-800 text-sm block mt-0.5">
                {successCase.cpaNombre}
              </span>
              <span className="text-blue-600 font-mono font-semibold">
                {successCase.cpaCodigo} • Comisión asignada: $45 USD
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedCaseForModal(successCase);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Eye className="w-4 h-4" /> Inspeccionar Expediente Creado
            </button>
            <button
              onClick={() => navigate('/cpa/dashboard')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Ir a CPA Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSuccessCase(null)}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-3 py-2"
            >
              Radicar otro caso
            </button>
          </div>
        </div>
      )}

      {/* Main Intake Form Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                <span>Formulario Oficial 1040 & State Tax Filing 2024</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                TAX $150 - {estado} - Expediente Histórico
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                Radique su declaración tributaria. El sistema creará la carpeta 
                <span className="font-mono font-bold text-yellow-300 mx-1">/2024/{estado}/CASO-XXXXX/</span> 
                con 8 soportes históricos y asignará automáticamente un CPA acreditado.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-right">
              <span className="text-[11px] text-blue-200 uppercase font-semibold block">Tarifa Plana</span>
              <span className="text-3xl font-black text-white">$150 <span className="text-xs font-medium">USD</span></span>
              <span className="text-[10px] text-emerald-300 block font-mono mt-0.5">Comisión CPA: $45</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePagarYRadicar} className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Estado y Datos Personales */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">1</span>
                Jurisdicción & Datos del Contribuyente
              </h3>
              <span className="text-xs font-mono text-slate-500">Año Fiscal: 2024</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Estado / Jurisdicción Fiscal *
                </label>
                <select
                  value={estado}
                  onChange={e => setEstado(e.target.value as USState)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="NY">🗽 New York (NY) - 5 Firmas Disponibles</option>
                  <option value="FL">☀️ Florida (FL) - 3 Firmas Disponibles</option>
                  <option value="NJ">🌊 New Jersey (NJ) - 2 Firmas Disponibles</option>
                  <option value="TX">🤠 Texas (TX) - 2 Firmas Disponibles</option>
                  <option value="RD">🌴 Rep. Dominicana (RD) - 2 Firmas Disponibles</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Tipo de Declaración
                </label>
                <select
                  value={tipoDeclaracion}
                  onChange={e => setTipoDeclaracion(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 font-semibold text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Soltero">Soltero (Single)</option>
                  <option value="Casado conjunto">Casado Declaración Conjunta (MFJ)</option>
                  <option value="Cabeza de familia">Cabeza de Familia (Head of Household)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Juan Perez"
                  required
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="juan@email.com"
                  required
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="+1 (917) 555-0143"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Últimos 4 dígitos SSN / ITIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={ssnLast4}
                  onChange={e => setSsnLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="4192"
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Carga de Evidencias & Soportes (8 Archivos) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">2</span>
                Carga de Evidencias & 8 Soportes Históricos
              </h3>
              <span className="text-xs font-mono text-blue-600">/2024/{estado}/CASO-XXXXX/</span>
            </div>

            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-100/60 transition-colors">
              <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2 opacity-80" />
              <div className="text-sm font-bold text-slate-800">
                Seleccione o arrastre los comprobantes tributarios
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Suba Formulario W-2, 1099, Identificación oficial (DL/Pasaporte), gastos médicos, intereses bancarios.
              </p>
              <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                <span>Examinar archivos locales</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Evidence List Preview */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">
                Archivos vinculados al expediente ({selectedFiles.length} detectados):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate text-slate-800">{file.name}</span>
                    </div>
                    <span className="text-slate-400 shrink-0 ml-2">{file.size}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 font-mono bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                El sistema incorporará automáticamente los 8 anexos requeridos para la bóveda histórica.
              </p>
            </div>
          </div>

          {/* Section 3: Firma Electrónica del Cliente */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">3</span>
                Firma Digital del Contribuyente
              </h3>
              <span className="text-xs text-slate-500">ESIGN Act & UETA Compliant</span>
            </div>

            <SignaturePad
              onSave={setClienteFirmaUrl}
              title="Firma Electrónica del Contribuyente"
              description="Dibuje su firma con el dedo o mouse para consentir la preparación tributaria 2024 y autorizar representación fiscal."
              penColor="#1e3a8a"
            />
          </div>

          {/* Section 4: Checkout & Submit $150 */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">Resumen de Radicación:</div>
                <div className="text-sm font-bold flex items-center gap-2">
                  <span>Preparación Fiscal 2024 ({estado})</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-mono">Total a pagar: $150.00 USD</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Depósito seguro a Banco BHD - Cuenta: 08694150021
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Encriptación 256-bit TLS</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando pago de $150 & Asignando CPA...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pagar $150 - Genera Contrato + Asigna CPA Aleatorio {estado}</span>
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-slate-400">
              Al hacer clic en Pagar, se emite el contrato legal, se registra el expediente en 
              <span className="font-mono text-slate-600"> /2024/{estado}/CASO-XXXXX/</span> y se asigna al turno de un CPA con PTIN verificado.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
