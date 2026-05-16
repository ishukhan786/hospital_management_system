import React, { useState, useEffect } from 'react';
import { Search, Edit, Eye, Printer, Calendar, FileText, TestTube } from 'lucide-react';
import { Patient, Appointment, Prescription, LabTest, PatientType } from '../../types';
import { getPatients, savePatient, getAppointments, getPrescriptions, getLabTests } from '../../db/database';
import { showToast } from '../common/Toast';

interface PatientSearchProps {
  onPrintCard?: (patient: Patient) => void;
}

export const PatientSearch: React.FC<PatientSearchProps> = ({ onPrintCard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>(getPatients());

  // Edit Modal State
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Quick View / History Modal State
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  const [patientLabTests, setPatientLabTests] = useState<LabTest[]>([]);

  useEffect(() => {
    const handleUpdate = () => setPatients(getPatients());
    window.addEventListener('hms_db_update', handleUpdate);
    return () => window.removeEventListener('hms_db_update', handleUpdate);
  }, []);

  const filteredPatients = patients.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      p.patient_no.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.cnic.toLowerCase().includes(q) ||
      p.mobile.toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient({ ...p });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    const res = savePatient(editingPatient);
    if (res.success) {
      showToast('Patient record updated successfully!', 'success');
      setEditingPatient(null);
      setPatients(getPatients());
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleOpenHistory = (p: Patient) => {
    setViewingPatient(p);
    const apts = getAppointments().filter(a => a.patient_id === p.patient_no);
    const prsc = getPrescriptions().filter(pr => pr.patient_id === p.patient_no);
    const labs = getLabTests().filter(l => l.patient_id === p.patient_no);

    setPatientAppointments(apts);
    setPatientPrescriptions(prsc);
    setPatientLabTests(labs);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><Search size={24} style={{ color: 'var(--primary-teal)' }} /> Patient Search Engine</h2>
        <span className="badge badge-navy">Total Patients: {patients.length}</span>
      </div>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '48px', fontSize: '1.05rem' }}
          placeholder="Search by Patient No (PT-YYYY-XXXXX), Patient Name, CNIC, or Mobile Number..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Results Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Full Name</th>
              <th>CNIC Number</th>
              <th>Mobile Number</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map(p => (
              <tr key={p.patient_no}>
                <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{p.patient_no}</td>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.cnic}</td>
                <td>{p.mobile}</td>
                <td><span className={`badge ${p.patient_type === 'IPD' ? 'badge-danger' : 'badge-success'}`}>{p.patient_type}</span></td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => handleOpenHistory(p)} title="Quick View & History">
                    <Eye size={16} />
                  </button>
                  <button className="btn btn-outline" style={{ padding: '6px 12px' }} onClick={() => handleOpenEdit(p)} title="Edit Record">
                    <Edit size={16} />
                  </button>
                  {onPrintCard && (
                    <button className="btn btn-teal" style={{ padding: '6px 12px' }} onClick={() => onPrintCard(p)} title="Print Patient Card">
                      <Printer size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No patients found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setEditingPatient(null)}>✕</button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '24px' }}>
              Edit Patient Record ({editingPatient.patient_no})
            </h2>

            <form onSubmit={handleSaveEdit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={editingPatient.name} onChange={e => setEditingPatient({ ...editingPatient, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Father / Husband Name</label>
                  <input type="text" className="form-input" value={editingPatient.father_name} onChange={e => setEditingPatient({ ...editingPatient, father_name: e.target.value })} required />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="text" className="form-input" value={editingPatient.mobile} onChange={e => setEditingPatient({ ...editingPatient, mobile: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Patient Type</label>
                  <select className="form-select" value={editingPatient.patient_type} onChange={e => setEditingPatient({ ...editingPatient, patient_type: e.target.value as PatientType })}>
                    <option value="OPD">OPD</option>
                    <option value="IPD">IPD</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" value={editingPatient.city} onChange={e => setEditingPatient({ ...editingPatient, city: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-input" value={editingPatient.address} onChange={e => setEditingPatient({ ...editingPatient, address: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingPatient(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick View / Visit History Modal */}
      {viewingPatient && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px' }}>
            <button className="modal-close" onClick={() => setViewingPatient(null)}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <img src={viewingPatient.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt={viewingPatient.name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{viewingPatient.name}</h2>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  <span>ID: <strong>{viewingPatient.patient_no}</strong></span>
                  <span>CNIC: <strong>{viewingPatient.cnic}</strong></span>
                  <span>Blood: <strong style={{ color: 'var(--danger)' }}>{viewingPatient.blood_group}</strong></span>
                </div>
              </div>
            </div>

            {/* Sub-sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Appointments History */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} style={{ color: 'var(--primary-teal)' }} /> Appointment History
                </h3>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Token</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientAppointments.map(a => (
                        <tr key={a.id}>
                          <td style={{ fontWeight: 600 }}>{a.date}</td>
                          <td>{a.time_slot}</td>
                          <td><span className="badge badge-navy">#{a.token_no}</span></td>
                          <td><span className={`badge ${a.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{a.status}</span></td>
                        </tr>
                      ))}
                      {patientAppointments.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>No past appointments</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Prescriptions History */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} style={{ color: 'var(--primary-teal)' }} /> Prescriptions & Diagnosis
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {patientPrescriptions.map(pr => (
                    <div key={pr.id} style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>Diagnosis: {pr.diagnosis}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{pr.created_at}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}><strong>Complaint:</strong> {pr.complaint}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--primary-teal)' }}>Medicines Prescribed:</strong>
                        {pr.medicines.map(m => (
                          <div key={m.id} style={{ fontSize: '0.85rem', background: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600 }}>{m.name} ({m.dose})</span>
                            <span>{m.frequency} — {m.duration}</span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><strong>Advice:</strong> {pr.advice}</p>
                    </div>
                  ))}
                  {patientPrescriptions.length === 0 && (
                    <p style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '12px' }}>No prescriptions found</p>
                  )}
                </div>
              </div>

              {/* Lab Reports History */}
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TestTube size={18} style={{ color: 'var(--primary-teal)' }} /> Laboratory Reports
                </h3>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th>Result</th>
                        <th>Normal Range</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientLabTests.map(t => (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 600 }}>{t.test_name}</td>
                          <td>
                            <span style={{ fontWeight: 700, color: t.is_abnormal ? 'var(--danger)' : 'var(--success)' }}>
                              {t.result} {t.unit}
                            </span>
                          </td>
                          <td>{t.normal_range} {t.unit}</td>
                          <td><span className={`badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{t.status}</span></td>
                        </tr>
                      ))}
                      {patientLabTests.length === 0 && (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>No lab reports found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button className="btn btn-outline" onClick={() => setViewingPatient(null)}>Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
