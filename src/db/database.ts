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

import {
  initialTenants,
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

import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  TENANTS: 'hms_tenants',
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

// Generic Helper Functions for Local Storage Cache
const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new Event('hms_db_update'));
};

// --- SUPABASE SYNCHRONIZATION ENGINE ---
export const syncAllFromSupabase = async () => {
  try {
    const [
      { data: tenants },
      { data: users },
      { data: patients },
      { data: doctors },
      { data: appointments },
      { data: prescriptions },
      { data: labTests },
      { data: feesOPD },
      { data: admissions },
      { data: feesIPD },
      { data: receipts },
      { data: settings },
      { data: auditLogs }
    ] = await Promise.all([
      supabase.from('tenant_hospitals').select('*'),
      supabase.from('users').select('*'),
      supabase.from('patients').select('*'),
      supabase.from('doctors').select('*'),
      supabase.from('appointments').select('*'),
      supabase.from('prescriptions').select('*'),
      supabase.from('lab_tests').select('*'),
      supabase.from('fees_opd').select('*'),
      supabase.from('admissions').select('*'),
      supabase.from('fees_ipd').select('*'),
      supabase.from('receipts').select('*'),
      supabase.from('hospital_settings').select('*'),
      supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })
    ]);

    let updated = false;

    if (tenants && tenants.length > 0) { setItems(STORAGE_KEYS.TENANTS, tenants); updated = true; }
    if (users && users.length > 0) { setItems(STORAGE_KEYS.USERS, users); updated = true; }
    if (patients && patients.length > 0) { setItems(STORAGE_KEYS.PATIENTS, patients); updated = true; }
    if (doctors && doctors.length > 0) { setItems(STORAGE_KEYS.DOCTORS, doctors); updated = true; }
    if (appointments && appointments.length > 0) { setItems(STORAGE_KEYS.APPOINTMENTS, appointments); updated = true; }
    if (prescriptions && prescriptions.length > 0) { setItems(STORAGE_KEYS.PRESCRIPTIONS, prescriptions); updated = true; }
    if (labTests && labTests.length > 0) { setItems(STORAGE_KEYS.LAB_TESTS, labTests); updated = true; }
    if (feesOPD && feesOPD.length > 0) { setItems(STORAGE_KEYS.FEES_OPD, feesOPD); updated = true; }
    if (admissions && admissions.length > 0) { setItems(STORAGE_KEYS.ADMISSIONS, admissions); updated = true; }
    if (feesIPD && feesIPD.length > 0) { setItems(STORAGE_KEYS.FEES_IPD, feesIPD); updated = true; }
    if (receipts && receipts.length > 0) { setItems(STORAGE_KEYS.RECEIPTS, receipts); updated = true; }
    if (settings && settings.length > 0) { setItems(STORAGE_KEYS.SETTINGS, settings); updated = true; }
    if (auditLogs && auditLogs.length > 0) { setItems(STORAGE_KEYS.AUDIT_LOGS, auditLogs); updated = true; }

    // If Supabase tables exist but are empty, seed them from initialData!
    if (tenants && tenants.length === 0) {
      await Promise.all([
        supabase.from('tenant_hospitals').upsert(initialTenants),
        supabase.from('users').upsert(initialUsers),
        supabase.from('patients').upsert(initialPatients),
        supabase.from('doctors').upsert(initialDoctors),
        supabase.from('appointments').upsert(initialAppointments),
        supabase.from('prescriptions').upsert(initialPrescriptions),
        supabase.from('lab_tests').upsert(initialLabTests),
        supabase.from('fees_opd').upsert(initialFeesOPD),
        supabase.from('admissions').upsert(initialAdmissions),
        supabase.from('fees_ipd').upsert(initialFeesIPD),
        supabase.from('receipts').upsert(initialReceipts),
        supabase.from('hospital_settings').upsert(initialSettings),
        supabase.from('audit_logs').upsert(initialAuditLogs)
      ]);
      console.log('Supabase Multi-Tenant SaaS seeded successfully with initial data!');
    }

    if (updated) {
      window.dispatchEvent(new Event('hms_db_update'));
    }
  } catch (err) {
    console.error('Supabase Sync Error:', err);
  }
};

// Initialize DB & Setup Supabase Realtime Subscriptions
export const initDB = () => {
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(initialTenants));
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
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify([initialSettings]));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(initialUsers[0])); // Default SaaS Master Admin
  }

  syncAllFromSupabase();

  supabase
    .channel('hms-saas-channel')
    .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      console.log('Realtime change received:', payload);
      syncAllFromSupabase();
    })
    .subscribe();
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
  window.dispatchEvent(new Event('hms_db_update'));
};

export const logoutUser = () => {
  addAuditLog('LOGOUT', 'User logged out');
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.dispatchEvent(new Event('hms_auth_update'));
};

// Audit Log Helper
export const addAuditLog = (action: string, details: string) => {
  const currentUser = getCurrentUser();
  const logs = getItems<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    hospital_id: currentUser ? currentUser.hospital_id : 'saas-master',
    user_id: currentUser ? currentUser.id : 'system',
    user_name: currentUser ? currentUser.name : 'System',
    role: currentUser ? currentUser.role : 'SUPER_ADMIN',
    action,
    details,
    timestamp: new Date().toLocaleString(),
  };
  setItems(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs]);
  supabase.from('audit_logs').insert(newLog).then();
};

// --- SAAS TENANT MANAGEMENT ---
export const getTenants = (): TenantHospital[] => getItems(STORAGE_KEYS.TENANTS);

export const saveTenant = (tenant: TenantHospital) => {
  const tenants = getTenants();
  const index = tenants.findIndex(t => t.id === tenant.id);
  if (index >= 0) {
    tenants[index] = tenant;
    addAuditLog('UPDATE_TENANT', `Updated hospital tenant: ${tenant.name} (${tenant.plan})`);
  } else {
    tenants.push(tenant);
    addAuditLog('REGISTER_TENANT', `Registered new hospital tenant: ${tenant.name} (${tenant.plan})`);

    // Also auto-create a Super Admin user for this new hospital
    const newAdminUser: User = {
      id: `usr-${Date.now()}`,
      hospital_id: tenant.id,
      name: `${tenant.owner_name} (Admin)`,
      email: tenant.owner_email,
      password_hash: 'hashed_password',
      role: 'SUPER_ADMIN',
      is_active: true,
    };
    const users = getItems<User>(STORAGE_KEYS.USERS);
    users.push(newAdminUser);
    setItems(STORAGE_KEYS.USERS, users);
    supabase.from('users').upsert(newAdminUser).then();

    // Also auto-create default settings for this hospital
    const newSettings: HospitalSettings = {
      id: tenant.id,
      hospital_name: tenant.name,
      hospital_logo: tenant.logo,
      departments: ['General Medicine', 'Pediatrics', 'Cardiology', 'Gynecology'],
      address: tenant.address,
      phone: tenant.phone,
    };
    const settingsList = getItems<HospitalSettings>(STORAGE_KEYS.SETTINGS);
    settingsList.push(newSettings);
    setItems(STORAGE_KEYS.SETTINGS, settingsList);
    supabase.from('hospital_settings').upsert(newSettings).then();
  }
  setItems(STORAGE_KEYS.TENANTS, tenants);
  supabase.from('tenant_hospitals').upsert(tenant).then();
};

export const deleteTenant = (id: string) => {
  const tenants = getTenants().filter(t => t.id !== id);
  setItems(STORAGE_KEYS.TENANTS, tenants);
  addAuditLog('DELETE_TENANT', `Deleted hospital tenant ID: ${id}`);
  supabase.from('tenant_hospitals').delete().eq('id', id).then();
};

// --- USERS MANAGEMENT (Multi-Tenant Scoped) ---
export const getUsers = (): User[] => {
  const allUsers = getItems<User>(STORAGE_KEYS.USERS);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allUsers;
  return allUsers.filter(u => u.hospital_id === currentUser.hospital_id || u.role === 'SAAS_MASTER_ADMIN');
};

export const saveUser = (user: User) => {
  const currentUser = getCurrentUser();
  const hospital_id = user.hospital_id || (currentUser ? currentUser.hospital_id : 'hospital-1');
  const userObj = { ...user, hospital_id };

  const allUsers = getItems<User>(STORAGE_KEYS.USERS);
  const existingIndex = allUsers.findIndex(u => u.id === userObj.id);
  if (existingIndex >= 0) {
    allUsers[existingIndex] = userObj;
    addAuditLog('UPDATE_USER', `Updated user: ${userObj.name} (${userObj.role})`);
  } else {
    allUsers.push(userObj);
    addAuditLog('CREATE_USER', `Created new user: ${userObj.name} (${userObj.role})`);
  }
  setItems(STORAGE_KEYS.USERS, allUsers);
  supabase.from('users').upsert(userObj).then();

  if (userObj.role === 'DOCTOR') {
    const allDoctors = getItems<Doctor>(STORAGE_KEYS.DOCTORS);
    const docIndex = allDoctors.findIndex(d => d.user_id === userObj.id);
    const doctorObj: Doctor = {
      user_id: userObj.id,
      hospital_id: userObj.hospital_id,
      specialization: userObj.specialization || 'General Physician',
      qualification: userObj.qualification || 'MBBS',
      fee: userObj.fee || 1500,
      available_days: userObj.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    };
    if (docIndex >= 0) {
      allDoctors[docIndex] = doctorObj;
    } else {
      allDoctors.push(doctorObj);
    }
    setItems(STORAGE_KEYS.DOCTORS, allDoctors);
    supabase.from('doctors').upsert(doctorObj).then();
  }
};

export const deleteUser = (id: string) => {
  const allUsers = getItems<User>(STORAGE_KEYS.USERS).filter(u => u.id !== id);
  setItems(STORAGE_KEYS.USERS, allUsers);
  addAuditLog('DELETE_USER', `Deleted user ID: ${id}`);
  supabase.from('users').delete().eq('id', id).then();
};

// --- PATIENTS MANAGEMENT (Multi-Tenant Scoped) ---
export const getPatients = (): Patient[] => {
  const allPatients = getItems<Patient>(STORAGE_KEYS.PATIENTS);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allPatients;
  return allPatients.filter(p => p.hospital_id === currentUser.hospital_id);
};

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

  const currentUser = getCurrentUser();
  const hospital_id = currentUser ? currentUser.hospital_id : 'hospital-1';
  const patientObj = { ...patient, hospital_id };

  const allPatients = getItems<Patient>(STORAGE_KEYS.PATIENTS);
  const existingIndex = allPatients.findIndex(p => p.patient_no === patientObj.patient_no && p.hospital_id === hospital_id);

  if (existingIndex >= 0) {
    allPatients[existingIndex] = patientObj;
    addAuditLog('UPDATE_PATIENT', `Updated patient record: ${patientObj.name} (${patientObj.patient_no})`);
  } else {
    allPatients.push(patientObj);
    addAuditLog('REGISTER_PATIENT', `Registered new patient: ${patientObj.name} (${patientObj.patient_no})`);
  }
  setItems(STORAGE_KEYS.PATIENTS, allPatients);
  supabase.from('patients').upsert(patientObj).then();

  return { success: true, message: 'Patient saved successfully!' };
};

export const deletePatient = (patient_no: string) => {
  const allPatients = getItems<Patient>(STORAGE_KEYS.PATIENTS).filter(p => p.patient_no !== patient_no);
  setItems(STORAGE_KEYS.PATIENTS, allPatients);
  addAuditLog('DELETE_PATIENT', `Deleted patient: ${patient_no}`);
  supabase.from('patients').delete().eq('patient_no', patient_no).then();
};

// --- DOCTORS ---
export const getDoctors = (): Doctor[] => {
  const allDoctors = getItems<Doctor>(STORAGE_KEYS.DOCTORS);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allDoctors;
  return allDoctors.filter(d => d.hospital_id === currentUser.hospital_id);
};

export const getDoctorDetails = (user_id: string): { user: User; doctor: Doctor } | undefined => {
  const user = getUsers().find(u => u.id === user_id);
  const doctor = getDoctors().find(d => d.user_id === user_id);
  if (user && doctor) return { user, doctor };
  return undefined;
};

// --- APPOINTMENTS ---
export const getAppointments = (): Appointment[] => {
  const allApts = getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allApts;
  return allApts.filter(a => a.hospital_id === currentUser.hospital_id);
};

export const bookAppointment = (appointment: Omit<Appointment, 'id' | 'token_no' | 'status' | 'hospital_id'>): Appointment => {
  const currentUser = getCurrentUser();
  const hospital_id = currentUser ? currentUser.hospital_id : 'hospital-1';

  const allApts = getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const doctorApts = allApts.filter(a => a.doctor_id === appointment.doctor_id && a.date === appointment.date && a.hospital_id === hospital_id);
  const token_no = doctorApts.length + 1;
  const newApt: Appointment = {
    ...appointment,
    id: `apt-${Date.now()}`,
    hospital_id,
    token_no,
    status: 'Booked',
  };
  allApts.push(newApt);
  setItems(STORAGE_KEYS.APPOINTMENTS, allApts);
  supabase.from('appointments').upsert(newApt).then();

  const doctorInfo = getDoctorDetails(appointment.doctor_id);
  const feeAmount = doctorInfo ? doctorInfo.doctor.fee : 1500;
  const allFeesOPD = getItems<FeeOPD>(STORAGE_KEYS.FEES_OPD);
  const newFee: FeeOPD = {
    id: `fee-${Date.now()}`,
    hospital_id,
    patient_id: appointment.patient_id,
    doctor_id: appointment.doctor_id,
    appointment_id: newApt.id,
    amount: feeAmount,
    status: 'Unpaid',
    receipt_no: `REC-OPD-${Date.now().toString().slice(-4)}`,
  };
  allFeesOPD.push(newFee);
  setItems(STORAGE_KEYS.FEES_OPD, allFeesOPD);
  supabase.from('fees_opd').upsert(newFee).then();

  addAuditLog('BOOK_APPOINTMENT', `Booked appointment ${newApt.id} for ${newApt.patient_id}`);
  return newApt;
};

export const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
  const allApts = getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const apt = allApts.find(a => a.id === id);
  if (apt) {
    apt.status = status;
    setItems(STORAGE_KEYS.APPOINTMENTS, allApts);
    addAuditLog('UPDATE_APPOINTMENT', `Updated appointment ${id} status to ${status}`);
    supabase.from('appointments').update({ status }).eq('id', id).then();
  }
};

// --- PRESCRIPTIONS ---
export const getPrescriptions = (): Prescription[] => {
  const allPrsc = getItems<Prescription>(STORAGE_KEYS.PRESCRIPTIONS);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allPrsc;
  return allPrsc.filter(p => p.hospital_id === currentUser.hospital_id);
};

export const savePrescription = (prescription: Omit<Prescription, 'hospital_id'>) => {
  const currentUser = getCurrentUser();
  const hospital_id = currentUser ? currentUser.hospital_id : 'hospital-1';
  const prscObj = { ...prescription, hospital_id };

  const allPrsc = getItems<Prescription>(STORAGE_KEYS.PRESCRIPTIONS);
  allPrsc.push(prscObj);
  setItems(STORAGE_KEYS.PRESCRIPTIONS, allPrsc);
  supabase.from('prescriptions').upsert(prscObj).then();

  updateAppointmentStatus(prescription.appointment_id, 'Completed');
  addAuditLog('WRITE_PRESCRIPTION', `Prescription created for Patient: ${prescription.patient_id}`);
};

// --- LAB TESTS ---
export const getLabTests = (): LabTest[] => {
  const allTests = getItems<LabTest>(STORAGE_KEYS.LAB_TESTS);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allTests;
  return allTests.filter(t => t.hospital_id === currentUser.hospital_id);
};

export const saveLabTest = (labTest: Omit<LabTest, 'hospital_id'>) => {
  const currentUser = getCurrentUser();
  const hospital_id = currentUser ? currentUser.hospital_id : 'hospital-1';
  const testObj = { ...labTest, hospital_id };

  const allTests = getItems<LabTest>(STORAGE_KEYS.LAB_TESTS);
  const index = allTests.findIndex(t => t.id === testObj.id);
  if (index >= 0) {
    allTests[index] = testObj;
    addAuditLog('UPDATE_LAB_TEST', `Updated lab test ${testObj.test_name} for ${testObj.patient_id}`);
  } else {
    allTests.push(testObj);
    addAuditLog('ORDER_LAB_TEST', `Ordered lab test ${testObj.test_name} for ${testObj.patient_id}`);
  }
  setItems(STORAGE_KEYS.LAB_TESTS, allTests);
  supabase.from('lab_tests').upsert(testObj).then();
};

// --- CASHIER & FEES ---
export const getFeesOPD = (): FeeOPD[] => {
  const allFees = getItems<FeeOPD>(STORAGE_KEYS.FEES_OPD);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allFees;
  return allFees.filter(f => f.hospital_id === currentUser.hospital_id);
};

export const payFeeOPD = (fee_id: string, payment_mode: 'Cash' | 'Card' | 'Online' = 'Cash'): Receipt | null => {
  const allFees = getItems<FeeOPD>(STORAGE_KEYS.FEES_OPD);
  const fee = allFees.find(f => f.id === fee_id);
  if (!fee) return null;

  fee.status = 'Paid';
  fee.paid_at = new Date().toLocaleString();
  setItems(STORAGE_KEYS.FEES_OPD, allFees);
  supabase.from('fees_opd').update({ status: 'Paid', paid_at: fee.paid_at }).eq('id', fee_id).then();

  const allReceipts = getItems<Receipt>(STORAGE_KEYS.RECEIPTS);
  const currentUser = getCurrentUser();
  const newReceipt: Receipt = {
    id: `rec-${Date.now()}`,
    hospital_id: fee.hospital_id,
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
  allReceipts.push(newReceipt);
  setItems(STORAGE_KEYS.RECEIPTS, allReceipts);
  supabase.from('receipts').upsert(newReceipt).then();

  const allApts = getItems<Appointment>(STORAGE_KEYS.APPOINTMENTS);
  const apt = allApts.find(a => a.id === fee.appointment_id);
  if (apt && apt.status === 'Booked') {
    apt.status = 'Waiting';
    setItems(STORAGE_KEYS.APPOINTMENTS, allApts);
    supabase.from('appointments').update({ status: 'Waiting' }).eq('id', fee.appointment_id).then();
  }

  addAuditLog('PAY_OPD_FEE', `Paid OPD Fee ${fee.amount} for Patient ${fee.patient_id}`);
  return newReceipt;
};

// --- IPD & ADMISSIONS ---
export const getAdmissions = (): Admission[] => {
  const allAdm = getItems<Admission>(STORAGE_KEYS.ADMISSIONS);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allAdm;
  return allAdm.filter(a => a.hospital_id === currentUser.hospital_id);
};

export const getFeesIPD = (): FeeIPD[] => {
  const allFees = getItems<FeeIPD>(STORAGE_KEYS.FEES_IPD);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allFees;
  return allFees.filter(f => f.hospital_id === currentUser.hospital_id);
};

export const admitPatient = (admission: Omit<Admission, 'id' | 'status' | 'hospital_id'>): Admission => {
  const currentUser = getCurrentUser();
  const hospital_id = currentUser ? currentUser.hospital_id : 'hospital-1';

  const allAdm = getItems<Admission>(STORAGE_KEYS.ADMISSIONS);
  const newAdm: Admission = {
    ...admission,
    id: `adm-${Date.now()}`,
    hospital_id,
    status: 'Admitted',
  };
  allAdm.push(newAdm);
  setItems(STORAGE_KEYS.ADMISSIONS, allAdm);
  supabase.from('admissions').upsert(newAdm).then();

  const allPatients = getItems<Patient>(STORAGE_KEYS.PATIENTS);
  const p = allPatients.find(pat => pat.patient_no === admission.patient_id && pat.hospital_id === hospital_id);
  if (p) {
    p.patient_type = 'IPD';
    setItems(STORAGE_KEYS.PATIENTS, allPatients);
    supabase.from('patients').update({ patient_type: 'IPD' }).eq('patient_no', admission.patient_id).then();
  }

  addAuditLog('ADMIT_PATIENT', `Admitted patient ${admission.patient_id} to ${admission.ward}`);
  return newAdm;
};

export const addFeeIPD = (feeIPD: Omit<FeeIPD, 'id' | 'hospital_id'>) => {
  const currentUser = getCurrentUser();
  const hospital_id = currentUser ? currentUser.hospital_id : 'hospital-1';

  const allFees = getItems<FeeIPD>(STORAGE_KEYS.FEES_IPD);
  const newFee: FeeIPD = {
    ...feeIPD,
    id: `ipd-fee-${Date.now()}`,
    hospital_id,
  };
  allFees.push(newFee);
  setItems(STORAGE_KEYS.FEES_IPD, allFees);
  supabase.from('fees_ipd').upsert(newFee).then();

  addAuditLog('ADD_IPD_CHARGE', `Added charge ${feeIPD.charge_type} (${feeIPD.amount}) for Admission ${feeIPD.admission_id}`);
};

export const dischargePatient = (admission_id: string, payment_mode: 'Cash' | 'Card' | 'Online' = 'Cash'): Receipt | null => {
  const allAdm = getItems<Admission>(STORAGE_KEYS.ADMISSIONS);
  const adm = allAdm.find(a => a.id === admission_id);
  if (!adm) return null;

  adm.status = 'Discharged';
  adm.discharge_date = new Date().toLocaleString();
  setItems(STORAGE_KEYS.ADMISSIONS, allAdm);
  supabase.from('admissions').update({ status: 'Discharged', discharge_date: adm.discharge_date }).eq('id', admission_id).then();

  const ipdFees = getFeesIPD().filter(f => f.admission_id === admission_id);
  const totalAmount = ipdFees.reduce((sum, f) => sum + f.amount, 0);

  const allReceipts = getItems<Receipt>(STORAGE_KEYS.RECEIPTS);
  const currentUser = getCurrentUser();
  const newReceipt: Receipt = {
    id: `rec-${Date.now()}`,
    hospital_id: adm.hospital_id,
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
  allReceipts.push(newReceipt);
  setItems(STORAGE_KEYS.RECEIPTS, allReceipts);
  supabase.from('receipts').upsert(newReceipt).then();

  const allPatients = getItems<Patient>(STORAGE_KEYS.PATIENTS);
  const p = allPatients.find(pat => pat.patient_no === adm.patient_id && pat.hospital_id === adm.hospital_id);
  if (p) {
    p.patient_type = 'OPD';
    setItems(STORAGE_KEYS.PATIENTS, allPatients);
    supabase.from('patients').update({ patient_type: 'OPD' }).eq('patient_no', adm.patient_id).then();
  }

  addAuditLog('DISCHARGE_PATIENT', `Discharged patient ${adm.patient_id} with Total Bill ${totalAmount}`);
  return newReceipt;
};

// --- RECEIPTS ---
export const getReceipts = (): Receipt[] => {
  const allReceipts = getItems<Receipt>(STORAGE_KEYS.RECEIPTS);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allReceipts;
  return allReceipts.filter(r => r.hospital_id === currentUser.hospital_id);
};

// --- SETTINGS ---
export const getSettings = (): HospitalSettings => {
  const allSettings = getItems<HospitalSettings>(STORAGE_KEYS.SETTINGS);
  const currentUser = getCurrentUser();
  const hospital_id = currentUser ? currentUser.hospital_id : 'hospital-1';
  const found = allSettings.find(s => s.id === hospital_id);
  return found || initialSettings;
};

export const saveSettings = (settings: Omit<HospitalSettings, 'id'>) => {
  const currentUser = getCurrentUser();
  const hospital_id = currentUser ? currentUser.hospital_id : 'hospital-1';
  const settingObj: HospitalSettings = { ...settings, id: hospital_id };

  const allSettings = getItems<HospitalSettings>(STORAGE_KEYS.SETTINGS);
  const index = allSettings.findIndex(s => s.id === hospital_id);
  if (index >= 0) {
    allSettings[index] = settingObj;
  } else {
    allSettings.push(settingObj);
  }
  setItems(STORAGE_KEYS.SETTINGS, allSettings);
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(allSettings)); // keep backward compat
  addAuditLog('UPDATE_SETTINGS', 'Updated hospital settings');
  window.dispatchEvent(new Event('hms_settings_update'));
  supabase.from('hospital_settings').upsert(settingObj).then();
};

// --- AUDIT LOGS ---
export const getAuditLogs = (): AuditLog[] => {
  const allLogs = getItems<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role === 'SAAS_MASTER_ADMIN') return allLogs;
  return allLogs.filter(log => log.hospital_id === currentUser.hospital_id);
};

// --- RESET / CLEAR SYSTEM DATA ---
export const clearAllSystemData = async () => {
  try {
    setItems(STORAGE_KEYS.USERS, initialUsers);
    setItems(STORAGE_KEYS.PATIENTS, []);
    setItems(STORAGE_KEYS.DOCTORS, initialDoctors);
    setItems(STORAGE_KEYS.APPOINTMENTS, []);
    setItems(STORAGE_KEYS.PRESCRIPTIONS, []);
    setItems(STORAGE_KEYS.LAB_TESTS, []);
    setItems(STORAGE_KEYS.FEES_OPD, []);
    setItems(STORAGE_KEYS.ADMISSIONS, []);
    setItems(STORAGE_KEYS.FEES_IPD, []);
    setItems(STORAGE_KEYS.RECEIPTS, []);
    setItems(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);

    await Promise.all([
      supabase.from('users').delete().neq('id', 'usr-saas-master').neq('id', 'usr-1'),
      supabase.from('patients').delete().neq('patient_no', '0'),
      supabase.from('appointments').delete().neq('id', '0'),
      supabase.from('prescriptions').delete().neq('id', '0'),
      supabase.from('lab_tests').delete().neq('id', '0'),
      supabase.from('fees_opd').delete().neq('id', '0'),
      supabase.from('admissions').delete().neq('id', '0'),
      supabase.from('fees_ipd').delete().neq('id', '0'),
      supabase.from('receipts').delete().neq('id', '0')
    ]);

    console.log('System wiped clean successfully.');
    window.dispatchEvent(new Event('hms_db_update'));
  } catch (err) {
    console.error('Error clearing system data:', err);
  }
};
