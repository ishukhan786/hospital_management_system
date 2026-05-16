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
  UserRole
} from '../types';

import {
  initialUsers,
  initialPatients,
  initialDoctors,
  initialAppointments,
  initialPrescriptions,
  initialLabTests,
  initialFeesOPD,
  initialAdmissions,
  initialFeesIPD,
  initialReceipts,
  initialSettings,
  initialAuditLogs
} from './initialData';

const STORAGE_KEYS = {
  USERS: 'hms_users',
  PATIENTS: 'hms_patients',
  DOCTORS: 'hms_doctors',
  APPOINTMENTS: 'hms_appointments',
  PRESCRIPTIONS: 'hms_prescriptions',
  LAB_TESTS: 'hms_lab_tests',
  FEES_OPD: 'hms_fees_opd',
  ADMISSIONS: 'hms_admissions',
  FEES_IPD: 'hms_fees_ipd',
  RECEIPTS: 'hms_receipts',
  SETTINGS: 'hms_settings',
  AUDIT_LOGS: 'hms_audit_logs',
  CURRENT_USER: 'hms_current_user',
};

// Initialize DB
export const initDB = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(initialPatients));
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(initialDoctors));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initialAppointments));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(initialPrescriptions));
    localStorage.setItem(STORAGE_KEYS.LAB_TESTS, JSON.stringify(initialLabTests));
    localStorage.setItem(STORAGE_KEYS.FEES_OPD, JSON.stringify(initialFeesOPD));
    localStorage.setItem(STORAGE_KEYS.ADMISSIONS, JSON.stringify(initialAdmissions));
    localStorage.setItem(STORAGE_KEYS.FEES_IPD, JSON.stringify(initialFeesIPD));
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(initialReceipts));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initialSettings));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(initialUsers[0])); // Default Super Admin
  }
};

// Generic Helper Functions
const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event('hms_db_update'));
};

// Audit Log Helper
export const addAuditLog = (action: string, details: string) => {
  const currentUser = getCurrentUser();
  const logs = getItems<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    user_id: currentUser ? currentUser.id : 'system',
    user_name: currentUser ? currentUser.name : 'System',
    role: currentUser ? currentUser.role : 'SUPER_ADMIN',
    action,
    details,
    timestamp: new Date().toLocaleString(),
  };
  setItems(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
};

// --- AUTHENTICATION ---
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  addAuditLog('LOGIN/SWITCH_ROLE', `User logged in / switched to role: ${user.role}`);
  window.dispatchEvent(new Event('hms_auth_update'));
};

export const logoutUser = () => {
  addAuditLog('LOGOUT', 'User logged out');
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.dispatchEvent(new Event('hms_auth_update'));
};

// --- USERS MANAGEMENT ---
export const getUsers = (): User[] => getItems(STORAGE_KEYS.USERS);

export const saveUser = (user: User) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
    addAuditLog('UPDATE_USER', `Updated user: ${user.name} (${user.role})`);
  } else {
    users.push(user);
    addAuditLog('CREATE_USER', `Created new user: ${user.name} (${user.role})`);
  }
  setItems(STORAGE_KEYS.USERS, users);

  // If Doctor, sync doctors table
  if (user.role === 'DOCTOR') {
    const doctors = getDoctors();
    const docIndex = doctors.findIndex(d => d.user_id === user.id);
    const doctorObj: Doctor = {
      user_id: user.id,
      specialization: user.specialization || 'General Physician',
      qualification: user.qualification || 'MBBS',
      fee: user.fee || 1500,
      available_days: user.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    };
    if (docIndex >= 0) {
      doctors[docIndex] = doctorObj;
    } else {
      doctors.push(doctorObj);
    }
    setItems(STORAGE_KEYS.DOCTORS, doctors);
  }
};

export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  setItems(STORAGE_KEYS.USERS, users);
  addAuditLog('DELETE_USER', `Deleted user ID: ${id}`);
};

// --- PATIENTS MANAGEMENT ---
export const getPatients = (): Patient[] => getItems(STORAGE_KEYS.PATIENTS);

export const getPatientByNo = (patient_no: string): Patient | undefined => {
  return getPatients().find(p => p.patient_no === patient_no);
};

export const generatePatientNo = (): string => {
  const patients = getPatients();
  const year = new Date().getFullYear();
  const count = patients.length + 1;
  const padded = count.toString().padStart(5, '0');
  return `PT-${year}-${padded}`;
};

export const validateCNIC = (cnic: string): boolean => {
  const regex = /^\d{5}-\d{7}-\d{1}$/;
  return regex.test(cnic);
};

export const checkDuplicateCNIC = (cnic: string, excludePatientNo?: string): boolean => {
  const patients = getPatients();
  return patients.some(p => p.cnic === cnic && p.patient_no !== excludePatientNo);
};

export const savePatient = (patient: Patient): { success: boolean; message: string } => {
  if (!validateCNIC(patient.cnic)) {
    return { success: false, message: 'Invalid CNIC Format. Must be #####-#######-#' };
  }
  if (checkDuplicateCNIC(patient.cnic, patient.patient_no)) {
    return { success: false, message: 'CNIC already exists in the system!' };
  }

  const patients = getPatients();
  const existingIndex = patients.findIndex(p => p.patient_no === patient.patient_no);

  if (existingIndex >= 0) {
    patients[existingIndex] = patient;
    addAuditLog('UPDATE_PATIENT', `Updated patient record: ${patient.name} (${patient.patient_no})`);
  } else {
    patients.push(patient);
    addAuditLog('REGISTER_PATIENT', `Registered new patient: ${patient.name} (${patient.patient_no})`);
  }
  setItems(STORAGE_KEYS.PATIENTS, patients);
  return { success: true, message: 'Patient saved successfully!' };
};

export const deletePatient = (patient_no: string) => {
  const patients = getPatients().filter(p => p.patient_no !== patient_no);
  setItems(STORAGE_KEYS.PATIENTS, patients);
  addAuditLog('DELETE_PATIENT', `Deleted patient: ${patient_no}`);
};

// --- DOCTORS ---
export const getDoctors = (): Doctor[] => getItems(STORAGE_KEYS.DOCTORS);

export const getDoctorDetails = (user_id: string): { user: User; doctor: Doctor } | undefined => {
  const user = getUsers().find(u => u.id === user_id);
  const doctor = getDoctors().find(d => d.user_id === user_id);
  if (user && doctor) return { user, doctor };
  return undefined;
};

// --- APPOINTMENTS ---
export const getAppointments = (): Appointment[] => getItems(STORAGE_KEYS.APPOINTMENTS);

export const bookAppointment = (appointment: Omit<Appointment, 'id' | 'token_no' | 'status'>): Appointment => {
  const appointments = getAppointments();
  // Generate token no for the doctor on that date
  const doctorApts = appointments.filter(a => a.doctor_id === appointment.doctor_id && a.date === appointment.date);
  const token_no = doctorApts.length + 1;
  const newApt: Appointment = {
    ...appointment,
    id: `apt-${Date.now()}`,
    token_no,
    status: 'Booked',
  };
  appointments.push(newApt);
  setItems(STORAGE_KEYS.APPOINTMENTS, appointments);

  // Also generate OPD Fee Unpaid
  const doctorInfo = getDoctorDetails(appointment.doctor_id);
  const feeAmount = doctorInfo ? doctorInfo.doctor.fee : 1500;
  const feesOPD = getFeesOPD();
  feesOPD.push({
    id: `fee-${Date.now()}`,
    patient_id: appointment.patient_id,
    doctor_id: appointment.doctor_id,
    appointment_id: newApt.id,
    amount: feeAmount,
    status: 'Unpaid',
    receipt_no: `REC-OPD-${Date.now().toString().slice(-4)}`,
  });
  setItems(STORAGE_KEYS.FEES_OPD, feesOPD);

  addAuditLog('BOOK_APPOINTMENT', `Booked appointment ${newApt.id} for ${newApt.patient_id}`);
  return newApt;
};

export const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
  const appointments = getAppointments();
  const apt = appointments.find(a => a.id === id);
  if (apt) {
    apt.status = status;
    setItems(STORAGE_KEYS.APPOINTMENTS, appointments);
    addAuditLog('UPDATE_APPOINTMENT', `Updated appointment ${id} status to ${status}`);
  }
};

// --- PRESCRIPTIONS ---
export const getPrescriptions = (): Prescription[] => getItems(STORAGE_KEYS.PRESCRIPTIONS);

export const savePrescription = (prescription: Prescription) => {
  const prescriptions = getPrescriptions();
  prescriptions.push(prescription);
  setItems(STORAGE_KEYS.PRESCRIPTIONS, prescriptions);
  // Mark appointment as Completed
  updateAppointmentStatus(prescription.appointment_id, 'Completed');
  addAuditLog('WRITE_PRESCRIPTION', `Prescription created for Patient: ${prescription.patient_id}`);
};

// --- LAB TESTS ---
export const getLabTests = (): LabTest[] => getItems(STORAGE_KEYS.LAB_TESTS);

export const saveLabTest = (labTest: LabTest) => {
  const tests = getLabTests();
  const index = tests.findIndex(t => t.id === labTest.id);
  if (index >= 0) {
    tests[index] = labTest;
    addAuditLog('UPDATE_LAB_TEST', `Updated lab test ${labTest.test_name} for ${labTest.patient_id}`);
  } else {
    tests.push(labTest);
    addAuditLog('ORDER_LAB_TEST', `Ordered lab test ${labTest.test_name} for ${labTest.patient_id}`);
  }
  setItems(STORAGE_KEYS.LAB_TESTS, tests);
};

// --- CASHIER & FEES ---
export const getFeesOPD = (): FeeOPD[] => getItems(STORAGE_KEYS.FEES_OPD);

export const payFeeOPD = (fee_id: string, payment_mode: 'Cash' | 'Card' | 'Online' = 'Cash'): Receipt | null => {
  const fees = getFeesOPD();
  const fee = fees.find(f => f.id === fee_id);
  if (!fee) return null;

  fee.status = 'Paid';
  fee.paid_at = new Date().toLocaleString();
  setItems(STORAGE_KEYS.FEES_OPD, fees);

  // Generate Receipt
  const receipts = getReceipts();
  const currentUser = getCurrentUser();
  const newReceipt: Receipt = {
    id: `rec-${Date.now()}`,
    patient_id: fee.patient_id,
    total_amount: fee.amount,
    discount: 0,
    paid_amount: fee.amount,
    payment_mode,
    cashier_id: currentUser ? currentUser.id : 'usr-5',
    created_at: fee.paid_at,
    receipt_type: 'OPD',
    reference_id: fee.appointment_id,
  };
  receipts.push(newReceipt);
  setItems(STORAGE_KEYS.RECEIPTS, receipts);

  // Update appointment status to Waiting if it was Booked
  const appointments = getAppointments();
  const apt = appointments.find(a => a.id === fee.appointment_id);
  if (apt && apt.status === 'Booked') {
    apt.status = 'Waiting';
    setItems(STORAGE_KEYS.APPOINTMENTS, appointments);
  }

  addAuditLog('PAY_OPD_FEE', `Paid OPD Fee ${fee.amount} for Patient ${fee.patient_id}`);
  return newReceipt;
};

// --- IPD & ADMISSIONS ---
export const getAdmissions = (): Admission[] => getItems(STORAGE_KEYS.ADMISSIONS);

export const getFeesIPD = (): FeeIPD[] => getItems(STORAGE_KEYS.FEES_IPD);

export const admitPatient = (admission: Omit<Admission, 'id' | 'status'>): Admission => {
  const admissions = getAdmissions();
  const newAdm: Admission = {
    ...admission,
    id: `adm-${Date.now()}`,
    status: 'Admitted',
  };
  admissions.push(newAdm);
  setItems(STORAGE_KEYS.ADMISSIONS, admissions);

  // Update patient type to IPD
  const patients = getPatients();
  const p = patients.find(pat => pat.patient_no === admission.patient_id);
  if (p) {
    p.patient_type = 'IPD';
    setItems(STORAGE_KEYS.PATIENTS, patients);
  }

  addAuditLog('ADMIT_PATIENT', `Admitted patient ${admission.patient_id} to ${admission.ward}`);
  return newAdm;
};

export const addFeeIPD = (feeIPD: Omit<FeeIPD, 'id'>) => {
  const fees = getFeesIPD();
  fees.push({
    ...feeIPD,
    id: `ipd-fee-${Date.now()}`,
  });
  setItems(STORAGE_KEYS.FEES_IPD, fees);
  addAuditLog('ADD_IPD_CHARGE', `Added charge ${feeIPD.charge_type} (${feeIPD.amount}) for Admission ${feeIPD.admission_id}`);
};

export const dischargePatient = (admission_id: string, payment_mode: 'Cash' | 'Card' | 'Online' = 'Cash'): Receipt | null => {
  const admissions = getAdmissions();
  const adm = admissions.find(a => a.id === admission_id);
  if (!adm) return null;

  adm.status = 'Discharged';
  adm.discharge_date = new Date().toLocaleString();
  setItems(STORAGE_KEYS.ADMISSIONS, admissions);

  // Calculate total IPD fee
  const ipdFees = getFeesIPD().filter(f => f.admission_id === admission_id);
  const totalAmount = ipdFees.reduce((sum, f) => sum + f.amount, 0);

  // Generate Receipt
  const receipts = getReceipts();
  const currentUser = getCurrentUser();
  const newReceipt: Receipt = {
    id: `rec-${Date.now()}`,
    patient_id: adm.patient_id,
    total_amount: totalAmount,
    discount: 0,
    paid_amount: totalAmount,
    payment_mode,
    cashier_id: currentUser ? currentUser.id : 'usr-5',
    created_at: adm.discharge_date,
    receipt_type: 'IPD',
    reference_id: admission_id,
  };
  receipts.push(newReceipt);
  setItems(STORAGE_KEYS.RECEIPTS, receipts);

  // Change patient type back to OPD
  const patients = getPatients();
  const p = patients.find(pat => pat.patient_no === adm.patient_id);
  if (p) {
    p.patient_type = 'OPD';
    setItems(STORAGE_KEYS.PATIENTS, patients);
  }

  addAuditLog('DISCHARGE_PATIENT', `Discharged patient ${adm.patient_id} with Total Bill ${totalAmount}`);
  return newReceipt;
};

// --- RECEIPTS ---
export const getReceipts = (): Receipt[] => getItems(STORAGE_KEYS.RECEIPTS);

// --- SETTINGS ---
export const getSettings = (): HospitalSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : initialSettings;
};

export const saveSettings = (settings: HospitalSettings) => {
  setItems(STORAGE_KEYS.SETTINGS, [settings]); // stored as single object wrapped or direct
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  addAuditLog('UPDATE_SETTINGS', 'Updated hospital settings');
  window.dispatchEvent(new Event('hms_settings_update'));
};

// --- AUDIT LOGS ---
export const getAuditLogs = (): AuditLog[] => getItems(STORAGE_KEYS.AUDIT_LOGS);
