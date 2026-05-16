import {
  User,
  Patient,
  Doctor,
  Appointment,
  Prescription,
  LabTest,
  FeeOPD,
  Admission,
  FeeIPD,
  Receipt,
  HospitalSettings,
  AuditLog,
  TenantHospital
} from '../types';

export const initialTenants: TenantHospital[] = [
  {
    id: 'hospital-1',
    name: 'MedCare General Hospital',
    logo: '🏥',
    address: '123 Health Avenue, Medical District, City',
    phone: '+92 21 34567890',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    joined_date: '2026-05-01',
    expiry_date: '2027-05-01',
    owner_name: 'Dr. Sarah Jenkins',
    owner_email: 'admin@hms.com',
    max_doctors: 100,
    max_staff: 500,
  },
  {
    id: 'hospital-2',
    name: 'City Health Clinic',
    logo: '🏨',
    address: '45B Commercial Area, Phase 2',
    phone: '+92 42 35789012',
    plan: 'BASIC',
    status: 'ACTIVE',
    joined_date: '2026-05-10',
    expiry_date: '2027-05-10',
    owner_name: 'Tariq Mehmood',
    owner_email: 'tariq@cityclinic.com',
    max_doctors: 3,
    max_staff: 10,
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr-saas-master',
    hospital_id: 'saas-master',
    name: 'SaaS Platform Owner',
    email: 'superadmin@saas.com',
    password_hash: 'hashed_password',
    role: 'SAAS_MASTER_ADMIN',
    is_active: true,
  },
  {
    id: 'usr-1',
    hospital_id: 'hospital-1',
    name: 'System Super Admin (MedCare)',
    email: 'admin@hms.com',
    password_hash: 'hashed_password',
    role: 'SUPER_ADMIN',
    is_active: true,
  },
  {
    id: 'usr-2',
    hospital_id: 'hospital-1',
    name: 'Emily Watson',
    email: 'reception@hms.com',
    password_hash: 'hashed_password',
    role: 'RECEPTIONIST',
    is_active: true,
  },
  {
    id: 'usr-3',
    hospital_id: 'hospital-1',
    name: 'Dr. Robert Chen',
    email: 'doctor@hms.com',
    password_hash: 'hashed_password',
    role: 'DOCTOR',
    is_active: true,
    specialization: 'Cardiology',
    qualification: 'MBBS, MD',
    fee: 2500,
    available_days: ['Monday', 'Wednesday', 'Friday'],
  },
  {
    id: 'usr-5',
    hospital_id: 'hospital-1',
    name: 'Michael Chang',
    email: 'cashier@hms.com',
    password_hash: 'hashed_password',
    role: 'CASHIER',
    is_active: true,
  },
  {
    id: 'usr-6',
    hospital_id: 'hospital-1',
    name: 'David Miller',
    email: 'lab@hms.com',
    password_hash: 'hashed_password',
    role: 'LAB_STAFF',
    is_active: true,
  },
  // Hospital 2 Staff
  {
    id: 'usr-h2-1',
    hospital_id: 'hospital-2',
    name: 'Tariq Mehmood (City Clinic)',
    email: 'tariq@cityclinic.com',
    password_hash: 'hashed_password',
    role: 'SUPER_ADMIN',
    is_active: true,
  }
];

export const initialPatients: Patient[] = [];
export const initialDoctors: Doctor[] = [
  {
    user_id: 'usr-3',
    hospital_id: 'hospital-1',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD',
    fee: 2500,
    available_days: ['Monday', 'Wednesday', 'Friday'],
  }
];
export const initialAppointments: Appointment[] = [];
export const initialPrescriptions: Prescription[] = [];
export const initialLabTests: LabTest[] = [];
export const initialFeesOPD: FeeOPD[] = [];
export const initialAdmissions: Admission[] = [];
export const initialFeesIPD: FeeIPD[] = [];
export const initialReceipts: Receipt[] = [];

export const initialSettings: HospitalSettings = {
  id: 'hospital-1',
  hospital_name: 'MedCare General Hospital',
  hospital_logo: '🏥',
  departments: ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Surgery', 'Gynecology'],
  address: '123 Health Avenue, Medical District, City',
  phone: '+92 21 34567890',
};

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    hospital_id: 'saas-master',
    user_id: 'usr-saas-master',
    user_name: 'SaaS Platform Owner',
    role: 'SAAS_MASTER_ADMIN',
    action: 'SAAS_INIT',
    details: 'Multi-Tenant SaaS Platform initialized with 2 default hospital tenants.',
    timestamp: new Date().toLocaleString(),
  }
];
