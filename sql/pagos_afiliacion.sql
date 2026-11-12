-- Esquema SQL de Producción: Membresía Sociedad de Contadores ($50.00 USD)
-- Compatible con MySQL / MariaDB (y adaptable a PostgreSQL / SQLite)

CREATE TABLE IF NOT EXISTS pagos_afiliacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contador_id VARCHAR(50) NOT NULL,
    monto DECIMAL(10, 2) DEFAULT 50.00,
    moneda VARCHAR(3) DEFAULT 'USD',
    concepto VARCHAR(150) DEFAULT 'Cuota de afiliacion sociedad de contadores',
    modalidad ENUM('PAGO_VIRTUAL', 'TRANSFERENCIA_BANCO_SISTEMA', 'RETENCION_PRIMEROS_INGRESOS') DEFAULT 'PAGO_VIRTUAL',
    estado ENUM('PENDIENTE', 'PAGADO', 'FALLIDO') DEFAULT 'PENDIENTE',
    referencia_pasarela VARCHAR(255),
    cuenta_por_cobrar_saldo DECIMAL(10, 2) DEFAULT 50.00,
    clausula_contractual_aceptada BOOLEAN DEFAULT FALSE,
    fecha_pago DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configuración de cuenta bancaria receptora asignada al sistema (editable por Administrador)
CREATE TABLE IF NOT EXISTS cuentas_bancarias_sistema (
    id VARCHAR(50) PRIMARY KEY,
    banco_nombre VARCHAR(120) NOT NULL,
    titular VARCHAR(120) NOT NULL,
    numero_cuenta VARCHAR(80) NOT NULL,
    routing_swift VARCHAR(50) NOT NULL,
    tipo_cuenta VARCHAR(80) NOT NULL,
    instrucciones TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
