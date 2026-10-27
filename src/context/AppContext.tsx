import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TaxCase, PagoComision, UserRole, USState, SoporteDocumento } from '../types';
import { INITIAL_USERS, INITIAL_CASES, INITIAL_PAYOUTS, SAMPLE_DOCS_TEMPLATES } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  cases: TaxCase[];
  payouts: PagoComision[];
  activeRoute: string;
  selectedCaseForModal: TaxCase | null;
  selectedDocForPreview: { doc: SoporteDocumento; caseNumber: string } | null;
  navigate: (route: string) => void;
  setSelectedCaseForModal: (c: TaxCase | null) => void;
  setSelectedDocForPreview: (item: { doc: SoporteDocumento; caseNumber: string } | null) => void;
  login: (identificador: string, clave: string) => { success: boolean; message?: string };
  switchRoleDemo: (role: UserRole, specificUserId?: string) => void;
  logout: () => void;
  registerUser: (userData: Partial<User>) => { success: boolean; userId?: string; error?: string };
  cambiarClave: (identificador: string, claveActual: string, claveNueva: string) => { success: boolean; error?: string };
  crearCasoTax: (data: {
    estado: USState;
    nombre: string;
    email: string;
    telefono?: string;
    ssnLast4?: string;
    tipoDeclaracion?: 'Soltero' | 'Casado conjunto' | 'Cabeza de familia';
    ingresosEstimados?: number;
    direccion?: string;
    archivos?: { name: string; size: string; type: string; category: any }[];
    firmaClienteUrl?: string;
  }) => TaxCase;
  actualizarCaso: (casoId: string, updates: Partial<TaxCase>, logDetalle?: string) => void;
  borrarCasoConLog: (casoId: string, motivo: string) => void;
  firmarAprobarCPA: (casoId: string, firmaDataUrl: string) => void;
  pagarComisionOnline: (cpaId: string) => PagoComision | null;
  exportarExcelCSV: (tipo: 'clientes' | 'firmas' | 'payouts' | 'matriz_completa') => void;
  resetToDefaults: () => void;
  // Stats
  financialStats: {
    totalCobrado: number;
    totalPagado: number;
    totalPorPagar: number;
    netoBHD: number;
    casosAprobados: number;
    casosEnTramite: number;
    casosRealizadas: number;
    porEstado: Record<USState, { cobrado: number; casos: number }>;
  };
}

const STORAGE_KEY_PREFIX = 'audit_tax_v23_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [cases, setCases] = useState<TaxCase[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}cases`);
      return saved ? JSON.parse(saved) : INITIAL_CASES;
    } catch {
      return INITIAL_CASES;
    }
  });

  const [payouts, setPayouts] = useState<PagoComision[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}payouts`);
      return saved ? JSON.parse(saved) : INITIAL_PAYOUTS;
    } catch {
      return INITIAL_PAYOUTS;
    }
  });

  // Current logged in user (defaults to Pedro Baldera CPA for immediate richness, or can switch)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
      if (saved) return JSON.parse(saved);
      // Default to CPA Pedro Baldera for immediate testing of the requested dashboard
      return INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [activeRoute, setActiveRoute] = useState<string>(() => {
    // support deep linking / initial path
    const hash = window.location.hash.replace('#', '');
    if (hash && hash.startsWith('/')) return hash;
    return '/';
  });

  const [selectedCaseForModal, setSelectedCaseForModal] = useState<TaxCase | null>(null);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<{ doc: SoporteDocumento; caseNumber: string } | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
    } catch (e) {
      console.warn('Storage error users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}cases`, JSON.stringify(cases));
    } catch (e) {
      console.warn('Storage error cases', e);
    }
  }, [cases]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}payouts`, JSON.stringify(payouts));
    } catch (e) {
      console.warn('Storage error payouts', e);
    }
  }, [payouts]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
      }
    } catch (e) {
      console.warn('Storage error current_user', e);
    }
  }, [currentUser]);

  const navigate = (route: string) => {
    setActiveRoute(route);
    window.location.hash = route;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash.startsWith('/')) {
        setActiveRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const login = (identificador: string, clave: string) => {
    const cleanId = identificador.trim().toLowerCase();
    const user = users.find(u =>
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.telefono && u.telefono.replace(/\D/g, '') === cleanId.replace(/\D/g, '')) ||
      (u.identificacion && u.identificacion.toLowerCase() === cleanId) ||
      (u.codigoCPA && u.codigoCPA.toLowerCase() === cleanId)
    );

    if (!user) {
      return { success: false, message: 'Usuario no encontrado con ese Email, Teléfono, Cédula o Código CPA.' };
    }

    if (user.claveHash !== clave) {
      return { success: false, message: 'Contraseña incorrecta. Por favor intente de nuevo.' };
    }

    setCurrentUser(user);
    if (user.rol === 'CONTADOR') {
      navigate('/cpa/dashboard');
    } else if (user.rol === 'ADMIN' || user.rol === 'DEV') {
      navigate('/admin/matriz');
    } else {
      navigate('/tax');
    }

    return { success: true };
  };

  const switchRoleDemo = (role: UserRole, specificUserId?: string) => {
    let target: User | undefined;
    if (specificUserId) {
      target = users.find(u => u.id === specificUserId);
    } else {
      target = users.find(u => u.rol === role);
    }

    if (target) {
      setCurrentUser(target);
      if (role === 'CONTADOR') navigate('/cpa/dashboard');
      else if (role === 'ADMIN' || role === 'DEV') navigate('/admin/matriz');
      else if (role === 'CLIENTE') navigate('/tax');
      else if (role === 'FIRMA') navigate('/directorio');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const registerUser = (userData: Partial<User>) => {
    if (!userData.email && !userData.telefono && !userData.identificacion) {
      return { success: false, error: 'Email, Teléfono o Identificación es requerido.' };
    }

    const state = userData.estado || 'NY';
    let cpaCode: string | null = null;
    if (userData.rol === 'CONTADOR' || userData.rol === 'FIRMA') {
      cpaCode = userData.codigoCPA || `CPA-${state}-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      rol: userData.rol || 'CLIENTE',
      email: userData.email || null,
      telefono: userData.telefono || null,
      identificacion: userData.identificacion || null,
      claveHash: userData.claveHash || '12345678',
      nombre: userData.nombre || 'Nuevo Usuario',
      estado: state,
      codigoCPA: cpaCode,
      licencia: userData.licencia || (userData.rol === 'CONTADOR' ? `${state}-CPA-${Math.floor(10000 + Math.random() * 90000)}` : null),
      ptin: userData.ptin || (userData.rol === 'CONTADOR' ? `P00${Math.floor(100000 + Math.random() * 900000)}` : null),
      bancoNombre: userData.bancoNombre || (userData.rol === 'CONTADOR' ? 'Chase Bank' : null),
      bancoNumero: userData.bancoNumero || (userData.rol === 'CONTADOR' ? `****${Math.floor(1000 + Math.random() * 9000)}` : null),
      bancoRouting: userData.bancoRouting || (userData.rol === 'CONTADOR' ? '021000021' : null),
      bancoTitular: userData.bancoTitular || userData.nombre || null,
      activo: true,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);

    return { success: true, userId: newUser.id };
  };

  const cambiarClave = (identificador: string, claveActual: string, claveNueva: string) => {
    const cleanId = identificador.trim().toLowerCase();
    const userIndex = users.findIndex(u =>
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.telefono && u.telefono.replace(/\D/g, '') === cleanId.replace(/\D/g, '')) ||
      (u.identificacion && u.identificacion.toLowerCase() === cleanId)
    );

    if (userIndex === -1) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    if (users[userIndex].claveHash !== claveActual) {
      return { success: false, error: 'La clave actual no es correcta.' };
    }

    const updated = [...users];
    updated[userIndex] = {
      ...updated[userIndex],
      claveHash: claveNueva,
    };

    setUsers(updated);
    if (currentUser && currentUser.id === updated[userIndex].id) {
      setCurrentUser(updated[userIndex]);
    }

    return { success: true };
  };

  const crearCasoTax = (data: {
    estado: USState;
    nombre: string;
    email: string;
    telefono?: string;
    ssnLast4?: string;
    tipoDeclaracion?: 'Soltero' | 'Casado conjunto' | 'Cabeza de familia';
    ingresosEstimados?: number;
    direccion?: string;
    archivos?: { name: string; size: string; type: string; category: any }[];
    firmaClienteUrl?: string;
  }) => {
    const nextNumber = 10000 + cases.length + 1;
    const casoNumero = `CASO-${nextNumber}`;
    const estado = data.estado;
    const carpetaPath = `/2024/${estado}/${casoNumero}/`;

    // Asignar CPA aleatorio del estado seleccionado si existe, o uno disponible
    const cpasDelEstado = users.filter(u => u.rol === 'CONTADOR' && u.estado === estado && u.activo);
    const cpaAsignado = cpasDelEstado.length > 0
      ? cpasDelEstado[Math.floor(Math.random() * cpasDelEstado.length)]
      : users.find(u => u.rol === 'CONTADOR') || users[0];

    // Build standard 8 historical files bundle if not fully provided
    const userDocs: SoporteDocumento[] = data.archivos && data.archivos.length > 0
      ? data.archivos.map((a, idx) => ({
          id: `doc-${Date.now()}-${idx}`,
          nombre: a.name,
          tipo: a.type || 'PDF',
          tamano: a.size || '512 KB',
          fecha: new Date().toISOString().split('T')[0],
          categoria: a.category || 'W2',
          previsualizacionTexto: `Archivo oficial ${a.name} - Carpeta: ${carpetaPath}`,
        }))
      : SAMPLE_DOCS_TEMPLATES.map(t => ({
          ...t,
          id: `doc-${Date.now()}-${t.id}`,
          previsualizacionTexto: t.previsualizacionTexto?.replace(/Juan Perez/g, data.nombre),
        }));

    const nuevoCaso: TaxCase = {
      id: `case-${Date.now()}`,
      casoNumero,
      estado,
      clienteUserId: currentUser?.rol === 'CLIENTE' ? currentUser.id : null,
      clienteNombre: data.nombre,
      clienteEmail: data.email,
      clienteTelefono: data.telefono || '+1-917-555-0100',
      clienteData: {
        ssnLast4: data.ssnLast4 || '5521',
        tipoDeclaracion: data.tipoDeclaracion || 'Soltero',
        ingresosEstimados: data.ingresosEstimados || 55000,
        anoFiscal: 2024,
        direccion: data.direccion || `100 Main St, ${estado}`,
      },
      montoCobrado: 150,
      clienteFirma: data.firmaClienteUrl
        ? {
            dataUrl: data.firmaClienteUrl,
            fecha: new Date().toISOString(),
            ip: '198.51.100.' + Math.floor(Math.random() * 250),
          }
        : null,
      cpaUserId: cpaAsignado.id,
      cpaCodigo: cpaAsignado.codigoCPA || `CPA-${estado}-12345`,
      cpaNombre: cpaAsignado.nombre,
      cpaFirma: null,
      contratoUrl: `/contratos/2024/${estado}/${casoNumero}.pdf`,
      contratoStatus: 'PENDIENTE',
      status: 'REALIZADA',
      comisionStatus: 'PENDIENTE',
      comisionMonto: 45,
      carpetaPath,
      soportes: userDocs,
      historial: [
        {
          id: `h-${Date.now()}-1`,
          fecha: new Date().toLocaleString(),
          accion: 'Radicación & Pago $150',
          usuario: `${data.nombre} (Cliente)`,
          detalle: `Cobro $150 procesado. Asignado a ${cpaAsignado.nombre} (${cpaAsignado.codigoCPA}). Carpeta: ${carpetaPath}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCases(prev => [nuevoCaso, ...prev]);
    return nuevoCaso;
  };

  const actualizarCaso = (casoId: string, updates: Partial<TaxCase>, logDetalle?: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id !== casoId) return c;

        const updatedHistory = [...c.historial];
        if (logDetalle) {
          updatedHistory.push({
            id: `h-${Date.now()}`,
            fecha: new Date().toLocaleString(),
            accion: 'Actualización de Expediente',
            usuario: currentUser?.nombre || 'Usuario Autorizado',
            detalle: logDetalle,
          });
        }

        return {
          ...c,
          ...updates,
          historial: updatedHistory,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const borrarCasoConLog = (casoId: string, motivo: string) => {
    setCases(prev =>
      prev.filter(c => {
        if (c.id === casoId) {
          console.log(`[AUDIT LOG] Caso ${c.casoNumero} eliminado por ${currentUser?.nombre || 'Admin'}. Motivo: ${motivo}`);
          return false;
        }
        return true;
      })
    );
  };

  const firmarAprobarCPA = (casoId: string, firmaDataUrl: string) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id !== casoId) return c;

        const updatedHistory = [
          ...c.historial,
          {
            id: `h-${Date.now()}`,
            fecha: new Date().toLocaleString(),
            accion: 'Firma Oficial CPA & Aprobación',
            usuario: currentUser?.nombre || c.cpaNombre || 'CPA Asignado',
            detalle: 'Firma digital registrada bajo responsabilidad IRS Circular 230 y Confidencialidad IRC 7216. Comisión de $45 lista para cobro.',
          },
        ];

        return {
          ...c,
          status: 'APROBADA',
          contratoStatus: 'FIRMADO',
          cpaFirma: {
            dataUrl: firmaDataUrl,
            fecha: new Date().toISOString(),
            declaracionLegal: 'Certifico bajo pena de perjurio que he examinado esta declaración y sus anexos con debida diligencia conforme a la Circular 230 del IRS.',
          },
          historial: updatedHistory,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const pagarComisionOnline = (cpaId: string) => {
    const cpa = users.find(u => u.id === cpaId);
    if (!cpa) return null;

    // Buscar casos aprobados de este CPA con comisión pendiente
    const casosAprobadosPendientes = cases.filter(
      c => (c.cpaUserId === cpaId || c.cpaCodigo === cpa.codigoCPA) && c.status === 'APROBADA' && c.comisionStatus === 'PENDIENTE'
    );

    if (casosAprobadosPendientes.length === 0) return null;

    const montoTotal = casosAprobadosPendientes.reduce((acc, curr) => acc + (curr.comisionMonto || 45), 0);
    const refBHD = `BHD-08694150021-TR-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const nuevoPago: PagoComision = {
      id: `pago-${Date.now()}`,
      cpaId: cpa.id,
      cpaCodigo: cpa.codigoCPA || 'CPA-NY-12345',
      cpaNombre: cpa.nombre,
      cpaEstado: cpa.estado,
      monto: montoTotal,
      casosIncluidos: casosAprobadosPendientes.map(c => c.casoNumero),
      metodoPago: `Transferencia Electrónica BHD Cuenta 08694150021 -> ${cpa.bancoNombre || 'Banco'} (${cpa.bancoNumero || '****1234'})`,
      bancoDestino: `${cpa.bancoNombre || 'Banco'} ${cpa.bancoNumero || '****1234'} - Routing: ${cpa.bancoRouting || 'N/A'}`,
      comprobanteUrl: `/PAYOUTS/2024/${cpa.codigoCPA || 'CPA'}/COMPROBANTE-${Date.now()}.pdf`,
      referenciaBHD: refBHD,
      fechaPago: new Date().toLocaleString(),
      estado: 'PAGADO',
    };

    // Actualizar casos a PAGADO
    const casosIdsAprobados = new Set(casosAprobadosPendientes.map(c => c.id));
    setCases(prev =>
      prev.map(c => {
        if (casosIdsAprobados.has(c.id)) {
          return {
            ...c,
            comisionStatus: 'PAGADO',
            historial: [
              ...c.historial,
              {
                id: `h-${Date.now()}`,
                fecha: new Date().toLocaleString(),
                accion: 'Liquidación de Comisión $45',
                usuario: 'Admin Matriz BHD',
                detalle: `Pago de comisión procesado con Referencia BHD: ${refBHD}`,
              },
            ],
          };
        }
        return c;
      })
    );

    setPayouts(prev => [nuevoPago, ...prev]);
    return nuevoPago;
  };

  const exportarExcelCSV = (tipo: 'clientes' | 'firmas' | 'payouts' | 'matriz_completa') => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `audit-intelligence-${tipo}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (tipo === 'clientes' || tipo === 'matriz_completa') {
      csvContent += 'CASO,CLIENTE,ESTADO,EMAIL,TELEFONO,COBRADO,CPA_CODIGO,CPA_NOMBRE,STATUS,COMISION,CARPETA\n';
      cases.forEach(c => {
        csvContent += `"${c.casoNumero}","${c.clienteNombre}","${c.estado}","${c.clienteEmail}","${c.clienteTelefono || ''}",$${c.montoCobrado},"${c.cpaCodigo || ''}","${c.cpaNombre || ''}","${c.status}","${c.comisionStatus} (${c.comisionMonto})","${c.carpetaPath}"\n`;
      });
    } else if (tipo === 'firmas') {
      csvContent += 'CODIGO_CPA,NOMBRE_CPA,ESTADO,EMAIL,TELEFONO,BANCO,NUMERO_CUENTA,ROUTING,LICENCIA,PTIN,ESTADO_ACTIVO\n';
      users.filter(u => u.rol === 'CONTADOR' || u.rol === 'FIRMA').forEach(u => {
        csvContent += `"${u.codigoCPA || ''}","${u.nombre}","${u.estado}","${u.email || ''}","${u.telefono || ''}","${u.bancoNombre || ''}","${u.bancoNumero || ''}","${u.bancoRouting || ''}","${u.licencia || ''}","${u.ptin || ''}","${u.activo ? 'ACTIVO' : 'INACTIVO'}"\n`;
      });
    } else if (tipo === 'payouts') {
      csvContent += 'REFERENCIA_BHD,FECHA,CPA,ESTADO,MONTO,CASOS,BANCO_DESTINO,METODO\n';
      payouts.forEach(p => {
        csvContent += `"${p.referenciaBHD}","${p.fechaPago}","${p.cpaNombre}","${p.cpaEstado}",$${p.monto},"${p.casosIncluidos.join('; ')}","${p.bancoDestino}","${p.metodoPago}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetToDefaults = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}users`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}cases`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}payouts`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    setUsers(INITIAL_USERS);
    setCases(INITIAL_CASES);
    setPayouts(INITIAL_PAYOUTS);
    setCurrentUser(INITIAL_USERS[0]);
    navigate('/admin/matriz');
  };

  // Financial calculations
  const totalCobrado = cases.reduce((acc, curr) => acc + (curr.montoCobrado || 150), 0) + (100 - cases.length > 0 ? (100 - cases.length) * 150 : 0);
  const totalPagado = payouts.reduce((acc, curr) => acc + curr.monto, 0);
  
  // Por pagar: casos en estado APROBADA con comision PENDIENTE
  const totalPorPagar = cases
    .filter(c => c.status === 'APROBADA' && c.comisionStatus === 'PENDIENTE')
    .reduce((acc, curr) => acc + (curr.comisionMonto || 45), 0);

  const netoBHD = totalCobrado - totalPagado;

  const casosAprobados = cases.filter(c => c.status === 'APROBADA').length;
  const casosEnTramite = cases.filter(c => c.status === 'EN_TRAMITE').length;
  const casosRealizadas = cases.filter(c => c.status === 'REALIZADA').length;

  const porEstado: Record<USState, { cobrado: number; casos: number }> = {
    NY: { cobrado: 3800, casos: cases.filter(c => c.estado === 'NY').length },
    FL: { cobrado: 2200, casos: cases.filter(c => c.estado === 'FL').length },
    TX: { cobrado: 1900, casos: cases.filter(c => c.estado === 'TX').length },
    NJ: { cobrado: 1400, casos: cases.filter(c => c.estado === 'NJ').length },
    RD: { cobrado: 1200, casos: cases.filter(c => c.estado === 'RD').length },
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        cases,
        payouts,
        activeRoute,
        selectedCaseForModal,
        selectedDocForPreview,
        navigate,
        setSelectedCaseForModal,
        setSelectedDocForPreview,
        login,
        switchRoleDemo,
        logout,
        registerUser,
        cambiarClave,
        crearCasoTax,
        actualizarCaso,
        borrarCasoConLog,
        firmarAprobarCPA,
        pagarComisionOnline,
        exportarExcelCSV,
        resetToDefaults,
        financialStats: {
          totalCobrado: Math.max(15000, totalCobrado),
          totalPagado: Math.max(3600, totalPagado),
          totalPorPagar,
          netoBHD: Math.max(10500, netoBHD),
          casosAprobados,
          casosEnTramite,
          casosRealizadas,
          porEstado,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
