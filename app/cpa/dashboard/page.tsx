"use client";
import React, { useState } from 'react';

interface CasoAsignado {
  id: string;
  cliente: string;
  estado: string;
  formulario: string;
  pdfOriginalPath: string;
  estatus: string;
}

export default function CPADashboardPage() {
  const [email] = useState('carlos.mendoza@highub.com');
  const [cpaData] = useState({
    nombre: 'Carlos Mendoza',
    codigo: 'CPA-NY-12345',
    ptin: 'PTIN-654321',
    estado: 'NY'
  });

  const [casos, setCasos] = useState<CasoAsignado[]>([
    { id: '101', cliente: 'JUAN_PEREZ', estado: 'NY', formulario: '1040', pdfOriginalPath: 'declaracion_juan.pdf', estatus: 'PENDIENTE' },
    { id: '102', cliente: 'ALICE_SMITH', estado: 'NY', formulario: '1040', pdfOriginalPath: 'declaracion_alice.pdf', estatus: 'PENDIENTE' },
  ]);

  const [firmaBase64, setFirmaBase64] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'success' | 'error' } | null>(null);

  // Procesar archivo PNG local y convertir a Base64 string
  const handleFirmaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "image/png") {
        setMensaje({ texto: "El formato debe ser estrictamente una imagen PNG (con fondo transparente preferiblemente).", tipo: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFirmaBase64(reader.result as string);
        setMensaje({ texto: "Firma digital cargada y lista para estampar.", tipo: 'success' });
      };
      reader.readAsDataURL(file);
    }
  };

  const ejecutarFirma = async (caso: CasoAsignado) => {
    if (!firmaBase64) {
      setMensaje({ texto: "❌ Error: Debes subir tu firma en formato PNG antes de procesar el documento.", tipo: 'error' });
      return;
    }

    setProcesandoId(caso.id);
    setMensaje(null);

    try {
      const response = await fetch('/api/cpa/firmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfPath: caso.pdfOriginalPath,
          nombreCpa: cpaData.nombre,
          codigoCpa: cpaData.codigo,
          ptin: cpaData.ptin,
          estado: caso.estado,
          cliente: caso.cliente,
          firmaPngBase64: firmaBase64 // Pasamos el binario codificado
        })
      });

      const resultado = await response.json();

      if (response.ok) {
        setMensaje({ texto: `¡Caso firmado e inmovilizado con éxito! Registrada tu comisión de $45.`, tipo: 'success' });
        setCasos(prev => prev.map(c => c.id === caso.id ? { ...c, estatus: 'FIRMADO' } : c));
      } else {
        setMensaje({ texto: resultado.error || 'Fallo de procesamiento', tipo: 'error' });
      }
    } catch (err) {
      setMensaje({ texto: 'Error de comunicación con el motor de firma.', tipo: 'error' });
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen text-gray-800">
      {/* Perfil del CPA */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">CPA Autenticado</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{cpaData.nombre}</h1>
          <p className="text-sm text-gray-500">{email} • Jurisdicción: <span className="font-bold">{cpaData.estado}</span></p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div><span className="text-gray-400">Licencia:</span> <p className="font-bold text-gray-900">{cpaData.codigo}</p></div>
          <div><span className="text-gray-400">PTIN:</span> <p className="font-bold text-gray-900">{cpaData.ptin}</p></div>
        </div>
      </div>

      {/* Caja de Carga de Firma Física */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">🖋️ Configuración de Firma Hológrafa</h2>
        <p className="text-xs text-gray-500 mb-4">Sube una fotografía o trazo digital de tu firma en formato PNG transparente para inyectarla sobre los formularios de impuestos.</p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input 
            type="file" 
            accept="image/png" 
            onChange={handleFirmaUpload}
            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
          {firmaBase64 && (
            <div className="p-2 border border-dashed border-gray-200 rounded-lg bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={firmaBase64} alt="Firma Preliminar" className="h-12 max-w-[150px] object-contain mix-blend-multiply" />
            </div>
          )}
        </div>
      </div>

      {/* Alertas dinámicas */}
      {mensaje && (
        <div className={`p-4 mb-6 rounded-lg font-medium text-sm border ${
          mensaje.tipo === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* Casos por firmar */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Declaraciones Asignadas ({cpaData.estado})</h2>
      <div className="grid grid-cols-1 gap-4">
        {casos.filter(c => c.estado === cpaData.estado).map((caso) => (
          <div key={caso.id} className="bg-white p-5 rounded-xl shadow-xs border border-gray-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">ID: {caso.id}</span>
                <span className={`text-xs px-2 py-0.5 rounded-sm font-bold ${
                  caso.estatus === 'FIRMADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>{caso.estatus}</span>
              </div>
              <p className="text-base font-bold text-gray-900 mt-1">Formulario {caso.formulario} — {caso.cliente.replace('_', ' ')}</p>
            </div>

            <div className="flex items-center justify-end gap-3">
              {caso.estatus === 'FIRMADO' ? (
                <span className="text-emerald-600 font-bold text-sm">✓ Firmado (+$45)</span>
              ) : (
                <button
                  onClick={() => ejecutarFirma(caso)}
                  disabled={procesandoId !== null || !firmaBase64}
                  className={`font-semibold py-2 px-5 rounded-lg text-sm transition-colors shadow-xs ${
                    !firmaBase64 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {procesandoId === caso.id ? 'Estampando...' : 'Firmar Caso'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
