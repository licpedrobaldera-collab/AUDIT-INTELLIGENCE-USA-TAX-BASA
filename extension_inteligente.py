import json
import numpy as np
import pandas as pd
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class HistoricoPerfilCliente(Base):
    """Almacena y aprende los patrones recurrentes del contribuyente año tras año."""
    __tablename__ = "historico_perfil_cliente"
    id = Column(Integer, primary_key=True)
    cliente_id = Column(Integer, nullable=False, index=True)
    anio_fiscal = Column(Integer, nullable=False)
    estado_codigo = Column(String(5), nullable=False)
    
    # Datos estructurales para aprendizaje y migración
    datos_familiares = Column(JSON, default={})      # Estado civil, dependientes
    direccion_actual = Column(JSON, default={})      # Calle, ciudad, zip
    empleadores_fuentes = Column(JSON, default=[])   # Lista de empleadores W-2 / 1099
    resumen_financiero = Column(JSON, default={})    # Ingresos brutos, deducciones, retenciones
    indice_estabilidad = Column(Float, default=100.0)
    fecha_registro = Column(DateTime, default=datetime.utcnow)

class MotorAutodinamicoIA:
    """Gestiona validación 10/10, auto-ayuda en rojo, migración y comparativos."""
    
    GUIA_EJEMPLOS_ESTADO = {
        "NY": {
            "w2_box1": "Ejemplo NY: Ingrese el monto exacto de la Casilla 1 de su W-2 (ej. 68500.00). Adjunte PDF legible.",
            "residente_nyc": "Ejemplo NY: Indique 'Sí' solo si vivió en los 5 condados de NYC durante el año fiscal."
        },
        "DEFAULT": {
            "w2_box1": "Ejemplo General: Copie el valor de la Casilla 1 (Wages, tips) de su formulario W-2 sin signos de moneda.",
            "evidencia_id": "Ejemplo Documento: Suba foto frontal clara de su licencia de conducir o pasaporte vigente."
        }
    }

    def __init__(self, db_session):
        self.db = db_session

    def evaluar_campo_con_semaforo(self, estado: str, campo: str, valor, evidencia_adjunta: bool, es_pendiente: bool, no_aplica: bool) -> dict:
        """Determina el color del semáforo, oculta guías al llegar a 10/10 y sugiere opciones."""
        if no_aplica:
            return {"estatus": "NO_APLICA", "color": "GRIS", "puntaje": 10, "mostrar_guia": False, "mensaje": ""}
        
        if es_pendiente and (valor is None or str(valor).strip() == ""):
            return {
                "estatus": "PENDIENTE",
                "color": "AMARILLO",
                "puntaje": 5,
                "mostrar_guia": True,
                "mensaje": "Campo marcado como pendiente. Puede continuar llenando otras secciones, pero deberá completarlo antes de firmar."
            }

        # Validación de error o falta de evidencia -> Alerta Roja con ejemplo dinámico
        guia_estado = self.GUIA_EJEMPLOS_ESTADO.get(estado, self.GUIA_EJEMPLOS_ESTADO["DEFAULT"])
        ejemplo = guia_estado.get(campo, "Verifique el formato del dato según su documento oficial.")

        if valor is None or str(valor).strip() == "":
            return {
                "estatus": "ERROR_DATO",
                "color": "ROJO",
                "puntaje": 0,
                "mostrar_guia": True,
                "mensaje": f"Dato obligatorio faltante. {ejemplo}"
            }

        if campo.startswith("w2_") and not evidencia_adjunta:
            return {
                "estatus": "FALTA_EVIDENCIA",
                "color": "ROJO",
                "puntaje": 4,
                "mostrar_guia": True,
                "mensaje": f"Falta documento de respaldo. Pasos: 1) Escanee su W-2. 2) Súbalo en PDF/JPG. {ejemplo}"
            }

        # Validación exitosa 10/10 -> Color Azul y oculta guía
        return {
            "estatus": "APROBADO_10_10",
            "color": "AZUL",
            "puntaje": 10,
            "mostrar_guia": False,
            "mensaje": "Validado 10/10 por IA."
        }

    def migrar_version_anterior(self, cliente_id: int, anio_destino: int) -> dict:
        """Recupera datos del año previo y marca campos que requieren confirmación obligatoria."""
        previo = (
            self.db.query(HistoricoPerfilCliente)
            .filter(HistoricoPerfilCliente.cliente_id == cliente_id, HistoricoPerfilCliente.anio_fiscal < anio_destino)
            .order_by(HistoricoPerfilCliente.anio_fiscal.desc())
            .first()
        )
        if not previo:
            return {"migrado": False, "mensaje": "No se encontraron declaraciones previas para migrar."}

        return {
            "migrado": True,
            "anio_origen": previo.anio_fiscal,
            "datos_precargados": {
                "estado_codigo": previo.estado_codigo,
                "datos_familiares": previo.datos_familiares,
                "direccion_actual": previo.direccion_actual,
                "empleadores_fuentes": previo.empleadores_fuentes
            },
            "campos_validar_obligatorios": [
                "Confirmar si mantiene la misma dirección física actual",
                "Verificar continuidad laboral con empleadores del año anterior",
                "Actualizar montos de ingresos W-2 / 1099 correspondientes al nuevo período"
            ]
        }

    def analizar_comparativo_y_estabilidad(self, cliente_id: int, datos_actuales: dict) -> dict:
        """Compara año actual vs históricos con NumPy y mide estabilidad laboral/financiera."""
        historicos = (
            self.db.query(HistoricoPerfilCliente)
            .filter_by(cliente_id=cliente_id)
            .order_by(HistoricoPerfilCliente.anio_fiscal.asc())
            .all()
        )
        
        ingreso_actual = float(datos_actuales.get("ingreso_bruto", 0.0))
        ingresos_previos = [float(h.resumen_financiero.get("ingreso_bruto", 0.0)) for h in historicos]
        
        if not ingresos_previos:
            return {"estabilidad": "SIN_HISTORICO_PREVIO", "variacion_porcentual": 0.0, "tabla_comparativa": []}

        promedio_historico = float(np.mean(ingresos_previos))
        ultimo_ingreso = ingresos_previos[-1]
        variacion = ((ingreso_actual - ultimo_ingreso) / ultimo_ingreso * 100.0) if ultimo_ingreso > 0 else 0.0

        estabilidad = "ESTABLE" if abs(variacion) <= 15.0 else ("CRECIMIENTO" if variacion > 15.0 else "VARIACION_SIGNIFICATIVA")

        tabla = []
        for h in historicos:
            tabla.append({
                "Periodo": h.anio_fiscal,
                "Estado": h.estado_codigo,
                "Ingreso_Bruto": h.resumen_financiero.get("ingreso_bruto", 0.0),
                "Deducciones": h.resumen_financiero.get("deducciones", 0.0),
                "Empleadores": ", ".join(h.empleadores_fuentes)
            })
        tabla.append({
            "Periodo": "ACTUAL (PRELIMINAR)",
            "Estado": datos_actuales.get("estado_codigo", ""),
            "Ingreso_Bruto": ingreso_actual,
            "Deducciones": datos_actuales.get("deducciones", 0.0),
            "Empleadores": ", ".join(datos_actuales.get("empleadores_fuentes", []))
        })

        return {
            "estabilidad_laboral_ingresos": estabilidad,
            "promedio_historico_usd": round(promedio_historico, 2),
            "variacion_vs_ultimo_anio_pct": round(variacion, 2),
            "tabla_comparativa": tabla
        }

    def exportar_preliminar_excel(self, tabla_comparativa: list, ruta_salida: str) -> str:
        """Genera el archivo Excel preliminar editado y validado para revisión."""
        df = pd.DataFrame(tabla_comparativa)
        df.to_excel(ruta_salida, index=False, sheet_name="Comparativo_Fiscal_IA")
        return ruta_salida
