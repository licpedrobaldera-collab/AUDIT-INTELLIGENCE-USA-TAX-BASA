import React, { useState, useEffect } from 'react';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  getDriveAccessToken,
  initDriveAuth
} from '../services/googleDriveAuth';
import {
  listGoogleDriveFiles,
  createTaxCaseDriveVault,
  uploadFileToDrive,
  deleteFileFromDrive,
  DriveFileItem
} from '../services/googleDriveService';
import { useApp } from '../context/AppContext';
import {
  Folder,
  HardDrive,
  Upload,
  ExternalLink,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Search,
  Cloud,
  LogOut,
  FolderPlus,
  ShieldCheck
} from 'lucide-react';

export const GoogleDriveManagerView: React.FC = () => {
  const { cases } = useApp();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Vault creation state
  const [selectedCaseForVault, setSelectedCaseForVault] = useState<string>('');
  const [isCreatingVault, setIsCreatingVault] = useState<boolean>(false);
  const [createdVaultLink, setCreatedVaultLink] = useState<string | null>(null);

  // File upload state
  const [uploadFileName, setUploadFileName] = useState<string>('Formulario_1040_Auditado_2024.pdf');
  const [uploadContent, setUploadContent] = useState<string>(
    'AUDIT-INTELLIGENCE USA TAX 2024\n' +
    'Expediente Fiscal y Declaración 1040 Certificada\n' +
    'Cumplimiento con IRS Circular 230 y Código de Rentas Internas § 7216.\n' +
    'Fecha de Emisión: ' + new Date().toISOString()
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Confirm delete modal state
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);

  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, token) => {
        setIsConnected(true);
        setUserProfile(user);
        loadFiles();
      },
      () => {
        setIsConnected(false);
        setUserProfile(null);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await connectGoogleDrive();
      setIsConnected(true);
      setUserProfile(res.user);
      setSuccessMsg('¡Conectado exitosamente con Google Drive!');
      await loadFiles();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive();
    setIsConnected(false);
    setUserProfile(null);
    setFiles([]);
    setSuccessMsg('Google Drive desconectado.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const loadFiles = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await listGoogleDriveFiles("trashed = false", 30);
      setFiles(res.files || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar archivos de Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCaseVault = async () => {
    if (!selectedCaseForVault) {
      alert('Por favor selecciona un caso tributario para crear su bóveda en Google Drive.');
      return;
    }
    const targetCase = cases.find(c => c.id === selectedCaseForVault || c.casoNumero === selectedCaseForVault);
    if (!targetCase) return;

    setIsCreatingVault(true);
    setErrorMsg(null);
    try {
      const vault = await createTaxCaseDriveVault(
        '2024',
        targetCase.estado,
        targetCase.casoNumero,
        targetCase.clienteNombre
      );
      setCreatedVaultLink(vault.folderLink || null);
      setSuccessMsg(`Bóveda de expediente creada en Drive: /HIGHUB/2024/${targetCase.estado}/${targetCase.casoNumero}/`);

      // Upload summary dossier
      await uploadFileToDrive(
        `--- EXPEDIENTE FISCAL AUDITADO EN DRIVE ---\n` +
        `Caso: ${targetCase.casoNumero}\n` +
        `Cliente: ${targetCase.clienteNombre} (${targetCase.clienteEmail})\n` +
        `Estado Fiscal: ${targetCase.estado}\n` +
        `CPA Responsable: ${targetCase.cpaNombre || 'Lic. Pedro Baldera, CPA'}\n` +
        `Tarifa: $${targetCase.montoCobrado} USD | Comisión CPA: $${targetCase.comisionMonto} USD\n` +
        `Fecha de Registro en Bóveda: ${new Date().toLocaleString()}\n`,
        `EXPEDIENTE_${targetCase.casoNumero}_MANIFEST.txt`,
        'text/plain',
        vault.caseFolderId
      );

      await loadFiles();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear bóveda en Google Drive');
    } finally {
      setIsCreatingVault(false);
    }
  };

  const handleUploadDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      await uploadFileToDrive(uploadContent, uploadFileName, 'text/plain');
      setSuccessMsg(`Archivo "${uploadFileName}" subido exitosamente a tu Google Drive.`);
      await loadFiles();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al subir archivo a Drive');
    } finally {
      setIsUploading(false);
    }
  };

  // Explicit destructive confirmation per safety guidelines
  const confirmExecuteDelete = async () => {
    if (!fileToDelete) return;
    try {
      const ok = await deleteFileFromDrive(fileToDelete.id);
      if (ok) {
        setSuccessMsg(`Archivo "${fileToDelete.name}" eliminado de Google Drive.`);
        setFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar archivo');
    } finally {
      setFileToDelete(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Delete Confirmation Modal (Explicit Confirmation Dialog) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                ¿Confirmas eliminar este archivo de Google Drive?
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                El archivo <strong>"{fileToDelete.name}"</strong> se eliminará de tu unidad de Google Drive. Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmExecuteDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                Sí, Eliminar de Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span>Integración Oficial Google Workspace API • Google Drive v3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Bóveda de Expedientes en Google Drive
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Sincroniza tus declaraciones 1040, evidencias tributarias (W-2, 1099, IDs) y firmas del CPA directamente en tu unidad personal o compartida de Google Drive con estructura HIGHUB.
          </p>
        </div>

        {/* Connect / Disconnect Action */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right space-y-2 shrink-0">
          {isConnected ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold justify-end">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Drive Conectado: {userProfile?.email}</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold border border-rose-700/60 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Desconectar Drive
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Conectando...' : 'Conectar con Google Drive'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Drive Workstation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Create Case Vault Directory */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Crear Bóveda de Caso en Google Drive</h3>
              <p className="text-xs text-slate-500">Estructura jerárquica /AUDIT_INTELLIGENCE_HIGHUB/2024/{'{ESTADO}'}/{'{CASO}'}/</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Selecciona Caso Tributario Registrado:
              </label>
              <select
                value={selectedCaseForVault}
                onChange={e => setSelectedCaseForVault(e.target.value)}
                disabled={!isConnected}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Seleccionar expediente --</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.casoNumero} — {c.clienteNombre} ({c.estado})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateCaseVault}
              disabled={!isConnected || isCreatingVault}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isCreatingVault ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creando carpetas en Drive...</span>
                </>
              ) : (
                <>
                  <Folder className="w-4 h-4" />
                  <span>Generar Bóveda en Google Drive</span>
                </>
              )}
            </button>

            {createdVaultLink && (
              <a
                href={createdVaultLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Abrir carpeta generada en Google Drive
              </a>
            )}
          </div>
        </div>

        {/* Box 2: Upload File to Google Drive */}
        <form onSubmit={handleUploadDossier} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Subir Documento Fiscal a Google Drive</h3>
              <p className="text-xs text-slate-500">Guarda anexos certificados, resúmenes 1040 o notas de auditoría</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre del Archivo en Drive:</label>
              <input
                type="text"
                value={uploadFileName}
                onChange={e => setUploadFileName(e.target.value)}
                disabled={!isConnected}
                placeholder="Nombre del archivo (ej: Declaracion_1040_Auditada.txt)"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contenido / Datos Tributarios:</label>
              <textarea
                value={uploadContent}
                onChange={e => setUploadContent(e.target.value)}
                disabled={!isConnected}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] focus:ring-2 focus:ring-emerald-500"
                placeholder="Texto o informe a certificar..."
              />
            </div>

            <button
              type="submit"
              disabled={!isConnected || isUploading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Subiendo a Google Drive...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Subir Documento a Drive</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Drive File Browser */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Archivos y Carpetas en Google Drive</h3>
              <p className="text-xs text-slate-500">
                {isConnected ? `Mostrando archivos de ${userProfile?.email}` : 'Inicia sesión con Google para explorar y sincronizar'}
              </p>
            </div>
          </div>

          {isConnected && (
            <button
              onClick={loadFiles}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar lista</span>
            </button>
          )}
        </div>

        {!isConnected ? (
          <div className="p-12 text-center space-y-4">
            <Cloud className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">Google Drive Desconectado</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Conecta tu cuenta de Google con un clic para acceder a las carpetas de auditoría, descargar archivos de soporte y archivar declaraciones de impuestos oficiales.
            </p>
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Conectar Google Drive Ahora
            </button>
          </div>
        ) : files.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No se encontraron archivos en la raíz o carpetas trashed de Google Drive.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="p-4">Nombre de Archivo / Carpeta</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Última Modificación</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {files.map(f => {
                  const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          {isFolder ? (
                            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                          <span className="font-bold text-slate-900 truncate max-w-xs">{f.name}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                        {isFolder ? 'Carpeta Drive' : f.mimeType.split('.').pop() || 'Archivo'}
                      </td>
                      <td className="p-4 text-slate-500 text-[11px]">
                        {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {f.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                            >
                              <ExternalLink className="w-3 h-3" /> Ver
                            </a>
                          )}
                          <button
                            onClick={() => setFileToDelete(f)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar de Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
