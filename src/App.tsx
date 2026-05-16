import React, { useState, useEffect } from 'react';
import { User, Patient, Prescription, LabTest, Receipt, Doctor } from './types';
import { initDB, getCurrentUser } from './db/database';

// Common Components
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { Toast } from './components/common/Toast';

// Auth
import { Login } from './components/auth/Login';

// Dashboard & Modules
import { StatsCards } from './components/dashboard/StatsCards';
import { UserManagement } from './components/admin/UserManagement';
import { PatientRegistration } from './components/reception/PatientRegistration';
import { PatientSearch } from './components/reception/PatientSearch';
import { AppointmentBooking } from './components/reception/AppointmentBooking';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { PatientExamination } from './components/doctor/PatientExamination';
import { CashierDashboard } from './components/cashier/CashierDashboard';
import { LabDashboard } from './components/laboratory/LabDashboard';

// Print Modal
import { PrintModal } from './components/print/PrintModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Examination Navigation State
  const [examAppointment, setExamAppointment] = useState<any | null>(null);
  const [examPatient, setExamPatient] = useState<Patient | null>(null);

  // Print Modal State
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [printType, setPrintType] = useState<'PATIENT_CARD' | 'PRESCRIPTION' | 'LAB_REPORT' | 'RECEIPT'>('PATIENT_CARD');
  const [printPatient, setPrintPatient] = useState<Patient | null>(null);
  const [printPrescription, setPrintPrescription] = useState<Prescription | null>(null);
  const [printLabTest, setPrintLabTest] = useState<LabTest | null>(null);
  const [printReceipt, setPrintReceipt] = useState<Receipt | null>(null);
  const [printDoctorInfo, setPrintDoctorInfo] = useState<{ user: User; doctor: Doctor } | null>(null);

  useEffect(() => {
    initDB();
    setCurrentUser(getCurrentUser());

    const handleAuthUpdate = () => {
      setCurrentUser(getCurrentUser());
      setActiveTab('dashboard'); // reset tab on role switch
    };

    window.addEventListener('hms_auth_update', handleAuthUpdate);
    return () => window.removeEventListener('hms_auth_update', handleAuthUpdate);
  }, []);

  // Print Handlers
  const handlePrintPatientCard = (patient: Patient) => {
    setPrintType('PATIENT_CARD');
    setPrintPatient(patient);
    setIsPrintOpen(true);
  };

  const handlePrintPrescription = (prescription: Prescription, patient: Patient, docInfo: { user: User; doctor: Doctor }) => {
    setPrintType('PRESCRIPTION');
    setPrintPrescription(prescription);
    setPrintPatient(patient);
    setPrintDoctorInfo(docInfo);
    setIsPrintOpen(true);
  };

  const handlePrintLabReport = (labTest: LabTest, patient: Patient) => {
    setPrintType('LAB_REPORT');
    setPrintLabTest(labTest);
    setPrintPatient(patient);
    setIsPrintOpen(true);
  };

  const handlePrintReceipt = (receipt: Receipt, patient: Patient) => {
    setPrintType('RECEIPT');
    setPrintReceipt(receipt);
    setPrintPatient(patient);
    setIsPrintOpen(true);
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return (
      <>
        <Toast />
        <Login onLoginSuccess={() => setCurrentUser(getCurrentUser())} />
      </>
    );
  }

  // Render Module Content based on Active Tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <StatsCards />;

      // Super Admin
      case 'users':
      case 'audit_logs':
      case 'settings':
        return <UserManagement />;

      // Receptionist / Admin
      case 'register_patient':
        return <PatientRegistration onPrintCard={handlePrintPatientCard} />;
      case 'search_patient':
        return <PatientSearch onPrintCard={handlePrintPatientCard} />;
      case 'book_appointment':
        return <AppointmentBooking />;

      // Doctor
      case 'doctor_panel':
        return (
          <DoctorDashboard
            currentUser={currentUser}
            onExaminePatient={(apt, pat) => {
              setExamAppointment(apt);
              setExamPatient(pat);
              setActiveTab('examination');
            }}
          />
        );
      case 'examination':
        return (
          <PatientExamination
            currentUser={currentUser}
            initialAppointment={examAppointment}
            initialPatient={examPatient}
            onBackToDashboard={() => setActiveTab('doctor_panel')}
            onPrintPrescription={handlePrintPrescription}
          />
        );

      // Cashier
      case 'opd_fee':
        return <CashierDashboard initialSubTab="opd" onPrintReceipt={handlePrintReceipt} />;
      case 'ipd_fee':
        return <CashierDashboard initialSubTab="ipd" onPrintReceipt={handlePrintReceipt} />;
      case 'fee_reports':
        return <CashierDashboard initialSubTab="reports" onPrintReceipt={handlePrintReceipt} />;

      // Lab Staff
      case 'lab_management':
        return <LabDashboard onPrintReport={handlePrintLabReport} />;

      default:
        return <StatsCards />;
    }
  };

  return (
    <div className="app-container">
      <Toast />

      {/* Sidebar Navigation */}
      <Sidebar currentUser={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="main-content">
        <Navbar currentUser={currentUser} />
        <div className="content-area">
          {renderContent()}
        </div>
      </main>

      {/* Global Print Modal */}
      <PrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        printType={printType}
        patient={printPatient}
        prescription={printPrescription}
        labTest={printLabTest}
        receipt={printReceipt}
        doctorInfo={printDoctorInfo}
      />
    </div>
  );
};

export default App;
