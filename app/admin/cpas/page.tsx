"use client";
import React, { useState, useEffect } from 'react';

interface CPAUsuario {
  id: string;
  nombre: string;
  licencia: string;
  estado: string;
  casosFirmados: number;
  ptin: string;
  aprobado: boolean;
}

export default function HistoricoCPAsPage() {
  const [cpas, setCpas] = useState<CPAUsuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const VALOR_COMISION = 45;

  // Estado para el control dinámico de teléfonos (Administrador)
  const [telefonos, setTelefonos] = useState<Record<string, string>>({
    '1': '+18297717390', // Default RD
    '2': '+13055550199', // Ejemplo USA
  });

  // Cargar datos desde el CSV a través de nuestra API
  useEffect(() => {
    async function cargarDatos() {
      try {
        const res = await fetch('/api/cpas');
        if (res.ok) {
          const data = await res.json();
          setCpas(data);
        }
      } catch (error) {
        console.error("Error al conectar con la API de comisiones", error);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  const cambiarTelefono = (id: string, nuevoNumero: string) => {
    setTelefonos(prev => ({
      ...prev,
      [id]: nuevoNumero
    }));
    // Aquí puedes realizar un fetch para actualizarlo permanentemente en tu DB o config
  };

  const handleAprobar = (id: string) => {
    setCpas(prevCpas =>
      prevCpas.map(cpa => cpa.id === id ? { ...cpa, aprobado: !cpa.aprobado } : cpa)
    );
  };

  const estadosDisponibles = ['TODOS', ...Array.from(new Set(cpas.map(cpa => cpa.estado)))];
  const cpasFiltrados = filtroEstado === 'TODOS' ? cpas : cpas.filter(cpa => cpa.estado === filtroEstado);

  const totalCasosGlobal = cpasFiltrados.reduce((acc, curr) => acc + curr.casosFirmados, 0);
  const totalBalanceGlobal = totalCasosGlobal * VALOR_COMISION;

  // Función para exportar los datos filtrados en pantalla a un nuevo reporte CSV
  const descargarReporteCSV = () => {
    if (cpasFiltrados.length === 0) return;

    // 1. Definir encabezados
    const encabezados = ["Identificador", "Licencia CPA", "PTIN", "Teléfono Destino", "Estado", "Casos Firmados", "Comision Acumulada (USD)", "Estatus Aprobacion"];
    
    // 2. Formatear filas con la información calculada
    const filas = cpasFiltrados.map(cpa => [
      `"${cpa.nombre}"`,
      `"${cpa.licencia}"`,
      `"${cpa.ptin}"`,
      `"${telefonos[cpa.id] || '+18297717390'}"`,
      `"${cpa.estado}"`,
      cpa.casosFirmados,
      cpa.casosFirmados * VALOR_COMISION,
      cpa.aprobado ? "APROBADO" : "PENDIENTE"
    ]);

    // 3. Unificar contenido respetando saltos de línea estándar
    const contenidoCSV = [encabezados.join(","), ...filas.map(f => f.join(","))].join("\n");
    
    // 4. Crear un Blob e iniciar descarga transparente en navegador
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const fechaArchivo = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_HIGHUB_CPAs_${filtroEstado}_${fechaArchivo}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-500 font-medium animate-pulse">Cargando bitácora de comisiones desde HIGHUB...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">HIGHUB Admin</h1>
          <p className="text-gray-500 mt-1">Histórico en tiempo real desde comisiones_highub.csv</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <label htmlFor="estado-select" className="text-sm font-semibold text-gray-600">Filtrar Estado:</label>
          <select
            id="estado-select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-transparent font-medium text-gray-900 focus:outline-none cursor-pointer"
          >
            {estadosDisponibles.map(est => (
              <option key={est} value={est}>{est}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase">CPAs Activos en CSV</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{cpasFiltrados.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase">Total Casos en Estado</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalCasosGlobal}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase font-semibold text-emerald-600">Balance Contable Total</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">${totalBalanceGlobal.toLocaleString()} USD</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <th className="px-6 py-4">Identificador</th>
                <th className="px-6 py-4">Código Registro (Licencia)</th>
                <th className="px-6 py-4">PTIN Asignado</th>
                <th className="px-6 py-4">Celular Notificación (RD / USA)</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Casos Consolidados</th>
                <th className="px-6 py-4 text-right">Monto Acumulado ($45/u)</th>
                <th className="px-6 py-4 text-center">Acciones / Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {cpasFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No hay registros disponibles en el archivo de comisiones.
                  </td>
                </tr>
              ) : (
                cpasFiltrados.map((cpa) => {
                  const balanceCPA = cpa.casosFirmados * VALOR_COMISION;
                  return (
                    <tr key={cpa.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{cpa.nombre}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{cpa.licencia}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{cpa.ptin}</td>
                      {/* Input dinámico para teléfonos del cliente */}
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={telefonos[cpa.id] || "+18297717390"} 
                          onChange={(e) => cambiarTelefono(cpa.id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-xs font-mono w-40 bg-gray-50 focus:bg-white text-gray-900"
                          placeholder="+1 Ex: RD o USA"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          {cpa.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-700">{cpa.casosFirmados}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        ${balanceCPA.toLocaleString()} USD
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleAprobar(cpa.id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                            cpa.aprobado
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {cpa.aprobado ? '✓ Aprobado' : 'Aprobar'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={descargarReporteCSV}
          disabled={cpasFiltrados.length === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
            cpasFiltrados.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
          }`}
        >
          📥 Descargar Reporte CSV Consolidado
        </button>
      </div>
    </div>
  );
}
