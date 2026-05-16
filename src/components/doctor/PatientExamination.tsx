import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, CheckCircle, Search, Printer, TestTube, History, ArrowLeft } from 'lucide-react';
import { Appointment, Patient, Prescription, Medicine, LabTest, User, Doctor } from '../../types';
import { getPatients, getAppointments, getPrescriptions, getLabTests, savePrescription, getDoctors } from '../../db/database';
import { showToast } from '../common/Toast';

interface PatientExaminationProps {
  currentUser: User;
  initialAppointment?: Appointment | null;
  initialPatient?: Patient | null;
  onBackToDashboard: () => void;
  onPrintPrescription?: (prescription: Prescription, patient: Patient, doctorInfo: { user: User; doctor: Doctor }) => void;
}

export const PatientExamination: React.FC<PatientExaminationProps> = ({
  currentUser,
  initialAppointment,
  initialPatient,
  onBackToDashboard,
  onPrintPrescription
}) => {
  const [patients, setPatients] = useState<Patient[]>(getPatients());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialPatient || null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(initialAppointment || null);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  // Prescription Form State
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([
    { id: `med-${Date.now()}`, prescription_id: '', name: '', dose: '1 Tab', frequency: 'Once daily', duration: '5 Days', instructions: 'After meal' }
  ]);

  // History State
  const [pastPrescriptions, setPastPrescriptions] = useState<Prescription[]>([]);
  const [pastLabTests, setPastLabTests] = useState<LabTest[]>([]);

  // Saved Prescription State
  const [savedPrescription, setSavedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    if (selectedPatient) {
      const prsc = getPrescriptions().filter(p => p.patient_id === selectedPatient.patient_no);
      const labs = getLabTests().filter(l => l.patient_id === selectedPatient.patient_no);
      setPastPrescriptions(prsc);
      setPastLabTests(labs);
    }
  }, [selectedPatient]);

  const handlePatientSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = patients.find(p => p.patient_no.toLowerCase() === patientSearchTerm.toLowerCase() || p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()));
    if (found) {
      setSelectedPatient(found);
      // Find latest appointment
      const apt = getAppointments().find(a => a.patient_id === found.patient_no && a.status !== 'Completed');
      setSelectedAppointment(apt || null);
      showToast(`Patient loaded: ${found.name}`, 'success');
    } else {
      showToast('Patient not found', 'error');
    }
  };

  const addMedicineRow = () => {
    setMedicines(prev => [
      ...prev,
      { id: `med-${Date.now()}`, prescription_id: '', name: '', dose: '1 Tab', frequency: 'Once daily', duration: '5 Days', instructions: 'After meal' }
    ]);
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMedicineRow = (id: string) => {
    if (medicines.length === 1) return;
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      showToast('Please select or search a patient first', 'error');
      return;
    }
    if (!complaint || !diagnosis) {
      showToast('Chief Complaint and Diagnosis are required', 'error');
      return;
    }
    if (medicines.some(m => !m.name)) {
      showToast('Please enter medicine names for all rows', 'error');
      return;
    }

    const prscId = `prsc-${Date.now()}`;
    const finalMedicines = medicines.map(m => ({ ...m, prescription_id: prscId }));

    const newPrsc: Prescription = {
      id: prscId,
      appointment_id: selectedAppointment ? selectedAppointment.id : `apt-walkin-${Date.now()}`,
      patient_id: selectedPatient.patient_no,
      doctor_id: currentUser.id,
      complaint,
      diagnosis,
      advice,
      followup_date: followupDate || 'No follow-up required',
      created_at: new Date().toLocaleString(),
      medicines: finalMedicines,
    };

    savePrescription(newPrsc);
    setSavedPrescription(newPrsc);
    showToast('Prescription saved successfully and visit marked as Completed!', 'success');
  };

  const handlePrint = () => {
    if (!savedPrescription || !selectedPatient || !onPrintPrescription) return;
    const docObj = getDoctors().find(d => d.user_id === currentUser.id) || { user_id: currentUser.id, specialization: 'General Physician', qualification: 'MBBS', fee: 1500, available_days: [] };
    onPrintPrescription(savedPrescription, selectedPatient, { user: currentUser, doctor: docObj });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn btn-outline" onClick={onBackToDashboard}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)' }}>Patient Examination Panel</h1>
      </div>

      {/* Patient Search / Selection Bar */}
      {!selectedPatient && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: 'var(--primary-navy)' }}>Search Patient to Examine</h3>
          <form onSubmit={handlePatientSearch} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Patient No (PT-YYYY-XXXXX) or Name..."
              value={patientSearchTerm}
              onChange={e => setPatientSearchTerm(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary"><Search size={18} /> Search</button>
          </form>
        </div>
      )}

      {selectedPatient && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {/* Left Column: Patient Profile & Past History */}
          <div>
            {/* Patient Info Card */}
            <div className="card" style={{ borderLeft: '4px solid var(--primary-teal)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src={selectedPatient.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={selectedPatient.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{selectedPatient.name}</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID: {selectedPatient.patient_no} | {selectedPatient.gender} | DOB: {selectedPatient.dob}</p>
                  </div>
                </div>
                <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setSelectedPatient(null)}>Change Patient</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', fontSize: '0.85rem' }}>
                <div><strong>Blood Group:</strong> <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{selectedPatient.blood_group}</span></div>
                <div><strong>Patient Type:</strong> {selectedPatient.patient_type}</div>
                <div><strong>Mobile:</strong> {selectedPatient.mobile}</div>
                <div><strong>City:</strong> {selectedPatient.city}</div>
              </div>
            </div>

            {/* Past Prescriptions */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><History size={20} style={{ color: 'var(--primary-teal)' }} /> Previous Visit History</h3>
                <span className="badge badge-navy">{pastPrescriptions.length} Visits</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto' }}>
                {pastPrescriptions.map(p => (
                  <div key={p.id} style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '6px' }}>
                      <span>{p.diagnosis}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.created_at}</span>
                    </div>
                    <p style={{ marginBottom: '8px' }}><strong>Complaint:</strong> {p.complaint}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {p.medicines.map(m => (
                        <span key={m.id} style={{ background: 'white', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {m.name} ({m.dose})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {pastPrescriptions.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No previous visit records found.</p>
                )}
              </div>
            </div>

            {/* Past Lab Reports */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><TestTube size={20} style={{ color: 'var(--primary-teal)' }} /> Linked Lab Reports</h3>
                <span className="badge badge-warning">{pastLabTests.length} Reports</span>
              </div>
              <div className="table-responsive">
                <table className="table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Result</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastLabTests.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600 }}>{t.test_name}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: t.is_abnormal ? 'var(--danger)' : 'var(--success)' }}>
                            {t.result || '-'} {t.unit}
                          </span>
                        </td>
                        <td><span className={`badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></td>
                      </tr>
                    ))}
                    {pastLabTests.length === 0 && (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No lab reports linked to this patient.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Write Prescription Form */}
          <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="card-header">
              <h2 className="card-title"><FileText size={24} style={{ color: 'var(--primary-teal)' }} /> Write Prescription Slip</h2>
              {selectedAppointment && <span className="badge badge-warning">Token #{selectedAppointment.token_no}</span>}
            </div>

            {savedPrescription ? (
              <div style={{ padding: '32px', textAlign: 'center', animation: 'scaleUp 0.3s ease-out', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <CheckCircle size={64} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>Prescription Saved Successfully!</h2>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '28px' }}>
                  The visit has been marked as Completed. You can now print the official prescription slip.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <button className="btn btn-teal" onClick={handlePrint}>
                    <Printer size={18} /> Print Prescription Slip
                  </button>
                  <button className="btn btn-outline" onClick={() => { setSavedPrescription(null); setSelectedPatient(null); }}>
                    Examine Next Patient
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSavePrescription} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Chief Complaint *</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Describe patient symptoms and complaints..."
                    value={complaint}
                    onChange={e => setComplaint(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Final Diagnosis *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acute Viral Pharyngitis / Hypertension"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    required
                  />
                </div>

                {/* Medicines List Section */}
                <div style={{ marginBottom: '24px', background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)' }}>Prescribe Medicines</h4>
                    <button type="button" className="btn btn-teal" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={addMedicineRow}>
                      <Plus size={16} /> Add Medicine
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {medicines.map((med) => (
                      <div key={med.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr auto', gap: '10px', alignItems: 'center', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <input type="text" className="form-input" style={{ padding: '8px 12px', fontSize: '0.85rem' }} placeholder="Medicine Name *" value={med.name} onChange={e => updateMedicine(med.id, 'name', e.target.value)} required />
                        <input type="text" className="form-input" style={{ padding: '8px 12px', fontSize: '0.85rem' }} placeholder="Dose" value={med.dose} onChange={e => updateMedicine(med.id, 'dose', e.target.value)} />
                        <input type="text" className="form-input" style={{ padding: '8px 12px', fontSize: '0.85rem' }} placeholder="Frequency" value={med.frequency} onChange={e => updateMedicine(med.id, 'frequency', e.target.value)} />
                        <input type="text" className="form-input" style={{ padding: '8px 12px', fontSize: '0.85rem' }} placeholder="Duration" value={med.duration} onChange={e => updateMedicine(med.id, 'duration', e.target.value)} />
                        <input type="text" className="form-input" style={{ padding: '8px 12px', fontSize: '0.85rem' }} placeholder="Instructions" value={med.instructions} onChange={e => updateMedicine(med.id, 'instructions', e.target.value)} />
                        <button type="button" className="btn btn-outline" style={{ padding: '8px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => removeMedicineRow(med.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Doctor's Advice / Notes</label>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder="Dietary advice, rest instructions..."
                      value={advice}
                      onChange={e => setAdvice(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Follow-up Date (Optional)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={followupDate}
                      onChange={e => setFollowupDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '28px' }}>
                  <button type="button" className="btn btn-outline" onClick={onBackToDashboard}>Cancel</button>
                  <button type="submit" className="btn btn-primary"><FileText size={18} /> Complete Visit & Save Prescription</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
