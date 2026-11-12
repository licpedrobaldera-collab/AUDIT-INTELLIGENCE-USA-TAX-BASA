# AUDIT-INTELLIGENCE USA TAX (PRODUCTION SYSTEM V2.4)

Plataforma unificada de radicación tributaria en Estados Unidos, auditoría contable certificada (Circular 230 del IRS & Sección 7216 del IRC), gestión de expedientes criptográficos y liquidación electrónica de comisiones para Contadores Públicos Autorizados (CPAs).

Compatible de forma nativa para **PC, Laptop, Tablet / iPad, Móvil / Celular** y despliegue directo en **GitHub, Vercel, Docker y Streamlit**.

---

## 🚀 Arquitectura y Capacidades Principales

1. **Radicación de Declaraciones Tributarias ($150 USD)**
   - Soporte para **los 50 Estados de EE.UU.** (NY, FL, TX, CA, NJ, IL, PA, OH, GA, etc.) + Puerto Rico y Expatriados/Internacional.
   - Subida y vinculación de expedientes con los 8 soportes tributarios oficiales (W-2, 1099-NEC, Photo ID, Schedule Deductions, SSN/ITIN, 1099-INT, comprobante de domicilio, acuerdo de representación).
   - Canvas de firma digital táctil/mouse con plena validez jurídica bajo **ESIGN Act** y **UETA**.
   - Asignación oficial a un CPA colegiado con PTIN y licencia verificada.

2. **CPA Dashboard & Visualización Recharts**
   - Panel de control interactivo con métricas reales.
   - **Componente Recharts integrado**: Gráficos interactivos de pastel (PieChart) y barras (BarChart) para monitoreo visual en tiempo real de la distribución de estatus: **Realizadas vs. En Trámite vs. Aprobadas**.
   - Examen de soportes en línea, descarga de paquete de expediente ZIP y edición de notas de auditoría.
   - Contrato Oficial de Firma del CPA para aprobación e-file con generación de comisión de **$45.00 USD**.

3. **Privacidad y Matriz de Liquidación Bancaria**
   - Datos bancarios y números de cuenta protegidos: **no visibles en portada**, mostrándose únicamente de manera segura en el momento exacto de la liquidación bancaria de comisiones a los CPAs.
   - Emisión de comprobantes oficiales con código de referencia único descargable en formato PDF/TXT.
   - Base de datos limpia de casos reales (cero casos fantasmas).

4. **Multi-Dispositivo & Multi-Plataforma**
   - 100% responsive: diseño adaptativo para celulares, tablets y computadoras de escritorio.
   - Compatible como API REST, aplicación web SPA Vite/React y frontend integrable con microservicios en Python/Streamlit.

---

## 💻 Ejecución Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 🐍 Compatibilidad Streamlit / Python Bridge (Opcional)

Si deseas conectar el sistema a un backend de Streamlit (`app.py`), puedes ejecutar:

```bash
pip install streamlit requests
streamlit run streamlit_app.py
```

El frontend React se comunica vía API REST JSON con cualquier servicio backend.

---

## 📄 Licencia y Cumplimiento
Desarrollado bajo cumplimiento estricto con las regulaciones del Departamento del Tesoro de EE.UU. (IRS Treasury Circular 230) y normativas de confidencialidad de la información tributaria (IRC § 7216).
