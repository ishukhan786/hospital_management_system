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
  AuditLog
} from '../types';

// Only keep 1 Super Admin account so the system can be accessed
export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'System Super Admin',
    email: 'admin@hms.com',
    password_hash: 'hashed_password',
    role: 'SUPER_ADMIN',
    is_active: true,
  }
];

export const initialPatients: Patient[] = [];
export const initialDoctors: Doctor[] = [];
export const initialAppointments: Appointment[] = [];
export const initialPrescriptions: Prescription[] = [];
export const initialLabTests: LabTest[] = [];
export const initialFeesOPD: FeeOPD[] = [];
export const initialAdmissions: Admission[] = [];
export const initialFeesIPD: FeeIPD[] = [];
export const initialReceipts: Receipt[] = [];

export const initialSettings: HospitalSettings = {
  hospital_name: 'MedCare General Hospital',
  hospital_logo: '🏥',
  departments: ['Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'General Surgery', 'Gynecology'],
  address: '123 Health Avenue, Medical District, City',
  phone: '+92 21 34567890',
};

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    user_id: 'usr-1',
    user_name: 'System Super Admin',
    role: 'SUPER_ADMIN',
    action: 'SYSTEM_CLEAN_INIT',
    details: 'System initialized in clean production mode. All placeholder data cleared.',
    timestamp: new Date().toLocaleString(),
  }
];
