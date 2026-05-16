export type UserRole = 'SUPER_ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'CASHIER' | 'LAB_STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  specialization?: string; // For doctors
  qualification?: string; // For doctors
  fee?: number; // For doctors
  available_days?: string[]; // For doctors
}

export type PatientType = 'OPD' | 'IPD';

export interface Patient {
  patient_no: string; // PT-YYYY-XXXXX
  name: string;
  father_name: string;
  cnic: string; // #####-#######-#
  mobile: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: string;
  address: string;
  city: string;
  registered_date: string;
  patient_type: PatientType;
  photo_url?: string;
}

export interface Doctor {
  user_id: string;
  specialization: string;
  qualification: string;
  fee: number;
  available_days: string[];
}

export type AppointmentStatus = 'Booked' | 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled';
export type AppointmentType = 'New' | 'Follow-up';

export interface Appointment {
  id: string;
  patient_id: string; // patient_no
  doctor_id: string; // user_id
  date: string;
  time_slot: string;
  token_no: number;
  status: AppointmentStatus;
  type: AppointmentType;
}

export interface Medicine {
  id: string;
  prescription_id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  complaint: string;
  diagnosis: string;
  advice: string;
  followup_date: string;
  created_at: string;
  medicines: Medicine[];
}

export type LabTestStatus = 'Pending' | 'Processing' | 'Completed';

export interface LabTest {
  id: string;
  patient_id: string;
  doctor_id: string;
  test_name: string;
  result: string;
  normal_range: string;
  unit: string;
  status: LabTestStatus;
  report_date?: string;
  remarks?: string;
  is_abnormal?: boolean;
}

export type FeeStatus = 'Paid' | 'Unpaid' | 'Partial';

export interface FeeOPD {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string;
  amount: number;
  status: FeeStatus;
  receipt_no: string;
  paid_at?: string;
}

export type AdmissionStatus = 'Admitted' | 'Discharged';

export interface Admission {
  id: string;
  patient_id: string;
  doctor_id: string;
  admit_date: string;
  discharge_date?: string;
  ward: string;
  bed_no: string;
  reason: string;
  status: AdmissionStatus;
}

export interface FeeIPD {
  id: string;
  admission_id: string;
  charge_type: string;
  amount: number;
  date: string;
}

export interface Receipt {
  id: string;
  patient_id: string;
  total_amount: number;
  discount: number;
  paid_amount: number;
  payment_mode: 'Cash' | 'Card' | 'Online';
  cashier_id: string;
  created_at: string;
  receipt_type: 'OPD' | 'IPD';
  reference_id: string; // appointment_id or admission_id
}

export interface HospitalSettings {
  hospital_name: string;
  hospital_logo: string;
  departments: string[];
  address: string;
  phone: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
