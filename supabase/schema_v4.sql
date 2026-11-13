-- Supabase PostgreSQL + Storage Schema (Zero-Cost Tier)
-- Audit Intelligence GlobalTaxEngine V3.0 + SelfHealingCore V4.0

create extension if not exists "pgcrypto";

-- 1. Expedientes Tributarios Multi-País
create table if not exists public.global_tax_cases (
  id uuid primary key default gen_random_uuid(),
  case_id text unique not null,
  client_name text not null,
  country_code text not null default 'US',
  tax_year integer not null default 2026,
  entity_type text not null check (entity_type in ('INDIVIDUAL', 'CORPORATE', 'NON_PROFIT')),
  sector_code text not null,
  folder_path text not null,
  total_fee numeric(12, 2) not null default 150.00,
  status text not null default 'AUTO_POPULATED',
  compliance_score integer not null default 100,
  validated_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Pagos de Afiliación Sociedad de Contadores ($50 USD)
create table if not exists public.pagos_afiliacion (
  id bigserial primary key,
  contador_id text not null,
  contador_nombre text not null,
  contador_email text,
  monto numeric(10, 2) not null default 50.00,
  moneda text not null default 'USD',
  modalidad text not null,
  estado text not null default 'PENDIENTE',
  pasarela text,
  referencia_pasarela text,
  fecha_pago timestamptz,
  created_at timestamptz not null default now()
);

-- 3. Bitácora de Autorreparación e Incidencias (SelfHealingCore V4.0)
create table if not exists public.self_healing_incidents (
  id bigserial primary key,
  incident_id text unique not null,
  module text not null,
  severity text not null check (severity in ('LOW', 'MEDIUM', 'CRITICAL')),
  error_detected text not null,
  auto_repair_action text not null,
  resolved boolean not null default true,
  resolution_time_ms integer not null default 0,
  created_at timestamptz not null default now()
);

-- 4. Certificados de Auditoría 100/100
create table if not exists public.audit_certificates_100 (
  id uuid primary key default gen_random_uuid(),
  report_id text unique not null,
  case_id text not null,
  client_name text not null,
  country_code text not null,
  compliance_score integer not null default 100,
  applied_corrections jsonb not null default '[]'::jsonb,
  executive_justification text not null,
  generated_at timestamptz not null default now()
);

-- 5. Bucket de Almacenamiento para Expedientes y PDFs (/expedientes/{PAIS}/{AÑO}/...)
insert into storage.buckets (id, name, public)
values ('expedientes', 'expedientes', false)
on conflict (id) do nothing;
