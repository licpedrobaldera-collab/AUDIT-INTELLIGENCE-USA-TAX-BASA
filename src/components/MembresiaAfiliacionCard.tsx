import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModalidadAfiliacion, User } from '../types';
import {
  CreditCard,
  Building2,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileText,
  ArrowRight,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MembresiaAfiliacionCardProps {
  cpaUser: User;
  onSuccess?: () => void;
}

export const MembresiaAfiliacionCard: React.FC<MembresiaAfiliacionCardProps> = ({
  cpaUser,
  onSuccess
}) => {
  const { systemBankAccount, procesarAfiliacionContador } = useApp();

  const [modalidad, setModalidad] = useState<ModalidadAfiliacion>(
    cpaUser.modalidadAfiliacion || 'PAGO_VIRTUAL'
  );
  const [pasarela, setPasarela] = useState('Stripe Checkout (USD)');
  const [referenciaManual, setReferenciaManual] = useState('');
  const [aceptarClausula, setAceptarClausula] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const estadoAfiliacion = cpaUser.estadoAfiliacion || 'PENDIENTE';
  const saldoPorCobrar = cpaUser.cuentaPorCobrarSaldo ?? 50;

  const handlePagarAfiliacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (modalidad === 'TRANSFERENCIA_BANCO_SISTEMA' && !referenciaManual.trim()) {
      setStatusMessage({
        type: 'err',
        text: 'Por favor ingrese el número de comprobante o referencia de su transferencia bancaria.'
      });
      return;
    }

    if (!aceptarClausula) {
      setStatusMessage({
        type: 'err',
        text: 'Debe aceptar la Cláusula Cuarta del Contrato de Afiliación para continuar.'
      });
      return;
    }

    setIsProcessing(true);
    const res = await procesarAfiliacionContador({
      contadorId: cpaUser.id,
      modalidad,
      pasarela,
      referenciaManual: referenciaManual.trim() || undefined,
      aceptarClausula
    });
    setIsProcessing(false);

    if (!res.success) {
      setStatusMessage({
        type: 'err',
        text: res.error || 'No se pudo procesar la afiliación.'
      });
      return;
    }

    if (res.url && res.url.startsWith('http')) {
      window.location.href = res.url;
      return;
    }

    try {
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    if (modalidad === 'PAGO_VIRTUAL') {
      setStatusMessage({
        type: 'ok',
        text: `¡Afiliación Pagada ($50.00 USD)! Ref: ${res.referencia}. Su firma y servicio han sido habilitados inmediatamente.`
      });
    } else if (modalidad === 'RETENCION_PRIMEROS_INGRESOS') {
      setStatusMessage({
        type: 'ok',
        text: `¡Autorización Contractual Registrada! Ref: ${res.referencia}. Ya puede firmar casos; los $50.00 USD se retendrán automáticamente de sus primeros ingresos.`
      });
    } else {
      setStatusMessage({
        type: 'ok',
        text: `Transferencia registrada (${res.referencia}) hacia ${systemBankAccount.bancoNombre}. En validación por Administración.`
      });
    }

    if (onSuccess) onSuccess();
  };

  if (estadoAfiliacion === 'PAGADO') {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
              Membresía Sociedad de Contadores Activa (100% Pagada)
            </div>
            <p className="text-xs text-emerald-900 mt-0.5">
              Cuota única de <strong>$50.00 USD</strong> saldada • Modalidad:{' '}
              <span className="font-mono font-bold">{cpaUser.modalidadAfiliacion || 'PAGO_VIRTUAL'}</span>
              {cpaUser.referenciaPagoAfiliacion && ` • Ref: ${cpaUser.referenciaPagoAfiliacion}`}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
          Habilitado para Firmar
        </span>
      </div>
    );
  }

  if (estadoAfiliacion === 'AUTORIZADO_RETENCION') {
    const porcentajeCubierto = Math.round(((50 - saldoPorCobrar) / 50) * 100);
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-900">
                Servicio Habilitado • Cuenta por Cobrar Derecho de Afiliación ($50.00 USD)
              </div>
              <p className="text-xs text-amber-900 mt-0.5">
                Retención contractual autorizada sobre primeros ingresos devengados. Saldo pendiente por retener:{' '}
                <strong className="font-mono text-sm">${saldoPorCobrar.toFixed(2)} USD</strong> (se descuenta automáticamente en sus primeros casos aprobados).
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black">
            Habilitado con CxC (${saldoPorCobrar.toFixed(2)})
          </span>
        </div>

        <div className="w-full bg-amber-200/70 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${porcentajeCubierto}%` }}
          />
        </div>
        {cpaUser.clausulaFormaPagoTexto && (
          <p className="text-[11px] font-mono text-amber-950 bg-white/80 p-2.5 rounded-xl border border-amber-200">
            {cpaUser.clausulaFormaPagoTexto}
          </p>
        )}
      </div>
    );
  }

  // Estado PENDIENTE: Bloqueo de firma hasta pagar o autorizar retención
  return (
    <div className="card-afiliacion bg-white border-2 border-rose-300 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Requisito Previo de Activación CPA</span>
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Membresía Sociedad de Contadores
          </h3>
          <p className="text-xs text-slate-600">
            Cuota única de afiliación: <strong className="text-slate-900 text-sm">$50.00 USD</strong> (pago único no recurrente). Debe completarse o autorizar su retención en primeros ingresos antes de poder firmar y brindar el servicio.
          </p>
        </div>

        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
            Cuota Única
          </span>
          <span className="text-2xl font-black font-mono text-emerald-400">$50.00 USD</span>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
            statusMessage.type === 'ok'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {statusMessage.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handlePagarAfiliacion} className="space-y-5 text-xs">
        {/* Selección de Modalidad Contractual */}
        <div className="space-y-2.5">
          <label className="font-black text-slate-800 uppercase tracking-wider block">
            Seleccione Forma de Pago de Afiliación ($50.00 USD):
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Opción 1: Pago Virtual */}
            <button
              type="button"
              onClick={() => setModalidad('PAGO_VIRTUAL')}
              className={`p-4 rounded-2xl border-2 text-left transition-all space-y-2 ${
                modalidad === 'PAGO_VIRTUAL'
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Inmediato
                </span>
              </div>
              <div className="font-bold text-slate-900">1. Pago Virtual Online</div>
              <p className="text-[11px] text-slate-600">
                Pasarela Stripe / PayPal / Azul / CardNet. Activa su firma al instante.
              </p>
            </button>

            {/* Opción 2: Transferencia a Cuenta Propia Asignada al Sistema */}
            <button
              type="button"
              onClick={() => setModalidad('TRANSFERENCIA_BANCO_SISTEMA')}
              className={`p-4 rounded-2xl border-2 text-left transition-all space-y-2 ${
                modalidad === 'TRANSFERENCIA_BANCO_SISTEMA'
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  Banco Sistema
                </span>
              </div>
              <div className="font-bold text-slate-900">2. Transferencia Bancaria</div>
              <p className="text-[11px] text-slate-600">
                Depósito directo a la cuenta asignada del sistema (configurable por Admin).
              </p>
            </button>

            {/* Opción 3: Retención Primeros Ingresos (CxC) */}
            <button
              type="button"
              onClick={() => setModalidad('RETENCION_PRIMEROS_INGRESOS')}
              className={`p-4 rounded-2xl border-2 text-left transition-all space-y-2 ${
                modalidad === 'RETENCION_PRIMEROS_INGRESOS'
                  ? 'border-amber-500 bg-amber-50/80 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <Wallet className="w-5 h-5 text-amber-600" />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  CxC Ingresos
                </span>
              </div>
              <div className="font-bold text-slate-900">3. Retención Primeros Ingresos</div>
              <p className="text-[11px] text-slate-600">
                Cuenta por cobrar a derecho de afiliación descontada desde su primer caso generado.
              </p>
            </button>
          </div>
        </div>

        {/* Detalles específicos según modalidad */}
        {modalidad === 'PAGO_VIRTUAL' && (
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-3">
            <label className="font-bold text-blue-950 block">
              Seleccione Pasarela Virtual Autorizada:
            </label>
            <select
              value={pasarela}
              onChange={e => setPasarela(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-blue-300 bg-white font-semibold text-slate-800"
            >
              <option value="Stripe Checkout (USD)">Stripe Checkout (Tarjeta Crédito / Débito USD)</option>
              <option value="PayPal Express (USD)">PayPal Business Checkout (USD)</option>
              <option value="Azul / CardNet">Azul / CardNet (República Dominicana & Intl)</option>
            </select>
          </div>
        )}

        {modalidad === 'TRANSFERENCIA_BANCO_SISTEMA' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
              <span className="font-black text-indigo-950 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-700" />
                Cuenta Bancaria Asignada al Sistema (Solo Visible al Pagar)
              </span>
              <span className="text-[10px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                Actualizable por Admin
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-indigo-100 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block font-sans">Banco Receptor:</span>
                <strong className="text-slate-900">{systemBankAccount.bancoNombre}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Titular de Cuenta:</span>
                <strong className="text-slate-900">{systemBankAccount.titular}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Número de Cuenta:</span>
                <strong className="text-blue-700 text-xs">{systemBankAccount.numeroCuenta}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Routing / SWIFT:</span>
                <strong className="text-slate-900">{systemBankAccount.routingSwift}</strong>
              </div>
            </div>

            <p className="text-[11px] text-indigo-900">{systemBankAccount.instrucciones}</p>

            <div>
              <label className="font-bold text-indigo-950 block mb-1">
                Número de Referencia / Comprobante de Transferencia *:
              </label>
              <input
                type="text"
                value={referenciaManual}
                onChange={e => setReferenciaManual(e.target.value)}
                placeholder="Ej: TRF-99482104"
                className="w-full p-2.5 rounded-xl border border-indigo-300 bg-white font-mono"
              />
            </div>
          </div>
        )}

        {modalidad === 'RETENCION_PRIMEROS_INGRESOS' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-amber-950">
            <div className="font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-700" />
              Mecanismo Automático de Retención en Primeros Ingresos:
            </div>
            <p className="leading-relaxed">
              Al aprobar esta modalidad, el sistema creará una <strong>Cuenta por Cobrar de $50.00 USD</strong> a derecho de afiliación y le habilitará inmediatamente para firmar expedientes. Al liquidar su primer caso generador de ingresos ($45.00 USD por caso), el sistema retendrá automáticamente los ingresos devengados hasta saldar los $50.00 USD completos.
            </p>
          </div>
        )}

        {/* Cláusula Contractual Obligatoria */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-700" />
            Cláusula Contractual de Membresía y Forma de Pago
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
            {modalidad === 'PAGO_VIRTUAL' && (
              <>
                <strong>CLÁUSULA CUARTA:</strong> El Contador (<strong>{cpaUser.nombre}</strong>) acuerda el pago único de <strong>$50.00 USD</strong> mediante Pago Virtual autorizado por concepto de derecho de afiliación a la Sociedad de Contadores Audit Intelligence USA, requisito previo indispensable para ejercer firma certificada en la plataforma.
              </>
            )}
            {modalidad === 'TRANSFERENCIA_BANCO_SISTEMA' && (
              <>
                <strong>CLÁUSULA CUARTA:</strong> El Contador (<strong>{cpaUser.nombre}</strong>) realiza el pago único de <strong>$50.00 USD</strong> vía transferencia bancaria hacia la cuenta propia asignada al sistema (<strong>{systemBankAccount.bancoNombre} • Cuenta {systemBankAccount.numeroCuenta}</strong>), reconociendo que el Administrador del sistema podrá modificar o cambiar la institución bancaria receptora en cualquier momento.
              </>
            )}
            {modalidad === 'RETENCION_PRIMEROS_INGRESOS' && (
              <>
                <strong>CLÁUSULA CUARTA:</strong> El Contador (<strong>{cpaUser.nombre}</strong>) autoriza expresamente que la cuota única de afiliación de <strong>$50.00 USD</strong> sea contabilizada como <strong>Cuenta por Cobrar a Derecho de Afiliación</strong> y retenida automáticamente de sus primeros ingresos devengados por comisiones, reconociéndose desde el primer caso generador de ingresos del Contador hasta su total cancelación.
              </>
            )}
          </p>

          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={aceptarClausula}
              onChange={e => setAceptarClausula(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold text-slate-800">
              Acepto y suscribo electrónicamente esta cláusula contractual de afiliación por $50.00 USD bajo la modalidad seleccionada.
            </span>
          </label>
        </div>

        <button
          id="btnPagarAfiliacion"
          type="submit"
          disabled={isProcessing}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-blue-700 disabled:opacity-60 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>
            {isProcessing
              ? 'Procesando...'
              : modalidad === 'PAGO_VIRTUAL'
              ? 'Pagar Afiliación ($50 USD) — Pago Virtual'
              : modalidad === 'TRANSFERENCIA_BANCO_SISTEMA'
              ? 'Registrar Transferencia ($50 USD)'
              : 'Autorizar Retención en Primeros Ingresos ($50 USD) y Activar'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
