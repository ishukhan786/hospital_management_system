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

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Dr. Sarah Jenkins',
    email: 'admin@hms.com',
    password_hash: 'hashed_password',
    role: 'SUPER_ADMIN',
    is_active: true,
  },
  {
    id: 'usr-2',
    name: 'Emily Watson',
    email: 'reception@hms.com',
    password_hash: 'hashed_password',
    role: 'RECEPTIONIST',
    is_active: true,
  },
  {
    id: 'usr-3',
    name: 'Dr. Robert Chen',
    email: 'doctor@hms.com',
    password_hash: 'hashed_password',
    role: 'DOCTOR',
    is_active: true,
    specialization: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology)',
    fee: 2500,
    available_days: ['Monday', 'Wednesday', 'Friday'],
  },
  {
    id: 'usr-4',
    name: 'Dr. Ayesha Khan',
    email: 'ayesha@hms.com',
    password_hash: 'hashed_password',
    role: 'DOCTOR',
    is_active: true,
    specialization: 'Pediatrics',
    qualification: 'MBBS, FCPS (Pediatrics)',
    fee: 2000,
    available_days: ['Tuesday', 'Thursday', 'Saturday'],
  },
  {
    id: 'usr-5',
    name: 'Michael Chang',
    email: 'cashier@hms.com',
    password_hash: 'hashed_password',
    role: 'CASHIER',
    is_active: true,
  },
  {
    id: 'usr-6',
    name: 'David Miller',
    email: 'lab@hms.com',
    password_hash: 'hashed_password',
    role: 'LAB_STAFF',
    is_active: true,
  }
];

export const initialPatients: Patient[] = [
  {
    patient_no: 'PT-2026-00001',
    name: 'Ahmed Raza',
    father_name: 'Muhammad Ali',
    cnic: '42101-1234567-1',
    mobile: '0300-1234567',
    dob: '1985-06-15',
    gender: 'Male',
    blood_group: 'B+',
    address: 'Clifton, Block 5',
    city: 'Karachi',
    registered_date: '2026-05-10',
    patient_type: 'OPD',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    patient_no: 'PT-2026-00002',
    name: 'Fatima Noor',
    father_name: 'Tariq Mehmood',
    cnic: '42201-7654321-2',
    mobile: '0333-7654321',
    dob: '1992-09-20',
    gender: 'Female',
    blood_group: 'O+',
    address: 'Gulberg, Main Boulevard',
    city: 'Lahore',
    registered_date: '2026-05-12',
    patient_type: 'OPD',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    patient_no: 'PT-2026-00003',
    name: 'Zainab Bibi',
    father_name: 'Ghulam Rasool',
    cnic: '35202-1122334-4',
    mobile: '0321-1122334',
    dob: '1970-03-10',
    gender: 'Female',
    blood_group: 'A-',
    address: 'F-8 Markaz',
    city: 'Islamabad',
    registered_date: '2026-05-14',
    patient_type: 'IPD',
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  }
];

export const initialDoctors: Doctor[] = [
  {
    user_id: 'usr-3',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD (Cardiology)',
    fee: 2500,
    available_days: ['Monday', 'Wednesday', 'Friday'],
  },
  {
    user_id: 'usr-4',
    specialization: 'Pediatrics',
    qualification: 'MBBS, FCPS (Pediatrics)',
    fee: 2000,
    available_days: ['Tuesday', 'Thursday', 'Saturday'],
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    patient_id: 'PT-2026-00001',
    doctor_id: 'usr-3',
    date: '2026-05-16',
    time_slot: '10:00 AM - 10:30 AM',
    token_no: 1,
    status: 'Waiting',
    type: 'New',
  },
  {
    id: 'apt-2',
    patient_id: 'PT-2026-00002',
    doctor_id: 'usr-4',
    date: '2026-05-16',
    time_slot: '11:00 AM - 11:30 AM',
    token_no: 2,
    status: 'In Progress',
    type: 'New',
  },
  {
    id: 'apt-3',
    patient_id: 'PT-2026-00001',
    doctor_id: 'usr-3',
    date: '2026-05-15',
    time_slot: '09:00 AM - 09:30 AM',
    token_no: 1,
    status: 'Completed',
    type: 'New',
  }
];

export const initialPrescriptions: Prescription[] = [
  {
    id: 'prsc-1',
    appointment_id: 'apt-3',
    patient_id: 'PT-2026-00001',
    doctor_id: 'usr-3',
    complaint: 'Chest pain and shortness of breath during mild exertion.',
    diagnosis: 'Hypertension / Angina',
    advice: 'Avoid oily food, 30 mins brisk walk daily, monitor BP twice a day.',
    followup_date: '2026-05-30',
    created_at: '2026-05-15 10:15 AM',
    medicines: [
      {
        id: 'med-1',
        prescription_id: 'prsc-1',
        name: 'Tab Concor 5mg',
        dose: '1 Tab',
        frequency: 'Once daily (Morning)',
        duration: '14 Days',
        instructions: 'Take after breakfast',
      },
      {
        id: 'med-2',
        prescription_id: 'prsc-1',
        name: 'Tab Lipitor 20mg',
        dose: '1 Tab',
        frequency: 'Once daily (Night)',
        duration: '30 Days',
        instructions: 'Take before sleeping',
      }
    ],
  }
];

export const initialLabTests: LabTest[] = [
  {
    id: 'lab-1',
    patient_id: 'PT-2026-00001',
    doctor_id: 'usr-3',
    test_name: 'Lipid Profile (Cholesterol)',
    result: '245',
    normal_range: '< 200',
    unit: 'mg/dL',
    status: 'Completed',
    report_date: '2026-05-15 02:30 PM',
    remarks: 'High Total Cholesterol. Dietary control advised.',
    is_abnormal: true,
  },
  {
    id: 'lab-2',
    patient_id: 'PT-2026-00002',
    doctor_id: 'usr-4',
    test_name: 'Complete Blood Count (CBC)',
    result: '12.5',
    normal_range: '12.0 - 15.5',
    unit: 'g/dL',
    status: 'Pending',
  },
  {
    id: 'lab-3',
    patient_id: 'PT-2026-00003',
    doctor_id: 'usr-3',
    test_name: 'Blood Sugar Fasting (FBS)',
    result: '142',
    normal_range: '70 - 100',
    unit: 'mg/dL',
    status: 'Processing',
    remarks: 'Impaired fasting glucose',
    is_abnormal: true,
  }
];

export const initialFeesOPD: FeeOPD[] = [
  {
    id: 'fee-1',
    patient_id: 'PT-2026-00001',
    doctor_id: 'usr-3',
    appointment_id: 'apt-1',
    amount: 2500,
    status: 'Paid',
    receipt_no: 'REC-OPD-1001',
    paid_at: '2026-05-16 09:45 AM',
  },
  {
    id: 'fee-2',
    patient_id: 'PT-2026-00002',
    doctor_id: 'usr-4',
    appointment_id: 'apt-2',
    amount: 2000,
    status: 'Unpaid',
    receipt_no: 'REC-OPD-1002',
  }
];

export const initialAdmissions: Admission[] = [
  {
    id: 'adm-1',
    patient_id: 'PT-2026-00003',
    doctor_id: 'usr-3',
    admit_date: '2026-05-14 04:00 PM',
    ward: 'Cardiology Ward',
    bed_no: 'Bed-104',
    reason: 'Severe Palpitations and Unstable Angina observation',
    status: 'Admitted',
  }
];

export const initialFeesIPD: FeeIPD[] = [
  {
    id: 'ipd-fee-1',
    admission_id: 'adm-1',
    charge_type: 'Room & Nursing Charges (2 Days)',
    amount: 10000,
    date: '2026-05-16',
  },
  {
    id: 'ipd-fee-2',
    admission_id: 'adm-1',
    charge_type: 'ECG & Monitoring',
    amount: 3500,
    date: '2026-05-15',
  },
  {
    id: 'ipd-fee-3',
    admission_id: 'adm-1',
    charge_type: 'IV Medicines & Cannula',
    amount: 4200,
    date: '2026-05-15',
  }
];

export const initialReceipts: Receipt[] = [
  {
    id: 'rec-1',
    patient_id: 'PT-2026-00001',
    total_amount: 2500,
    discount: 0,
    paid_amount: 2500,
    payment_mode: 'Cash',
    cashier_id: 'usr-5',
    created_at: '2026-05-16 09:45 AM',
    receipt_type: 'OPD',
    reference_id: 'apt-1',
  }
];

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
    user_name: 'Dr. Sarah Jenkins',
    role: 'SUPER_ADMIN',
    action: 'SYSTEM_INIT',
    details: 'Hospital Management System initialized with default seed data.',
    timestamp: '2026-05-16 08:00 AM',
  },
  {
    id: 'log-2',
    user_id: 'usr-2',
    user_name: 'Emily Watson',
    role: 'RECEPTIONIST',
    action: 'REGISTER_PATIENT',
    details: 'Registered new patient Ahmed Raza (PT-2026-00001)',
    timestamp: '2026-05-16 08:30 AM',
  },
  {
    id: 'log-3',
    user_id: 'usr-2',
    user_name: 'Emily Watson',
    role: 'RECEPTIONIST',
    action: 'BOOK_APPOINTMENT',
    details: 'Booked appointment apt-1 for PT-2026-00001 with Dr. Robert Chen',
    timestamp: '2026-05-16 08:35 AM',
  }
];
