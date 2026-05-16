-- ====================================================================
-- SUPABASE POSTGRESQL MULTI-TENANT SAAS SCHEMA FOR HOSPITAL MANAGEMENT
-- Copy and paste this script into your Supabase SQL Editor and click Run.
-- ====================================================================

-- 0. Tenant Hospitals Table (SaaS Multi-Tenancy)
CREATE TABLE IF NOT EXISTS public.tenant_hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    joined_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    max_doctors INTEGER NOT NULL,
    max_staff INTEGER NOT NULL
);

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL, -- 'saas-master' or tenant_hospitals.id
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    specialization TEXT,
    qualification TEXT,
    fee INTEGER,
    available_days TEXT[]
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    patient_no TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    cnic TEXT NOT NULL,
    mobile TEXT NOT NULL,
    dob TEXT NOT NULL,
    gender TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    registered_date TEXT NOT NULL,
    patient_type TEXT NOT NULL,
    photo_url TEXT,
    UNIQUE(hospital_id, cnic)
);

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    hospital_id TEXT NOT NULL REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    qualification TEXT NOT NULL,
    fee INTEGER NOT NULL,
    available_days TEXT[] NOT NULL
);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(patient_no) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    token_no INTEGER NOT NULL,
    status TEXT NOT NULL,
    type TEXT NOT NULL
);

-- 5. Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    appointment_id TEXT NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(patient_no) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    complaint TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    advice TEXT,
    followup_date TEXT,
    created_at TEXT NOT NULL,
    medicines JSONB NOT NULL DEFAULT '[]'::JSONB
);

-- 6. Lab Tests Table
CREATE TABLE IF NOT EXISTS public.lab_tests (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(patient_no) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    result TEXT,
    normal_range TEXT NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL,
    report_date TEXT,
    remarks TEXT,
    is_abnormal BOOLEAN DEFAULT FALSE
);

-- 7. OPD Fees Table
CREATE TABLE IF NOT EXISTS public.fees_opd (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(patient_no) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    appointment_id TEXT NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    receipt_no TEXT NOT NULL,
    paid_at TEXT
);

-- 8. Admissions Table
CREATE TABLE IF NOT EXISTS public.admissions (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(patient_no) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    admit_date TEXT NOT NULL,
    discharge_date TEXT,
    ward TEXT NOT NULL,
    bed_no TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL
);

-- 9. IPD Fees Table
CREATE TABLE IF NOT EXISTS public.fees_ipd (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    admission_id TEXT NOT NULL REFERENCES public.admissions(id) ON DELETE CASCADE,
    charge_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    date TEXT NOT NULL
);

-- 10. Receipts Table
CREATE TABLE IF NOT EXISTS public.receipts (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES public.patients(patient_no) ON DELETE CASCADE,
    total_amount INTEGER NOT NULL,
    discount INTEGER DEFAULT 0,
    paid_amount INTEGER NOT NULL,
    payment_mode TEXT NOT NULL,
    cashier_id TEXT NOT NULL REFERENCES public.users(id),
    created_at TEXT NOT NULL,
    receipt_type TEXT NOT NULL,
    reference_id TEXT NOT NULL
);

-- 11. Hospital Settings Table
CREATE TABLE IF NOT EXISTS public.hospital_settings (
    id TEXT PRIMARY KEY REFERENCES public.tenant_hospitals(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL,
    hospital_logo TEXT NOT NULL,
    departments TEXT[] NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    hospital_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT NOT NULL
);

-- ====================================================================
-- ENABLE REALTIME FOR ALL TABLES
-- ====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.doctors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_tests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fees_opd;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fees_ipd;
ALTER PUBLICATION supabase_realtime ADD TABLE public.receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospital_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
